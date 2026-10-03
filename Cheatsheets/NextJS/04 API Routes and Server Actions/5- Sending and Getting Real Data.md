# Sending and Getting Real Data in Next.js

Moving from in-memory arrays to a real database is the natural next step. Here's a complete guide using **Prisma + PostgreSQL** (the most common stack), with data flowing through **Server Components**, **Server Actions**, and **Route Handlers**.

## 🗺️ The Full Picture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────┐
│  Server         │ ───► │  Server Action   │ ───► │             │
│  Component      │      │  or Route Handler│      │  Prisma     │
│  (read data)    │ ◄─── │  (write data)    │ ◄─── │  Client     │
└─────────────────┘      └──────────────────┘      └──────┬──────┘
                                                           │
                                                    ┌──────▼──────┐
                                                    │  PostgreSQL │
                                                    └─────────────┘
```

---

## 1️⃣ Install Dependencies

```bash
npm install prisma @prisma/client
npm install -D prisma
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and a `.env` file.

---

## 2️⃣ Set Up the Database Connection

### `.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

> 💡 **Tip:** For local dev, run Postgres via Docker:
> ```bash
> docker run --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres
> ```

### `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  published Boolean  @default(false)
  authorId  Int?
  author    User?    @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String
  posts Post[]
}
```

### Run the migration
```bash
npx prisma migrate dev --name init
```

This creates the tables and generates the Prisma Client.

---

## 3️⃣ Prisma Client Singleton — `app/lib/prisma.ts`

In Next.js dev mode, hot reload can create many Prisma Clients. Use a singleton to avoid connection pool exhaustion.

```ts
// app/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 4️⃣ Seed Some Data — `prisma/seed.ts`

```ts
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      posts: {
        create: [
          { title: 'Hello World', body: 'My first post', published: true },
          { title: 'Next.js Rocks', body: 'Server Components are great', published: true },
        ],
      },
    },
  });
  console.log('Seeded user:', user.email);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
```

Add to `package.json`:
```json
{
  "prisma": { "seed": "tsx prisma/seed.ts" }
}
```

Then run:
```bash
npm install -D tsx
npx prisma db seed
```

---

## 5️⃣ GETTING Data — In a Server Component

Server Components can query the database **directly** — no API route needed.

```tsx
// app/posts/page.tsx
import { prisma } from '@/app/lib/prisma';
import Link from 'next/link';

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true, email: true } } },
  });

  if (posts.length === 0) {
    return <p>No posts yet. <Link href="/posts/new">Create one</Link>.</p>;
  }

  return (
    <main style={{ padding: 24, maxWidth: 700 }}>
      <h1>Posts</h1>
      <Link href="/posts/new">+ New post</Link>
      <ul style={{ marginTop: 24 }}>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: 16 }}>
            <Link href={`/posts/${post.id}`}>
              <strong>{post.title}</strong>
            </Link>
            <p>{post.body}</p>
            <small>
              by {post.author?.name ?? 'Anonymous'} ·{' '}
              {post.createdAt.toLocaleDateString()}
            </small>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### Reading a single record — with `notFound()`

```tsx
// app/posts/[id]/page.tsx
import { prisma } from '@/app/lib/prisma';
import { notFound } from 'next/navigation';

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: { author: true },
  });

  if (!post) notFound();

  return (
    <article style={{ padding: 24 }}>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <small>by {post.author?.name}</small>
    </article>
  );
}
```

> ⚠️ In Next.js 15+, `params` is a **Promise** — always `await params`.

---

## 6️⃣ SENDING Data — With a Server Action

```ts
// app/actions/posts.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';

const PostSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(100),
  body: z.string().min(1, 'Body is required.').max(1000),
});

export type FormState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string | null;
  values?: { title?: string; body?: string };
};

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    title: formData.get('title')?.toString() ?? '',
    body: formData.get('body')?.toString() ?? '',
  };

  const parsed = PostSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
      values: raw,
    };
  }

  try {
    await prisma.post.create({
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        published: true,
      },
    });
  } catch (error) {
    console.error('[createPost] DB error:', error);
    return {
      success: false,
      message: 'Could not save the post. Please try again.',
      values: raw,
    };
  }

  // Must be OUTSIDE try/catch — redirect() throws internally
  revalidatePath('/posts');
  redirect('/posts');
}

export async function deletePost(formData: FormData) {
  const id = Number(formData.get('id'));
  if (!id || Number.isNaN(id)) return { message: 'Invalid ID.' };

  try {
    await prisma.post.delete({ where: { id } });
  } catch (error) {
    console.error('[deletePost] DB error:', error);
    throw error; // bubble to error.tsx
  }

  revalidatePath('/posts');
}
```

### The form — `app/posts/new/page.tsx`

```tsx
// app/posts/new/page.tsx
import PostForm from './post-form';

export default function NewPostPage() {
  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <h1>New Post</h1>
      <PostForm />
    </main>
  );
}
```

```tsx
// app/posts/new/post-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createPost, type FormState } from '@/app/actions/posts';

const initialState: FormState = { success: false, message: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Create Post'}
    </button>
  );
}

export default function PostForm() {
  const [state, formAction] = useActionState(createPost, initialState);

  return (
    <form action={formAction} style={{ display: 'grid', gap: 8 }}>
      <input
        name="title"
        placeholder="Title"
        defaultValue={state.values?.title}
      />
      {state.errors?.title && <p style={{ color: 'crimson' }}>{state.errors.title[0]}</p>}

      <textarea
        name="body"
        placeholder="Body"
        defaultValue={state.values?.body}
      />
      {state.errors?.body && <p style={{ color: 'crimson' }}>{state.errors.body[0]}</p>}

      {state.message && <p style={{ color: 'crimson' }}>{state.message}</p>}

      <SubmitButton />
    </form>
  );
}
```

---

## 7️⃣ Transactions — Multiple Writes Atomically

When you need multiple operations to succeed or fail together:

```ts
// app/actions/users.ts
'use server';

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createUserWithPosts(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const titles = formData.getAll('postTitle') as string[];

  // Either everything succeeds, or nothing is written
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, name },
    });

    await tx.post.createMany({
      data: titles.map((title) => ({
        title,
        body: 'Draft',
        authorId: created.id,
      })),
    });

    return created;
  });

  revalidatePath('/users');
  return { success: true, userId: user.id };
}
```

### Interactive transactions (conditional logic)

```ts
await prisma.$transaction(async (tx) => {
  const sender = await tx.account.update({
    where: { id: senderId },
    data: { balance: { decrement: amount } },
  });

  if (sender.balance < 0) {
    throw new Error('Insufficient funds'); // rolls back everything
  }

  await tx.account.update({
    where: { id: receiverId },
    data: { balance: { increment: amount } },
  });
});
```

---

## 8️⃣ Filtering, Pagination & Search

```tsx
// app/posts/page.tsx
import { prisma } from '@/app/lib/prisma';

const PAGE_SIZE = 10;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = '', page = '1' } = await searchParams;
  const currentPage = Math.max(1, Number(page));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { body: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main style={{ padding: 24 }}>
      <form>
        <input name="q" defaultValue={q} placeholder="Search…" />
        <button type="submit">Search</button>
      </form>

      <p>{total} result(s)</p>

      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong> — {p.body.slice(0, 80)}…
          </li>
        ))}
      </ul>

      <nav style={{ display: 'flex', gap: 8 }}>
        {currentPage > 1 && (
          <a href={`?q=${q}&page=${currentPage - 1}`}>← Prev</a>
        )}
        <span>Page {currentPage} of {totalPages}</span>
        {currentPage < totalPages && (
          <a href={`?q=${q}&page=${currentPage + 1}`}>Next →</a>
        )}
      </nav>
    </main>
  );
}
```

---

## 9️⃣ Getting Data from a Route Handler (for external clients)

If you need a REST API for mobile apps, webhooks, or external consumers:

```ts
// app/api/posts/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const CreateSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(1000),
});

// GET /api/posts?q=hello&page=1
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const pageSize = 10;

  const where = q
    ? { title: { contains: q, mode: 'insensitive' as const } }
    : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, pageSize });
}

// POST /api/posts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({ data: parsed.data });
  return NextResponse.json(post, { status: 201 });
}
```

---

## 🔟 Caching & Revalidation

Next.js 15 changed the default: **fetch is no longer cached by default**. But Prisma queries in Server Components **are cached** across navigations unless told otherwise.

### Force dynamic (always fresh)

```tsx
// app/posts/page.tsx
export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const posts = await prisma.post.findMany();
  // ...
}
```

### Use `unstable_cache` for controlled caching

```ts
// app/lib/data.ts
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

export const getPublishedPosts = unstable_cache(
  async () => prisma.post.findMany({ where: { published: true } }),
  ['published-posts'],           // cache key
  { revalidate: 60, tags: ['posts'] } // revalidate every 60s or on tag
);
```

Then invalidate from a Server Action:

```ts
import { revalidateTag } from 'next/cache';

revalidateTag('posts'); // busts the cache
```

### Or use `revalidatePath`

```ts
revalidatePath('/posts');        // specific path
revalidatePath('/posts', 'page');// all posts pages
```

---

## 1️⃣1️⃣ Handling Prisma Errors Gracefully

```ts
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({ data: { email, name } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = unique constraint violation
    if (error.code === 'P2002') {
      return { message: 'Email already exists.' };
    }
    // P2025 = record not found
    if (error.code === 'P2025') {
      return { message: 'Record not found.' };
    }
  }
  console.error('[createUser]', error);
  throw error; // unexpected → error.tsx
}
```

### Common Prisma error codes

| Code | Meaning |
|---|---|
| `P2002` | Unique constraint failed |
| `P2003` | Foreign key constraint failed |
| `P2025` | Record not found |
| `P2000` | Value too long for column |
| `P1001` | Can't reach database server |

---

## 1️⃣2️⃣ Auth & Ownership (Bonus)

Real apps need to scope queries to the current user. Use `cookies()` or a session library:

```ts
// app/lib/auth.ts
import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  if (!sessionId) return null;

  return prisma.user.findUnique({ where: { id: Number(sessionId) } });
}
```

```ts
// app/actions/posts.ts
'use server';

import { getCurrentUser } from '@/app/lib/auth';

export async function createPost(prevState, formData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'You must be logged in.' };

  // ...validate...

  await prisma.post.create({
    data: { ...parsed.data, authorId: user.id },
  });
  // ...
}
```

---

## 📋 Complete Data Flow Cheat Sheet

| Task | Where | How |
|---|---|---|
| **Read (Server Component)** | `app/**/page.tsx` | `await prisma.post.findMany()` |
| **Read (Client Component)** | Client code | `fetch('/api/posts')` or via props |
| **Write (form)** | Server Action | `useActionState` + `action={fn}` |
| **Write (programmatic)** | Server Action | Call from `onClick` with `FormData` |
| **Write (external)** | Route Handler | `POST /api/posts` |
| **Multiple writes** | Server Action | `prisma.$transaction([...])` |
| **Revalidate** | After write | `revalidatePath('/posts')` or `revalidateTag('posts')` |
| **Cache reads** | `unstable_cache` | Wrap query with tag + revalidate time |

---

## ✅ Production Checklist

- [ ] Prisma Client is a **singleton** (avoid connection pool exhaustion)
- [ ] `.env` is in `.gitignore` — never commit `DATABASE_URL`
- [ ] Migrations are committed to `prisma/migrations/`
- [ ] Server Actions validate input with **Zod** before touching the DB
- [ ] `redirect()` / `notFound()` are **outside** try/catch
- [ ] Catch Prisma error codes (`P2002`, `P2025`) and translate them
- [ ] Use `revalidatePath` / `revalidateTag` after every mutation
- [ ] Scope queries to the current user (auth check in every action)
- [ ] Use `select` / `include` to avoid over-fetching
- [ ] Add `@@index` on frequently queried columns

---

## 🚀 Alternative Stacks

| Stack | When to choose |
|---|---|
| **Prisma + Postgres** | Most apps; great DX, type-safe |
| **Drizzle ORM** | Lighter, SQL-first, edge-friendly |
| **MongoDB + Mongoose** | Flexible schemas, document-based |
| **Supabase / Neon** | Managed Postgres with built-in auth |
| **Turso (libSQL)** | SQLite at the edge, cheap and fast |

---

Want me to extend this with **Prisma + auth (NextAuth/Clerk)**, **optimistic UI with `useOptimistic`**, **file uploads to S3/Cloudinary**, or a **full working starter repo** with everything wired together? Just say the word.