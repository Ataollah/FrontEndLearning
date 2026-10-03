## Navigation in Next.js: `Link` and `useRouter`

Next.js gives you two primary ways to navigate: the **`<Link>` component** for declarative navigation (like `<a>` tags) and the **`useRouter` / `useRouter`-equivalent hooks** for programmatic navigation (in response to events). Both do **client-side navigation** — no full page reload — which is the core performance win over plain `<a>` tags.

## Why Not Plain `<a>` Tags?

```javascript
// ❌ Full page reload — loses state, re-downloads everything
<a href="/about">About</a>

// ✅ Client-side navigation — instant, preserves state
import Link from 'next/link'
<Link href="/about">About</Link>
```

| | `<a>` tag | `<Link>` | `router.push()` |
|---|---|---|---|
| Page reload | ✅ Full | ❌ None | ❌ None |
| Prefetch | ❌ | ✅ Auto | ❌ |
| Preserves state | ❌ | ✅ | ✅ |
| Best for | External links | Declarative nav | Event-driven nav |

## The `<Link>` Component

`<Link>` extends `<a>` with prefetching and client-side navigation. When a link enters the viewport, Next.js **prefetches** the target route in the background, making navigation feel instant.

### Basic Usage

```javascript
import Link from 'next/link'

export default function Nav() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>
    </nav>
  )
}
```

### App Router: No `<a>` Child Needed

In **Next.js 13+ (App Router)**, `<Link>` renders an `<a>` automatically — don't nest one:

```javascript
// ✅ App Router
<Link href="/about">About</Link>

// ❌ Don't do this in App Router (it's an error)
<Link href="/about"><a>About</a></Link>
```

### Pages Router: Requires `<a>` Child (older versions)

```javascript
// Pages Router (Next.js 12 and earlier)
<Link href="/about"><a>About</a></Link>

// Pages Router (Next.js 13+)
<Link href="/about">About</Link>  // works
```

### Dynamic Links

```javascript
// Template literal
<Link href={`/blog/${post.slug}`}>{post.title}</Link>

// Object form (Pages Router)
<Link href={{
  pathname: '/blog/[slug]',
  query: { slug: post.slug }
}}>
  {post.title}
</Link>

// Dynamic path (App Router)
<Link href={`/blog/${post.slug}`}>{post.title}</Link>
```

### Link with Query Params

```javascript
<Link href="/search?q=nextjs&page=2">Search</Link>

// Or object form
<Link href={{
  pathname: '/search',
  query: { q: 'nextjs', page: 2 }
}}>
  Search
</Link>
```

### Replacing History Instead of Pushing

```javascript
<Link href="/login" replace>Login</Link>
```

`replace` uses `history.replaceState` — the back button won't return to the previous page.

### Disabling Prefetch

```javascript
<Link href="/heavy-page" prefetch={false}>Heavy Page</Link>
```

Prefetch is on by default in production. Disable it for pages you don't want to fetch eagerly.

### Scrolling Behavior

```javascript
<Link href="/about" scroll={false}>About</Link>
```

By default, navigation scrolls to the top. `scroll={false}` preserves the current scroll position.

### Active Link Styling

`<Link>` doesn't provide active styling directly — you check the pathname yourself:

```javascript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()
  
  return (
    <nav>
      <Link
        href="/about"
        className={pathname === '/about' ? 'active' : ''}
      >
        About
      </Link>
    </nav>
  )
}
```

## `useRouter` — Programmatic Navigation

Sometimes you need to navigate **in code** — after a form submit, a button click, a timer, or an auth check. That's what the router hook is for.

⚠️ **The hook is different between routers:**

| Router | Import |
|--------|--------|
| **App Router** | `import { useRouter } from 'next/navigation'` |
| **Pages Router** | `import { useRouter } from 'next/router'` |

This is a common source of bugs. App Router uses `next/navigation`; Pages Router uses `next/router`.

## App Router: `useRouter` from `next/navigation`

```javascript
'use client'
import { useRouter } from 'next/navigation'

export default function LoginButton() {
  const router = useRouter()
  
  async function handleLogin() {
    await login()
    router.push('/dashboard')
  }
  
  return <button onClick={handleLogin}>Log in</button>
}
```

### Methods

| Method | Description |
|--------|-------------|
| `router.push(href)` | Navigate, adding to history |
| `router.replace(href)` | Navigate, replacing history entry |
| `router.back()` | Go back |
| `router.forward()` | Go forward |
| `router.refresh()` | Re-fetch server components for current route |
| `router.prefetch(href)` | Manually prefetch a route |

### Examples

```javascript
'use client'
import { useRouter } from 'next/navigation'

export default function Actions() {
  const router = useRouter()
  
  return (
    <div>
      <button onClick={() => router.push('/dashboard')}>Dashboard</button>
      <button onClick={() => router.replace('/login')}>Replace</button>
      <button onClick={() => router.back()}>Back</button>
      <button onClick={() => router.forward()}>Forward</button>
      <button onClick={() => router.refresh()}>Refresh data</button>
      <button onClick={() => router.prefetch('/heavy')}>Prefetch</button>
    </div>
  )
}
```

### `router.refresh()` — App Router Only

Re-runs Server Components for the current route **without losing client state**. Great for pulling fresh data after a mutation.

```javascript
'use client'
import { useRouter } from 'next/navigation'

export default function AddTodo() {
  const router = useRouter()
  
  async function addTodo(formData) {
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ text: formData.get('text') })
    })
    router.refresh()  // re-fetch server data
  }
  
  return (
    <form action={addTodo}>
      <input name="text" />
      <button type="submit">Add</button>
    </form>
  )
}
```

### Other Navigation Hooks (App Router)

```javascript
'use client'
import { usePathname, useSearchParams, useParams } from 'next/navigation'

export default function Info() {
  const pathname = usePathname()        // '/blog/hello'
  const searchParams = useSearchParams() // URLSearchParams
  const params = useParams()            // { slug: 'hello' }
  
  return (
    <div>
      <p>Path: {pathname}</p>
      <p>Query: {searchParams.get('q')}</p>
      <p>Slug: {params.slug}</p>
    </div>
  )
}
```

| Hook | Returns |
|------|---------|
| `usePathname()` | Current path (e.g. `/blog/hello`) |
| `useSearchParams()` | URLSearchParams for query string |
| `useParams()` | Dynamic route params object |
| `useRouter()` | Router object with navigation methods |

## Pages Router: `useRouter` from `next/router`

The Pages Router's `useRouter` is a **single hook** that provides both navigation methods AND route info.

```javascript
import { useRouter } from 'next/router'

export default function Page() {
  const router = useRouter()
  
  // Navigation
  router.push('/dashboard')
  router.replace('/login')
  router.back()
  router.prefetch('/heavy')
  
  // Route info (all on the same object)
  router.pathname          // '/blog/[slug]'
  router.query             // { slug: 'hello', q: 'x' }
  router.asPath            // '/blog/hello?q=x'
  router.route             // '/blog/[slug]'
  router.isReady           // true when router is hydrated
  router.basePath          // '/docs' (if basePath set)
  router.locale            // 'en' (i18n)
  router.locales           // ['en', 'fr']
  router.defaultLocale     // 'en'
  router.events            // event emitter
}
```

### Push with Query

```javascript
router.push('/search?q=nextjs')
router.push({ pathname: '/search', query: { q: 'nextjs' } })
```

### Router Events (Pages Router Only)

```javascript
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Page() {
  const router = useRouter()
  
  useEffect(() => {
    const handleStart = url => console.log('Loading:', url)
    const handleComplete = url => console.log('Loaded:', url)
    const handleError = err => console.error(err)
    
    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleError)
    
    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleError)
    }
  }, [router])
  
  return <div>Page</div>
}
```

**Events:** `routeChangeStart`, `routeChangeComplete`, `routeChangeError`, `beforeHistoryChange`, `hashChangeStart`, `hashChangeComplete`.

> **App Router has no router events** — use `usePathname`/`useSearchParams` with `useEffect` instead.

## `Link` vs `useRouter` — When to Use Which

| Scenario | Use |
|----------|-----|
| Navigation menu, sidebar | `<Link>` |
| Inline text links | `<Link>` |
| Buttons that navigate | `router.push()` |
| After form submit | `router.push()` |
| After login/logout | `router.push()` or `router.replace()` |
| Conditional navigation | `router.push()` |
| Refresh current data | `router.refresh()` (App) |
| Back button | `router.back()` |

**Rule:** Prefer `<Link>` for anything a user clicks to go somewhere. Use `router` when navigation is the result of logic.

## Complete Example: Search Form

### App Router

```javascript
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  
  function handleSubmit(e) {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button type="submit">Search</button>
    </form>
  )
}
```

### Pages Router

```javascript
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState(router.query.q ?? '')
  
  function handleSubmit(e) {
    e.preventDefault()
    router.push({
      pathname: '/search',
      query: { q: query }
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button type="submit">Search</button>
    </form>
  )
}
```

## Complete Example: Auth Redirect

```javascript
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login')  // replace, not push
    }
  }, [router])
  
  return <div>Dashboard</div>
}
```

**Why `replace`?** So the user can't press back to return to the protected page after being logged out.

## Prefetching

### Automatic (via `<Link>`)

When a `<Link>` enters the viewport, Next.js prefetches it:

```javascript
<Link href="/dashboard">Dashboard</Link>  // prefetched automatically
```

### Manual

```javascript
// App Router
'use client'
import { useRouter } from 'next/navigation'

const router = useRouter()
router.prefetch('/heavy-page')
```

```javascript
// Pages Router
import { useRouter } from 'next/router'

const router = useRouter()
router.prefetch('/heavy-page')
```

**Prefetch behavior:**

| Router | Production | Development |
|--------|-----------|-------------|
| Pages Router | Prefetches on viewport | Prefetches on hover only |
| App Router | Full route prefetch | Full route prefetch |

Disable per-link: `<Link prefetch={false}>`.

## Common Pitfalls

### ❌ Wrong import for the router type

```javascript
// In App Router:
import { useRouter } from 'next/router'  // 💥 This is the Pages Router hook!
```

```javascript
// ✅ App Router:
import { useRouter } from 'next/navigation'

// ✅ Pages Router:
import { useRouter } from 'next/router'
```

### ❌ Using `useRouter` in a Server Component

```javascript
// app/page.js
import { useRouter } from 'next/navigation'  // 💥 hooks don't work in Server Components

export default function Page() {
  const router = useRouter()  // Error
}
```

```javascript
// ✅ Mark as client component
'use client'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()  // works
}
```

### ❌ Nesting `<a>` inside `<Link>` in App Router

```javascript
// ❌ App Router
<Link href="/about"><a>About</a></Link>
```

```javascript
// ✅ App Router
<Link href="/about">About</Link>
```

### ❌ Using `router.events` in App Router

```javascript
// App Router: no events
router.events.on(...)  // 💥 undefined
```

```javascript
// ✅ App Router: use hooks
'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const pathname = usePathname()
const searchParams = useSearchParams()

useEffect(() => {
  // runs on every route change
}, [pathname, searchParams])
```

### ❌ Calling `router.push` during render

```javascript
export default function Page() {
  router.push('/login')  // 💥 infinite loop / error
  return <div />
}
```

```javascript
// ✅ In an event handler or effect
useEffect(() => { router.push('/login') }, [])
```

### ❌ Forgetting `router.isReady` in Pages Router

On first render, `router.query` is empty. For pages relying on query params:

```javascript
const router = useRouter()

useEffect(() => {
  if (!router.isReady) return
  // now router.query is populated
}, [router.isReady])
```

App Router doesn't have this issue — `useParams()` and `useSearchParams()` are ready on mount.

### ❌ Using `<a href>` for internal links

```javascript
// ❌ Full reload
<a href="/about">About</a>
```

```javascript
// ✅ Client-side nav + prefetch
<Link href="/about">About</Link>
```

## Quick Reference

### App Router

```javascript
'use client'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation'

const router = useRouter()
router.push('/dashboard')
router.replace('/login')
router.back()
router.forward()
router.refresh()
router.prefetch('/heavy')

const pathname = usePathname()
const searchParams = useSearchParams()
const params = useParams()
```

### Pages Router

```javascript
import Link from 'next/link'
import { useRouter } from 'next/router'

const router = useRouter()
router.push('/dashboard')
router.push({ pathname: '/blog/[slug]', query: { slug: 'hi' } })
router.replace('/login')
router.back()
router.prefetch('/heavy')

router.pathname   // '/blog/[slug]'
router.query      // { slug: 'hi' }
router.asPath     // '/blog/hi'
router.isReady    // boolean
router.events.on('routeChangeStart', fn)
```

## Key Takeaways

1. **`<Link>`** = declarative navigation. Use it for anything clickable that goes somewhere. It **prefetches** automatically and does client-side navigation.
2. **`useRouter`** = programmatic navigation. Use it after form submits, auth checks, timers, or any logic-driven redirect.
3. **Import path matters:** `next/navigation` (App Router) vs `next/router` (Pages Router). Mixing them up is the #1 mistake.
4. App Router hooks are **split**: `useRouter`, `usePathname`, `useSearchParams`, `useParams`. Pages Router bundles everything into `useRouter`.
5. `router.refresh()` (App Router) re-fetches server data **without** losing client state.
6. Use `replace` instead of `push` for auth redirects and login flows.
7. `<Link>` prefetches on viewport entry in production — one reason navigation feels instant.