## Redirect Not-Logged-In Users in Next.js

Here's every way to redirect unauthenticated users — from simple middleware to server components — plus the patterns that avoid common bugs.

---

## 1. The Core Pattern

```ts
if (!user) redirect("/login")
```

But **where** you put this matters. You need it in three places for a solid app:

| Layer | Purpose |
|-------|---------|
| **Middleware** | Cheap, fast, blocks before render |
| **Server Component / Layout** | Real verification (can't be bypassed) |
| **API Routes / Server Actions** | Enforce on every mutation |

---

## 2. Middleware Redirect (First Line of Defense)

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value

  // No token → redirect to login
  if (!token) {
    return redirectToLogin(req)
  }

  // Token present → verify it
  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    // expired or invalid → clear + redirect
    return redirectToLogin(req, { clearCookies: true })
  }
}

function redirectToLogin(req: NextRequest, opts: { clearCookies?: boolean } = {}) {
  const url = new URL("/login", req.url)
  // Preserve where they wanted to go
  url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search)

  const res = NextResponse.redirect(url)
  if (opts.clearCookies) {
    res.cookies.delete("access_token")
    res.cookies.delete("refresh_token")
  }
  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/admin/:path*"],
}
```

**Key details:**
- `new URL("/login", req.url)` — keeps the correct origin (important behind proxies)
- `next` param — so after login you can send them back
- Clear invalid cookies — otherwise the loop never ends

---

## 3. Server Component Redirect (Real Enforcement)

Middleware can be bypassed in edge cases (misconfigured matcher, direct API calls). Always re-check on the server.

### In a page

```tsx
// app/dashboard/page.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export default async function Dashboard() {
  const token = (await cookies()).get("access_token")?.value

  if (!token) redirect("/login")

  try {
    await jwtVerify(token, secret)
  } catch {
    redirect("/login")
  }

  return <h1>Dashboard</h1>
}
```

### In a layout (protects a whole segment)

```tsx
// app/(protected)/layout.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = (await cookies()).get("access_token")?.value
  if (!token) redirect("/login")

  try {
    await jwtVerify(token, secret)
  } catch {
    redirect("/login")
  }

  return <>{children}</>
}
```

**Route group structure:**
```
app/
├── (public)/
│   ├── page.tsx
│   └── login/page.tsx
└── (protected)/
    ├── layout.tsx        ← auth check here
    ├── dashboard/page.tsx
    └── settings/page.tsx
```

Every page under `(protected)/` now requires login — one check, whole group covered.

---

## 4. `redirect` vs `NextResponse.redirect`

They look similar but are completely different:

| | `redirect()` from `next/navigation` | `NextResponse.redirect()` |
|--|-------------------------------------|---------------------------|
| **Where** | Server Components, Server Actions, Route Handlers | Middleware only |
| **How** | Throws a special error | Returns a Response |
| **Status** | 307/308 | 307 by default |
| **Can clear cookies?** | ❌ No | ✅ Yes |

> ⚠️ **Don't** try to use `redirect()` inside `try/catch` — it works by throwing. If you catch, you'll swallow the redirect. Next.js's `redirect()` uses a special sentinel that bypasses `catch`, but calling it inside your own try/catch that catches all errors can still trip you up.

**Safe pattern:**
```tsx
let payload
try {
  payload = await jwtVerify(token, secret)
} catch {
  redirect("/login") // ← outside the try, or it's fine since Next handles it
}
```

Better — verify first, redirect after:
```tsx
const ok = await verifyTokenSafe(token)
if (!ok) redirect("/login")
```

---

## 5. Avoid the Redirect Loop

The #1 bug: `/login` itself gets protected → redirects to `/login` → infinite loop.

### Fix 1 — Exclude `/login` in matcher
```ts
export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
}
```

### Fix 2 — Check pathname in middleware
```ts
const PUBLIC_ROUTES = ["/login", "/register", "/", "/about"]

if (PUBLIC_ROUTES.includes(req.nextUrl.pathname)) {
  return NextResponse.next()
}
```

### Fix 3 — Also redirect logged-in users away from `/login`
```ts
const isAuthPage = req.nextUrl.pathname.startsWith("/login")

if (isAuthPage && isLoggedIn) {
  return NextResponse.redirect(new URL("/dashboard", req.url))
}
if (!isAuthPage && !isLoggedIn) {
  return NextResponse.redirect(new URL("/login", req.url))
}
```

---

## 6. Preserve the Intended Destination (`?next=`)

Users hate logging in and landing on the homepage. Save their target:

### Middleware — attach `next`
```ts
const url = new URL("/login", req.url)
url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search)
return NextResponse.redirect(url)
```

### Login page — read it
```tsx
// app/login/page.tsx
export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  const next = searchParams.next ?? "/dashboard"
  return <LoginForm next={next} />
}
```

### Login form — redirect after success
```tsx
"use client"
import { useRouter } from "next/navigation"

export function LoginForm({ next }: { next: string }) {
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: new FormData(e.currentTarget),
    })
    if (res.ok) {
      router.push(next)
      router.refresh() // re-run server components with new cookie
    }
  }

  return <form onSubmit={onSubmit}>{/* ... */}</form>
}
```

### 🔒 Validate `next` to prevent open redirect
```ts
function safeNext(next: string | undefined) {
  if (!next) return "/dashboard"
  // only allow same-origin relative paths
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard"
  return next
}
```

Without this, `?next=https://evil.com` becomes a phishing vector.

---

## 7. Client-Side Redirect (with Auth Context)

For SPAs using client-side auth state:

```tsx
"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function ProtectedPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login")
  }, [status, router])

  if (status === "loading") return <Spinner />
  if (status === "unauthenticated") return null

  return <Dashboard />
}
```

**Downside:** brief flash of protected content, and it's **not secure** — the HTML was already served. Use only for UX polish, not security.

---

## 8. Redirect in API Routes / Server Actions

If an unauthenticated user hits an API, return `401` — not a redirect.

### API Route
```ts
// app/api/posts/route.ts
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

export async function POST(req: Request) {
  const token = (await cookies()).get("access_token")?.value
  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ... create post
}
```

### Server Action
```ts
"use server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { jwtVerify } from "jose"

export async function createPost(formData: FormData) {
  const token = (await cookies()).get("access_token")?.value
  if (!token) redirect("/login")

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
  } catch {
    redirect("/login")
  }

  // ... save post
}
```

---

## 9. Reusable Helper (DRY)

Instead of repeating verify logic everywhere:

```ts
// lib/auth.ts
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { redirect } from "next/navigation"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export type Session = {
  userId: string
  role: string
  email: string
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("access_token")?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      userId: payload.sub as string,
      role: payload.role as string,
      email: payload.email as string,
    }
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}

export async function requireRole(role: string): Promise<Session> {
  const session = await requireAuth()
  if (session.role !== role) redirect("/dashboard")
  return session
}
```

### Use it
```tsx
// app/dashboard/page.tsx
import { requireAuth } from "@/lib/auth"

export default async function Dashboard() {
  const session = await requireAuth() // 🔒 auto-redirects
  return <h1>Hi {session.email}</h1>
}
```

```tsx
// app/admin/page.tsx
import { requireRole } from "@/lib/auth"

export default async function Admin() {
  const session = await requireRole("admin")
  return <h1>Admin panel</h1>
}
```

---

## 10. Full Working Example

### `lib/auth.ts` — helpers
```ts
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { redirect } from "next/navigation"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function getSession() {
  const token = (await cookies()).get("access_token")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { sub: string; role: string; email: string }
  } catch {
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}
```

### `middleware.ts`
```ts
import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

const AUTH_PAGES = ["/login", "/register"]

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const token = req.cookies.get("access_token")?.value

  let isAuthed = false
  if (token) {
    try {
      await jwtVerify(token, secret)
      isAuthed = true
    } catch {}
  }

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))

  // logged-in hitting login → send to dashboard
  if (isAuthPage && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // logged-out hitting protected → send to login (with next)
  if (!isAuthPage && !isAuthed) {
    const url = new URL("/login", req.url)
    url.searchParams.set("next", pathname + search)
    const res = NextResponse.redirect(url)
    if (token) res.cookies.delete("access_token") // clear stale token
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/settings/:path*", "/login", "/register"],
}
```

### `app/(protected)/layout.tsx` — defense in depth
```tsx
import { requireAuth } from "@/lib/auth"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth() // 🔒 redirects if not logged in
  return <>{children}</>
}
```

### `app/login/page.tsx`
```tsx
import { LoginForm } from "./LoginForm"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return <LoginForm next={next ?? "/dashboard"} />
}
```

### `app/login/LoginForm.tsx`
```tsx
"use client"
import { useRouter } from "next/navigation"

export function LoginForm({ next }: { next: string }) {
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    })
    if (res.ok) {
      // validate next before navigating
      const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
      router.push(safe)
      router.refresh()
    } else {
      alert("Invalid credentials")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button>Log in</button>
    </form>
  )
}
```

---

## 11. Common Pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| Infinite redirect loop | `/login` is protected | Exclude it via matcher or pathname check |
| Redirect works once, then loops | Cookie not actually set | Check `secure`/`sameSite`/`path` in login route |
| `searchParams.next` open redirect | No validation | Only allow `/...` paths |
| Flash of protected content | Client-side redirect only | Add middleware + server check |
| Redirect after login lands on `/` | Ignoring `next` | Read + use `?next=` |
| `redirect is not defined` | Using in client component | Import from `next/navigation`, only works server-side |
| Redirect inside `try/catch` swallowed | `redirect()` throws | Call it **outside** try/catch or after verification |
| Stale token → never redirects | Not clearing cookie on fail | `res.cookies.delete("access_token")` |
| `localhost` cookie not set | `secure: true` in dev | Use `secure: process.env.NODE_ENV === "production"` |

---

## 12. Decision Guide

```
Is the route for a page (HTML)?
├── YES → Use middleware (fast) + requireAuth() in layout (secure)
└── NO  → Is it an API / Server Action?
         ├── YES → Return 401 (don't redirect JSON consumers)
         └── NO  → Client component?
                  └── YES → useSession + router.replace (UX only, not secure)
```

---

## TL;DR

- **Middleware** = fast first line (`NextResponse.redirect`) — cheap, runs on Edge.
- **Server Components / layouts** = real enforcement (`redirect()` from `next/navigation`).
- **API routes** = return **401**, don't redirect.
- **Client** = `router.push/replace` for UX polish only.
- Always **exclude `/login`** from protection → avoids loops.
- **Preserve `?next=`** — and **validate it** to prevent open redirects.
- **Defense in depth**: middleware + layout + API check.

Want me to package this into a full repo-style folder structure (login, protected layout, refresh, logout)?