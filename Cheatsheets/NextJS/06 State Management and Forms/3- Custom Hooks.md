# Custom Hooks in React & Next.js

## What Is a Custom Hook?

A custom hook is just a **JavaScript function whose name starts with `use`** and that calls other hooks. It lets you extract and reuse stateful logic across components.

```tsx
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  return { count, increment, decrement };
}
```

```tsx
function Counter() {
  const { count, increment } = useCounter(10);
  return <button onClick={increment}>{count}</button>;
}
```

That's it. No special API — just a convention. The `use` prefix tells React (and the linter) that hooks rules apply.

---

## The Rules (Same as Hooks)

1. Only call hooks at the **top level** of your hook — never inside loops, conditions, or nested functions
2. Only call hooks from **React components** or **other custom hooks**
3. Name must start with **`use`**

```tsx
// ❌ breaks rules
function useData(flag) {
  if (flag) {
    const [x, setX] = useState(0); // conditional hook
  }
}

// ✅ always called
function useData(flag) {
  const [x, setX] = useState(0);
  return flag ? x : null;
}
```

---

## Why They Exist

Custom hooks solve **three** problems:

1. **Logic reuse** — same behavior in many components without duplication
2. **Separation of concerns** — component renders UI, hook handles behavior
3. **Testability** — hooks can be tested in isolation

They **do not** share state. Each call to `useCounter()` creates its own independent state. (For shared state, use Context or an external store.)

---

## Common Patterns & Examples

### 1. Wrapping browser APIs — `useLocalStorage`

```tsx
"use client";
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

Usage:

```tsx
const [theme, setTheme] = useLocalStorage("theme", "light");
```

### 2. Debouncing — `useDebounce`

```tsx
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
```

Usage:

```tsx
const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 500);

useEffect(() => {
  if (debouncedQuery) search(debouncedQuery);
}, [debouncedQuery]);
```

### 3. Data fetching — `useFetch`

```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => e.name !== "AbortError" && setError(e))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}
```

⚠️ In practice, use **SWR** or **TanStack Query** instead — they handle caching, deduplication, and revalidation.

### 4. Event listeners — `useEventListener`

```tsx
function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (e: WindowEventMap[K]) => void
) {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    const listener = (e: WindowEventMap[K]) => ref.current(e);
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }, [event]);
}
```

The `ref` trick keeps the handler fresh without re-subscribing on every render.

### 5. Media query — `useMediaQuery`

```tsx
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
```

Usage:

```tsx
const isMobile = useMediaQuery("(max-width: 768px)");
```

### 6. Click outside — `useClickOutside`

```tsx
function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);

  return ref;
}
```

Usage:

```tsx
const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
return <div ref={ref}>...</div>;
```

### 7. Async state with loading/error — `useAsync`

```tsx
function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fn()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState({ data: null, loading: false, error }));

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
```

---

## Next.js-Specific Hooks

### 1. Auth hook (wrapping Context)

```tsx
"use client";
const AuthContext = createContext<Auth | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

### 2. Server Action wrapper

```tsx
"use client";
function useServerAction<T>(action: (fd: FormData) => Promise<T>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (formData: FormData) => {
      setPending(true);
      setError(null);
      try {
        return await action(formData);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setPending(false);
      }
    },
    [action]
  );

  return { run, pending, error };
}
```

### 3. URL / search params hook

```tsx
"use client";
function useQueryParam(key: string, defaultValue = "") {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const value = params.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      const sp = new URLSearchParams(params);
      if (next) sp.set(key, next);
      else sp.delete(key);
      router.push(`${pathname}?${sp.toString()}`);
    },
    [key, params, pathname, router]
  );

  return [value, setValue] as const;
}
```

### 4. Server Components can't use hooks

```tsx
// ❌ Server Component
export default async function Page() {
  const data = useFetch("/api/x"); // error: hooks not allowed
}
```

Fetch data directly on the server instead:

```tsx
// ✅
export default async function Page() {
  const data = await fetch("/api/x").then((r) => r.json());
  return <View data={data} />;
}
```

Hooks belong in **Client Components only**.

---

## Design Principles for Good Hooks

### 1. Return a tuple for positional values, an object for named ones

```tsx
// Positional — like useState
const [value, setValue] = useToggle();

// Named — many fields
const { data, loading, error } = useFetch(url);
```

### 2. Accept an options object for flexibility

```tsx
function useDebounce<T>(value: T, opts: { delay?: number } = {}) {
  const { delay = 300 } = opts;
  // ...
}
```

### 3. Clean up side effects

Every `useEffect` that subscribes, listens, or fetches must return a cleanup:

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // ✅
}, []);
```

### 4. Stabilize callbacks

If your hook accepts a function, wrap calls in a ref or use `useCallback` so consumers don't need to memoize:

```tsx
const ref = useRef(handler);
ref.current = handler; // always fresh, no re-subscription
```

### 5. Don't hide important behavior

Hooks should expose what matters — `loading`, `error`, `pending` — so components can render accordingly.

### 6. Prefer composition

Small hooks combine well:

```tsx
function useUserSearch() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 400);
  const { data, loading, error } = useFetch(`/api/users?q=${debounced}`);
  return { query, setQuery, results: data, loading, error };
}
```

---

## Testing Custom Hooks

Use `@testing-library/react`'s `renderHook`:

```tsx
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

test("increments", () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

For hooks that need Context, wrap with a `wrapper`:

```tsx
renderHook(() => useAuth(), { wrapper: AuthProvider });
```

---

## Custom Hook vs Other Tools

| Need | Use |
|---|---|
| Reusable stateful logic | Custom hook |
| Shared state across components | Context / Zustand |
| Server data fetching | SWR / TanStack Query |
| Form handling | React Hook Form |
| DOM refs, imperative APIs | `useRef` inside a hook |

---

## Common Pitfalls

1. **Sharing state accidentally** — each `useX()` call has its own state. Use Context for shared state.
2. **Stale closures** — capture values via a `ref` when the effect shouldn't re-subscribe.
3. **Missing cleanup** — subscriptions, timers, fetches must be cleaned up.
4. **Over-abstraction** — don't wrap everything; extract when logic repeats 2–3 times.
5. **Using hooks in Server Components** — will throw. Extract into a `"use client"` file.
6. **Conditional hook calls** — always call hooks unconditionally.

---

## Mental Model

```
Component
   │
   ├── calls useCustomHook()
   │      │
   │      ├── uses useState/useEffect/useRef internally
   │      ├── encapsulates behavior
   │      └── returns values + callbacks
   │
   └── renders UI using returned values
```

**Rules of thumb:**
- Name it `useSomething`
- One concern per hook
- Return the minimum useful API
- Clean up everything you start
- Extract only when there's real repetition

Want me to walk through a realistic one — like an `useForm` hook, a polling hook, or a hook that combines Context + Server Actions for optimistic updates?