# Building Route Handlers for GET, POST, PUT, DELETE in Next.js (App Router)

Here's a complete, production-ready implementation of CRUD route handlers with Prisma.

---

## 1. File Structure

Next.js App Router uses **folders as routes** and **`route.ts` files as endpoints**:

```
app/
└── api/
    └── posts/
        ├── route.ts          → /api/posts       (GET all, POST create)
        └── [id]/
            └── route.ts      → /api/posts/:id   (GET one, PUT, DELETE)
```

Each `route.ts` exports named functions matching HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

---

## 2. The Prisma Client Singleton

```ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Why a singleton?** In dev, Next.js hot-reloads and re-imports modules, creating new Prisma clients each time. This exhausts DB connections.

---

## 3. Validation with Zod

Never trust `req.json()`. Validate everything.

```ts
// lib/validations/post.ts
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().optional().default(false),
  authorId: z.number().int().positive(),
});

export const updatePostSchema = createPostSchema.partial(); // all fields optional

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
```

---

## 4. Shared Error Helper

```ts
// lib/api-error.ts
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function handleApiError(error: unknown) {
  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Known Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": // unique constraint
        return NextResponse.json(
          { error: "A record with this value already exists", field: error.meta?.target },
          { status: 409 }
        );
      case "P2025": // record not found
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
      case "P2003": // FK violation
        return NextResponse.json({ error: "Related record does not exist" }, { status: 400 });
    }
  }

  console.error("[API ERROR]", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

---

## 5. Collection Routes — `/api/posts`

```ts
// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/lib/validations/post";
import { handleApiError } from "@/lib/api-error";

// ─────────────────────────────────────────────
// GET /api/posts
// Query params: ?published=true&limit=10&offset=0&search=hello
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const publishedParam = searchParams.get("published");
    const search = searchParams.get("search") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
    const offset = Number(searchParams.get("offset") ?? 0);

    const posts = await prisma.post.findMany({
      where: {
        ...(publishedParam !== null && { published: publishedParam === "true" }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.post.count({
      where: {
        ...(publishedParam !== null && { published: publishedParam === "true" }),
      },
    });

    return NextResponse.json({
      data: posts,
      meta: { total, limit, offset },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/posts
// Body: { title, content, published?, authorId }
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createPostSchema.parse(body);

    const post = await prisma.post.create({
      data,
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json(post, {
      status: 201,
      headers: { Location: `/api/posts/${post.id}` },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 6. Item Routes — `/api/posts/:id`

```ts
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePostSchema } from "@/lib/validations/post";
import { handleApiError } from "@/lib/api-error";

type Params = { params: { id: string } };

// Helper to parse + validate the id
function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ─────────────────────────────────────────────
// GET /api/posts/:id
// ─────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        comments: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}

// ─────────────────────────────────────────────
// PUT /api/posts/:id — full replace (all required fields)
// ─────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const data = createPostSchema.parse(body); // full schema

    const post = await prisma.post.update({
      where: { id },
      data,
    });

    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}

// ─────────────────────────────────────────────
// PATCH /api/posts/:id — partial update
// ─────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const data = updatePostSchema.parse(body); // partial schema

    const post = await prisma.post.update({
      where: { id },
      data,
    });

    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}

// ─────────────────────────────────────────────
// DELETE /api/posts/:id
// ─────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const id = parseId(params.id);
    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await prisma.post.delete({ where: { id } });

    return new NextResponse(null, { status: 204 }); // 204 No Content
  } catch (error) {
    return handleApiError(error);
  }
}

// Re-import for PUT handler (since we use it there but not in POST)
import { createPostSchema } from "@/lib/validations/post";
```

> ⚠️ **Note:** Move the `createPostSchema` import to the top of the file — ESLint will complain otherwise. I put it at the bottom only to keep the diff readable. Final imports should be:
```ts
import { createPostSchema, updatePostSchema } from "@/lib/validations/post";
```

---

## 7. Testing the Endpoints

```bash
# CREATE
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","content":"World","authorId":1}'

# READ all
curl http://localhost:3000/api/posts?published=true&limit=5

# READ one
curl http://localhost:3000/api/posts/1

# UPDATE (partial)
curl -X PATCH http://localhost:3000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"published":true}'

# DELETE
curl -X DELETE http://localhost:3000/api/posts/1
```

---

## 8. Calling from the Frontend

```tsx
// app/posts/page.tsx
"use client";
import { useEffect, useState } from "react";

type Post = { id: number; title: string; content: string; published: boolean };

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/posts");
    const json = await res.json();
    setPosts(json.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createPost() {
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New", content: "Body", authorId: 1 }),
    });
    load();
  }

  async function updatePost(id: number) {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: true }),
    });
    load();
  }

  async function deletePost(id: number) {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={createPost}>+ New Post</button>
      {posts.map(p => (
        <div key={p.id}>
          <h3>{p.title}</h3>
          <button onClick={() => updatePost(p.id)}>Publish</button>
          <button onClick={() => deletePost(p.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 9. Optional: Real Database Middleware

If you want to use Prisma middleware to log or enforce policies:

```ts
// lib/prisma.ts (add after client creation)
prisma.$use(async (params, next) => {
  const start = Date.now();
  const result = await next(params);
  console.log(`[Prisma] ${params.model}.${params.action} — ${Date.now() - start}ms`);
  return result;
});
```

---

## 10. Optional: Authentication Check

```ts
// lib/auth.ts
import { NextRequest } from "next/server";

export async function requireUser(req: NextRequest) {
  // Example using a cookie session or bearer token
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("UNAUTHORIZED");

  // Verify JWT / session here
  const user = await verifyToken(token); // your logic
  return user;
}
```

Then in a route:
```ts
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const data = createPostSchema.parse(await req.json());
    const post = await prisma.post.create({
      data: { ...data, authorId: user.id },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handleApiError(e);
  }
}
```

---

## 11. HTTP Status Code Cheat Sheet

| Scenario | Status |
|----------|--------|
| Successful GET / PUT / PATCH | `200 OK` |
| Successful POST (created) | `201 Created` |
| Successful DELETE | `204 No Content` |
| Validation error | `400 Bad Request` |
| Missing auth | `401 Unauthorized` |
| Authenticated but not allowed | `403 Forbidden` |
| Not found | `404 Not Found` |
| Conflict (unique violation) | `409 Conflict` |
| Unhandled exception | `500 Internal Server Error` |

---

## 12. Key Patterns to Remember

1. **One file, multiple verbs** — `route.ts` exports `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
2. **Nested folders = URL segments** — `[id]` becomes a dynamic param.
3. **`params.id` is always a string** — parse and validate it.
4. **Always validate input with Zod** — don't trust `req.json()`.
5. **Always catch errors** — use a shared `handleApiError`.
6. **Return consistent shapes** — `{ data, meta }` for lists, the entity for singles, `{ error }` for failures.
7. **Use proper status codes** — 201 for create, 204 for delete, 404 for missing, etc.
8. **Prisma error codes map cleanly to HTTP** — P2002 → 409, P2025 → 404, P2003 → 400.
9. **Don't import Prisma in client components** — only in routes, server components, or server actions.
10. **Consider Server Actions** for mutations if you don't need external API clients.

---

## TL;DR Flow

```
Client fetch → /api/posts/route.ts (GET/POST)
                    ↓
            Zod parse + validate
                    ↓
            Prisma query → DB
                    ↓
        NextResponse.json() ← error helper catches failures

Client fetch → /api/posts/[id]/route.ts (GET/PUT/PATCH/DELETE)
                    ↓
            parseId → Zod (if body) → Prisma → Response
```