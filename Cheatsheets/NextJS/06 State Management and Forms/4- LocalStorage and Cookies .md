# LocalStorage and Cookies in Next.js

Both store data in the browser, but they have **very different purposes**. Choosing wrong causes bugs, security holes, or hydration errors.

---

## Quick Comparison

| | **localStorage** | **Cookies** |
|---|---|---|
| Accessible from | JS only (client) | JS **and** server |
| Sent to server | ❌ never | ✅ every request |
| Size limit | ~5–10 MB | ~4 KB per cookie |
| Expiry | Manual (or never) | `maxAge` / `expires` |
| Auto-sent with fetch | ❌ | ✅ (same-origin) |
| SSR-readable | ❌ | ✅ via `cookies()` |
| XSS risk | ✅ high (JS can read) | ⚠️ if not `httpOnly` |
| CSRF risk | ❌ | ⚠️ yes unless `SameSite` set |
| Sync/async | Sync | Sync (JS), async (server) |
| Blocked in | SSR, private mode (rare) | Rarely |

**Rule of thumb:**
- Need it on the server? → **cookie**
- Auth token? → **httpOnly cookie**
- Purely client-side preferences? → **localStorage**
- Session state shared with SSR? → **cookie**

---

## LocalStorage

### Browser API recap

```tsx
localStorage.setItem("key", "value");   // strings only
const v = localStorage.getItem("key");  // string | null
localStorage.removeItem("key");
localStorage.clear();
```

Only stores **strings**. For objects, use `JSON.stringify` / `JSON.parse`.

### The SSR Problem

`localStorage` doesn't exist on the server. Reading it during render breaks SSR and causes hydration mismatches.

```tsx
// ❌ Crashes on server
const [theme, setTheme] = useState(localStorage.getItem("theme"));
```

### Pattern 1: Lazy initializer + guard

```tsx
"use client";
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue] as const;
}
```

⚠️ Note: the initial render uses `initial`, then the effect updates — still a **hydration mismatch** if the server rendered `initial` and client had a different stored value. Fix below.

### Pattern 2: Hydration-safe (render after mount)

```tsx
"use client";
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, hydrated]);

  return { value, setValue, hydrated };
}
```

Consumers render a placeholder until `hydrated` is true:

```tsx
const { value, hydrated } = useLocalStorage("theme", "light");
if (!hydrated) return <Skeleton />;
```

### Pattern 3: Theme without flash (inline script)

The classic case: dark mode. The flash of wrong theme happens because HTML renders before JS runs. Solve with a blocking inline script in `<head>`:

```tsx
// app/layout.tsx
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `
        try {
          const t = localStorage.getItem('theme');
          if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
          }
        } catch {}
      `,
    }}
  />
</head>
```

This runs **before paint**, avoiding the flash. `next-themes` handles this for you.

### localStorage in Server Components

Impossible — no `window`. Fetch client-side in a Client Component, or move the data to a cookie.

---

## Cookies

### Two ways to interact

**Client-side JS:**

```tsx
document.cookie = "theme=dark; path=/; max-age=31536000; SameSite=Lax";
```

**Server-side (Next.js App Router):**

```tsx
import { cookies } from "next/headers";

const store = await cookies();          // Next 15 (async)
const theme = store.get("theme")?.value;
store.set("theme", "dark", { path: "/", maxAge: 60 * 60 * 24 * 365 });
store.delete("theme");
```

⚠️ In Next.js 15, `cookies()` is **async** — you must `await` it.

### Cookie attributes (the important ones)

| Attribute | Meaning |
|---|---|
| `path=/` | Available on all routes |
| `maxAge` | Seconds until expiry |
| `expires` | Absolute date |
| `httpOnly` | **JS cannot read it** — great for auth tokens |
| `secure` | HTTPS only |
| `SameSite=Lax` | Sent on top-level navigations, blocks most CSRF |
| `SameSite=Strict` | Never sent cross-site |
| `SameSite=None` | Always sent; requires `Secure` |

**Typical auth cookie:**

```tsx
store.set("session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

### Reading cookies on the server

**Server Component:**

```tsx
import { cookies } from "next/headers";

export default async function Page() {
  const store = await cookies();
  const theme = store.get("theme")?.value ?? "light";
  return <div className={theme}>...</div>;
}
```

**Route Handler / Server Action:**

```tsx
"use server";
import { cookies } from "next/headers";

export async function login(formData: FormData) {
  const token = await authenticate(formData);
  const store = await cookies();
  store.set("session", token, { httpOnly: true, path: "/" });
}
```

**Middleware:**

```tsx
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const token = req.cookies.get("session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}
```

Middleware runs on every matched request — perfect for auth gating.

### Reading cookies on the client

`document.cookie` is ugly (single semicolon-separated string). Use a helper or the `js-cookie` library.

```tsx
"use client";
function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="))
    ?.split("=")[1];
}
```

⚠️ **`httpOnly` cookies are invisible here** — that's the point.

### Setting cookies

**From a Server Action** (recommended for Next.js):

```tsx
"use server";
import { cookies } from "next/headers";

export async function setTheme(theme: string) {
  const store = await cookies();
  store.set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
```

**From client JS:**

```tsx
document.cookie = `theme=dark; path=/; max-age=31536000; SameSite=Lax`;
```

You cannot set `httpOnly` from JS — that's server-only.

---

## Storage vs Cookie: When to Use Which

| Data | Store | Why |
|---|---|---|
| Auth session token | **httpOnly cookie** | XSS-safe, SSR-readable, sent automatically |
| Theme preference | **Cookie** (or localStorage + inline script) | Avoid FOUC; SSR knows the theme |
| Language / locale | **Cookie** | SSR needs it |
| Cart contents | **Cookie** (small) or server DB | SSR renders cart; cookie for anonymous users |
| Draft text in a form | **localStorage** | No need to hit server |
| Last visited tab | **localStorage** | Pure UI state |
| UI preferences (sidebar open) | **localStorage** | Purely client |
| Feature flags | **Cookie** (or server fetch) | If SSR-dependent |
| JWT for API calls | **httpOnly cookie** | Never put in localStorage |

**Never store:**
- Passwords
- API secrets
- Full JWTs in localStorage (XSS steals them)

---

## Common Patterns

### Theme with cookie (SSR-safe, no flash)

```tsx
// app/actions.ts
"use server";
import { cookies } from "next/headers";

export async function setTheme(theme: "light" | "dark") {
  (await cookies()).set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
```

```tsx
// app/layout.tsx
import { cookies } from "next/headers";

export default async function RootLayout({ children }) {
  const theme = (await cookies()).get("theme")?.value ?? "light";
  return (
    <html className={theme}>
      <body>{children}</body>
    </html>
  );
}
```

No flash. No client script. Fully server-rendered. 🎉

### Auth flow with httpOnly cookie

```tsx
// login server action
"use server";
export async function login(formData: FormData) {
  const user = await verifyCredentials(formData);
  if (!user) return { error: "Invalid credentials" };
  (await cookies()).set("session", user.token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/dashboard");
}
```

```tsx
// protected server component
const token = (await cookies()).get("session")?.value;
if (!token) redirect("/login");
```

### Client-only preferences

```tsx
"use client";
const [sidebarOpen, setSidebarOpen] = useLocalStorage("sidebar", true);
```

### Language switching

```tsx
"use server";
export async function setLocale(locale: string) {
  (await cookies()).set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
```

---

## Security Notes

### localStorage

- **XSS steals it.** Any script on the page — yours, a dependency, an ad — can read everything.
- Never store session tokens here if you can use httpOnly cookies.

### Cookies

- **CSRF**: attacker tricks the browser into sending a cookie to your site. Mitigate with `SameSite=Lax` (default in modern browsers) or `Strict`, plus CSRF tokens for state-changing requests.
- **XSS**: `httpOnly` protects the cookie from JS, but the attacker can still make requests as the user.
- **Secure**: set in production so cookies aren't sent over HTTP.
- **Size limit ~4 KB**: don't stuff large payloads into cookies — they're sent on every request.

### Best practice for auth

```
Login → server sets httpOnly + secure + sameSite cookie
      → middleware checks cookie
      → server components read cookie
      → client never touches the token
```

---

## Hydration Mismatch — The #1 Bug

Symptom:

```
Warning: Text content did not match.
Server: "light"  Client: "dark"
```

Cause: server rendered with one value, client read localStorage/cookie and got another.

**Fixes:**
1. Use cookies read on the server → same value both sides
2. Render a fallback until `mounted` is true
3. Use `suppressHydrationWarning` for known-mismatch cases (like `<html className>` with an inline script)

```tsx
<html suppressHydrationWarning className={theme}>
```

`next-themes` uses this combo internally.

---

## Summary

| Need | Solution |
|---|---|
| Server needs it during render | **Cookie** (via `cookies()`) |
| Auth token | **httpOnly cookie** |
| Purely client preference | **localStorage** (with mount guard) |
| Theme / locale (SSR-rendered) | **Cookie** |
| Draft text, tab state | **localStorage** |
| Avoid flash of wrong theme | Inline script + localStorage, OR cookie + server render |
| Cross-tab sync | `storage` event listener (localStorage only) |

**Mental model:**

```
Server Component  →  cookies()  →  knows at render time
Client Component  →  cookies / localStorage  →  after mount
                     ↑ hydration mismatch risk
```

If you want, I can show a complete `useCookie` hook, a cross-tab `useLocalStorage` synced via the `storage` event, or a full auth implementation with middleware + httpOnly cookies + refresh tokens.