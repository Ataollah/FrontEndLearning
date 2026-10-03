## File-based Routing in Next.js

File-based routing is Next.js's core routing system where **the file structure of your project automatically defines your application's routes**. Instead of manually configuring routes, you create files in specific directories, and Next.js handles the routing for you.

## How It Works

### Basic Structure
```
pages/                    (Pages Router)
├── index.js             → /
├── about.js             → /about
├── blog/
│   ├── index.js         → /blog
│   ├── first-post.js    → /blog/first-post
│   └── [slug].js        → /blog/:slug (dynamic)
└── products/
    └── [...categories].js → /products/* (catch-all)
```

```
app/                      (App Router - Next.js 13+)
├── page.js              → /
├── about/
│   └── page.js          → /about
├── blog/
│   ├── page.js          → /blog
│   └── [slug]/
│       └── page.js      → /blog/:slug
└── layout.js            → Shared layout
```

## Key Concepts

### 1. **Index Routes**
Files named `index.js` (Pages Router) or `page.js` (App Router) represent the root of a directory:
```
pages/index.js          → /
pages/blog/index.js     → /blog
```

### 2. **Nested Routes**
Folders create URL segments:
```
pages/dashboard/settings/profile.js → /dashboard/settings/profile
```

### 3. **Dynamic Routes**
Square brackets create dynamic segments:
```javascript
// pages/posts/[id].js
export default function Post({ params }) {
  return <h1>Post ID: {params.id}</h1>
}
// Matches: /posts/1, /posts/hello, etc.
```

### 4. **Catch-all Routes**
Three dots inside brackets capture multiple segments:
```javascript
// pages/docs/[...slug].js
// Matches: /docs/a, /docs/a/b, /docs/a/b/c
```

### 5. **Optional Catch-all Routes**
Double brackets make the catch-all optional:
```javascript
// pages/shop/[[...categories]].js
// Matches: /shop, /shop/clothes, /shop/clothes/shirts
```

## Pages Router vs App Router

### Pages Router (Traditional)
```javascript
// pages/blog/[slug].js
import { useRouter } from 'next/router'

export default function BlogPost() {
  const router = useRouter()
  const { slug } = router.query
  
  return <h1>Post: {slug}</h1>
}

// Data fetching
export async function getStaticProps({ params }) {
  const post = await getPost(params.slug)
  return { props: { post } }
}
```

### App Router (Next.js 13+)
```javascript
// app/blog/[slug]/page.js
export default function BlogPost({ params }) {
  return <h1>Post: {params.slug}</h1>
}

// Data fetching (Server Component)
async function getPost(slug) {
  const res = await fetch(`https://api.example.com/posts/${slug}`)
  return res.json()
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  return <h1>{post.title}</h1>
}
```

## Special Files (App Router)

| File | Purpose |
|------|---------|
| `page.js` | Defines a route's UI |
| `layout.js` | Shared UI that wraps pages |
| `loading.js` | Loading UI (Suspense) |
| `error.js` | Error boundary |
| `not-found.js` | 404 UI |
| `route.js` | API endpoints |

## Benefits

1. **Intuitive** - URL structure mirrors file structure
2. **Less boilerplate** - No route configuration needed
3. **Colocation** - Related files live together
4. **Type safety** - With TypeScript, params are typed
5. **Built-in features** - Code splitting, prefetching, layouts

## Common Patterns

### Route Groups (App Router)
Organize without affecting URL:
```
app/
├── (marketing)/
│   ├── about/page.js    → /about
│   └── contact/page.js  → /contact
└── (shop)/
    └── cart/page.js     → /cart
```

### Parallel Routes
```
app/
└── dashboard/
    ├── @team/page.js
    └── @analytics/page.js
```

### Intercepting Routes
```
app/
└── photo/
    └── (..)feed/  → Intercepts /feed from /photo
```

## Quick Comparison

| Feature | Pages Router | App Router |
|---------|--------------|------------|
| Directory | `pages/` | `app/` |
| Route file | `index.js` | `page.js` |
| Layouts | `_app.js` | `layout.js` (nested) |
| Data fetching | `getStaticProps`, `getServerSideProps` | `async` components, `fetch` |
| Default | Client Components | Server Components |

## Example: Complete Blog Structure

```
app/
├── layout.js              # Root layout
├── page.js                # Home /
├── blog/
│   ├── layout.js          # Blog layout
│   ├── page.js            # /blog
│   └── [slug]/
│       ├── page.js        # /blog/:slug
│       └── loading.js     # Loading state
└── api/
    └── posts/
        └── route.js       # API endpoint
```

**In short:** File-based routing means your folder structure *is* your routing configuration — create a file, get a route. It's one of Next.js's most powerful features for building scalable applications quickly.