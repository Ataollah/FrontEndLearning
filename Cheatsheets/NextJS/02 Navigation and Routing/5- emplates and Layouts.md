## Templates and Layouts in Next.js

Both **layouts** and **templates** wrap your pages with shared UI, but they behave very differently on navigation. Understanding the distinction is key to structuring your App Router app correctly.

## The Core Difference

| Feature | Layout | Template |
|---------|--------|----------|
| **State preserved on navigation?** | ✅ Yes | ❌ No |
| **Re-renders on navigation?** | ❌ No | ✅ Yes |
| **Re-mounts (new instance)?** | ❌ No | ✅ Yes |
| **Use for** | Persistent UI (nav, sidebar) | Animations, `useEffect` per route |
| **File name** | `layout.js` | `template.js` |

**Rule of thumb:** Use `layout` by default. Use `template` when you need a **fresh instance** of something for each route.

## Layouts (`layout.js`)

A layout wraps all child routes and **persists across navigation**. It does NOT re-render when you move between its children.

### Root Layout (Required)

Every App Router app needs a root layout at `app/layout.js`:

```javascript
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

**Requirements:**
- Must contain `<html>` and `<body>` tags
- Required at the root — the app won't build without it

### Nested Layouts

```
app/
├── layout.js              # Root layout
└── dashboard/
    ├── layout.js          # Wraps /dashboard/*
    └── users/
        ├── layout.js      # Wraps /dashboard/users/*
        └── page.js
```

```javascript
// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

### How Layouts Behave on Navigation

Navigate from `/dashboard/users` → `/dashboard/analytics`:

- Root layout: **not re-rendered** ✅
- Dashboard layout: **not re-rendered** ✅
- Only the page content swaps ✅

This means **state is preserved**:
```javascript
// app/dashboard/layout.js
'use client'
import { useState } from 'react'

export default function DashboardLayout({ children }) {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      {children}
    </div>
  )
}
```

Navigate between child routes → **count stays the same**. ✅

### Layouts Receive `children` and `params`

```javascript
// app/shop/[category]/layout.js
export default function CategoryLayout({ children, params }) {
  return (
    <div>
      <h2>Category: {params.category}</h2>
      {children}
    </div>
  )
}
```

### Layouts Don't Receive `searchParams`

A layout can't access query params — because it doesn't re-render on navigation. For that, you need a template or a client component using `useSearchParams`.

## Templates (`template.js`)

A template looks identical to a layout but behaves differently: it creates a **new instance for each child route** on navigation.

```javascript
// app/dashboard/template.js
export default function DashboardTemplate({ children }) {
  return <div className="template-wrapper">{children}</div>
}
```

### How Templates Behave on Navigation

Navigate from `/dashboard/users` → `/dashboard/analytics`:

- Template **re-mounts** ✅
- Component state **resets** ✅
- `useEffect` **runs again** ✅
- A **new DOM instance** is created ✅

### When to Use Templates

#### 1. Enter/Exit Animations

```javascript
// app/dashboard/template.js
'use client'
import { motion } from 'framer-motion'

export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```

Each route gets a fresh mount → animation replays.

#### 2. Resetting State on Route Change

```javascript
// app/search/template.js
'use client'
import { useState } from 'react'

export default function SearchTemplate({ children }) {
  const [query, setQuery] = useState('')
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {children}
    </div>
  )
}
```

Every route change resets the search input.

#### 3. Logging / Analytics Per Route

```javascript
// app/blog/template.js
'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function BlogTemplate({ children }) {
  const pathname = usePathname()
  
  useEffect(() => {
    analytics.trackPageView(pathname)
  }, [pathname])
  
  return <>{children}</>
}
```

`useEffect` re-runs on every route change inside the template.

#### 4. Route-Specific `useEffect` Logic

Need something to run every time a route loads? Template.

## Layout + Template Together

They stack — layout is the outer shell, template is inside it:

```
app/
├── layout.js          # Root (persists always)
└── dashboard/
    ├── layout.js      # Dashboard shell (persists)
    ├── template.js    # Re-mounts per route
    └── page.js
```

Render order for `/dashboard`:
```
RootLayout
└── DashboardLayout
    └── DashboardTemplate
        └── Page
```

## Visual: Layout vs Template on Navigation

Navigate `/dashboard/a` → `/dashboard/b`:

```
LAYOUT                          TEMPLATE
┌──────────────────┐            ┌──────────────────┐
│ Root Layout      │            │ Root Layout      │
│ ┌──────────────┐ │            │ ┌──────────────┐ │
│ │ Dash Layout  │ │            │ │ Dash Layout  │ │
│ │ ┌──────────┐ │ │            │ │ ┌──────────┐ │ │
│ │ │ Page A   │ │ │  ──────►   │ │ │ Page B   │ │ │
│ │ └──────────┘ │ │            │ │ └──────────┘ │ │
│ │ (same inst.) │ │            │ │ (NEW inst.)  │ │
│ └──────────────┘ │            │ └──────────────┘ │
└──────────────────┘            └──────────────────┘
Layout state preserved          Template state reset
```

## Layouts vs Templates: Side-by-Side Example

### Using a Layout

```javascript
// app/counter/layout.js
'use client'
import { useState } from 'react'

export default function CounterLayout({ children }) {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Layout count: {count}
      </button>
      {children}
    </div>
  )
}
```

```
/counter/a → click to count = 5
/counter/b → count is STILL 5  ✅ (persisted)
```

### Using a Template

```javascript
// app/counter/template.js
'use client'
import { useState } from 'react'

export default function CounterTemplate({ children }) {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Template count: {count}
      </button>
      {children}
    </div>
  )
}
```

```
/counter/a → click to count = 5
/counter/b → count is 0  ❌ (reset)
```

## Pages Router Equivalent

The Pages Router only has one concept: **`_app.js`** for global layout. Nested layouts are simulated manually.

```javascript
// pages/_app.js — equivalent to root layout (persists)
export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
```

**Per-page layouts** (manual nesting):
```javascript
// pages/dashboard/users.js
import DashboardLayout from '../../layouts/DashboardLayout'

Users.getLayout = page => (
  <DashboardLayout>{page}</DashboardLayout>
)

export default function Users() {
  return <h1>Users</h1>
}
```

Then in `_app.js`:
```javascript
export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? (page => page)
  return getLayout(<Component {...pageProps} />)
}
```

**No template concept** in Pages Router — you'd manually force re-mounts with a `key` prop:

```javascript
// _app.js — emulate template behavior
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  return <Component key={router.asPath} {...pageProps} />
}
```

Changing the `key` forces React to unmount and remount — the Pages Router's equivalent of a template.

## Layouts & Templates: File Reference

```
app/
├── layout.js          # Root layout (required)
├── template.js        # Root template (optional)
└── dashboard/
    ├── layout.js      # Dashboard layout
    ├── template.js    # Dashboard template (re-mounts per route)
    ├── page.js        # /dashboard
    ├── analytics/
    │   └── page.js    # /dashboard/analytics
    └── settings/
        ├── layout.js  # Settings-specific layout
        ├── page.js    # /dashboard/settings
        └── profile/
            └── page.js  # /dashboard/settings/profile
```

For `/dashboard/settings/profile`:
```
RootLayout
└── RootTemplate
    └── DashboardLayout
        └── DashboardTemplate
            └── SettingsLayout
                └── ProfilePage
```

## When to Use Which

### Use a **Layout** for:
- ✅ Navigation bars, sidebars
- ✅ Persistent UI across routes
- ✅ Shared state that should survive navigation
- ✅ Common context providers (theme, auth, cart)
- ✅ Anything that shouldn't re-render

### Use a **Template** for:
- ✅ Route transition animations
- ✅ Reset state on route change
- ✅ Per-route `useEffect` (analytics, focus management)
- ✅ Fresh form state per route
- ✅ Anything needing a **new instance** per route

## Real-World Example: E-commerce

```
app/
├── layout.js              # Header + footer (persistent)
└── products/
    ├── layout.js          # Product filters sidebar (persistent)
    ├── template.js        # Fade animation per product page
    └── [id]/
        ├── page.js        # Product detail
        └── reviews/
            └── page.js    # Reviews
```

- **Root layout** keeps the header/footer mounted → no flicker
- **Products layout** keeps the filter sidebar's state → filters don't reset
- **Products template** replays the fade animation whenever you switch products
- **Layout state** (filters, cart) persists; **template effects** (animation, logging) re-run

## Common Pitfalls

### ❌ Trying to use `useState` with searchParams in a layout
Layouts don't re-render on navigation, so they miss query changes.

### ✅ Use a template or client component
```javascript
// app/search/template.js
'use client'
import { useSearchParams } from 'next/navigation'

export default function SearchTemplate({ children }) {
  const params = useSearchParams()
  // Re-runs on navigation
  return <>{children}</>
}
```

### ❌ Putting entrance animations in a layout
They only play once — never on route change.

### ✅ Put them in a template
Each navigation re-mounts → animations replay.

### ❌ Assuming layouts receive `searchParams`
They don't — only `params` and `children`.

### ✅ Get search params in the page or a client component

## Key Takeaways

1. **Layout** = persistent shell. **Template** = fresh instance per route.
2. On navigation, layouts **don't** re-render; templates **do** re-mount.
3. Use **layouts** for shared UI + state; use **templates** for animations, resets, and per-route effects.
4. They **stack**: `RootLayout → RootTemplate → NestedLayout → NestedTemplate → Page`.
5. Root `layout.js` is **required** in App Router; `template.js` is **optional**.
6. Pages Router has no template concept — emulate it with a `key={router.asPath}` on the page component.