# State Management and Forms in Next.js

## State Management in Next.js

Next.js has **two environments** where state lives, and this shapes everything:

- **Server** — no persistent state between requests
- **Client** — React state, context, external stores

### 1. Local State (`useState`, `useReducer`)

Standard React. Works only in Client Components (`"use client"`).

```tsx
"use client";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 2. URL State (often overlooked)

The URL is a great state store in Next.js. Use `useSearchParams`, `useRouter`, and route params.

```tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";

const router = useRouter();
const params = useSearchParams();

router.push(`/products?sort=${value}`);
```

**Good for:** filters, pagination, tabs, shareable UI state.

### 3. React Context

Fine for small, low-frequency state (theme, auth user, locale).

```tsx
"use client";
const ThemeContext = createContext("light");

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

⚠️ Context re-renders all consumers. Avoid for high-frequency updates.

### 4. External Stores — Zustand / Redux / Jotai

Best for complex client state shared across many components.

```tsx
// store.ts
import { create } from "zustand";

export const useStore = create((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));
```

```tsx
"use client";
const { count, inc } = useStore();
```

**Why Zustand is popular in Next.js:** works outside React, no provider needed, minimal re-renders, easy SSR hydration.

### 5. Server State — TanStack Query / SWR

Server state (data from APIs/DB) is **not** the same as client state. Use a data-fetching library for caching, revalidation, and mutations.

```tsx
"use client";
import useSWR from "swr";

const { data, mutate } = useSWR("/api/user", fetcher);
```

### 6. Server State via Server Components

In the App Router, fetch data directly in Server Components — no client store needed:

```tsx
// app/page.tsx (Server Component)
export default async function Page() {
  const data = await fetch("https://api.example.com/data", {
    next: { revalidate: 60 },
  }).then((r) => r.json());
  return <View data={data} />;
}
```

### Choosing the Right Tool

| State type | Recommended |
|---|---|
| UI toggles, form inputs | `useState` |
| Filters, pagination | URL params |
| Theme, auth | Context |
| Complex app state | Zustand / Redux |
| API data cache | TanStack Query / SWR |
| Static/DB data | Server Components |

---

## Forms in Next.js

### 1. Controlled Forms (Client Component)

Classic React — full control, validation on every keystroke.

```tsx
"use client";
export default function Form() {
  const [name, setName] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); /* submit */ }}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </form>
  );
}
```

### 2. Server Actions (App Router, recommended)

Forms can call server functions directly — no API route needed.

```tsx
// app/actions.ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({ email: z.string().email() });

export async function subscribe(formData: FormData) {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Invalid email" };
  await db.insert(parsed.data);
  revalidatePath("/");
}
```

```tsx
// app/page.tsx (Server Component)
import { subscribe } from "./actions";

export default function Page() {
  return (
    <form action={subscribe}>
      <input name="email" type="email" required />
      <button type="submit">Subscribe</button>
    </form>
  );
}
```

**Benefits:** progressive enhancement (works without JS), less client bundle, direct DB access.

### 3. `useActionState` (client feedback)

For validation errors, pending state, etc.

```tsx
"use client";
import { useActionState } from "react";

export function Form({ action }) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction}>
      <input name="email" />
      {state?.error && <p>{state.error}</p>}
      <button disabled={pending}>Submit</button>
    </form>
  );
}
```

### 4. `useFormStatus` (nested submit button)

```tsx
"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}
```

### 5. Optimistic Updates (`useOptimistic`)

Show the result before the server confirms:

```tsx
"use client";
const [optimistic, addOptimistic] = useOptimistic(messages, (state, msg) => [
  ...state, { text: msg, sending: true },
]);
```

### 6. React Hook Form + Zod (complex forms)

For large forms with many fields, dynamic arrays, and fine-grained validation, RHF is still the go-to:

```tsx
"use client";
const { register, handleSubmit, formState } = useForm({
  resolver: zodResolver(schema),
});

const onSubmit = handleSubmit((data) => save(data));
```

Combine with a Server Action when you want server-side validation too.

---

## Practical Rules of Thumb

1. **Prefer server state over client state.** Fetch in Server Components; keep client state minimal.
2. **Use Server Actions for mutations.** You get progressive enhancement and type safety for free.
3. **Reach for URL params before global state.** They survive refresh and are shareable.
4. **Don't put server data in Zustand/Redux.** Use TanStack Query or Server Components.
5. **For forms:** simple → Server Action; complex → RHF + Zod + Server Action.
6. **Always `"use client"` at the leaf**, not at the top of your tree — keep the server boundary as deep as possible.

### Mental model

```
Server Components ─── fetch data, render HTML (no state)
      │
      ▼
Client Components ─── useState / useReducer (local)
      │              Context (shared, low-frequency)
      │              Zustand/Redux (global, high-frequency)
      │              TanStack Query/SWR (server cache)
      │
      ▼
Server Actions ──── mutations + revalidation (the bridge back to server)
```

If you tell me what you're building (dashboard, e-commerce, blog, etc.), I can show a concrete state + form architecture for it.