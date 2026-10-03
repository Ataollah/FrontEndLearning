## Building Next.js Middleware for Authentication

Here's a complete, production-ready middleware setup for JWT auth — including route protection, role-based access, token refresh, and common patterns.

---

## 1. What is Middleware?

`middleware.ts` runs **before** every matched request, on the **Edge runtime**. Perfect for:

- ✅ Redirecting unauthenticated users
- ✅ Protecting route groups (`/dashboard`, `/admin`)
- ✅ Redirecting logged-in users away from `/login`
- ✅ Role-based access (admin-only routes)
- ✅ Adding security headers

**What it can't do:**
- ❌ Direct DB access (no Node.js APIs on Edge — use `fetch` or an Edge-compatible driver)
- ❌ Heavy crypto (`jsonwebtoken` doesn't work — use `jose`)
- ❌ Replace server-side verification (defense in depth!)

---

## 2. File Location

```
project/
├── middleware.ts          ← root, next to app/ or src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── dashboard/page.tsx
│   └── admin/page.tsx
```

> If you use `src/`, put it at `src/middleware.ts`.

---

## 3. Minimal Middleware

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
```

That's it — anything under `/dashboard` requires a token.

---

## 4. Full Example: Verify JWT + Role Checks

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

// Route protection config
const PROTECTED = ["/dashboard", "/admin", "/settings"]
const AUTH_ONLY = ["/login", "/register"]
const ADMIN_ONLY = ["/admin"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = req.cookies.get("access_token")?.value
  let payload: any = null

  // Verify token if present
  if (token) {
    try {
      const result = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
      })
      payload = result.payload
    } catch {
      // expired or invalid — treat as logged out
      payload = null
    }
  }

  const isLoggedIn = !!payload

  // 1. Redirect logged-in users away from login/register
  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 2. Block unauthenticated users from protected routes
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p))
  if (needsAuth && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("next", pathname) // preserve intended destination
    return NextResponse.redirect(loginUrl)
  }

  // 3. Admin-only routes
  const needsAdmin = ADMIN_ONLY.some((p) => pathname.startsWith(p))
  if (needsAdmin && payload?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 4. Optional: attach user info to headers for downstream
  const res = NextResponse.next()
  if (payload) {
    res.headers.set("x-user-id", String(payload.sub))
    res.headers.set("x-user-role", String(payload.role ?? ""))
  }
  return res
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - api          (handle auth in API routes)
     * - _next/static (build files)
     * - _next/image  (image optimization)
     * - favicon.ico, images, etc.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)",
  ],
}
```

---

## 5. The `matcher` Config (Critical!)

Without `matcher`, middleware runs on **every** request — including static files. Always filter.

### Common patterns

```ts
// Only specific paths
export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] }

// Everything except static/API
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

// Multiple specific patterns
export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/admin/:path*"],
}
```

**Regex syntax:** Next.js uses `path-to-regexp`. `:path*` = zero or more segments.

---

## 6. Auto-Refresh Token in Middleware

A powerful pattern: if the **access token is expired** but the **refresh token is valid**, silently refresh.

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify, SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

async function verify(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return { payload, expired: false }
  } catch (err: any) {
    if (err?.code === "ERR_JWT_EXPIRED") {
      // decode without verifying to get payload
      const [, payloadB64] = token.split(".")
      const payload = JSON.parse(atob(payloadB64))
      return { payload, expired: true }
    }
    return { payload: null, expired: false }
  }
}

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value
  const refreshToken = req.cookies.get("refresh_token")?.value

  const isProtected = req.nextUrl.pathname.startsWith("/dashboard")
  if (!isProtected) return NextResponse.next()

  if (!accessToken) {
    if (!refreshToken) return redirectToLogin(req)
    return await tryRefresh(req, refreshToken)
  }

  const { payload, expired } = await verify(accessToken)

  if (!payload) return redirectToLogin(req)
  if (expired) {
    if (!refreshToken) return redirectToLogin(req)
    return await tryRefresh(req, refreshToken, payload.sub as string)
  }

  return NextResponse.next()
}

async function tryRefresh(req: NextRequest, refreshToken: string, sub?: string) {
  try {
    const { payload } = await jwtVerify(refreshToken, secret)

    // Issue new access token
    const newAccess = await new SignJWT({ sub: payload.sub, role: payload.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret)

    // Continue the request and set the new cookie
    const res = NextResponse.next()
    res.cookies.set("access_token", newAccess, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    })
    return res
  } catch {
    return redirectToLogin(req)
  }
}

function redirectToLogin(req: NextRequest) {
  const url = new URL("/login", req.url)
  url.searchParams.set("next", req.nextUrl.pathname)
  const res = NextResponse.redirect(url)
  // clear invalid cookies
  res.cookies.delete("access_token")
  res.cookies.delete("refresh_token")
  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
```

> ⚠️ **Caveat:** Refreshing in middleware means **every** navigation may rotate tokens. For high-traffic apps, prefer refreshing in a client hook or a dedicated `/api/refresh` call.

---

## 7. Chaining Multiple Middlewares

Next.js only runs **one** `middleware.ts`, so compose manually.

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { authMiddleware } from "./middlewares/auth"
import { loggerMiddleware } from "./middlewares/logger"
import { headersMiddleware } from "./middlewares/headers"

type Middleware = (req: NextRequest) => NextResponse | Promise<NextResponse>

function chain(...fns: Middleware[]) {
  return async (req: NextRequest) => {
    for (const fn of fns) {
      const res = await fn(req)
      // If it's a redirect/rewrite, stop
      if (res.status !== 200) return res
    }
    return NextResponse.next()
  }
}

export const middleware = chain(
  loggerMiddleware,
  headersMiddleware,
  authMiddleware
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

### `middlewares/auth.ts`
```ts
import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function authMiddleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }
  const token = req.cookies.get("access_token")?.value
  if (!token) return NextResponse.redirect(new URL("/login", req.url))

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}
```

### `middlewares/headers.ts`
```ts
import { NextResponse, type NextRequest } from "next/server"

export function headersMiddleware(_req: NextRequest) {
  const res = NextResponse.next()
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  return res
}
```

---

## 8. Route Groups Pattern (App Router)

Organize routes with route groups so middleware is trivial:

```
app/
├── (public)/
│   ├── page.tsx
│   └── about/page.tsx
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
└── (protected)/
    ├── dashboard/page.tsx
    ├── settings/page.tsx
    └── admin/page.tsx
```

```ts
// middleware.ts
export const config = { matcher: ["/(protected)/:path*"] }
```

> ⚠️ Route group names `(protected)` are **not** part of the URL — matcher should target the actual paths (`/dashboard`, `/settings`, etc.).

---

## 9. Passing User Data Downstream

Middleware can't directly hand data to Server Components, but you **can** forward via headers:

```ts
// middleware.ts
const res = NextResponse.next()
res.headers.set("x-user-id", String(payload.sub))
res.headers.set("x-user-role", String(payload.role))
return res
```

Read it in a Server Component via `headers()`:

```tsx
// app/dashboard/page.tsx
import { headers } from "next/headers"

export default async function Page() {
  const h = await headers()
  const userId = h.get("x-user-id")
  return <p>User: {userId}</p>
}
```

> ⚠️ **Security note:** Clients can spoof `x-user-*` headers. Only trust them if you strip incoming headers first:
> ```ts
> const reqHeaders = new Headers(req.headers)
> reqHeaders.delete("x-user-id")
> reqHeaders.delete("x-user-role")
> return NextResponse.next({ request: { headers: reqHeaders } })
> ```

**Better:** Just re-verify the cookie in the Server Component with `auth()`. Belt-and-suspenders.

---

## 10. Security Headers Middleware

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server"

export function middleware(_req: NextRequest) {
  const res = NextResponse.next()
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  )
  return res
}
```

For **CSP** (Content-Security-Policy) you usually need a nonce — see Next.js docs for `middleware` + nonce recipe.

---

## 11. Debugging Middleware

### Log what's happening
```ts
export async function middleware(req: NextRequest) {
  console.log("[mw]", req.method, req.nextUrl.pathname, {
    hasToken: !!req.cookies.get("access_token"),
  })
  return NextResponse.next()
}
```

### Inspect cookies
```ts
console.log(req.cookies.getAll())
```

### Verify the matcher
If middleware seems not to run, it's usually the `matcher`. Test by adding a log for `/` and hitting your app.

### Common errors

| Error | Cause |
|-------|-------|
| `The edge runtime does not support Node.js 'crypto' module` | Using `jsonwebtoken` → switch to `jose` |
| `Module not found: Can't resolve 'fs'` | Importing Node-only libs |
| Middleware runs on static assets | Fix `matcher` |
| Redirect loop | Check that `/login` isn't itself matched |
| `cookies()` in middleware returns wrong thing | Middleware uses `req.cookies`, **not** `cookies()` from `next/headers` |

---

## 12. Middleware vs Server-Side Auth (Both!)

**Middleware is not a security boundary on its own.** Always re-verify on the server for sensitive operations:

```tsx
// app/dashboard/page.tsx
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { redirect } from "next/navigation"

export default async function Page() {
  const token = (await cookies()).get("access_token")?.value
  if (!token) redirect("/login")

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
  } catch {
    redirect("/login")
  }

  // fetch data, etc.
}
```

**Rule of thumb:**
- Middleware = UX (redirects, cheap guards)
- Server Component / API route = real enforcement
- Database = ultimate truth

---

## 13. Complete Working Template

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

const PUBLIC = ["/", "/about", "/pricing"]
const AUTH_PAGES = ["/login", "/register"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("access_token")?.value

  let payload: any = null
  if (token) {
    try {
      payload = (await jwtVerify(token, secret)).payload
    } catch {}
  }

  const isAuthed = !!payload

  // logged-in users skip login/register
  if (AUTH_PAGES.some((p) => pathname.startsWith(p)) && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // public routes always allowed
  if (PUBLIC.some((p) => pathname === p)) {
    return NextResponse.next()
  }

  // everything else requires auth
  if (!isAuthed) {
    const url = new URL("/login", req.url)
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  // admin gate
  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## TL;DR

- `middleware.ts` at project root — runs on Edge, before every matched request.
- Use **`jose`** (not `jsonwebtoken`) for JWT verify.
- Always define a **`matcher`** to skip `_next/static`, `api`, images.
- Read cookies via **`req.cookies.get(...)`** (not `cookies()`).
- Use `NextResponse.redirect`, `.next()`, `.rewrite()`.
- Middleware = **UX layer**, not the security boundary — re-verify in Server Components / API routes.
- Chain logic manually since Next.js runs only one middleware.
- Watch out for **redirect loops** and **Edge runtime limitations**.

Want me to extend this with role-based routing for a multi-tenant app, or wire it into a full login → middleware → protected dashboard flow?