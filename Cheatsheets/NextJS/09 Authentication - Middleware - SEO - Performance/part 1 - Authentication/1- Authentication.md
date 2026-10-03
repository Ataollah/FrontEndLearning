## Authentication in Next.js

Authentication in Next.js can be implemented in several ways, depending on your app's architecture (App Router vs Pages Router) and requirements. Here's a comprehensive explanation.

---

## 1. Core Concepts

**Authentication** = verifying *who* a user is (login).
**Authorization** = determining *what* they can do (permissions).

In Next.js, you need to handle auth in **three places**:

| Layer | Purpose |
|-------|---------|
| **Client** | Show/hide UI, redirect unauthenticated users |
| **Server (Middleware)** | Protect routes before rendering |
| **Server (API/Server Actions)** | Verify identity on every sensitive operation |

⚠️ **Key rule:** Never trust the client. Always verify auth on the server.

---

## 2. Common Authentication Strategies

1. **Session-based (cookies)** — Server stores session, browser holds a cookie. Most common in Next.js.
2. **JWT-based** — Token stored in cookie or localStorage; verified per request.
3. **OAuth / Social login** — Google, GitHub, etc. (usually via a library)
4. **Magic links / OTP** — Passwordless email login.

For Next.js, **HTTP-only cookies** are recommended over `localStorage` (XSS-safe).

---

## 3. Popular Libraries

| Library | Best For |
|---------|----------|
| **NextAuth.js / Auth.js** | Most projects — easy OAuth + credentials |
| **Clerk** | Fast setup, hosted UI |
| **Supabase Auth** | If using Supabase DB |
| **Lucia** | Lightweight, DIY-friendly |
| **Custom (jose + cookies)** | Full control |

---

## 4. Example: NextAuth.js (Auth.js) with App Router

### Install
```bash
npm install next-auth
```

### Configure — `auth.ts`
```ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({ clientId: process.env.GOOGLE_ID!, clientSecret: process.env.GOOGLE_SECRET! }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const user = await verifyUser(creds.email, creds.password)
        return user ?? null
      },
    }),
  ],
  pages: { signIn: "/login" },
})
```

### Route handler — `app/api/auth/[...nextauth]/route.ts`
```ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

### Protect a Server Component
```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await auth()
  if (!session) redirect("/login")
  return <h1>Welcome {session.user?.name}</h1>
}
```

### Protect via Middleware — `middleware.ts`
```ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
```

### Client Component
```tsx
"use client"
import { useSession } from "next-auth/react"

export default function Profile() {
  const { data: session, status } = useSession()
  if (status === "loading") return <p>Loading...</p>
  return session ? <p>Hi {session.user?.name}</p> : <p>Not signed in</p>
}
```

---

## 5. Custom Session with Cookies (No library)

### Login API route
```ts
// app/api/login/route.ts
import { SignJWT } from "jose"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const user = await verifyUser(email, password)
  if (!user) return new Response("Invalid", { status: 401 })

  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET))

  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
  return Response.json({ ok: true })
}
```

### Read session on server
```ts
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

export async function getSession() {
  const token = cookies().get("session")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    return payload
  } catch {
    return null
  }
}
```

---

## 6. Best Practices

- ✅ **Use HTTP-only cookies** — not localStorage for tokens
- ✅ **Verify on server** for every protected API / Server Action
- ✅ **Use middleware** for route protection (but not as sole security layer)
- ✅ **CSRF protection** — use `sameSite: "lax"` or `"strict"`
- ✅ **Hash passwords** with bcrypt/argon2
- ✅ **Rotate secrets**, set short token expiry, use refresh tokens
- ✅ **Never expose secrets** in `NEXT_PUBLIC_*` env vars
- ✅ **Rate limit** login endpoints
- ✅ **Validate redirects** to prevent open-redirect attacks

---

## 7. App Router vs Pages Router

| Feature | App Router | Pages Router |
|---------|-----------|--------------|
| Session read (server) | `auth()` / `cookies()` | `getServerSession()` |
| Route protection | `middleware.ts` | `middleware.ts` |
| Data fetching | Server Components / Actions | `getServerSideProps` |
| Client hook | `useSession()` | `useSession()` |

---

## 8. Typical Flow (Session-based)

```
1. User submits login form  →  POST /api/auth/login
2. Server verifies creds, creates session/JWT
3. Server sets HTTP-only cookie
4. Browser sends cookie on every request
5. Middleware checks cookie → allows/redirects
6. Server Components/API read session from cookie
7. Logout → clear cookie
```

---

If you tell me which router you're using (App vs Pages) and your preferred approach (NextAuth, Clerk, custom JWT), I can give a full working starter.