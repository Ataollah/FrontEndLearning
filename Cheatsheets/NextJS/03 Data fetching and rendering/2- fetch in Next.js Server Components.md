# `fetch` in Next.js Server Components

Next.js **extends the native `fetch` API** with caching and revalidation controls. In a Server Component, `fetch` runs **on the server**, and its options determine whether the page is static, dynamic, or ISR.

---

## 1. It's an Extended `fetch`

It looks like normal `fetch`, but Next.js patches it to:
- Cache responses on the server
- Deduplicate identical requests
- Control revalidation
- Integrate with the build system

```jsx
// app/page.js  (Server Component by default)
export default async function Page() {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

No `'use client'` → this runs on the server only. The browser never sees this `fetch`.

---

## 2. The Cache Options (the important part)

### Default → Static (SSG)
```jsx
fetch('https://api.com/data')
// equivalent to:
fetch('https://api.com/data', { cache: 'force-cache' })
```
Fetched **once at build time**, cached forever. Page becomes **static**.

### `no-store` → Dynamic (SSR)
```jsx
fetch('https://api.com/data', { cache: 'no-store' })
```
Fetched **on every request**. Page becomes **dynamic (SSR)**.

### `revalidate` → ISR
```jsx
fetch('https://api.com/data', { next: { revalidate: 60 } })
```
Cached, but **regenerated at most every 60 seconds**. Page becomes **ISR**.

### Revalidate 0 → Always fresh
```jsx
fetch('https://api.com/data', { next: { revalidate: 0 } })
```
Same effect as `no-store`.

---

## 3. Comparison Table

| Option | Behavior | Resulting mode |
|--------|----------|----------------|
| _(default)_ | Cache at build | **SSG** |
| `cache: 'force-cache'` | Cache at build | **SSG** |
| `cache: 'no-store'` | Fetch every request | **SSR** |
| `next: { revalidate: N }` | Cache, refresh every N sec | **ISR** |
| `next: { revalidate: 0 }` | Always refetch | **SSR** |

> ⚠️ In Next.js 15, the **default changed to `no-store`** (dynamic) unless you opt into caching. In 13/14 the default was `force-cache`. Always be explicit.

---

## 4. Request Deduplication

If multiple components fetch the **same URL with the same options**, Next.js calls the API **only once** per render pass.

```jsx
// Header.jsx
const res = await fetch('https://api.com/user')

// Sidebar.jsx
const res = await fetch('https://api.com/user') // ← not a second network call
```

This works automatically — no need for a cache library.

---

## 5. Tag-Based Revalidation

You can tag cached data and invalidate it on demand.

```jsx
// Fetch with a tag
const res = await fetch('https://api.com/posts', {
  next: { tags: ['posts'] }
})
```

Then trigger revalidation from a Server Action or route handler:

```jsx
'use server'
import { revalidateTag } from 'next/cache'

export async function addPost() {
  await db.posts.create(...)
  revalidateTag('posts') // clears all fetches tagged 'posts'
}
```

This is how you build **on-demand ISR** — no timer, refresh exactly when data changes.

---

## 6. What Makes a Route Dynamic?

A page becomes **dynamic (SSR)** if any of these are true:
- Uses `fetch(..., { cache: 'no-store' })`
- Uses `cookies()`, `headers()`, or `searchParams`
- Uses `noStore()` from `next/cache`
- Has a dynamic segment without `generateStaticParams`

```jsx
import { cookies } from 'next/headers'

export default async function Page() {
  const token = cookies().get('token') // ← forces dynamic rendering
  ...
}
```

---

## 7. Time-Based Revalidation Example

```jsx
export default async function Products() {
  const res = await fetch('https://api.shop.com/products', {
    next: { revalidate: 300 } // refresh at most every 5 min
  })
  const products = await res.json()

  return products.map(p => <ProductCard key={p.id} {...p} />)
}
```

**Flow:**
1. First request after build → serves cached version
2. After 300s, next request triggers a background refetch
3. Users keep getting the old version until it's ready
4. New version swaps in — zero downtime

---

## 8. Error Handling

`fetch` doesn't throw on 4xx/5xx — you must check `res.ok`.

```jsx
const res = await fetch('https://api.com/data')

if (!res.ok) {
  throw new Error('Failed to fetch data') // caught by error.js
}
```

Next.js automatically catches thrown errors with `error.js` boundary files.

---

## 9. Native `fetch` vs Next.js `fetch`

| Feature | Native `fetch` | Next.js `fetch` |
|---------|---------------|-----------------|
| Caching | ❌ (you build it) | ✅ Built-in |
| Revalidation | ❌ | ✅ `next.revalidate` |
| Tags | ❌ | ✅ `next.tags` |
| Deduplication | ❌ | ✅ Automatic |
| Runs in Server Components | ✅ | ✅ |

---

## Mental Model

```
fetch(url, { cache: 'no-store' })          → SSR
fetch(url)                                  → SSG (default in 13/14)
fetch(url, { next: { revalidate: 60 } })    → ISR
fetch(url, { next: { tags: ['x'] } })       → ISR with on-demand refresh
```

The `fetch` call **is** the rendering strategy. You choose SSG / SSR / ISR simply by choosing how to cache the request — no separate config file needed.

---

## Full Example: Mixed Strategies in One Page

```jsx
export default async function Dashboard() {
  // Static — never changes
  const config = await fetch('https://api.com/config').then(r => r.json())

  // ISR — refresh every 10 min
  const stats = await fetch('https://api.com/stats', {
    next: { revalidate: 600 }
  }).then(r => r.json())

  // SSR — always fresh
  const user = await fetch('https://api.com/me', {
    cache: 'no-store'
  }).then(r => r.json())

  return (
    <>
      <Header config={config} />
      <Stats data={stats} />
      <UserPanel user={user} />
    </>
  )
}
```

Because one `fetch` uses `no-store`, **the whole page renders dynamically (SSR)**. To keep it static, make every `fetch` cacheable — the slowest/most dynamic fetch wins.