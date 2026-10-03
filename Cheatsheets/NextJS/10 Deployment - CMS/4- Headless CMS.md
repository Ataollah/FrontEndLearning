# Headless CMS

A **Headless CMS** is a content management system where the **backend (content repository + admin UI)** is completely decoupled from the **frontend (presentation layer)**. It manages and stores content, then exposes it via APIs (REST, GraphQL, or SDKs). "Headless" = it has no built-in "head" (no website/theme layer).

Think of it as: **content as a service**, consumed by any frontend — Next.js, React Native, a smartwatch, a kiosk, whatever.

---

## Traditional CMS vs Headless CMS

| Aspect | Traditional (WordPress, Drupal) | Headless (Sanity, Contentful) |
|--------|-------------------------------|-------------------------------|
| Frontend | Built-in themes/templates | You build it (any framework) |
| Delivery | HTML pages rendered server-side | JSON via API |
| Coupling | Tight (content + presentation) | Loose (API contract only) |
| Multi-channel | Hard | Native — same API, many clients |
| Dev freedom | Constrained by CMS | Total |
| Editor experience | Familiar WYSIWYG | Often better for structured content |

---

## Core Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Editors    │────▶│  Headless CMS   │────▶│  Content API │
│ (Admin UI)   │     │ (DB + logic)    │     │ REST/GraphQL │
└──────────────┘     └─────────────────┘     └──────┬───────┘
                                                     │
                          ┌──────────────────────────┼──────────────────────┐
                          ▼                          ▼                      ▼
                    ┌──────────┐              ┌──────────┐          ┌──────────┐
                    │ Next.js  │              │ Mobile   │          │  IoT /   │
                    │  Web     │              │  App     │          │  Kiosk   │
                    └──────────┘              └──────────┘          └──────────┘
```

---

## Key Characteristics

1. **API-first** — Every piece of content is accessible via API.
2. **Structured content** — Content modeled as typed fields (not just HTML blobs). Enables reuse across channels.
3. **Content modeling** — You define schemas: `Post { title, slug, body, author, tags }`.
4. **Omnichannel** — Same content powers web, mobile, email, voice, etc.
5. **Frontend agnostic** — Next.js, Nuxt, SvelteKit, Astro, plain HTML.
6. **Separation of concerns** — Editors manage content; devs manage presentation.

---

## Common Content Delivery Patterns

### REST API
```js
const res = await fetch('https://cdn.contentful.com/spaces/X/entries?content_type=post');
```

### GraphQL
```graphql
query {
  posts {
    title
    slug
    body { json }
  }
}
```

### SDK
```js
import { createClient } from '@sanity/client';
const client = createClient({ projectId, dataset, useCdn: true });
const posts = await client.fetch(`*[_type == "post"]`);
```

### CDN + Webhooks
- Content served from global CDN (fast, cached).
- On publish, CMS fires a **webhook** → your Next.js `/api/revalidate` → ISR updates.

---

## Popular Headless CMSs

### Hosted / SaaS
| CMS | Notes |
|-----|-------|
| **Contentful** | Enterprise-grade, mature, GraphQL + REST |
| **Sanity** | Real-time, GROQ query language, great DX, Portable Text |
| **Prismic** | Slices (reusable page sections), editor-friendly |
| **Storyblok** | Visual editor, component-based |
| **Hygraph** (GraphCMS) | GraphQL-native, federation |
| **DatoCMS** | Strong image handling, modular blocks |
| **ButterCMS** | Simple, marketing-focused |

### Open-source / Self-hosted
| CMS | Notes |
|-----|-------|
| **Strapi** | Node.js, REST + GraphQL, huge ecosystem |
| **Payload** | TypeScript, can run *inside* Next.js |
| **Directus** | Wraps any SQL database, instant API |
| **Ghost** | Publishing-focused, headless or with frontend |
| **KeystoneJS** | Node + GraphQL, code-first |

### Git-based (Markdown/MDX)
| CMS | Notes |
|-----|-------|
| **TinaCMS** | Visual editing on Git content |
| **Decap CMS** (Netlify CMS) | Git-backed, simple |
| **Keystatic** | Remix/Next.js friendly, type-safe |

### Hybrid
- **WordPress (headless)** — WP REST API / WPGraphQL as backend, Next.js frontend.
- **Notion as CMS** — via `notion-api` / `react-notion-x`.

---

## Content Modeling Concepts

| Concept | Meaning |
|---------|---------|
| **Content Type** | A schema, e.g., `BlogPost`, `Product` |
| **Field** | Typed property: `text`, `richText`, `reference`, `media`, `boolean` |
| **Reference** | Link to another content type (e.g., Post → Author) |
| **Asset** | Uploaded media (image, video, PDF) |
| **Localization** | Multi-locale content variants |
| **Draft / Published** | Content lifecycle states |
| **Environments** | Separate staging/production content spaces |

---

## Headless CMS + Next.js: Why It's a Great Match

1. **Hybrid rendering** — SSG/ISR/SSR/RSC all consume the same API.
2. **ISR** — CMS updates trigger revalidation; no full rebuild needed.
3. **Draft Mode** — Preview unpublished content safely.
4. **Image optimization** — `next/image` works with CMS CDNs.
5. **Edge rendering** — Fetch CMS content at the edge for speed.
6. **App Router + RSC** — Fetch content directly in server components.

### Revalidation webhook example
```js
// app/api/revalidate/route.js
import { revalidateTag } from 'next/cache';

export async function POST(req) {
  const { tag } = await req.json();
  revalidateTag(tag); // e.g., 'posts'
  return Response.json({ revalidated: true });
}
```

Then tag your fetches:
```js
await fetch(cmsUrl, { next: { tags: ['posts'] } });
```

---

## Pros and Cons

### ✅ Pros
- **Omnichannel** — one source of truth, many frontends.
- **Developer freedom** — pick any stack.
- **Performance** — static/CDN delivery possible.
- **Scalability** — decoupled frontend and backend scale independently.
- **Modern DX** — Git workflows, TypeScript, CI/CD.
- **Structured content** — reusable across contexts.

### ❌ Cons
- **No built-in preview** (must build it; some CMSs offer it).
- **More dev work upfront** — you build the frontend.
- **Editor learning curve** — structured content ≠ freeform WYSIWYG.
- **Vendor lock-in risk** (mitigated by API abstraction layers).
- **Cost** — hosted CMSs charge per seat/API call at scale.
- **SEO** — you must handle meta tags, sitemaps, structured data yourself.

---

## Best Practices

1. **Model content for reuse**, not for one page.
2. **Use references** for relationships (Author, Category, Related Posts).
3. **Cache aggressively** — CDN + ISR + tags.
4. **Webhook-driven revalidation** — update only what changed.
5. **Draft Mode for previews** — never expose drafts publicly.
6. **Abstract the CMS** — wrap fetches in a `lib/cms.ts` so you can swap providers.
7. **Generate types** from your schema (GraphQL codegen, Sanity TypeGen).
8. **Localize early** if you'll need i18n later.
9. **Version your content model** — treat schemas like code.
10. **Monitor API usage** — some CMSs bill per request.

---

## When to Use a Headless CMS

**Great fit:**
- Multi-channel delivery (web + mobile + more)
- Jamstack / Next.js / Astro sites
- Marketing sites with frequent content updates
- Structured, reusable content (products, docs, listings)
- Teams with dedicated developers

**Overkill / not ideal:**
- Tiny static sites (Markdown is fine)
- Simple blogs where WordPress already works
- Teams with no dev resources (traditional CMS easier)
- Heavy WYSIWYG/layout freedom requirements

---

## TL;DR

A **headless CMS** = content backend + admin UI, exposed via API, with **no frontend attached**. You bring your own frontend (Next.js, mobile, etc.). It's the standard architecture for modern, multi-channel, fast websites — trading convenience for flexibility, performance, and developer control.

Want a concrete walkthrough — e.g., building a blog with **Sanity + Next.js App Router** with ISR and preview mode?