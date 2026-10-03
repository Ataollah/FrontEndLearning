# Building an API with GET and POST using Next.js Route Handlers

Here's a complete example of building a simple CRUD-style API with `GET` and `POST` methods using Route Handlers in the App Router.

## 📁 Project Structure

```
app/
└── api/
    └── posts/
        ├── route.ts          # Handles GET (list) and POST (create)
        └── [id]/
            └── route.ts      # Handles GET (single item)
```

## 1️⃣ The Collection Route — `app/api/posts/route.ts`

This file handles requests to `/api/posts` — listing all posts (`GET`) and creating a new one (`POST`).

```ts
// app/api/posts/route.ts
import { NextResponse, type NextRequest } from 'next/server';

// In-memory store (for demo purposes only — resets on server restart)
type Post = { id: number; title: string; body: string };
let posts: Post[] = [
  { id: 1, title: 'Hello World', body: 'My first post' },
  { id: 2, title: 'Next.js Rocks', body: 'Route Handlers are neat' },
];

// GET /api/posts → list all posts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  // Optional filtering by title
  const filtered = query
    ? posts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : posts;

  return NextResponse.json({ count: filtered.length, posts: filtered });
}

// POST /api/posts → create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body?.title || !body?.body) {
      return NextResponse.json(
        { error: 'Both "title" and "body" are required.' },
        { status: 400 }
      );
    }

    const newPost: Post = {
      id: posts.length ? Math.max(...posts.map((p) => p.id)) + 1 : 1,
      title: body.title,
      body: body.body,
    };

    posts.push(newPost);

    // 201 Created + Location header (REST best practice)
    return NextResponse.json(newPost, {
      status: 201,
      headers: { Location: `/api/posts/${newPost.id}` },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }
}
```

## 2️⃣ The Item Route — `app/api/posts/[id]/route.ts`

This handles `/api/posts/:id` requests (e.g., fetching a single post).

```ts
// app/api/posts/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';

type Post = { id: number; title: string; body: string };
// Note: in a real app, this would come from a shared module or database
const posts: Post[] = [
  { id: 1, title: 'Hello World', body: 'My first post' },
  { id: 2, title: 'Next.js Rocks', body: 'Route Handlers are neat' },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = posts.find((p) => p.id === Number(id));

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}
```

> ⚠️ **Note:** In Next.js 15+, `params` is a `Promise` and must be awaited.

## 3️⃣ Testing the API

### Start the dev server
```bash
npm run dev
```

### GET — List all posts
```bash
curl http://localhost:3000/api/posts
```

Response:
```json
{
  "count": 2,
  "posts": [
    { "id": 1, "title": "Hello World", "body": "My first post" },
    { "id": 2, "title": "Next.js Rocks", "body": "Route Handlers are neat" }
  ]
}
```

### GET — Filter by query param
```bash
curl "http://localhost:3000/api/posts?q=rock"
```

### GET — Fetch a single post
```bash
curl http://localhost:3000/api/posts/1
```

### POST — Create a new post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"New Post","body":"Created via POST"}'
```

Response (`201 Created`):
```json
{
  "id": 3,
  "title": "New Post",
  "body": "Created via POST"
}
```

### POST — Trigger validation error
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Missing body"}'
```

Response (`400 Bad Request`):
```json
{ "error": "Both \"title\" and \"body\" are required." }
```

## 4️⃣ Calling It from the Frontend

You can consume the API from any component — a Client Component, Server Component, or via `fetch`:

```tsx
// app/posts/page.tsx (Server Component)
async function getPosts() {
  const res = await fetch('http://localhost:3000/api/posts', {
    cache: 'no-store', // ensure fresh data
  });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export default async function PostsPage() {
  const { posts } = await getPosts();

  return (
    <ul>
      {posts.map((p: any) => (
        <li key={p.id}>
          <strong>{p.title}</strong> — {p.body}
        </li>
      ))}
    </ul>
  );
}
```

Or from a Client Component:

```tsx
'use client';

async function createPost() {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'From Client', body: 'Hi there' }),
  });
  const data = await res.json();
  console.log(data);
}
```

## 🔑 Key Takeaways

| Concept | Detail |
|---|---|
| **File location** | `app/api/.../route.ts` — exports named functions per HTTP method |
| **Naming** | Function names must be uppercase HTTP verbs: `GET`, `POST`, etc. |
| **Response** | Use `NextResponse.json()` for typed JSON responses |
| **Request body** | `await request.json()` — returns the parsed JSON body |
| **Query params** | `request.nextUrl.searchParams.get('key')` |
| **Dynamic segments** | `params` is a Promise in Next 15+ — `await params` |
| **Status codes** | Pass `{ status: 201 }` as the second arg to `NextResponse.json()` |
| **Conflicts** | A `route.ts` can't share a segment with a `page.tsx` |

## 🚀 Next Steps

- **Persist data**: Swap the in-memory array for Prisma + PostgreSQL, Drizzle, or MongoDB.
- **Add validation**: Use [Zod](https://zod.dev/) for schema validation.
- **Add PUT / DELETE**: Extend the `[id]/route.ts` file with `PUT` and `DELETE` handlers.
- **Handle CORS**: Add `OPTIONS` and headers if calling from another origin.
- **Auth**: Use `cookies()` or `headers()` from `next/headers` to protect endpoints.

Want me to extend this with `PUT`/`DELETE`, database integration (Prisma), or Zod validation? Just let me know.