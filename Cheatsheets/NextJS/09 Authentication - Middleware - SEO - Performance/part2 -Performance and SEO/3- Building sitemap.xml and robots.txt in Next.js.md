# Building `sitemap.xml` and `robots.txt` in Next.js

Next.js has built-in file conventions to generate both files dynamically. You place special files in your `app/` directory, and Next.js serves them at the correct URLs automatically.

---

## 🗺️ Sitemap (`sitemap.ts` / `sitemap.xml`)

### 1. Static Sitemap
Create `app/sitemap.ts` and export a function that returns an array of URLs.

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://example.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://example.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]
}
```

This generates `https://example.com/sitemap.xml`.

### 2. Dynamic Sitemap (Fetching Data)
For sites with dynamic content (e.g., blog posts, products), fetch your data inside the function.

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://example.com'

  // Fetch dynamic content
  const posts = await fetch(`${baseUrl}/api/posts`).then((res) => res.json())

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postUrls,
  ]
}
```

### 3. Multiple Sitemaps
For large sites (>50,000 URLs), split into multiple sitemaps using `generateSitemaps`.

```ts
// app/product/sitemap.ts
import type { MetadataRoute } from 'next'

export async function generateSitemaps() {
  // Return an array of sitemap IDs
  return [{ id: 0 }, { id: 1 }, { id: 2 }]
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  const start = id * 50000
  const end = start + 50000
  const products = await getProducts(start, end)

  return products.map((product) => ({
    url: `https://example.com/product/${product.id}`,
    lastModified: product.updatedAt,
    priority: 0.7,
  }))
}
```

This creates `/product/sitemap/0.xml`, `/product/sitemap/1.xml`, etc.

### `MetadataRoute.Sitemap` Fields

| Field | Type | Description |
|---|---|---|
| `url` | `string` | **Required.** Full URL (absolute). |
| `lastModified` | `Date \| string` | When the page was last changed. |
| `changeFrequency` | `'always' \| 'hourly' \| 'daily' \| 'weekly' \| 'monthly' \| 'yearly' \| 'never'` | Hint for crawlers. |
| `priority` | `number` (0.0–1.0) | Relative importance within your site. |
| `alternates.languages` | `object` | For i18n alternate URLs. |

---

## 🤖 Robots (`robots.ts` / `robots.txt`)

### 1. Basic `robots.txt`
Create `app/robots.ts`:

```ts
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://example.com/sitemap.xml',
    host: 'https://example.com',
  }
}
```

This generates `https://example.com/robots.txt`.

### 2. Multiple Rules
You can pass an array of rule objects for different user agents.

```ts
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private/', '/admin/'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/', // Block AI crawlers
      },
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: '/',
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
    host: 'https://example.com',
  }
}
```

### `MetadataRoute.Robots` Fields

| Field | Type | Description |
|---|---|---|
| `rules` | object or array | `userAgent`, `allow`, `disallow`, `crawlDelay`. |
| `sitemap` | `string \| string[]` | URL(s) to your sitemap. |
| `host` | `string` | Canonical host for the site. |

---

## ⚙️ Environment-Based Configuration

A common pattern is to disable crawling in non-production environments:

```ts
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

  // Block everything in staging/preview
  if (process.env.VERCEL_ENV !== 'production') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

---

## 📂 Static Files (Alternative)

If you prefer static files, just drop them in the `public/` folder:

```
public/
├── robots.txt
└── sitemap.xml
```

> ⚠️ **Don't mix both approaches.** If you have `app/robots.ts` *and* `public/robots.txt`, the file-based convention in `app/` takes precedence, but it's confusing — pick one.

**Prefer `app/` conventions** when your URLs depend on dynamic data (e.g., CMS posts, DB products) or environments.

---

## ✅ Best Practices

1. **Use absolute URLs** in your sitemap (include `https://` + domain).
2. **Set `metadataBase`** in your root layout so relative URLs in metadata resolve correctly:
   ```ts
   export const metadata = {
     metadataBase: new URL('https://example.com'),
   }
   ```
3. **Only include canonical, indexable URLs** — exclude redirects, 404s, and `noindex` pages.
4. **Keep `lastModified` accurate** — Google uses it to decide re-crawls.
5. **Reference the sitemap in `robots.txt`** so crawlers discover it.
6. **Test locally** by running `npm run dev` and visiting:
   - `http://localhost:3000/sitemap.xml`
   - `http://localhost:3000/robots.txt`
7. **Submit to search engines**: Add your sitemap to [Google Search Console](https://search.google.com/search-console) and Bing Webmaster Tools.

---

## 🧪 Quick Verification

After deploying, verify with:
```bash
curl https://yourdomain.com/sitemap.xml
curl https://yourdomain.com/robots.txt
```

Or use Google's [Rich Results Test](https://search.google.com/test/rich-results) and [URL Inspection](https://support.google.com/webmasters/answer/9012289) tools.

Want me to show how to combine this with **i18n alternates** or **dynamic product pages from a database**?