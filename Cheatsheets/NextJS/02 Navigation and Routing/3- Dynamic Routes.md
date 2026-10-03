## Dynamic Routes in Next.js

Dynamic routes let you create pages with **URLs that aren't known at build time** — like `/blog/my-first-post`, `/users/42`, or `/shop/shoes/nike-air-max`. You define a pattern once, and it matches many URLs.

## The Core Idea

Use **square brackets** `[param]` in a filename to create a dynamic segment. The value in the URL becomes available as a parameter in your component.

```
pages/blog/[slug].js   →  /blog/anything
                              ↑
                          slug = "anything"
```

## Pages Router (Traditional)

### 1. Basic Dynamic Route

```javascript
// pages/blog/[slug].js
import { useRouter } from 'next/router'

export default function BlogPost() {
  const router = useRouter()
  const { slug } = router.query
  
  return <h1>Post: {slug}</h1>
}
// Matches: /blog/hello  → slug = "hello"
// Matches: /blog/nextjs → slug = "nextjs"
```

### 2. Data Fetching with Dynamic Params

```javascript
// pages/blog/[slug].js
export async function getStaticPaths() {
  const posts = await getPosts()
  
  return {
    paths: posts.map(post => ({
      params: { slug: post.slug }
    })),
    fallback: false  // or 'blocking' or true
  }
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug)
  return { props: { post } }
}

export default function BlogPost({ post }) {
  return <h1>{post.title}</h1>
}
```

**Fallback options:**
| Value | Behavior |
|-------|----------|
| `false` | Only pre-rendered paths work; others 404 |
| `true` | Show fallback UI, generate page on-demand |
| `'blocking'` | Wait for page to generate, then serve (no fallback) |

### 3. Server-Side Rendering

```javascript
// pages/users/[id].js
export async function getServerSideProps({ params }) {
  const user = await getUser(params.id)
  return { props: { user } }
}

export default function User({ user }) {
  return <h1>{user.name}</h1>
}
```

### 4. Multiple Dynamic Segments

```
pages/shop/[category]/[productId].js  →  /shop/shoes/123
```

```javascript
export default function Product() {
  const router = useRouter()
  const { category, productId } = router.query
  return <h1>{category} — {productId}</h1>
}
```

### 5. Catch-all Routes

Use `[...param]` to capture **one or more** segments:

```
pages/docs/[...slug].js
```

| URL | `slug` value |
|-----|--------------|
| `/docs/a` | `['a']` |
| `/docs/a/b` | `['a', 'b']` |
| `/docs/a/b/c` | `['a', 'b', 'c']` |
| `/docs` | ❌ No match (404) |

```javascript
export default function Docs() {
  const router = useRouter()
  const { slug } = router.query  // always an array
  return <h1>Path: {slug?.join(' / ')}</h1>
}
```

### 6. Optional Catch-all Routes

Use `[[...param]]` to also match the **base path**:

```
pages/shop/[[...categories]].js
```

| URL | `categories` |
|-----|--------------|
| `/shop` | `undefined` |
| `/shop/clothes` | `['clothes']` |
| `/shop/clothes/shirts` | `['clothes', 'shirts']` |

```javascript
export default function Shop() {
  const router = useRouter()
  const { categories } = router.query
  
  if (!categories) return <h1>All products</h1>
  return <h1>Category: {categories.join(' / ')}</h1>
}
```

### 7. Linking to Dynamic Routes

```javascript
import Link from 'next/link'

<Link href="/blog/my-post">Read post</Link>

// Or with template literals
<Link href={`/blog/${post.slug}`}>Read post</Link>

// Or object form
<Link href={{ pathname: '/blog/[slug]', query: { slug: post.slug } }}>
  Read post
</Link>
```

## App Router (Next.js 13+)

### 1. Basic Dynamic Route

```
app/blog/[slug]/page.js  →  /blog/:slug
```

```javascript
// app/blog/[slug]/page.js
export default function BlogPost({ params }) {
  return <h1>Post: {params.slug}</h1>
}
```

**Key difference:** `params` is a **prop** (not from `useRouter()`), and it's a **Promise in Next.js 15+**:

```javascript
// Next.js 15+
export default async function BlogPost({ params }) {
  const { slug } = await params
  return <h1>Post: {slug}</h1>
}
```

### 2. Data Fetching (Server Components)

No `getStaticProps`/`getServerSideProps` — just use `async`:

```javascript
// app/blog/[slug]/page.js
async function getPost(slug) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    cache: 'no-store'  // SSR: fetch every request
    // or next: { revalidate: 60 }  // ISR: revalidate every 60s
  })
  return res.json()
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  return <h1>{post.title}</h1>
}
```

### 3. Static Params (Build-time Generation)

Replaces `getStaticPaths`:

```javascript
// app/blog/[slug]/page.js
export async function generateStaticParams() {
  const posts = await getPosts()
  
  return posts.map(post => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  return <h1>{post.title}</h1>
}
```

**By default:** paths not returned by `generateStaticParams` are generated on-demand (equivalent to `fallback: 'blocking'`).

Control this with:
```javascript
export const dynamicParams = false // 404 for unlisted paths
```

### 4. Multiple Dynamic Segments

```
app/shop/[category]/[productId]/page.js  →  /shop/:category/:productId
```

```javascript
export default async function Product({ params }) {
  const { category, productId } = await params
  return <h1>{category} — {productId}</h1>
}
```

### 5. Catch-all Routes

```
app/docs/[...slug]/page.js
```

| URL | `slug` |
|-----|--------|
| `/docs/a` | `['a']` |
| `/docs/a/b` | `['a', 'b']` |

```javascript
export default async function Docs({ params }) {
  const { slug } = await params  // array
  return <h1>{slug.join(' / ')}</h1>
}
```

### 6. Optional Catch-all Routes

```
app/shop/[[...categories]]/page.js
```

| URL | `categories` |
|-----|--------------|
| `/shop` | `undefined` |
| `/shop/clothes` | `['clothes']` |
| `/shop/clothes/shirts` | `['clothes', 'shirts']` |

```javascript
export default async function Shop({ params }) {
  const { categories } = await params
  
  if (!categories) return <h1>All products</h1>
  return <h1>{categories.join(' / ')}</h1>
}
```

### 7. generateStaticParams for Catch-all

```javascript
export async function generateStaticParams() {
  return [
    { slug: ['docs'] },
    { slug: ['docs', 'getting-started'] },
    { slug: ['docs', 'api', 'routes'] },
  ]
}
```

### 8. Linking to Dynamic Routes

```javascript
import Link from 'next/link'

<Link href="/blog/my-post">Read post</Link>
<Link href={`/blog/${post.slug}`}>Read post</Link>
```

## Other Files in Dynamic Folders

Dynamic folders can contain more than just `page.js`:

```
app/blog/[slug]/
├── page.js           → /blog/:slug
├── layout.js         → layout for that post
├── loading.js        → loading UI for that post
├── error.js          → error UI for that post
├── not-found.js      → 404 UI for that post
└── opengraph-image.js → dynamic OG image
```

## Comparing Route Types

| Pattern | File | Matches | Params |
|---------|------|---------|--------|
| Static | `about.js` | `/about` | — |
| Dynamic | `[id].js` | `/users/1` | `{ id: '1' }` |
| Catch-all | `[...slug].js` | `/docs/a/b` | `{ slug: ['a','b'] }` |
| Optional catch-all | `[[...slug]].js` | `/docs`, `/docs/a` | `undefined` or `['a']` |

## Common Pitfalls

### ❌ Wrong: Slug is undefined during SSR
```javascript
export default function Post() {
  const router = useRouter()
  return <h1>{router.query.slug}</h1>  // undefined on first render!
}
```

### ✅ Right: Wait for router or use props
```javascript
export default function Post() {
  const router = useRouter()
  if (!router.isReady) return <div>Loading...</div>
  return <h1>{router.query.slug}</h1>
}
```

### ❌ Wrong: Catch-all treated as string
```javascript
const { slug } = router.query  // slug is array for [...slug]
slug.toUpperCase()             // 💥 error
```

### ✅ Right: Handle array
```javascript
const { slug } = router.query
const path = Array.isArray(slug) ? slug.join('/') : slug
```

### ❌ Wrong: params used directly in Next.js 15
```javascript
export default function Page({ params }) {
  return <h1>{params.slug}</h1>  // Warning: params is a Promise
}
```

### ✅ Right: Await params
```javascript
export default async function Page({ params }) {
  const { slug } = await params
  return <h1>{slug}</h1>
}
```

## Real-World Example: Blog

```
app/
└── blog/
    ├── page.js                 → /blog (list of posts)
    └── [slug]/
        ├── page.js             → /blog/:slug (single post)
        ├── loading.js          → skeleton while loading
        └── not-found.js        → custom 404 for missing posts
```

```javascript
// app/blog/[slug]/page.js
import { notFound } from 'next/navigation'

async function getPost(slug) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 60 }
  })
  if (!res.ok) return null
  return res.json()
}

export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  return { title: post?.title ?? 'Not Found' }
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post) notFound()  // renders not-found.js
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

## Key Takeaways

1. **`[param]`** = one dynamic segment, **`[...param]`** = one or more, **`[[...param]]`** = zero or more
2. **Pages Router**: params come from `useRouter().query`; fetch data via `getStaticProps`/`getServerSideProps`; pre-generate paths with `getStaticPaths`
3. **App Router**: params are a prop (a `Promise` in Next.js 15+); fetch data directly in `async` components; pre-generate with `generateStaticParams`
4. **Catch-all params are arrays** — always handle them as arrays
5. Dynamic routes combine naturally with **nested routes and layouts** for scalable URL hierarchies