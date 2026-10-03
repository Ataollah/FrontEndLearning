# Fetching Data from a Remote API in Next.js

Here's a complete, practical guide — from a simple call to production-ready patterns.

---

## 1. The Simplest Case (Server Component)

```jsx
// app/posts/page.js
export default async function PostsPage() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  const posts = await res.json()

  return (
    <ul>
      {posts.map(p => <li key={p.id}>{p.title}</li>)}
    </ul>
  )
}
```

- Runs **on the server**
- **No API key ever reaches the browser**
- Default cache in Next 15 = `no-store` (dynamic); in 13/14 = `force-cache` (static)

---

## 2. Always Check `res.ok`

`fetch` **does NOT throw** on 404/500. You must handle it.

```jsx
export default async function PostsPage() {
  const res = await fetch('https://api.example.com/posts')

  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status}`)
  }

  const posts = await res.json()
  return <List posts={posts} />
}
```

Throw → caught by `app/error.js`:

```jsx
// app/error.js
'use client'
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## 3. Choosing a Cache Strategy

```jsx
// Static — fetch once at build
await fetch(url)

// SSR — fetch on every request
await fetch(url, { cache: 'no-store' })

// ISR — refresh every 60 seconds
await fetch(url, { next: { revalidate: 60 } })

// On-demand — refresh when you call revalidateTag('posts')
await fetch(url, { next: { tags: ['posts'] } })
```

For a remote API that changes often → `no-store` or `revalidate: N`.

---

## 4. Sending Headers, Auth, Query Params

```jsx
const res = await fetch('https://api.example.com/posts?limit=10', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.API_TOKEN}`
  },
  cache: 'no-store'
})
```

### Using environment variables (secret stays on server)
```bash
# .env.local
API_TOKEN=sk_live_xxxxxxxxx
API_BASE=https://api.example.com
```

```jsx
const res = await fetch(`${process.env.API_BASE}/posts`, {
  headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
  cache: 'no-store'
})
```

> ⚠️ Never prefix with `NEXT_PUBLIC_` for secrets — that exposes them to the browser.

---

## 5. Fetching Multiple Endpoints

### Sequential (slow — avoid unless dependent)
```jsx
const user = await fetch(`${API}/user`).then(r => r.json())
const posts = await fetch(`${API}/user/${user.id}/posts`).then(r => r.json())
```

### Parallel (fast — use when independent)
```jsx
const [userRes, postsRes, statsRes] = await Promise.all([
  fetch(`${API}/user`, { cache: 'no-store' }),
  fetch(`${API}/posts`, { cache: 'no-store' }),
  fetch(`${API}/stats`, { cache: 'no-store' })
])

const [user, posts, stats] = await Promise.all([
  userRes.json(), postsRes.json(), statsRes.json()
])
```

Next.js dedupes identical fetches automatically, so parallel is safe.

---

## 6. Handling POST / PUT / DELETE (Mutations)

Use **Server Actions**:

```jsx
// app/posts/actions.js
'use server'
import { revalidateTag } from 'next/cache'

export async function createPost(formData) {
  const title = formData.get('title')

  const res = await fetch('https://api.example.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })

  if (!res.ok) throw new Error('Failed to create post')

  revalidateTag('posts') // refresh cached list
  return res.json()
}
```

```jsx
// app/posts/new/page.js
import { createPost } from '../actions'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

---

## 7. Type-Safe Fetching (TypeScript)

```tsx
type Post = { id: number; title: string; body: string }

async function getPosts(): Promise<Post[]> {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }
  })
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export default async function Page() {
  const posts = await getPosts()
  return posts.map(p => <div key={p.id}>{p.title}</div>)
}
```

---

## 8. Reusable Fetch Helper

```tsx
// lib/api.ts
const BASE = process.env.API_BASE!

type FetchOptions = RequestInit & { revalidate?: number; tags?: string[] }

export async function apiFetch<T>(
  path: string,
  { revalidate, tags, ...init }: FetchOptions = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      ...init.headers
    },
    next: { revalidate, tags }
  })

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }

  return res.json() as Promise<T>
}
```

Usage:
```tsx
const posts = await apiFetch<Post[]>('/posts', { revalidate: 60, tags: ['posts'] })
```

---

## 9. Loading & Error States

```jsx
// app/posts/loading.js
export default function Loading() {
  return <p>Loading posts...</p>
}
```

```jsx
// app/posts/error.js
'use client'
export default function Error({ error, reset }) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )
}
```

Next.js automatically wraps the page in a Suspense boundary using these files.

---

## 10. Route Handler (Proxy Endpoint)

If the client needs to call the API, don't expose the key — proxy it:

```jsx
// app/api/posts/route.js
export async function GET() {
  const res = await fetch('https://api.example.com/posts', {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    cache: 'no-store'
  })
  const data = await res.json()
  return Response.json(data)
}
```

Client:
```jsx
'use client'
const res = await fetch('/api/posts')
const data = await res.json()
```

---

## 11. Fetching in Client Components (CSR)

Only if you need interactivity tied to the fetch:

```jsx
'use client'
import { useEffect, useState } from 'react'

export default function Posts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(setPosts)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>
  return posts.map(p => <div key={p.id}>{p.title}</div>)
}
```

For anything serious, use **SWR** or **React Query**:

```jsx
'use client'
import useSWR from 'swr'
const fetcher = url => fetch(url).then(r => r.json())

export default function Posts() {
  const { data, error, isLoading } = useSWR('/api/posts', fetcher)
  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error</p>
  return data.map(p => <div key={p.id}>{p.title}</div>)
}
```

---

## 12. Timeouts (Native `fetch` has none)

```tsx
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)

try {
  const res = await fetch(url, { signal: controller.signal })
} finally {
  clearTimeout(timeout)
}
```

Or a helper:
```tsx
async function fetchWithTimeout(url: string, ms = 5000, init?: RequestInit) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}
```

---

## 13. Common Pitfalls

| Pitfall | Fix |
|---------|-----|
| Forgetting `if (!res.ok)` | Always check — `fetch` doesn't throw |
| Exposing API key with `NEXT_PUBLIC_` | Keep secrets unprefixed; proxy via route handler |
| Sequential fetches that could be parallel | Use `Promise.all` |
| Caching secrets/user data | Use `cache: 'no-store'` for user-specific data |
| `no-store` + `next: { revalidate }` together | Pick one — revalidate is ignored with no-store |
| Assuming Next 15 default caches | Next 15 defaults to dynamic; be explicit |
| No timeout | Wrap with `AbortController` |

---

## 14. Complete Real-World Example

```tsx
// app/products/page.tsx
import { apiFetch } from '@/lib/api'

type Product = { id: string; name: string; price: number }

export const revalidate = 60 // ISR for whole page

export default async function ProductsPage() {
  const products = await apiFetch<Product[]>('/products', {
    revalidate: 60,
    tags: ['products']
  })

  return (
    <main>
      <h1>Products</h1>
      <ul>
        {products.map(p => (
          <li key={p.id}>{p.name} — ${p.price}</li>
        ))}
      </ul>
    </main>
  )
}
```

```tsx
// app/products/error.tsx
'use client'
export default function Error({ error, reset }) {
  return (
    <div>
      <p>Failed to load products: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )
}
```

```tsx
// app/products/loading.tsx
export default function Loading() {
  return <p>Loading products...</p>
}
```

```tsx
// app/products/actions.ts
'use server'
import { revalidateTag } from 'next/cache'

export async function refreshProducts() {
  revalidateTag('products')
}
```

---

## TL;DR Cheat Sheet

```tsx
// Static
await fetch(url)

// Dynamic (SSR)
await fetch(url, { cache: 'no-store' })

// ISR
await fetch(url, { next: { revalidate: 60 } })

// On-demand
await fetch(url, { next: { tags: ['x'] } })
// later: revalidateTag('x')

// Auth + error check
const res = await fetch(url, {
  headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
  cache: 'no-store'
})
if (!res.ok) throw new Error(res.statusText)
const data = await res.json()
```

**Golden rules:**
1. Fetch on the **server** whenever possible
2. **Always** check `res.ok`
3. Keep secrets **unprefixed** in env
4. Use **tags + `revalidateTag`** for on-demand freshness
5. `Promise.all` for independent requests
6. Add **timeouts** for external APIs