# CMS in Next.js

A **CMS (Content Management System)** in Next.js is a tool that lets you manage content (blog posts, products, pages) separately from your code, then fetch it into your Next.js app. Next.js works exceptionally well with CMSs because of its flexible data-fetching capabilities (SSG, SSR, ISR, and RSC).

## Two Main Types of CMS

### 1. **Traditional / Coupled CMS**
- Backend + frontend tightly connected (e.g., WordPress with its own theme system).
- Next.js can still consume it via REST/GraphQL, acting as a headless frontend.

### 2. **Headless CMS**
- Only provides content via API (REST or GraphQL).
- You build the frontend (Next.js) however you want.
- Examples: **Contentful, Sanity, Strapi, Payload, Prismic, Storyblok, Hygraph, Directus, WordPress (REST/GraphQL), Notion API**.

### 3. **Git-based CMS**
- Content stored as Markdown/MDX in your repo.
- Examples: **TinaCMS, Decap CMS (Netlify CMS), Keystatic**.
- Great for devs who want content versioned with code.

---

## How Next.js Fetches CMS Content

### App Router (Next.js 13+)

**Static (build-time):**
```js
// app/blog/page.js
async function getPosts() {
  const res = await fetch('https://cms.example.com/api/posts', {
    next: { revalidate: 60 } // ISR: revalidate every 60s
  });
  return res.json();
}

export default async function BlogPage() {
  const posts = await getPosts();
  return posts.map(p => <article key={p.id}>{p.title}</article>);
}
```

**Dynamic (per-request):**
```js
const res = await fetch(url, { cache: 'no-store' });
```

**Static params for dynamic routes:**
```js
// app/blog/[slug]/page.js
export async function generateStaticParams() {
  const posts = await fetch('https://cms.example.com/posts').then(r => r.json());
  return posts.map(p => ({ slug: p.slug }));
}
```

### Pages Router

```js
export async function getStaticProps() {
  const posts = await fetchCMS('/posts');
  return { props: { posts }, revalidate: 60 };
}

// or
export async function getServerSideProps() {
  const posts = await fetchCMS('/posts');
  return { props: { posts } };
}
```

---

## Rendering Strategies with a CMS

| Strategy | When to use |
|----------|-------------|
| **SSG** | Content rarely changes (marketing pages) |
| **ISR** | Blog/products — updates without rebuild |
| **SSR** | Personalized or always-fresh content |
| **CSR** | Dashboards, previews, user-specific |
| **RSC + Streaming** | Modern App Router default |

**ISR is the sweet spot** for most CMS-driven sites — fast like static, fresh like dynamic.

---

## Common CMS Integrations

### Sanity (popular)
```bash
npm i next-sanity
```
- GROQ queries, live preview, Portable Text rendering.

### Contentful
```js
import { createClient } from 'contentful';
const client = createClient({ space, accessToken });
const entries = await client.getEntries({ content_type: 'blogPost' });
```

### Strapi (self-hosted)
```js
const res = await fetch('http://localhost:1337/api/posts?populate=*');
```

### Payload CMS
- Can run **inside** your Next.js app (same server) — no separate backend needed.

### WordPress
- Use the REST API (`/wp-json/wp/v2/posts`) or WPGraphQL.

### MDX (local, no CMS)
```js
import { compileMDX } from 'next-mdx-remote/rsc';
```

---

## Key Features to Look For

1. **Preview mode** — Next.js has built-in [Draft Mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode) for unpublished content.
2. **On-demand revalidation** — trigger ISR updates via webhook from CMS:
   ```js
   // app/api/revalidate/route.js
   import { revalidatePath } from 'next/cache';
   export async function POST(req) {
     revalidatePath('/blog');
     return Response.json({ revalidated: true });
   }
   ```
3. **Image optimization** — use `next/image` with CMS image URLs (add domains to `next.config.js`).
4. **Rich text rendering** — Portable Text (Sanity), MDX, or custom renderers.
5. **Type safety** — generate types from GraphQL/OpenAPI schemas.

---

## Typical Architecture

```
[Editor] → [Headless CMS] → (REST/GraphQL API) → [Next.js]
                                                     ↓
                                          SSG / ISR / SSR / RSC
                                                     ↓
                                               [CDN / Edge]
```

Plus webhooks from CMS → Next.js revalidation endpoint for instant updates.

---

## Choosing a CMS for Next.js

| Need | Recommendation |
|------|----------------|
| Fastest setup, hosted | **Sanity, Contentful, Prismic** |
| Self-hosted, open-source | **Strapi, Directus, Payload** |
| Content in Git / dev-friendly | **TinaCMS, Keystatic, Decap** |
| Already using WordPress | **WP REST API / WPGraphQL** |
| Full-stack in one app | **Payload (Next.js native)** |

---

## TL;DR

A CMS in Next.js = a content backend you query via API, rendered through Next's hybrid rendering (SSG/ISR/SSR/RSC). **Headless CMS + ISR + on-demand revalidation + Draft Mode** is the standard modern stack — giving editors a nice UI and users a fast, static-feeling site.

Want me to walk through a concrete example (e.g., Sanity + App Router) with code?