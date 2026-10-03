## JWT Authentication — Explained

**JWT (JSON Web Token)** is a compact, self-contained token format used to securely transmit information between parties. In authentication, it's used to prove *who a user is* without the server needing to store session state.

---

## 1. What is a JWT?

A JWT is just a **string** with three parts separated by dots:

```
header.payload.signature
```

Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWxpIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### The three parts

| Part | Content | Encoded? | Encrypted? |
|------|---------|----------|------------|
| **Header** | Algorithm + type (`{"alg":"HS256","typ":"JWT"}`) | Base64URL | ❌ No |
| **Payload** | Claims (user data, expiry, etc.) | Base64URL | ❌ No |
| **Signature** | HMAC/RSA signature of header+payload | — | ✅ Signed |

> ⚠️ **Key point:** JWT payload is **NOT encrypted** — anyone can decode it. It's only **signed**, meaning it can't be *tampered with* without invalidating the signature.

---

## 2. Structure Breakdown

### Header
```json
{ "alg": "HS256", "typ": "JWT" }
```

### Payload (Claims)
```json
{
  "sub": "user_123",       // subject (user id)
  "email": "ali@mail.com",
  "role": "admin",
  "iat": 1700000000,       // issued at
  "exp": 1700003600        // expiration
}
```

**Registered claims (standard):**
- `iss` — issuer
- `sub` — subject
- `aud` — audience
- `exp` — expiration time
- `iat` — issued at
- `nbf` — not before
- `jti` — JWT ID (unique)

You can add **custom claims** (`role`, `plan`, etc.) — but keep them small.

### Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

If anyone changes even one character of the payload, the signature won't match → token rejected.

---

## 3. How JWT Authentication Works

```
┌────────┐                    ┌────────┐
│ Client │                    │ Server │
└───┬────┘                    └───┬────┘
    │  1. POST /login (creds)     │
    │ ───────────────────────────►│
    │                             │ verify password
    │                             │ sign JWT with secret
    │  2. { token: "eyJ..." }     │
    │ ◄───────────────────────────│
    │                             │
    │  3. GET /api/me             │
    │     Authorization: Bearer eyJ...
    │ ───────────────────────────►│ verify signature + exp
    │                             │ read payload → user id
    │  4. { user data }           │
    │ ◄───────────────────────────│
```

**Key idea:** The server doesn't store the token. It just **verifies the signature** on each request. This is called **stateless authentication**.

---

## 4. JWT vs Session Cookies

| Feature | JWT | Session (server-side) |
|---------|-----|----------------------|
| Storage | Client | Server (memory/DB/Redis) |
| Scalability | ✅ Easy (no shared state) | ❌ Needs shared store |
| Revocation | ❌ Hard (until expiry) | ✅ Instant |
| Size | Larger | Small (just session ID) |
| Security | Payload visible | Payload hidden |
| Best for | APIs, microservices, mobile | Traditional web apps |

---

## 5. Where to Store JWTs (Frontend)

| Location | XSS-safe? | CSRF-safe? | Recommendation |
|----------|-----------|------------|----------------|
| `localStorage` | ❌ No | ✅ Yes | ❌ Avoid for sensitive apps |
| `sessionStorage` | ❌ No | ✅ Yes | ❌ Same risk |
| **HTTP-only cookie** | ✅ Yes | ⚠️ Needs `sameSite` | ✅ Best for web |
| In-memory (JS var) | ✅ Yes | ✅ Yes | ✅ Good but lost on refresh |

**Best practice:** Store in **HTTP-only + Secure + SameSite cookie**. This prevents JS from reading it (XSS-safe) and CSRF if `SameSite=Lax/Strict`.

---

## 6. Access Token + Refresh Token Pattern

Short-lived JWTs are safer, but annoying (frequent logins). Solution: **two tokens**.

| Token | Lifetime | Purpose | Storage |
|-------|----------|---------|---------|
| **Access token** | 5–15 min | Authorize API calls | Memory / cookie |
| **Refresh token** | 7–30 days | Get new access tokens | HTTP-only cookie / DB |

### Flow
```
1. Login → return access + refresh tokens
2. Client uses access token for API calls
3. Access token expires → 401
4. Client sends refresh token to /refresh
5. Server validates refresh token → new access token
6. Repeat
```

Refresh tokens should be **stored server-side (DB/Redis)** so you can revoke them.

---

## 7. Implementation Example (Node.js)

### Sign a JWT
```ts
import jwt from "jsonwebtoken"

const token = jwt.sign(
  { sub: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: "15m", issuer: "myapp" }
)
```

### Verify a JWT
```ts
import jwt from "jsonwebtoken"

function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!, {
      issuer: "myapp",
    })
  } catch (err) {
    return null // expired, invalid signature, etc.
  }
}
```

### Express middleware
```ts
app.get("/api/me", (req, res) => {
  const auth = req.headers.authorization
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: "No token" })

  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: "Invalid token" })

  res.json({ userId: payload.sub, role: payload.role })
})
```

### Next.js (App Router) — using `jose` (Edge-compatible)
```ts
// lib/auth.ts
import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function signToken(payload: object) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}
```

> Use `jose` instead of `jsonwebtoken` in Next.js middleware — `jsonwebtoken` doesn't run on the Edge runtime.

---

## 8. Signing Algorithms

| Algorithm | Type | Use Case |
|-----------|------|----------|
| **HS256** | Symmetric (shared secret) | Single server / simple apps |
| **RS256** | Asymmetric (private/public key) | Microservices, third-party verification |
| **ES256** | Asymmetric (ECDSA) | Smaller tokens, modern |

- **HS256:** Same secret signs & verifies. Fast, simple, but secret must be shared.
- **RS256:** Private key signs, public key verifies. Anyone can verify without being able to forge.

⚠️ **Never** use `alg: "none"`. Always whitelist allowed algorithms on verify:
```ts
jwt.verify(token, secret, { algorithms: ["HS256"] })
```

---

## 9. Security Best Practices

- ✅ **Always set `exp`** — short for access tokens (5–15 min)
- ✅ **Use HTTPS** — JWTs are bearer tokens; anyone who steals one *is* the user
- ✅ **Store in HTTP-only cookies** for web apps
- ✅ **Whitelist algorithms** on verify (`algorithms: ["HS256"]`)
- ✅ **Validate all claims** — `exp`, `iss`, `aud`, `nbf`
- ✅ **Use strong secrets** (32+ random bytes) — never hardcode
- ✅ **Rotate secrets** and support key rotation (`kid` header)
- ✅ **Don't put sensitive data** in the payload (it's readable)
- ✅ **Implement refresh token revocation** (store in DB with a `jti`)
- ✅ **Rate-limit** login and refresh endpoints
- ❌ **Don't** store JWTs in `localStorage` for sensitive apps
- ❌ **Don't** use JWT for sessions if you need instant logout (sessions are better)

---

## 10. How to Revoke a JWT (Since It's Stateless)

JWTs can't be "deleted" — they're valid until `exp`. To revoke:

1. **Short expiry + refresh tokens** — the standard answer. Access tokens die fast; refresh tokens live in DB and can be deleted.
2. **Blocklist (denylist)** — store revoked `jti` values until their `exp`. Adds state (defeats some of the point).
3. **Token versioning** — include `tokenVersion` in payload; bump on the user record to invalidate all tokens.

---

## 11. Common Pitfalls

| Pitfall | Fix |
|---------|-----|
| Long-lived access tokens | Use 15-min expiry + refresh |
| Storing in `localStorage` | Use HTTP-only cookies |
| Trusting `alg` from token | Hardcode allowed algorithms |
| Putting PII in payload | JWT is base64 — not encrypted |
| No revocation plan | Use refresh tokens in DB |
| Using `jsonwebtoken` in Next middleware | Use `jose` (Edge runtime) |
| Weak secret | Use 256-bit random from env |

---

## TL;DR

- JWT = `header.payload.signature`, base64-encoded, **signed but not encrypted**.
- Server verifies signature → trusts payload → identifies user.
- **Stateless** — great for APIs and scaling.
- Store in **HTTP-only cookies**, keep access tokens **short-lived**, use **refresh tokens** for longevity.
- **Never** trust the client — verify on every request.

Want me to show a complete Next.js 14 example with access + refresh tokens, or the Express/Node version?