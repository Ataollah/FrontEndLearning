# SEO and Performance in Next.js

Next.js is a React framework built by Vercel that provides powerful built-in features for both **SEO** and **performance**. Let me break down each area.

---

## 🔍 SEO in Next.js

SEO (Search Engine Optimization) is about making your site easy for search engines to crawl, understand, and rank. Next.js offers several features for this.

### 1. Server-Side Rendering (SSR) & Static Generation (SSG)
Unlike plain React (client-side rendered), Next.js can render HTML on the server or at build time — so crawlers see fully populated content.

| Rendering Method | When HTML is Generated | Best For |
|---|---|---|
| **SSG** (`getStaticProps`) | At build time | Blogs, marketing pages |
| **SSR** (`getServerSideProps`) | On each request | Dashboards, personalized content |
| **ISR** | Build + revalidate on interval | News sites, e-commerce |
| **CSR** | In the browser | Highly dynamic, user-specific UIs |

### 2. The Metadata API (App Router)
Next.js 13+ uses the `metadata` export for clean SEO tags:

```tsx
// app/blog/[slug]/page.tsx
export const metadata = {
  title: 'My Blog Post',
  description: 'A great article about Next.js',
  openGraph: {
    title: 'My Blog Post',
    images: ['/og-image.png'],
  },
  twitter: { card: 'summary_large_image' },
};
```

### 3. Dynamic Metadata
For dynamic pages, use `generateMetadata`:

```tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

### 4. Other SEO Features
- **`next/image`** — auto-optimized images improve Core Web Vitals (a ranking factor)
- **`next/sitemap`** & **`next/robots`** — auto-generate `sitemap.xml` and `robots.txt`
- **Structured data** — add JSON-LD via `<script type="application/ld+json">`
- **Canonical URLs** — via the `alternates` metadata field
- **Automatic font optimization** with `next/font` (reduces CLS)

---

## ⚡ Performance in Next.js

Performance impacts both user experience and SEO (Google uses Core Web Vitals). Next.js optimizes many things out of the box.

### 1. Automatic Code Splitting
Each page/route only loads the JavaScript it needs, thanks to the file-based routing system.

### 2. Image Optimization (`next/image`)
```tsx
import Image from 'next/image';

<Image src="/hero.jpg" alt="Hero" width={800} height={600} priority />
```
- Lazy loads by default
- Serves modern formats (WebP/AVIF)
- Prevents layout shift (CLS)
- `priority` for above-the-fold images

### 3. Font Optimization (`next/font`)
Self-hosts Google Fonts, eliminating render-blocking requests and layout shift:
```tsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

### 4. Streaming & Suspense (App Router)
Stream HTML progressively so users see content faster:
```tsx
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>
```

### 5. Route Handlers & Edge Runtime
Run logic close to the user (Edge) for lower latency.

### 6. Caching Layers
- **Full Route Cache** — static routes cached at build time
- **Data Cache** — fetch requests cached and revalidated
- **Router Cache** — client-side cache for navigation
- **Request Memoization** — dedupes fetch calls in one render

### 7. `next/dynamic` for Lazy Loading
```tsx
const HeavyChart = dynamic(() => import('../components/Chart'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});
```

### 8. Bundle Analysis
```bash
npm install @next/bundle-analyzer
ANALYZE=true npm run build
```

---

## 🔗 How They Intersect

| Optimization | SEO Benefit | Performance Benefit |
|---|---|---|
| SSR/SSG | Crawlable HTML | Faster FCP |
| `next/image` | Better LCP (ranking) | Smaller payloads |
| Code splitting | — | Faster TTI |
| Metadata API | Rich snippets | — |
| Caching | — | Faster repeat visits |

**Key metrics Google cares about (Core Web Vitals):**
- **LCP** (Largest Contentful Paint) — loading speed
- **INP** (Interaction to Next Paint) — responsiveness
- **CLS** (Cumulative Layout Shift) — visual stability

---

## ✅ Best Practices Summary

1. **Prefer SSG/ISR** unless content is user-specific
2. **Always use `next/image` and `next/font`**
3. **Export `metadata` on every page** (title, description, OG)
4. **Keep client components small** — push `"use client"` to the leaves
5. **Use `Suspense` + streaming** for slow data
6. **Add `sitemap.ts` and `robots.ts`**
7. **Monitor with Vercel Analytics or Lighthouse**

Want me to dive deeper into any specific area — like the App Router vs Pages Router for SEO, or a full performance audit checklist?