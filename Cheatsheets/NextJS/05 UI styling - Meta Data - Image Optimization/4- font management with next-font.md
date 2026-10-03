The `next/font` module is Next.js's built-in solution for handling fonts. It automatically optimizes your fonts, removes external network requests, and eliminates layout shift—all with zero configuration.

### 🎯 Why Use `next/font`?

Loading fonts traditionally (via Google Fonts `<link>` tags or `@import` in CSS) causes several performance problems:

- **Layout Shift (CLS)**: The browser renders fallback text first, then swaps to the web font, causing content to jump.
- **External Requests**: The browser must connect to Google's servers, adding latency.
- **Privacy Concerns**: User IPs are exposed to Google.

`next/font` solves all three by **self-hosting fonts at build time**, serving them from your own domain with a fallback font sized to match the web font exactly.

### 📦 Google Fonts

Import any Google Font directly from `next/font/google`:

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

**Key details:**
- Font names with spaces use underscores: `Roboto_Mono`, `Open_Sans`.
- **Variable fonts** (like Inter) don't need a `weight`—they include all weights in one file.
- **Non-variable fonts** require specifying `weight`: `Roboto({ weight: '400' })` or `weight: ['400', '700']`.
- Use `subsets` to reduce file size—`['latin']` is most common.

### 💻 Local Fonts

For custom font files, import from `next/font/local`:

```tsx
import localFont from 'next/font/local'

const myFont = localFont({
  src: './fonts/MyFont.woff2',
  display: 'swap',
})
```

**Important:** The `src` path is **relative to the file where `localFont` is called**, not the project root. If your font is in `public/fonts/`, you need `../public/fonts/MyFont.woff2` from `app/layout.tsx`.

For multiple weights of the same family, use an array:

```tsx
const roboto = localFont({
  src: [
    { path: './Roboto-Regular.woff2', weight: '400', style: 'normal' },
    { path: './Roboto-Bold.woff2', weight: '700', style: 'normal' },
  ],
})
```

### 🎨 Tailwind CSS Integration

`next/font` integrates with Tailwind using **CSS variables**. This is the recommended approach for multiple fonts.

**Step 1: Define fonts with `variable` option in layout**

```tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

**Step 2: Map variables in Tailwind config**

For **Tailwind v4** (CSS-based config):
```css
/* globals.css */
@import 'tailwindcss';

@theme inline {
  --font-sans: var(--font-inter);
  --font-mono: var(--font-roboto-mono);
}
```

For **Tailwind v3**:
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-roboto-mono)'],
      },
    },
  },
}
```

**Step 3: Use the utility classes**

```jsx
<p className="font-sans">Default text uses Inter</p>
<code className="font-mono">Code uses Roboto Mono</code>
```

### ⚠️ Common Pitfalls

**Don't import fonts in multiple components.** Each call to a font function creates a new instance. Define fonts once in a shared file and import the font object where needed:

```tsx
// app/fonts.ts
import { Inter, Roboto_Mono } from 'next/font/google'

export const inter = Inter({ subsets: ['latin'] })
export const robotoMono = Roboto_Mono({ subsets: ['latin'] })
```

**Avoid manual `<link>` tags.** `next/font` replaces them entirely—manual tags block rendering and skip optimization.

**Use `.woff2` for local fonts.** Older formats like `.woff` may cause font weight issues with variable fonts.

### 📋 Quick Reference

| Feature | Option | Notes |
|---|---|---|
| **Subset** | `subsets: ['latin']` | Required for Google Fonts to preload |
| **Display** | `display: 'swap'` | Recommended; shows fallback immediately |
| **Variable** | `variable: '--font-inter'` | Use for Tailwind integration |
| **Weight** | `weight: '400'` | Only needed for non-variable fonts |
| **Fallback** | `adjustFontFallback: 'Arial'` | Automatic fallback sizing (default: true) |

Would you like a complete example combining `next/font`, Tailwind v4, and a dark/light theme?