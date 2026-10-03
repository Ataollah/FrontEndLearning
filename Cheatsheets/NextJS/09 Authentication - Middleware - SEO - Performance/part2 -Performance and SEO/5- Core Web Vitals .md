# Core Web Vitals in Next.js

Core Web Vitals are Google's set of metrics that measure real user experience. They directly affect search rankings. In Next.js, you can optimize each one using built-in features.

---

## 🎯 The Three Core Metrics & Thresholds

Google evaluates your site using the **75th percentile** of user data. The metric only "passes" if 75% of your users have a good experience.

| Metric | What It Measures | Good | Needs Improvement | Poor |
| :--- | :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | Loading performance | **≤ 2.5s** | ≤ 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | Responsiveness | **≤ 200ms** | ≤ 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | **≤ 0.1** | ≤ 0.25 | > 0.25 |

> **Note:** INP replaced FID (First Input Delay) in March 2024 as a Core Web Vital.

---

## ⚡ Optimizing Each Metric in Next.js

### 1. LCP — Make Main Content Appear Fast

**Image Optimization**
Use `next/image` — it auto-converts to modern formats (WebP/AVIF), compresses, and prevents layout shift. For hero images above the fold, add `priority`:
```tsx
import Image from 'next/image'

<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />
```

**Font Optimization**
Use `next/font` to self-host fonts, eliminating render-blocking requests:
```tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
```

**Rendering Strategy**
Use **SSG** or **SSR** so HTML arrives with content already populated — avoid client-side rendering for above-the-fold content.

---

### 2. INP — Keep the Page Responsive

**Reduce Main Thread Blocking**
INP suffers when long JavaScript tasks block the main thread. Use `next/dynamic` to code-split and lazy-load heavy components:
```tsx
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('../components/Chart'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
})
```

**Optimize Third-Party Scripts**
Use `next/script` with the right strategy so analytics, chat widgets, etc. don't block interactivity:
```tsx
import Script from 'next/script'

<Script src="https://example.com/analytics.js" strategy="lazyOnload" />
```

**Strategies:** `beforeInteractive` → `afterInteractive` (default) → `lazyOnload`

---

### 3. CLS — Keep the Layout Stable

**Reserve Space for Media**
`next/image` automatically reserves space using `width`/`height`, preventing content jumps.

**Stable Fonts**
`next/font` matches font metrics with fallback fonts, so text doesn't shift when the custom font loads.

**Handle Dynamic Content**
For client-injected content (cookie banners, ads, toasts), reserve a `min-height` container so insertion doesn't push content down.

---

## 📊 Monitoring in Next.js

Since Google ranks based on **field data** (real users), you need to measure real experiences. Next.js provides the `useReportWebVitals` hook to send metrics to your analytics service.

**Basic usage:**
```tsx
// app/_components/WebVitals.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to your analytics endpoint
    console.log(metric)

    // Example: send to Google Analytics
    // window.gtag('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // })
  })

  return null
}
```

Then include it in your root layout:
```tsx
// app/layout.tsx
import { WebVitals } from './_components/WebVitals'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WebVitals />
        {children}
      </body>
    </html>
  )
}
```

---

## 🛠️ Tools for Measurement

| Tool | Type | Use Case |
| :--- | :--- | :--- |
| **Chrome DevTools → Lighthouse** | Lab | Local debugging |
| **PageSpeed Insights** | Lab + Field | Real CrUX data + audit |
| **Search Console → Core Web Vitals** | Field | Real user data from Google |
| **Vercel Analytics / Speed Insights** | Field | Real user data on Vercel |
| **web-vitals library** | Field | Custom RUM (Real User Monitoring) |

---

## ✅ Quick Wins Checklist

- [ ] Use `next/image` everywhere with `priority` on LCP images
- [ ] Use `next/font` for all custom fonts
- [ ] Lazy-load below-the-fold components with `next/dynamic`
- [ ] Defer third-party scripts with `strategy="lazyOnload"`
- [ ] Prefer SSG/ISR over client-side rendering for content pages
- [ ] Reserve space for ads, embeds, and dynamic content
- [ ] Monitor with `useReportWebVitals` + Vercel Speed Insights
- [ ] Set performance budgets in Lighthouse CI

---

## 📈 Field vs. Lab Data

| | Lab Data | Field Data |
| :--- | :--- | :--- |
| **Source** | Synthetic (Lighthouse) | Real users (CrUX) |
| **Purpose** | Debug & test | Ranking signal |
| **Variability** | Low (controlled) | High (real devices/networks) |
| **Google uses for ranking?** | ❌ No | ✅ Yes |

**Key takeaway:** Lab data helps you *find and fix* problems. Field data determines your *search ranking*. Always optimize for field data.

---

Want me to show you how to set up **Vercel Speed Insights** or build a **custom RUM dashboard** for these metrics?