Next.js provides a built-in **Metadata API** that makes SEO configuration clean and declarative. Instead of manually writing `<head>` tags, you export a `metadata` object or a `generateMetadata` function from your Server Components.

### ⚙️ How It Works

The API operates on two levels:

- **Static Metadata**: A `metadata` object exported from a `layout.tsx` or `page.tsx` file, ideal for content that doesn't change .
- **Dynamic Metadata**: A `generateMetadata` async function that fetches data to populate metadata, used for content like blog posts or product pages .

**Important**: Both are only supported in **Server Components**. If a page has `'use client'`, you must either move metadata to a parent Server Component layout or split the file .

### 📄 Config-Based Metadata

**Root Layout (Global Defaults)**
Define site-wide defaults in `app/layout.tsx`. The `metadataBase` is critical for resolving relative URLs in Open Graph images and canonical links .

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://your-site.com'),
  title: {
    default: 'Site Name',
    template: '%s | Site Name', // Child pages inherit this pattern
  },
  description: 'Your site description',
  openGraph: {
    type: 'website',
    siteName: 'Site Name',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}
```

**Page-Specific Metadata**
Exporting `metadata` from a page **overrides** inherited values from parent layouts .

```tsx
export const metadata: Metadata = {
  title: 'About Us', // Renders as "About Us | Site Name"
  description: 'Learn about our team.',
}
```

**Dynamic Metadata**
Use `generateMetadata` to fetch data based on route params. React's `cache()` prevents duplicate fetches when the page needs the same data .

```tsx
import { cache } from 'react'

const getPost = cache(async (slug: string) => {
  return await db.posts.findFirst({ where: { slug } })
})

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return {
    title: post.title,
    description: post.description,
  }
}
```

### 📁 File-Based Metadata

Next.js automatically detects special files placed in the `app/` directory, overriding any config-based metadata for that route .

| File | Purpose |
|---|---|
| `favicon.ico` | Browser tab icon |
| `opengraph-image.png` | Social media preview (1200×630px) |
| `twitter-image.png` | Twitter card image (falls back to OG) |
| `sitemap.ts` | Generates `/sitemap.xml` |
| `robots.ts` | Generates `/robots.txt` |

A single `opengraph-image.png` in `app/` covers both Open Graph and Twitter previews .

### 🤖 Sitemap & Robots

**Sitemap (`app/sitemap.ts`)**
Generates a dynamic `sitemap.xml` at build time .

```tsx
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://your-site.com', lastModified: new Date(), priority: 1.0 },
    { url: 'https://your-site.com/about', changeFrequency: 'monthly', priority: 0.8 },
  ]
}
```

**Robots (`app/robots.ts`)**
Controls crawler access and links your sitemap .

```tsx
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] }],
    sitemap: 'https://your-site.com/sitemap.xml',
  }
}
```

### 📊 Structured Data (JSON-LD)

Structured data enables rich results (star ratings, prices, FAQs) in Google. Add it as a `<script>` tag in your page component .

```tsx
export default function ProductPage({ product }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    price: product.price,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>{product.name}</h1>
    </>
  )
}
```

### ✅ SEO Checklist

Before deploying, verify these essentials :

- **Title** unique per page, under 60 characters
- **Description** compelling, 150–160 characters
- **Canonical URLs** set via `alternates: { canonical: '/path' }`
- **MetadataBase** configured in root layout
- **Open Graph image** at 1200×630px, accessible via absolute URL
- **Sitemap and robots.txt** accessible at `/sitemap.xml` and `/robots.txt`
- **Server Components** used for content pages so crawlers see real HTML, not loading states

A common mistake is using `next/head` from the Pages Router—it does nothing in the App Router. Use `metadata` or `generateMetadata` instead .