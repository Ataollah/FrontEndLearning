## Loading and Error Pages in Next.js

Next.js gives you **special files** that automatically handle loading and error states for each route. You don't wire them up manually — you just create `loading.js` or `error.js` in a folder, and Next.js uses them for that route segment.

## The Special Files

| File | Purpose | Router |
|------|---------|--------|
| `loading.js` | Loading UI (Suspense fallback) | App Router |
| `error.js` | Error boundary (client) | App Router |
| `global-error.js` | Root error boundary | App Router |
| `not-found.js` | 404 UI | App Router |
| `_error.js` | Custom error page | Pages Router |
| `404.js` | Custom 404 page | Pages Router |

## Loading Pages (`loading.js`)

A `loading.js` file wraps its route segment in a **React Suspense boundary**. While the page's data is being fetched (server-side), Next.js shows your loading UI.

### Basic Loading

```
app/
└── dashboard/
    ├── loading.js
    └── page.js
```

```javascript
// app/dashboard/loading.js
export default function Loading() {
  return <p>Loading dashboard...</p>
}
```

When you navigate to `/dashboard`, this shows **instantly** while `page.js` loads.

### How It Works

```javascript
// Conceptually, Next.js does this:
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
```

The loading UI appears **only on first load** of the segment — on subsequent navigations, it may be prefetched and shown instantly.

### Skeleton Example

```javascript
// app/dashboard/loading.js
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
      <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
      <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
    </div>
  )
}
```

### Nested Loading States

Each route segment can have its own loading UI. The **closest ancestor** `loading.js` is used:

```
app/
├── loading.js                 # Fallback for entire app
└── dashboard/
    ├── loading.js             # Fallback for /dashboard/*
    └── users/
        ├── loading.js         # Fallback for /dashboard/users/*
        └── page.js
```

Navigating to `/dashboard/users`:
1. If only root `loading.js` exists → use it
2. If `dashboard/loading.js` exists → use it (more specific)
3. If `users/loading.js` exists → use it (most specific)

Nested loadings **stack** — an outer loading shows while an inner one resolves.

### Streaming with Loading

Because it's Suspense-based, `loading.js` enables **streaming** — the shell renders immediately, and content streams in:

```javascript
// app/dashboard/page.js
async function SlowComponent() {
  await new Promise(r => setTimeout(r, 3000))
  return <p>Loaded after 3s</p>
}

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading slow part...</p>}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}
```

- Shell (`h1`) shows instantly
- `loading.js` shows during initial navigation
- `SlowComponent` streams in when ready

## Error Pages (`error.js`)

An `error.js` file creates a **React Error Boundary** for its route segment. It catches errors thrown during rendering, data fetching, or in client components within its scope.

### ⚠️ Must Be a Client Component

```javascript
// app/dashboard/error.js
'use client'  // REQUIRED

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Props

| Prop | Description |
|------|-------------|
| `error` | The error object (has `message`, `digest`) |
| `reset` | Function to retry rendering the segment |

### How It Works

```javascript
// Conceptually:
<ErrorBoundary fallback={<Error />}>
  <Page />
</ErrorBoundary>
```

The error page **replaces** the failing segment's content — **parent layouts remain intact**. So if the sidebar is in a layout, it stays visible; only the erroring content swaps.

### `reset()` Behavior

Calling `reset()` re-renders the error boundary. Useful for:
- Retrying a failed fetch
- Recovering from transient errors

```javascript
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => reset()}>Retry</button>
    </div>
  )
}
```

### Nested Error Boundaries

Like loading, errors bubble to the **nearest ancestor** `error.js`:

```
app/
├── error.js                   # Catches app-wide errors
└── dashboard/
    ├── error.js               # Catches /dashboard/* errors
    └── users/
        ├── error.js           # Catches /dashboard/users/* errors
        └── page.js
```

An error in `/dashboard/users/page.js` is caught by `users/error.js` first. If that file doesn't exist, it bubbles up to `dashboard/error.js`, then `error.js`, etc.

### Error Hierarchy Example

```javascript
// app/dashboard/users/error.js
'use client'

export default function UsersError({ error, reset }) {
  return (
    <div className="error-box">
      <h2>Failed to load users</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Reload users</button>
    </div>
  )
}
```

If `page.js` throws, only the users section shows the error — the rest of the dashboard layout is preserved.

## Global Error (`global-error.js`)

The root `error.js` cannot catch errors in the **root layout** itself, because it's rendered *inside* that layout. For that, use `global-error.js` at the app root.

```javascript
// app/global-error.js
'use client'

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

**Notes:**
- Must be at `app/global-error.js` (root only)
- Must include `<html>` and `<body>` (it replaces the root layout)
- Only activates in production
- Rarely used — usually for root layout failures

## Not Found (`not-found.js`)

A 404 UI for a route segment. Triggered by calling `notFound()` or by unmatched routes.

```javascript
// app/not-found.js
import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <h2>404 — Not Found</h2>
      <Link href="/">Go home</Link>
    </div>
  )
}
```

### Triggering Programmatically

```javascript
// app/blog/[slug]/page.js
import { notFound } from 'next/navigation'

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  
  if (!post) notFound()   // renders not-found.js
  
  return <h1>{post.title}</h1>
}
```

### Nested Not Found

Just like loading/error, `not-found.js` can be placed per-segment:

```
app/
├── not-found.js                 # App-wide 404
└── blog/
    ├── not-found.js             # Blog-specific 404
    └── [slug]/
        └── page.js
```

When `notFound()` is called in `/blog/[slug]`, the closest `not-found.js` renders — with parent layouts intact.

## Putting It All Together

```
app/
├── layout.js                 # Root layout
├── loading.js                # App-wide loading
├── error.js                  # App-wide error
├── global-error.js           # Root layout error
├── not-found.js              # App-wide 404
└── dashboard/
    ├── layout.js             # Dashboard layout
    ├── loading.js            # Dashboard loading
    ├── error.js              # Dashboard error
    ├── not-found.js          # Dashboard 404
    └── users/
        ├── loading.js        # Users loading
        ├── error.js          # Users error
        └── page.js
```

### A Full Example

```javascript
// app/dashboard/users/loading.js
export default function Loading() {
  return <UserListSkeleton />
}
```

```javascript
// app/dashboard/users/error.js
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Couldn't load users</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )
}
```

```javascript
// app/dashboard/users/page.js
import { notFound } from 'next/navigation'

export default async function UsersPage() {
  const res = await fetch('https://api.example.com/users')
  
  if (!res.ok) throw new Error('Failed to fetch users')  // → error.js
  const users = await res.json()
  
  if (users.length === 0) notFound()  // → not-found.js
  
  return <UserList users={users} />
}
```

Flow:
1. **Navigate** to `/dashboard/users` → `loading.js` shows
2. **Fetch fails** → `error.js` renders (with retry button)
3. **Fetch succeeds but empty** → `not-found.js` renders
4. **Fetch succeeds with data** → page renders

## Pages Router Equivalents

The Pages Router doesn't have per-segment loading/error files. You handle it manually.

### Loading (`_app.js` or per-page)

```javascript
// pages/_app.js
import { useRouter } from 'next/router'
import NProgress from 'nprogress'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  
  // Custom loading state
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const start = () => setLoading(true)
    const done = () => setLoading(false)
    router.events.on('routeChangeStart', start)
    router.events.on('routeChangeComplete', done)
    return () => {
      router.events.off('routeChangeStart', start)
      router.events.off('routeChangeComplete', done)
    }
  }, [])
  
  return (
    <>
      {loading && <TopLoader />}
      <Component {...pageProps} />
    </>
  )
}
```

### Error Boundary

You must create your own class component:

```javascript
// components/ErrorBoundary.js
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, info) {
    console.error(error, info)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

### 404 & 500 Pages

```
pages/
├── 404.js        # Custom 404
└── 500.js        # Custom server error
```

```javascript
// pages/404.js
export default function Custom404() {
  return <h1>404 - Page Not Found</h1>
}
```

```javascript
// pages/500.js
export default function Custom500() {
  return <h1>500 - Server Error</h1>
}
```

### Custom Error Page

```javascript
// pages/_error.js
function Error({ statusCode }) {
  return (
    <p>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : 'An error occurred on client'}
    </p>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
```

## Comparison: App Router vs Pages Router

| Concern | App Router | Pages Router |
|---------|-----------|--------------|
| Loading | `loading.js` (auto Suspense) | Manual (`router.events`, NProgress) |
| Error | `error.js` (auto boundary) | Custom `ErrorBoundary` component |
| Global error | `global-error.js` | `_error.js` |
| 404 | `not-found.js` | `404.js` |
| Per-route scope | ✅ Automatic | ❌ Manual per page |
| Nested | ✅ Inherited from ancestors | ❌ Manual |

## Best Practices

### 1. Design Loading Skeletons, Not Spinners
Skeletons match the final layout → less jarring transition.

```javascript
export default function Loading() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  )
}
```

### 2. Show Actionable Errors
Give users a way forward:

```javascript
'use client'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log to error reporting
    console.error(error)
  }, [error])
  
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
      <Link href="/">Go home</Link>
    </div>
  )
}
```

### 3. Use Route-Specific Errors
Don't let a small widget failure take down the whole app — scope your error boundaries.

### 4. Reset on Route Change
The `reset` from `error.js` retries the segment. For navigation-based reset, give the error a `key` tied to the pathname or use a template.

### 5. Catch Errors on the Server Too
`error.js` catches client errors. Server-side errors (in Server Components) also propagate to `error.js` — but make sure you throw real errors, not silently return null.

```javascript
// app/users/page.js
export default async function UsersPage() {
  const res = await fetch('https://api.example.com/users')
  
  if (!res.ok) throw new Error(`Failed: ${res.status}`)  // → error.js
  
  return <UserList users={await res.json()} />
}
```

## Common Pitfalls

### ❌ Forgetting `'use client'` in `error.js`
```javascript
// app/dashboard/error.js
export default function Error() { /* ... */ }  // 💥 Build error
```

### ✅ Add the directive
```javascript
'use client'
export default function Error() { /* ... */ }
```

### ❌ Trying to catch root layout errors in `error.js`
Root layout errors bypass `app/error.js`. Use `global-error.js`.

### ✅ Place it at the app root
```
app/global-error.js
```

### ❌ Using `useState` to track loading in App Router
Next.js handles it — use `loading.js` and `<Suspense>`.

### ✅ Create a `loading.js`
```
app/dashboard/loading.js
```

### ❌ Calling `notFound()` and continuing
`notFound()` throws — code after it doesn't run.

### ✅ Call it and return
```javascript
if (!post) notFound()
// unreachable if not found — fine
return <Post data={post} />
```

## Key Takeaways

1. **`loading.js`** = automatic Suspense fallback for a route segment. Shows while data loads.
2. **`error.js`** = automatic error boundary. **Must be a client component**, receives `error` and `reset` props.
3. **`global-error.js`** = catches errors in the root layout (rare, must include `<html>`/`<body>`).
4. **`not-found.js`** = custom 404 UI; trigger with `notFound()`.
5. All these files are **route-scoped** and **nested** — the closest ancestor wins, and parent layouts stay intact.
6. **Pages Router** has no automatic equivalents — you build loading/error UX manually with `_app.js`, `ErrorBoundary`, `404.js`, and `500.js`.