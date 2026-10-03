## Saving JWT Tokens in Cookies — Complete Guide

Here's everything you need to store, read, refresh, and clear JWT tokens in cookies — with real Next.js and Express examples.

---

## 1. Why Cookies (vs localStorage)?

| | Cookie | localStorage |
|--|--------|--------------|
| JS can read it? | ❌ No (if `httpOnly`) | ✅ Yes |
| Sent automatically? | ✅ Yes, with every request | ❌ No (manual header) |
| XSS risk | ✅ Safe (httpOnly) | ❌ Token stealable |
| CSRF risk | ⚠️ Yes (mitigate with `sameSite`) | ✅ No |
| Best for auth | ✅ Yes | ❌ No |

**Verdict:** Cookies are the recommended place for auth tokens in web apps.

---

## 2. Cookie Flags You Must Set

```ts
{
  httpOnly: true,     // JS can't read it → XSS-safe
  secure: true,       // HTTPS only (production)
  sameSite: "lax",    // CSRF protection
  path: "/",          // available everywhere
  maxAge: 60 * 15,    // 15 minutes (seconds)
}
```

| Flag | Purpose |
|------|---------|
| `httpOnly` | Blocks `document.cookie` access |
| `secure` | Only sent over HTTPS |
| `sameSite: "strict"` | Never sent on cross-site requests (safest, but breaks OAuth redirects) |
| `sameSite: "lax"` | Sent on top-level navigation + same-site (good default) |
| `sameSite: "none"` | Always sent — requires `secure: true` |
| `path` | Which routes receive it |
| `maxAge` / `expires` | Lifetime |
| `domain` | Which subdomains get it |

---

## 3. Next.js App Router — Set Cookie

### In a Route Handler

```ts
// app/api/login/route.ts
import { cookies } from "next/headers"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = await db.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const token = await new SignJWT({ sub: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 min
  })

  return Response.json({ ok: true })
}
```

> In Next.js 15, `cookies()` is **async** — always `await` it.

### With Response headers (alternative)

```ts
import { serialize } from "cookie"

return new Response(JSON.stringify({ ok: true }), {
  headers: {
    "Set-Cookie": serialize("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    }),
  },
})
```

---

## 4. Next.js — Read Cookie

### In a Server Component

```tsx
// app/dashboard/page.tsx
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { redirect } from "next/navigation"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export default async function Dashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) redirect("/login")

  try {
    const { payload } = await jwtVerify(token, secret)
    return <h1>Welcome, user {payload.sub}</h1>
  } catch {
    redirect("/login")
  }
}
```

### In a Route Handler

```ts
// app/api/me/route.ts
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

export async function GET() {
  const token = (await cookies()).get("access_token")?.value
  if (!token) return Response.json({ error: "No token" }, { status: 401 })

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    )
    return Response.json({ user: payload })
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 })
  }
}
```

### In Middleware (Edge runtime)

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (token) {
    try {
      await jwtVerify(token, secret)
    } catch {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
```

> ⚠️ **Use `jose` not `jsonwebtoken`** in middleware — `jsonwebtoken` uses Node crypto and won't run on the Edge runtime.

---

## 5. Next.js — Delete Cookie (Logout)

```ts
// app/api/logout/route.ts
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete("access_token")
  cookieStore.delete("refresh_token")
  return Response.json({ ok: true })
}
```

Or set an already-expired cookie:

```ts
cookieStore.set("access_token", "", { maxAge: 0, path: "/" })
```

---

## 6. Access + Refresh Token Pattern in Cookies

This is the **production-grade** setup.

| Cookie | Lifetime | Path | Purpose |
|--------|----------|------|---------|
| `access_token` | 15 min | `/` | Authorize API calls |
| `refresh_token` | 7–30 days | `/api/auth/refresh` | Get new access tokens |

**Why `path` matters:** Setting `path: "/api/auth/refresh"` means the refresh token is **only sent to the refresh endpoint** — reducing exposure.

### Login — set both

```ts
// app/api/auth/login/route.ts
const cookieStore = await cookies()

cookieStore.set("access_token", accessToken, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 15,
})

cookieStore.set("refresh_token", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/api/auth/refresh", // 🔒 only sent here
  maxAge: 60 * 60 * 24 * 7,
})
```

### Refresh — rotate tokens

```ts
// app/api/auth/refresh/route.ts
import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function POST() {
  const cookieStore = await cookies()
  const refresh = cookieStore.get("refresh_token")?.value
  if (!refresh) return Response.json({ error: "No refresh token" }, { status: 401 })

  try {
    const { payload } = await jwtVerify(refresh, secret)

    // 🔒 check DB that refresh token hasn't been revoked/rotated
    const stored = await db.refreshToken.findUnique({ where: { jti: payload.jti as string } })
    if (!stored || stored.revoked) {
      return Response.json({ error: "Revoked" }, { status: 401 })
    }

    // rotate: delete old, create new
    await db.refreshToken.delete({ where: { jti: payload.jti as string } })
    const newJti = crypto.randomUUID()
    await db.refreshToken.create({ data: { jti: newJti, userId: payload.sub as string } })

    const newAccess = await new SignJWT({ sub: payload.sub, role: payload.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret)

    const newRefresh = await new SignJWT({ sub: payload.sub })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(newJti)
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret)

    cookieStore.set("access_token", newAccess, {
      httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 15,
    })
    cookieStore.set("refresh_token", newRefresh, {
      httpOnly: true, secure: true, sameSite: "lax",
      path: "/api/auth/refresh", maxAge: 60 * 60 * 24 * 7,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: "Invalid refresh token" }, { status: 401 })
  }
}
```

---

## 7. Express / Node.js Version

```ts
import express from "express"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"

const app = express()
app.use(express.json())
app.use(cookieParser())

app.post("/login", async (req, res) => {
  const { email, password } = req.body
  const user = await verifyUser(email, password)
  if (!user) return res.status(401).json({ error: "Invalid" })

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  })

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60 * 1000, // ms in express!
  })

  res.json({ ok: true })
})

app.get("/me", (req, res) => {
  const token = req.cookies.access_token
  if (!token) return res.status(401).json({ error: "No token" })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!)
    res.json({ user: payload })
  } catch {
    res.status(401).json({ error: "Invalid token" })
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("access_token", { path: "/" })
  res.json({ ok: true })
})
```

> **Note:** Express uses `maxAge` in **milliseconds**, Next.js cookies uses **seconds**, and the raw `Set-Cookie` header uses **seconds**. Easy to get wrong.

---

## 8. Client-Side Calls (Cookies Auto-Sent)

Because cookies are stored by the browser, `fetch` sends them automatically on same-origin requests:

```ts
// ✅ Cookie sent automatically
await fetch("/api/me")

// Cross-origin: must opt in
await fetch("https://api.example.com/me", { credentials: "include" })
```

You **don't** manually add `Authorization: Bearer ...` — the browser handles it.

---

## 9. CSRF Protection

Cookies are auto-sent, so a malicious site could trigger authenticated requests. Mitigations:

### ✅ Use `sameSite`
```ts
sameSite: "lax"    // blocks most CSRF
// or
sameSite: "strict" // blocks all cross-site (breaks OAuth redirects)
```

### ✅ Double-submit CSRF token (if you need `sameSite: "none"`)
```ts
// server sets a readable cookie
cookieStore.set("csrf", csrfToken, { httpOnly: false, sameSite: "lax", path: "/" })

// client sends it in a header
fetch("/api/transfer", {
  method: "POST",
  headers: { "X-CSRF-Token": getCookie("csrf") },
})

// server compares header vs cookie
if (req.headers["x-csrf-token"] !== req.cookies.csrf) return res.status(403)
```

### ✅ Check `Origin` header on state-changing requests
```ts
if (req.headers.origin !== process.env.APP_ORIGIN) return res.status(403)
```

---

## 10. Common Mistakes

| Mistake | Fix |
|---------|-----|
| `httpOnly: false` for auth tokens | Always `httpOnly: true` |
| `secure: false` in production | `secure: process.env.NODE_ENV === "production"` |
| Forgetting `sameSite` | Set `sameSite: "lax"` |
| Wrong `maxAge` units | Next/Set-Cookie = **seconds**, Express = **ms** |
| Refresh token path `/` | Scope it: `path: "/api/auth/refresh"` |
| Using `jsonwebtoken` in Next middleware | Use `jose` (Edge-compatible) |
| Forgetting `path: "/"` on delete | Cookie won't clear — match original path |
| Storing huge payloads | Cookies max ~4KB — keep JWT small |
| No refresh rotation | Rotate refresh tokens on every use |

---

## 11. Full Flow Diagram

```
┌────────┐                          ┌──────────────┐
│Browser │                          │  Next.js     │
└───┬────┘                          └──────┬───────┘
    │  POST /api/auth/login               │
    │  { email, password }                │
    │ ───────────────────────────────────►│
    │                                     │ sign JWT
    │                                     │ Set-Cookie: access_token (httpOnly)
    │                                     │ Set-Cookie: refresh_token (httpOnly)
    │  200 OK + Set-Cookie headers        │
    │ ◄───────────────────────────────────│
    │                                     │
    │  (browser stores cookies)           │
    │                                     │
    │  GET /dashboard                     │
    │  Cookie: access_token=...           │  ← auto-sent
    │ ───────────────────────────────────►│
    │                                     │ verify JWT
    │  200 HTML                           │
    │ ◄───────────────────────────────────│
    │                                     │
    │  ... 15 min later, token expired    │
    │                                     │
    │  POST /api/auth/refresh             │
    │  Cookie: refresh_token=...          │
    │ ───────────────────────────────────►│
    │                                     │ rotate tokens
    │  Set-Cookie: new access + refresh   │
    │ ◄───────────────────────────────────│
```

---

## TL;DR

- Use **`httpOnly: true`** cookies — JS can't read them → XSS-safe.
- Set **`secure: true`**, **`sameSite: "lax"`**, **`path: "/"`**, and a **short `maxAge`**.
- Use **`jose`** in Next.js Edge/middleware (`jsonwebtoken` doesn't work there).
- **Two tokens**: short-lived access (`path: "/"`) + long-lived refresh (`path: "/api/auth/refresh"`).
- **Rotate refresh tokens** on every refresh, store them in DB for revocation.
- Watch the **unit difference**: Next cookies = seconds, Express = milliseconds.
- Browser **auto-sends cookies** — no manual `Authorization` header needed.

Want me to put together a full working Next.js 15 starter with login/refresh/logout + protected routes and middleware?