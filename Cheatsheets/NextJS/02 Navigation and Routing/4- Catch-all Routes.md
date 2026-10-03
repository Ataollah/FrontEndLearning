## Catch-all Routes in Next.js

Catch-all routes let a **single file match multiple URL segments at any depth**. Instead of creating `[a].js`, `[a]/[b].js`, `[a]/[b]/[c].js`... you write one file with `[...param]` and it captures them all as an array.

## The Syntax

| Pattern | Name | Matches |
|---------|------|---------|
| `[slug]` | Dynamic | Exactly one segment |
| `[...slug]` | **Catch-all** | One or more segments |
| `[[...slug]]` | **Optional catch-all** | Zero or more segments |

The three dots `...` inside brackets is what makes it "catch-all."

## Pages Router

### 1. Basic Catch-all

```
pages/docs/[...slug].js
```

```javascript
// pages/docs/[...slug].js
import { useRouter } from 'next/router'

export default function Docs() {
  const router = useRouter()
  const { slug } = router.query  // ALWAYS an array
  
  return <h1>Path: {slug?.join(' / ')}</h1>
}
```

| URL | `slug` value |
|-----|--------------|
| `/docs/getting-started` | `['getting-started']` |
| `/docs/api/routes` | `['api', 'routes']` |
| `/docs/api/routes/dynamic` | `['api', 'routes', 'dynamic']` |
| `/docs` | ❌ **404** — catch-all requires at least one segment |

### 2. Optional Catch-all

```
pages/shop/[[...categories]].js
```

```javascript
// pages/shop/[[...categories]].js
import { useRouter } from 'next/router'

export default function Shop() {
  const router = useRouter()
  const { categories } = router.query
  
  if (!categories) return <h1>All products</h1>
  return <h1>Category: {categories.join(' / ')}</h1>
}
```

| URL | `categories` value |
|-----|--------------------|
| `/shop` | `undefined` ✅ (unlike plain catch-all) |
| `/shop/clothes` | `['clothes']` |
| `/shop/clothes/shirts` | `['clothes', 'shirts']` |

### 3. Data Fetching with Catch-all

```javascript
// pages/docs/[...slug].js
export async function getStaticPaths() {
  return {
    paths: [
      { params: { slug: ['getting-started'] } },
      { params: { slug: ['api', 'routes'] } },
      { params: { slug: ['api', 'routes', 'dynamic'] } },
    ],
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const doc = await getDoc(params.slug.join('/'))
  return { props: { doc } }
}

export default function Doc({ doc }) {
  return <article>{doc.content}</article>
}
```

**Note:** `params.slug` is an **array** in `getStaticPaths` and `getStaticProps`.

### 4. Linking to Catch-all Routes

```javascript
import Link from 'next/link'

<Link href="/docs/getting-started">Getting Started</Link>
<Link href="/docs/api/routes">API Routes</Link>

// Object form
<Link href={{
  pathname: '/docs/[...slug]',
  query: { slug: ['api', 'routes'] }
}}>
  API Routes
</Link>
```

## App Router

### 1. Basic Catch-all

```
app/docs/[...slug]/page.js
```

```javascript
// app/docs/[...slug]/page.js
export default async function Docs({ params }) {
  const { slug } = await params  // Next.js 15+: await required
  // slug is ALWAYS an array
  
  return <h1>Path: {slug.join(' / ')}</h1>
}
```

| URL | `slug` |
|-----|--------|
| `/docs/getting-started` | `['getting-started']` |
| `/docs/api/routes` | `['api', 'routes']` |
| `/docs` | ❌ 404 |

### 2. Optional Catch-all

```
app/shop/[[...categories]]/page.js
```

```javascript
// app/shop/[[...categories]]/page.js
export default async function Shop({ params }) {
  const { categories } = await params
  
  if (!categories) return <h1>All products</h1>
  return <h1>{categories.join(' / ')}</h1>
}
```

| URL | `categories` |
|-----|--------------|
| `/shop` | `undefined` ✅ |
| `/shop/clothes` | `['clothes']` |
| `/shop/clothes/shirts` | `['clothes', 'shirts']` |

### 3. generateStaticParams

Returns an **array of arrays** for catch-all routes:

```javascript
// app/docs/[...slug]/page.js
export async function generateStaticParams() {
  return [
    { slug: ['getting-started'] },
    { slug: ['api', 'routes'] },
    { slug: ['api', 'routes', 'dynamic'] },
  ]
}

export default async function Docs({ params }) {
  const { slug } = await params
  const doc = await getDoc(slug.join('/'))
  return <article>{doc.content}</article>
}
```

### 4. Fetching Data

```javascript
// app/docs/[...slug]/page.js
async function getDoc(path) {
  const res = await fetch(`https://api.example.com/docs/${path}`, {
    next: { revalidate: 3600 }
  })
  if (!res.ok) return null
  return res.json()
}

export default async function Docs({ params }) {
  const { slug } = await params
  const doc = await getDoc(slug.join('/'))
  
  if (!doc) notFound()
  return <article>{doc.content}</article>
}
```

### 5. Catch-all with Additional Files

```
app/docs/[...slug]/
├── page.js            → /docs/*
├── layout.js          → wraps all /docs/* pages
├── loading.js         → loading UI
├── error.js           → error boundary
└── not-found.js       → 404 UI
```

## Catch-all vs Optional Catch-all

The ONLY difference is whether the **base path matches**:

```
File: pages/shop/[...categories].js
  /shop              ❌ 404
  /shop/a            ✅ ['a']
  /shop/a/b          ✅ ['a', 'b']

File: pages/shop/[[...categories]].js
  /shop              ✅ undefined
  /shop/a            ✅ ['a']
  /shop/a/b          ✅ ['a', 'b']
```

## Real-World Use Cases

### 1. Documentation Sites
```
/docs
/docs/getting-started
/docs/api/routes
/docs/api/routes/dynamic
/docs/guides/deployment/vercel
```
One file handles everything:
```
app/docs/[[...slug]]/page.js
```

### 2. File Browsers / CMS
```
/files
/files/images
/files/images/2024
/files/images/2024/photo.jpg
```
```
app/files/[[...path]]/page.js
```

### 3. GitHub-style URLs
```
/user/repo
/user/repo/issues
/user/repo/issues/42
/user/repo/pull/7/files
```
```
app/[owner]/[repo]/[[...path]]/page.js
```

### 4. Multi-language / Localized Routes
```
/en
/en/about
/en/blog/post-1
```
```
app/[locale]/[[...slug]]/page.js
```

### 5. E-commerce Category Trees
```
/shop
/shop/clothes
/shop/clothes/shirts
/shop/clothes/shirts/casual
```
```
app/shop/[[...categories]]/page.js
```

## Common Mistakes

### ❌ Treating catch-all params as a string
```javascript
const { slug } = router.query
slug.toUpperCase()  // 💥 slug is an array!
```

### ✅ Join or index into it
```javascript
const { slug } = router.query
const [first, ...rest] = slug ?? []
// or
const path = (slug ?? []).join('/')
```

### ❌ Forgetting `await params` in Next.js 15
```javascript
export default function Page({ params }) {
  return <h1>{params.slug}</h1>  // ⚠️ params is a Promise
}
```

### ✅ Await it
```javascript
export default async function Page({ params }) {
  const { slug } = await params
  return <h1>{slug}</h1>
}
```

### ❌ Confusing optional catch-all with plain catch-all
```javascript
// pages/shop/[...categories].js
// Visiting /shop → 404, not "all products"
```

### ✅ Use `[[...categories]]` if `/shop` should work
```
pages/shop/[[...categories]].js
```

### ❌ Returning non-array from generateStaticParams
```javascript
export async function generateStaticParams() {
  return [
    { slug: 'getting-started' },  // ⚠️ Should be array
  ]
}
```

### ✅ Return arrays
```javascript
export async function generateStaticParams() {
  return [
    { slug: ['getting-started'] },
    { slug: ['api', 'routes'] },
  ]
}
```

## Comparison Table

| File | `/docs` | `/docs/a` | `/docs/a/b` |
|------|:-------:|:---------:|:-----------:|
| `docs/index.js` | ✅ | ❌ | ❌ |
| `docs/[slug].js` | ❌ | ✅ | ❌ |
| `docs/[...slug].js` | ❌ | ✅ | ✅ |
| `docs/[[...slug]].js` | ✅ | ✅ | ✅ |

## Key Takeaways

1. **`[...param]`** captures **1+ segments** as an array; **`[[...param]]`** also matches the **base path** (0+ segments)
2. The param value is **always an array** — never a string
3. Plain catch-all → base path is **404**; optional catch-all → base path works
4. In App Router, `params` is a **Promise** (Next.js 15+) — always `await` it
5. `generateStaticParams` must return **arrays** for catch-all slugs
6. Perfect for **docs, CMS, file trees, GitHub-like URLs**, and any **variable-depth hierarchy** — you write one file instead of many