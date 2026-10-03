# Displaying Data from a Database in Next.js

Once your API routes and forms are wired up, you need to **read from the DB and render it**. In the App Router you have two fundamentally different ways — and choosing correctly is the difference between a slow app and a fast one.

---

## 1. The Two Approaches

| Approach | Runs | Use for |
|----------|------|---------|
| **Server Components** (default) | Server | Initial page load, SEO, static-ish content |
| **Client Components** (`"use client"`) | Browser | Interactivity, filters, live updates |

**The rule:** Fetch data on the server whenever you can. Only go client-side when you need state, effects, or user interaction.

---

## 2. Approach A — Server Components (preferred)

Fetch directly from Prisma in the component. No API route needed. No `useEffect`. No loading spinner on first paint.

### Basic list

```tsx
// app/posts/page.tsx
import { prisma } from "@/lib/prisma";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <p>by {post.author.name}</p>
        </li>
      ))}
    </ul>
  );
}
```

**That's it.** Next.js fetches this on the server, streams HTML to the browser. No client JS needed for the read.

### With a detail page

```tsx
// app/posts/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PostPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, email: true } },
      comments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!post) notFound(); // triggers app/not-found.tsx

  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author.name}</p>
      <div>{post.content}</div>

      <section>
        <h2>Comments ({post.comments.length})</h2>
        {post.comments.map((c) => (
          <div key={c.id}>{c.body}</div>
        ))}
      </section>
    </article>
  );
}
```

**`notFound()`** is how you handle 404s in server components — throw it and Next.js renders `not-found.tsx`.

---

## 3. Loading & Error States (App Router conventions)

Next.js uses **special files** next to your page:

```
app/posts/
├── page.tsx           ← the page
├── loading.tsx        ← shown while page.tsx streams
├── error.tsx          ← shown when page.tsx throws
└── not-found.tsx      ← shown when notFound() is called
```

### `loading.tsx` — automatic Suspense boundary
```tsx
// app/posts/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  );
}
```

### `error.tsx` — must be a client component
```tsx
// app/posts/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### `not-found.tsx`
```tsx
// app/posts/[id]/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2>Post not found</h2>
      <Link href="/posts">Back to all posts</Link>
    </div>
  );
}
```

You get loading, error, and 404 handling **for free** — no manual state management.

---

## 4. Approach B — Client Components + `fetch`

Use when you need filters, pagination, search, or live updates. Fetch from your API route.

```tsx
"use client";

import { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
  content: string;
  author: { name: string };
};

export default function PostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch("/api/posts", { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to load posts");
        const body = await res.json();
        setPosts(body.data);
      } catch (e) {
        if ((e as Error).name === "AbortError") return; // ignore cancellations
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort(); // cleanup on unmount
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>
          <h2>{p.title}</h2>
          <p>by {p.author.name}</p>
        </li>
      ))}
    </ul>
  );
}
```

**Notice the `AbortController`** — critical for avoiding state updates after unmount and stale responses.

---

## 5. The Hybrid Pattern (best of both)

**Server component fetches initial data → passes it to a client component** for interactivity. No loading flicker, no wasted request.

```tsx
// app/posts/page.tsx (server)
import { prisma } from "@/lib/prisma";
import PostsList from "./PostsList";

export default async function Page() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return <PostsList initialPosts={posts} />;
}
```

```tsx
// app/posts/PostsList.tsx (client)
"use client";

import { useState, useMemo } from "react";

type Post = {
  id: number;
  title: string;
  author: { name: string };
};

export default function PostsList({ initialPosts }: { initialPosts: Post[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      initialPosts.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      ),
    [initialPosts, search]
  );

  return (
    <div>
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {filtered.map((p) => (
          <li key={p.id}>
            <h2>{p.title}</h2>
            <p>by {p.author.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

The page ships with data already rendered. Filtering happens instantly client-side.

---

## 6. Pagination

### Server-side (URL-based) — the Next.js way

```tsx
// app/posts/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PAGE_SIZE = 10;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const skip = (page - 1) * PAGE_SIZE;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.post.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>

      <nav>
        {page > 1 && <Link href={`/posts?page=${page - 1}`}>Previous</Link>}
        <span>Page {page} of {totalPages}</span>
        {page < totalPages && <Link href={`/posts?page=${page + 1}`}>Next</Link>}
      </nav>
    </>
  );
}
```

**Why this is great:**
- URL is shareable and bookmarkable
- Back/forward buttons work
- No JS required
- Next.js only refetches when `searchParams` changes

### Client-side (infinite scroll)

```tsx
"use client";
import { useEffect, useState, useRef, useCallback } from "react";

export default function InfiniteList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const res = await fetch(`/api/posts?page=${page}&limit=10`);
    const body = await res.json();

    setPosts((prev) => [...prev, ...body.data]);
    setHasMore(body.data.length === 10);
    setPage((p) => p + 1);
    setLoading(false);
  }, [page, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div>
      {posts.map((p) => (
        <div key={p.id}>{p.title}</div>
      ))}
      <div ref={sentinelRef} />
      {loading && <p>Loading more...</p>}
      {!hasMore && <p>End of list</p>}
    </div>
  );
}
```

---

## 7. Filtering & Sorting via URL

Keep filter state in the URL so server components can read it.

```tsx
// app/posts/page.tsx
export default async function PostsPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string; published?: string };
}) {
  const { q, sort = "desc", published } = searchParams;

  const posts = await prisma.post.findMany({
    where: {
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(published !== undefined && { published: published === "true" }),
    },
    orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
  });

  return (
    <>
      <FilterBar /> {/* client component that updates the URL */}
      <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>
    </>
  );
}
```

```tsx
// app/posts/FilterBar.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/posts?${params.toString()}`);
  }

  return (
    <div>
      <input
        placeholder="Search"
        onChange={(e) => update("q", e.target.value)}
      />
      <select onChange={(e) => update("sort", e.target.value)}>
        <option value="desc">Newest</option>
        <option value="asc">Oldest</option>
      </select>
    </div>
  );
}
```

**Debounce the search input** in a real app (300ms) to avoid a request per keystroke.

---

## 8. Streaming with Suspense

For slow queries, stream the page in pieces — header renders instantly, data arrives later.

```tsx
// app/posts/page.tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <h1>Posts</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <PostsList /> {/* async server component */}
      </Suspense>

      <Suspense fallback={<SidebarSkeleton />}>
        <PopularTags /> {/* separate slow query */}
      </Suspense>
    </>
  );
}

async function PostsList() {
  const posts = await prisma.post.findMany({ take: 20 });
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}

async function PopularTags() {
  const tags = await prisma.tag.findMany({ take: 10 });
  return <ul>{tags.map((t) => <li key={t.id}>{t.name}</li>)}</ul>;
}
```

Each `<Suspense>` boundary streams independently. The user sees content progressively instead of a blank page.

---

## 9. Caching & Revalidation

Next.js caches server component fetches. Control it:

```tsx
// Static — cached until you manually revalidate (default for Prisma-less fetches)
// Dynamic — re-fetched on every request
export const dynamic = "force-dynamic";

// Revalidate every 60 seconds
export const revalidate = 60;
```

After a mutation (from a Server Action or API route), bust the cache:

```ts
import { revalidatePath } from "next/cache";

revalidatePath("/posts");            // refresh the list page
revalidatePath(`/posts/${post.id}`); // refresh the detail page
```

Or tag-based:
```ts
// on fetch
const posts = await prisma.post.findMany();
// (tagging requires fetch(); for Prisma, use unstable_cache or revalidatePath)

// after mutation
revalidateTag("posts");
```

> **Reality check:** Prisma queries in Server Components aren't automatically cached the way `fetch()` is. If you want caching, wrap with `unstable_cache` or rely on full-route caching via `dynamic`/`revalidate` exports.

---

## 10. Real-World Example: Full Posts Page

```tsx
// app/posts/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import PostsSkeleton from "./PostsSkeleton";
import FilterBar from "./FilterBar";

export const revalidate = 30; // refresh every 30s

export default function Page({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Posts</h1>
      <FilterBar />
      <Suspense fallback={<PostsSkeleton />}>
        <PostsList q={searchParams.q} />
      </Suspense>
    </main>
  );
}

async function PostsList({ q }: { q?: string }) {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...(q && { title: { contains: q, mode: "insensitive" } }),
    },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  if (posts.length === 0) {
    return <p className="text-gray-500">No posts found.</p>;
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li key={post.id} className="border rounded p-4">
          <Link href={`/posts/${post.id}`} className="text-xl font-semibold hover:underline">
            {post.title}
          </Link>
          <p className="text-sm text-gray-500">by {post.author.name}</p>
        </li>
      ))}
    </ul>
  );
}
```

---

## 11. Common Pitfalls

| Pitfall | Fix |
|---------|-----|
| Fetching in `useEffect` for initial page load | Use a Server Component instead |
| Passing whole Prisma objects to client components | Pass only serializable fields — `Date` works but `Decimal`/`BigInt` don't |
| Forget `key` on list items | Always use a stable `id`, never the index |
| No `AbortController` in `useEffect` | Add one — prevents stale state + memory leaks |
| Loading whole related trees with `include` | Use `select` to limit fields |
| N+1 queries in a loop | Use `include` or `findMany({ where: { id: { in: ids } } })` |
| Forgetting `notFound()` for missing records | Return `null` → renders a blank page silently |
| Not revalidating after mutation | `router.refresh()` or `revalidatePath()` |
| Overusing `"use client"` | Keep pages server-side; push `"use client"` down the tree |
| Passing functions/classes to client components | Only serializable props cross the boundary |

---

## 12. Choosing Your Data-Fetching Approach

```
Does the data need to be in the initial HTML?
├─ Yes → Server Component + Prisma
│   ├─ Is it slow? → wrap in <Suspense> + loading.tsx
│   └─ Does it need to refresh? → export revalidate / call revalidatePath
│
└─ No (user-triggered only)
    ├─ Filters/pagination → keep state in URL → Server Component reads searchParams
    └─ Live updates / infinite scroll → Client Component + fetch + AbortController
```

**Default to server components.** Reach for the client only when the data isn't known until the user interacts.

---

## 13. Serialization Warning

Props crossing from server → client components must be **JSON-serializable**.

```tsx
// ❌ Breaks: Prisma Decimal and BigInt aren't serializable
const product = await prisma.product.findFirst();
return <Card product={product} />;

// ✅ Convert first
const product = await prisma.product.findFirst();
if (!product) notFound();
return <Card product={{ ...product, price: product.price.toString() }} />;
```

`Date` objects work (Next.js serializes them), but `Decimal`, `BigInt`, `Buffer`, and class instances do not.

---

## TL;DR

1. **Server Components + Prisma = default.** Fetch directly, no API route, no `useEffect`.
2. **Use `loading.tsx` / `error.tsx` / `not-found.tsx`** for the three UI states.
3. **Client components only** for interactivity — fetch from your API route with `AbortController`.
4. **Hybrid pattern** (server fetches, client filters) gives instant UX with zero initial request.
5. **Put state in the URL** (`?page=2&q=foo`) so pagination and filters work with server components.
6. **Use `Suspense`** to stream slow queries.
7. **Revalidate** with `revalidatePath()` after mutations.
8. **Only pass serializable props** across the server/client boundary.
9. **Never fetch in `useEffect`** just to show initial data — that's a Server Component's job.