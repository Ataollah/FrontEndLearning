# Rendering Methods in Next.js

Next.js offers four main rendering strategies. Here's what each one means:

---

## 1. CSR — Client-Side Rendering

**What:** HTML is rendered in the browser using JavaScript after the page loads.

**When it happens:** At request time, in the user's browser.

**How in Next.js:**
- Use `'use client'` + `useEffect` + `useState`
- Or libraries like SWR / React Query

```jsx
'use client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])
  return <div>{data?.name}</div>
}
```

**Pros:** Rich interactivity, no server load for rendering  
**Cons:** Slow first paint, poor SEO, blank flash  
**Use for:** Dashboards, user-specific pages, heavy interactive apps

---

## 2. SSR — Server-Side Rendering

**What:** HTML is generated on the server **on every request**.

**When it happens:** At request time, on the server.

**How in Next.js (App Router):**
```jsx
export default async function Page() {
  const res = await fetch('https://api.com/data', { cache: 'no-store' })
  const data = await res.json()
  return <div>{data.name}</div>
}
```
`cache: 'no-store'` = always fresh = SSR.

**Pros:** Always up-to-date data, great SEO, fast first paint  
**Cons:** Slower TTFB, server cost per request  
**Use for:** Personalized feeds, dashboards needing fresh data, auth pages

---

## 3. SSG — Static Site Generation

**What:** HTML is generated **once at build time** and reused for every request.

**When it happens:** `next build` (build time).

**How in Next.js:**
```jsx
export default async function Page() {
  const res = await fetch('https://api.com/data') // default = cached
  const data = await res.json()
  return <div>{data.name}</div>
}
```
Default `fetch` in Next.js App Router = static = SSG.

**Pros:** Fastest possible (served from CDN), cheap, great SEO  
**Cons:** Data can be stale until rebuild  
**Use for:** Blogs, marketing pages, docs, landing pages

---

## 4. ISR — Incremental Static Regeneration

**What:** Static pages that **revalidate in the background** after a set time — a hybrid of SSG + SSR.

**When it happens:** Build time + background regeneration on interval.

**How in Next.js:**
```jsx
export default async function Page() {
  const res = await fetch('https://api.com/data', {
    next: { revalidate: 60 } // rebuild at most every 60s
  })
  const data = await res.json()
  return <div>{data.name}</div>
}
```

**Flow:**
1. Build generates static page
2. Users get the cached version (fast!)
3. After 60s, next request triggers background rebuild
4. New version replaces old — no downtime

**Pros:** Static speed + fresh data, no full rebuild needed  
**Cons:** Data can be up to `revalidate` seconds stale  
**Use for:** E-commerce products, news sites, large content sites

---

## Quick Comparison

| Method | Rendered | When | Speed | Freshness | SEO |
|--------|----------|------|-------|-----------|-----|
| **CSR** | Browser | Request | Slow first load | Always fresh | ❌ Poor |
| **SSR** | Server | Every request | Medium | Always fresh | ✅ Great |
| **SSG** | Server | Build time | Fastest | Stale until rebuild | ✅ Great |
| **ISR** | Server | Build + interval | Fast | Fresh-ish | ✅ Great |

---

## Mental Model

```
CSR  → Browser does everything
SSR  → Server renders on every request
SSG  → Server renders once at build
ISR  → SSG that updates itself on a timer
```

In Next.js App Router, you don't pick explicitly — the `fetch` cache option decides:
- `cache: 'no-store'` → **SSR**
- default / `force-cache` → **SSG**
- `next: { revalidate: N }` → **ISR**
- `'use client'` + hooks → **CSR**

That's the whole system.