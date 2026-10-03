# Revalidate vs Cache in Next.js

These two concepts are related but **not the same**. Cache = *where/how data is stored*. Revalidate = *when that stored data is refreshed*.

---

## The Big Picture

```
fetch() → [ CACHE ] ←──────── [ REVALIDATE ] triggers refresh
              ↑                       ↑
        stores the data         decides WHEN to refresh
```

- **Cache** = the stored copy of the response
- **Revalidate** = the rule for invalidating/refreshing that copy

---

## 1. Cache — *Where the data lives*

Next.js has **multiple cache layers**:

| Cache | What it stores | Scope |
|-------|---------------|-------|
| **Request Memoization** | Dedupes identical `fetch` calls | Single render pass |
| **Data Cache** | Fetched responses | Persistent across requests |
| **Full Route Cache** | Rendered HTML + RSC payload | Build/server |
| **Router Cache** | Client-side prefetch cache | Browser session |

When people say "the cache" in the fetch context, they mean the **Data Cache**.

```jsx
// Store this response in the Data Cache forever
fetch('https://api.com/posts')

// Don't store it at all
fetch('https://api.com/posts', { cache: 'no-store' })

// Store it, but as a named-taggable entry
fetch('https://api.com/posts', { next: { tags: ['posts'] } })
```

---

## 2. Revalidate — *When to refresh the cache*

Revalidation comes in **two flavors**:

### A. Time-based (automatic)
```jsx
fetch('https://api.com/posts', {
  next: { revalidate: 60 } // stale after 60s
})
```
- Cached at build
- Served stale for up to 60s
- After 60s, **next request** triggers a background refresh
- No user ever waits for the refresh

### B. On-demand (manual)
```jsx
'use server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function createPost() {
  await db.posts.create(...)
  revalidateTag('posts')      // refresh all fetches tagged 'posts'
  // or
  revalidatePath('/blog')     // refresh a specific route
}
```
- You decide **exactly when** to invalidate
- Perfect for CMS edits, form submissions, webhooks

---

## 3. How They Work Together

Revalidation **only means something if there's a cache to revalidate**.

```jsx
// ❌ Revalidate does nothing here — nothing is cached
fetch(url, { cache: 'no-store', next: { revalidate: 60 } })

// ✅ Cached, and refreshed every 60s
fetch(url, { next: { revalidate: 60 } })

// ✅ Cached, refreshed when you call revalidateTag('x')
fetch(url, { next: { tags: ['x'] } })
```

Think of it like this:

| Concept | Analogy |
|---------|---------|
| **Cache** | A fridge storing food |
| **Revalidate** | The rule for when to throw food out |

No fridge → no need for a rule. No rule → food sits forever.

---

## 4. The Full Decision Matrix

| `fetch` options | Cached? | Refreshed when? | Result |
|-----------------|---------|-----------------|--------|
| `{ cache: 'no-store' }` | ❌ | Every request | **SSR** |
| _(default, Next 13/14)_ | ✅ | Never | **SSG** |
| `{ next: { revalidate: 0 } }` | ❌ | Every request | **SSR** |
| `{ next: { revalidate: 60 } }` | ✅ | Every 60s | **ISR** |
| `{ next: { tags: ['x'] } }` | ✅ | On `revalidateTag('x')` | **On-demand ISR** |
| `{ next: { revalidate: 60, tags: ['x'] } }` | ✅ | Every 60s **OR** on tag | **Hybrid ISR** |

---

## 5. Three Levels of Revalidation

Next.js lets you revalidate at three scopes:

```jsx
// 1. PER-FETCH — only this request
fetch(url, { next: { revalidate: 60 } })

// 2. PER-PAGE — whole route segment
export const revalidate = 60

// 3. PER-TAG — any fetch with that tag
fetch(url, { next: { tags: ['products'] } })
revalidateTag('products')
```

### Per-page example
```jsx
// app/blog/page.js
export const revalidate = 3600 // revalidate this page hourly

export default async function Page() {
  const posts = await fetch('https://api.com/posts').then(r => r.json())
  return <List posts={posts} />
}
```
This applies to **all fetches** on the page unless overridden individually.

---

## 6. Time-Based Flow (Visual)

```
t=0s    Build → cache stored (v1)
t=10s   Request → serve v1 (fast, from cache)
t=30s   Request → serve v1
t=65s   Request → serve v1 (stale) AND trigger background refresh
t=66s   Cache now has v2
t=70s   Request → serve v2
```

**Key insight:** Users **always get a cached response** — never wait for a refresh. The new version appears on the *next* request after regeneration completes.

---

## 7. On-Demand Flow (Visual)

```
t=0s    Build → cache stored (v1, tagged 'posts')
t=10s   User views page → v1
t=30s   Admin edits post → createPost() runs
t=30s   revalidateTag('posts') → cache invalidated
t=35s   User views page → cache miss → fetch fresh → v2 cached
t=40s   User views page → v2
```

Much more precise than waiting for a timer.

---

## 8. Opting Out of the Cache Entirely

Three equivalent ways to always get fresh data:

```jsx
// 1. Per-fetch
fetch(url, { cache: 'no-store' })

// 2. Per-fetch (alt syntax)
fetch(url, { next: { revalidate: 0 } })

// 3. Whole segment
export const dynamic = 'force-dynamic'
```

Then `revalidate` has **no effect** — there's nothing cached to refresh.

---

## 9. Common Mistakes

**❌ Mixing no-store with revalidate**
```jsx
fetch(url, { cache: 'no-store', next: { revalidate: 60 } }) // revalidate ignored
```

**❌ Expecting revalidate to be instant**
```jsx
fetch(url, { next: { revalidate: 60 } })
// Won't refresh exactly at 60s — refreshes on the FIRST request AFTER 60s
```

**❌ Using tags without revalidating**
```jsx
fetch(url, { next: { tags: ['posts'] } })
// Tags do nothing unless you call revalidateTag('posts') somewhere
```

**❌ Assuming `no-store` is default in Next 15**
```jsx
fetch(url) // In Next 15, this is dynamic by default now
```

---

## 10. Mental Model

```
CACHE       = "Keep a copy"
REVALIDATE  = "Replace the copy when ___"

Time-based:    "Replace it every N seconds"
On-demand:     "Replace it when I say so"
No cache:      "Don't keep a copy — always fetch fresh"
```

**One-liner:**
> Cache decides *whether* to remember. Revalidate decides *when to forget*.

---

## 11. Real-World Combos

| Use case | Configuration |
|----------|---------------|
| Blog posts (change rarely) | `{ next: { revalidate: 3600 } }` |
| E-commerce product page | `{ next: { tags: ['product-123'] } }` + revalidate on admin edit |
| News homepage | `{ next: { revalidate: 60 } }` |
| Stock prices | `{ cache: 'no-store' }` |
| User dashboard | `{ cache: 'no-store' }` (or client-side `fetch`) |
| Marketing page | default (static, never revalidate) |
| Docs site | `{ next: { tags: ['docs'] } }` + revalidate on deploy |

---

## TL;DR

| | Cache | Revalidate |
|--|-------|------------|
| **Question it answers** | Do we store this? | When do we refresh it? |
| **Set via** | `cache: 'force-cache' \| 'no-store'` | `next.revalidate`, `next.tags` |
| **Applies to** | The stored response | The stored response |
| **Effect if absent** | Fetch every time | Cache never refreshes |
| **Analogy** | Fridge | Expiry rule |