In Next.js, you set metadata by exporting a `metadata` object or a `generateMetadata` function from your `layout.js` or `page.js` files. Next.js then automatically generates the appropriate `<head>` tags for your pages.

### 📝 Static vs. Dynamic Metadata

There are two primary ways to define metadata, depending on whether the content is static or depends on dynamic data.

**Static Metadata**
For pages with fixed metadata, export a constant `metadata` object. This is ideal for the root layout or static pages like an "About Us" page.

```tsx
// app/blog/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Blog',
  description: 'Read the latest articles on my blog.',
}

export default function BlogLayout({ children }) {
  return <>{children}</>
}
```

**Dynamic Metadata**
When metadata depends on data from an API, a database, or route parameters, use the `generateMetadata` function. It's an async function that can fetch data and return a `Metadata` object.

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug
  // Fetch post information based on the slug
  const post = await fetch(`https://api.example.com/posts/${slug}`).then((res) => res.json())

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.imageUrl],
    },
  }
}

export default function Page({ params }: Props) {
  // Page component logic
}
```

### 🖼️ File-Based Metadata

Next.js also provides special file conventions for common metadata assets. You can add these files directly to your `app` directory, and Next.js will handle the rest.

| File Convention | Purpose |
| :--- | :--- |
| `favicon.ico` | Sets the browser tab icon. |
| `opengraph-image.jpg` | Sets the default Open Graph image for social sharing. |
| `twitter-image.jpg` | Sets the image for Twitter Cards. |
| `robots.txt` | Controls search engine crawling. |
| `sitemap.xml` | Provides a sitemap for search engines. |

For example, to add a favicon, you simply place a `favicon.ico` file in the root of your `app` folder.

### ⚙️ How Metadata Merges

Metadata is evaluated from the root layout down to the final page. Exported objects from different segments in the same route are **shallowly merged**. This means if a nested page defines a `title`, it will **override** the title from the parent layout. However, if it only defines an `openGraph` object, the parent's `openGraph` fields will be overridden entirely by the child's object.

### 💡 Best Practices

*   **Export from Server Components**: Both `metadata` and `generateMetadata` are only supported in Server Components.
*   **Use `metadataBase`**: Set this in your root layout to define the base URL for all relative metadata URLs, which is crucial for Open Graph images and canonical URLs.
*   **Memoize Data Fetching**: If you fetch the same data in both `generateMetadata` and your page component, wrap your fetch in React's `cache` function to prevent duplicate requests.