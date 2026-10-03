# Context API in React (and Next.js)

## What Problem It Solves

React passes data **down** through props. If a deeply nested component needs data from a top-level component, you end up **prop drilling**:

```tsx
<App user={user}>
  <Layout user={user}>
    <Sidebar user={user}>
      <Profile user={user} />  {/* only this needs it */}
    </Sidebar>
  </Layout>
</App>
```

Context lets a parent **broadcast** a value to any descendant, skipping intermediate levels.

---

## The Three Pieces

1. **`createContext(defaultValue)`** — creates the context object
2. **`<Context.Provider value={...}>`** — supplies the value to descendants
3. **`useContext(Context)`** — reads the value from any descendant

---

## Basic Example

```tsx
"use client";
import { createContext, useContext, useState } from "react";

// 1. Create the context
const ThemeContext = createContext<{
  theme: string;
  setTheme: (t: string) => void;
} | null>(null);

// 2. Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Custom hook (recommended pattern)
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

Usage:

```tsx
// app/layout.tsx
<ThemeProvider>
  <Header />      {/* can read theme */}
  <Page />        {/* can read theme */}
</ThemeProvider>
```

```tsx
"use client";
import { useTheme } from "@/context/theme";

function Button() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} />;
}
```

---

## Key Concepts

### Default value vs `null`

The default passed to `createContext` is used **only** when there's no Provider above. A common trick is to pass `null` and throw in the hook — this catches mistakes where you forgot the Provider.

```tsx
const Ctx = createContext<Value | null>(null);
```

### The Provider must be a Client Component

Context uses `useState`/`useContext`, so any file creating or consuming it needs `"use client"`. But **Server Components can still render a Provider** — they just can't read the context.

```tsx
// app/layout.tsx — Server Component
import { ThemeProvider } from "./theme-provider"; // client

export default function Layout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>; // ✅ works
}
```

Children passed as `children` from a Server Component stay as Server Components — only the Provider is client. This is the **"pass children through client components"** pattern.

### Context is not a state manager

Context **transports** a value. It doesn't create or manage state — you combine it with `useState`, `useReducer`, or an external store.

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
return (
  <Ctx.Provider value={{ state, dispatch }}>
    {children}
  </Ctx.Provider>
);
```

---

## The Re-render Problem

**Every consumer re-renders whenever the Provider's `value` changes** — even if they only use one field.

```tsx
// ❌ New object every render → all consumers re-render
<Ctx.Provider value={{ user, theme, cart }}>
```

Fixes:

### 1. Memoize the value

```tsx
const value = useMemo(() => ({ user, theme, cart }), [user, theme, cart]);
<Ctx.Provider value={value}>{children}</Ctx.Provider>
```

### 2. Split contexts by concern

```tsx
<UserContext.Provider value={user}>
  <ThemeContext.Provider value={theme}>
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  </ThemeContext.Provider>
</UserContext.Provider>
```

A component using only `useTheme()` won't re-render when `user` changes.

### 3. Separate state and dispatch

```tsx
<StateContext.Provider value={state}>
  <DispatchContext.Provider value={dispatch}>
    {children}
  </DispatchContext.Provider>
</StateContext.Provider>
```

Components that only dispatch won't re-render on state changes.

### When re-renders become a problem

If you have high-frequency updates (typing, animations, drag), Context is the wrong tool. Use **Zustand**, **Jotai**, or **Redux** — they let components subscribe to slices.

---

## Common Use Cases

| Use case | Good fit? |
|---|---|
| Theme (light/dark) | ✅ |
| Auth user / session | ✅ |
| i18n / locale | ✅ |
| Modal / toast manager | ✅ |
| Shopping cart | ⚠️ if frequent updates |
| Form state | ❌ use RHF or local state |
| Server data cache | ❌ use TanStack Query |
| Rapidly changing values | ❌ use Zustand |

---

## Context vs Alternatives

| | Context | Zustand | Props |
|---|---|---|---|
| Setup | Medium | Low | None |
| Re-render control | Coarse | Fine (selectors) | Fine |
| Works outside React | ❌ | ✅ | ❌ |
| SSR-safe | ✅ | ✅ (with care) | ✅ |
| Best for | Low-frequency global values | Complex/frequent state | Local data |

---

## In Next.js Specifically

### Where to put Providers

Put them in `app/layout.tsx` and wrap `{children}`:

```tsx
// app/providers.tsx
"use client";
export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={qc}>
          {children}
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Server Components can't consume Context

```tsx
// ❌ This will error
export default async function Page() {
  const theme = useTheme(); // server component
}
```

Only Client Components (`"use client"`) can call `useContext`. If a Server Component needs data from context, pass it as props instead, or fetch it on the server.

### Context + Server Actions

A common pattern: put the Server Action itself in context, so deep client components can trigger it.

```tsx
"use client";
const FormContext = createContext<{ action: (fd: FormData) => Promise<any> } | null>(null);
```

---

## Quick Mental Model

```
Provider (owns state) 
   │
   ├── value flows down automatically
   │
   ▼
Consumers (read via useContext)
   │
   └── re-render whenever value identity changes
```

**Rules:**
1. Create → Provider → `useContext` hook (with null check)
2. Memoize the `value` object
3. Split contexts by concern
4. Use it for **low-frequency**, **app-wide** values
5. Never put server data or hot state in Context

Want me to show how to combine Context with `useReducer` for a full app-level store, or how to swap it for Zustand later if you outgrow it?