## Nested Routes in Next.js

Nested routes allow you to create **hierarchical URL structures** by placing files/folders inside other folders. Each folder level adds a segment to the URL, and layouts can be shared across nested routes.

## Core Concept

Each folder = one URL segment. Nesting folders = nesting URL segments.

```
app/
└── dashboard/
    └── settings/
        └── profile/
            └── page.js    → /dashboard/settings/profile
```

The URL is built by **joining folder names** from root to the page file.

## Nested Routes in Pages Router

### Folder Structure = URL Structure
```
pages/
├── index.js                    → /
├── blog/
│   ├── index.js                → /blog
│   ├── [slug].js               → /blog/:slug
│   └── author/
│       ├── index.js            → /blog/author
│       └── [name].js           → /blog/author/:name
└── dashboard/
    ├── index.js                → /dashboard
    ├── analytics.js            → /dashboard/analytics
    └── users/
        ├── index.js            → /dashboard/users
        └── [id].js             → /dashboard/users/:id
```

### Nested Layouts (Pages Router)
Pages Router doesn't have true nested layouts built-in. You simulate them with composition:

```javascript
// components/DashboardLayout.js
export default function DashboardLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}

// pages/dashboard/users.js
import DashboardLayout from '../../components/DashboardLayout'

export default function Users() {
  return (
    <DashboardLayout>
      <h1>Users</h1>
    </DashboardLayout>
  )
}
```

Every page must manually wrap itself — repetitive.

## Nested Routes in App Router (Next.js 13+)

App Router has **true nested layouts** — a killer feature.

### Folder Structure = URL + Layout Hierarchy
```
app/
├── layout.js              # Root layout (applies to ALL routes)
├── page.js                # /
└── dashboard/
    ├── layout.js          # Dashboard layout (applies to /dashboard/*)
    ├── page.js            # /dashboard
    ├── analytics/
    │   └── page.js        # /dashboard/analytics
    └── users/
        ├── layout.js      # Users layout (applies to /dashboard/users/*)
        ├── page.js        # /dashboard/users
        └── [id]/
            └── page.js    # /dashboard/users/:id
```

### How Layouts Nest

When you visit `/dashboard/users/123`, Next.js renders:

```
RootLayout (app/layout.js)
└── DashboardLayout (app/dashboard/layout.js)
    └── UsersLayout (app/dashboard/users/layout.js)
        └── UserPage (app/dashboard/users/[id]/page.js)
```

Each layout **wraps** the one below it automatically. No manual composition needed.

### Example: Nested Layouts in Action

```javascript
// app/layout.js — Root layout
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
```

```javascript
// app/dashboard/layout.js — Dashboard layout
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <section className="flex-1">{children}</section>
    </div>
  )
}
```

```javascript
// app/dashboard/users/layout.js — Users layout
export default function UsersLayout({ children }) {
  return (
    <div>
      <UserTabs />
      {children}
    </div>
  )
}
```

```javascript
// app/dashboard/users/[id]/page.js — Final page
export default function UserPage({ params }) {
  return <h1>User: {params.id}</h1>
}
```

Result at `/dashboard/users/42`:
```html
<Navbar />
<div class="flex">
  <Sidebar />
  <section>
    <UserTabs />
    <h1>User: 42</h1>
  </section>
</div>
```

## Key Benefits of Nested Routes

### 1. **Shared UI Without Repetition**
Layouts defined once, applied to all child routes automatically.

### 2. **Partial Rendering**
On navigation, **only the changed segment re-renders**. Shared layouts stay mounted:
- Navigate `/dashboard/users` → `/dashboard/analytics`
- `DashboardLayout` **doesn't re-render**
- Only the page content swaps

### 3. **Independent Loading/Error States**
Each nested level can have its own `loading.js` and `error.js`:

```
app/dashboard/
├── layout.js
├── loading.js          # Loading for /dashboard/*
├── error.js            # Error for /dashboard/*
└── users/
    ├── loading.js      # Loading for /dashboard/users/*
    └── error.js        # Error for /dashboard/users/*
```

### 4. **Colocation**
Route-specific components, styles, and tests live next to the page:
```
app/dashboard/users/
├── page.js
├── UserCard.js         # Only used here
├── utils.js
└── [id]/
    └── page.js
```

### 5. **URL Reflects Structure**
Deeply nested UI = deeply nested URL. Easy to reason about.

## Nested Dynamic Routes

Combine nesting with dynamic segments:

```
app/
└── shop/
    └── [category]/
        └── [productId]/
            └── page.js
```

Matches:
- `/shop/shoes/123`
- `/shop/electronics/abc`

```javascript
// app/shop/[category]/[productId]/page.js
export default function Product({ params }) {
  const { category, productId } = params
  return <h1>{category} — Product {productId}</h1>
}
```

## Nested Route Groups

Use `(folderName)` to organize without adding URL segments:

```
app/
├── (marketing)/
│   ├── layout.js       # Marketing layout only
│   ├── about/page.js   → /about
│   └── pricing/page.js → /pricing
└── (shop)/
    ├── layout.js       # Shop layout only
    ├── cart/page.js    → /cart
    └── checkout/page.js → /checkout
```

Both groups have separate layouts but flat URLs.

## Common Nested Route Patterns

### 1. Dashboard with Sections
```
/dashboard
/dashboard/analytics
/dashboard/settings
/dashboard/settings/profile
/dashboard/settings/billing
```

### 2. E-commerce
```
/products
/products/[category]
/products/[category]/[id]
/cart
/checkout
/checkout/success
```

### 3. Documentation
```
/docs
/docs/getting-started
/docs/api
/docs/api/[endpoint]
```

## Visual Summary

```
URL: /dashboard/users/42

File tree:                    Render tree:
app/                          RootLayout
├── layout.js                    └── DashboardLayout
└── dashboard/                       └── UsersLayout
    ├── layout.js                        └── UserPage(42)
    └── users/
        ├── layout.js
        └── [id]/
            └── page.js
```

## Key Takeaway

**Nested routes** = folders inside folders → nested URLs + nested layouts. In the App Router, this gives you automatic layout inheritance, partial rendering, and scoped loading/error states — one of the biggest advantages over the Pages Router, where you had to manually compose layouts per page.