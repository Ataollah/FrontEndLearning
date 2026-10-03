# Open Graph & Social Previews

When you paste a link into Slack, WhatsApp, Twitter/X, LinkedIn, or iMessage, you usually see a rich card with a title, description, and image instead of a bare URL. That card is powered by **Open Graph** metadata. Getting it right dramatically improves click-through rates from shared links.

---

## 🧠 What Is Open Graph?

**Open Graph (OG)** is a protocol created by Facebook in 2010 that lets a webpage describe itself to social platforms using `<meta>` tags. When a crawler hits your URL, it reads these tags and builds a preview card.

The four **required** properties are:

| Property | Purpose |
|---|---|
| `og:title` | Headline of the preview |
| `og:type` | Content type (`website`, `article`, `product`, `video.movie`, etc.) |
| `og:image` | Preview image URL |
| `og:url` | Canonical URL of the page |

Common **optional** properties: `og:description`, `og:site_name`, `og:locale`, `og:image:width`, `og:image:height`, `og:image:alt`.

---

## 🐦 Twitter/X Cards

Twitter uses its own tag set (`twitter:*`), which largely mirrors OG but gives you finer control:

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Article Title" />
<meta name="twitter:description" content="Short summary..." />
<meta name="twitter:image" content="https://example.com/og.png" />
```

**Card types:**
- `summary` → small square thumbnail on the left
- `summary_large_image` → wide banner image (best for blogs, products)
- `player` → embedded video/audio

**Pro tip:** If you only set OG tags, Twitter falls back to them. But explicitly setting `twitter:card` ensures the layout you want.

---

## 🖼️ The Image Is Everything

The preview image drives ~80% of the visual impact. Follow these rules:

| Platform | Ideal Size | Aspect Ratio | Max File Size |
|---|---|---|---|
| Facebook / LinkedIn | 1200×630 | 1.91:1 | 8 MB |
| Twitter/X (large card) | 1200×628 | 1.91:1 | 5 MB |
| WhatsApp | 300×200 min | ~1.91:1 | 300 KB |
| iMessage | 1200×630 | 1.91:1 | — |

**Rules of thumb:**
- **1200×630px** is the safest universal size.
- Use **JPG or PNG** (WebP support is inconsistent across platforms).
- Serve over **HTTPS** with an absolute URL—relative paths often fail.
- Keep text in the image minimal and large—thumbnails shrink it fast.
- Avoid transparency; some platforms render it as black.
- Declare `og:image:width` and `og:image:height` so the platform doesn't need to fetch the image twice.

---

## ⚠️ Common Pitfalls

- **Missing `metadataBase` in Next.js** → OG image URLs resolve to `localhost` or fail entirely.
- **Relative image URLs** → Many crawlers won't resolve them.
- **Caching** → Platforms cache previews aggressively (sometimes for weeks). Use their debugger tools to force-refresh.
- **Dynamic pages** → If every blog post shares one static OG image, previews become useless. Generate per-page images.
- **Client-side rendering** → If metadata is injected by JavaScript, most crawlers (except Google) won't see it. This is why Next.js's Server Component metadata API matters.
- **Hotlinked images** → Some platforms won't fetch images from third-party CDNs. Host them yourself.

---

## ⚡ Next.js Implementation

Next.js's Metadata API makes this trivial. The `metadataBase` is critical—it's the base URL against which all relative OG URLs resolve .

```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://your-site.com'),
  openGraph: {
    title: 'Default Title',
    description: 'Default description',
    url: '/',
    siteName: 'Your Site',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Site preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Default Title',
    description: 'Default description',
    images: ['/og-default.png'],
  },
}
```

**Per-page override:**

```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug)
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: `/api/og?title=${encodeURIComponent(post.title)}` }],
    },
  }
}
```

**File-based OG images:** Drop `opengraph-image.png` (1200×630) into any route folder and Next.js automatically wires it up—no config needed.

---

## 🎨 Dynamic OG Images with `next/og`

For blogs, e-commerce, or any templated content, generating a unique image per page is a huge upgrade. Next.js ships `ImageResponse` (via `next/og`) for exactly this.

```tsx
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Default'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          fontSize: 72,
          fontWeight: 700,
          padding: 60,
        }}
      >
        {title}
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

You style it with a **subset of CSS-in-JS** (Flexbox only, no Grid). Then reference it from your metadata:

```tsx
images: [{ url: `/api/og?title=${encodeURIComponent(post.title)}` }]
```

**Cost consideration:** Edge runtime is fast but billed per invocation. For high-traffic sites, cache generated images at the CDN layer or generate at build time for static pages.

---

## 🧪 Testing Your Previews

Never trust that your tags "just work." Test with:

- **Facebook Sharing Debugger** — `developers.facebook.com/tools/debug/`
- **Twitter Card Validator** — `cards-dev.twitter.com/validator`
- **LinkedIn Post Inspector** — `linkedin.com/post-inspector/`
- **OpenGraph.xyz** — quick multi-platform preview
- **Slack/WhatsApp** — just paste the link in a private chat to test live

These tools also **force-refresh the platform's cache** after you fix a problem.

---

## ✅ Open Graph Checklist

- `og:title`, `og:type`, `og:image`, `og:url` set on every page
- `og:description` written compellingly (150–200 chars)
- `og:image` is 1200×630, HTTPS, absolute URL, under 5 MB
- `og:image:width` and `og:image:height` declared
- `og:image:alt` provided for accessibility
- `twitter:card` set to `summary_large_image` for wide banners
- `metadataBase` configured in Next.js root layout
- Dynamic pages generate **unique** OG images (not one shared default)
- Preview validated with a debugger tool and cache refreshed
- Canonical `og:url` matches the page's actual URL (no trailing-slash mismatches)

---

Would you like a full working example combining dynamic OG images, per-page metadata, and a fallback strategy for pages without a custom image?