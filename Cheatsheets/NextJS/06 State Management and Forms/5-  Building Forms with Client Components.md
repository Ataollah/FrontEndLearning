# Building Forms with Client Components in Next.js

Client Components (`"use client"`) give you the full React toolkit for forms: controlled inputs, instant validation, async submission, and UI feedback. This guide walks through every pattern from simple to production-grade.

---

## When to Use a Client Component Form

Use a **Client Component** when you need:

- Instant validation as the user types
- Conditional fields that depend on other fields
- Dynamic field arrays (add/remove rows)
- File previews, image cropping, rich text editors
- Complex UI feedback (spinners, optimistic updates)
- Third-party form libraries (React Hook Form, Formik)

Use a **Server Action with a plain `<form>`** when:

- The form is simple (login, newsletter signup)
- Progressive enhancement matters
- You don't need client-side interactivity

You can also **combine them**: Client Component form + Server Action handler.

---

## 1. The Simplest Controlled Form

```tsx
"use client";
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    // handle response
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Log in</button>
    </form>
  );
}
```

**Key points:**
- `"use client"` at the top of the file
- `e.preventDefault()` stops the native browser submit
- Every input is **controlled** — React owns the value

---

## 2. A Reusable `useForm` Hook

Once you have more than a couple of fields, a local hook pays off.

```tsx
"use client";
import { useState } from "react";

type Errors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    // clear error as the user types
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setField(name as keyof T, val as T[keyof T]);
  };

  const reset = () => {
    setValues(initial);
    setErrors({});
  };

  return { values, errors, submitting, setValues, setErrors, setSubmitting, setField, handleChange, reset };
}
```

Usage:

```tsx
"use client";
const { values, handleChange, submitting, setSubmitting } = useForm({
  email: "",
  password: "",
});

<input name="email" value={values.email} onChange={handleChange} />
```

The `name` attribute on each input ties it to a key in `values` — no per-field setters needed.

---

## 3. Validation: Client-Side

Validate on **blur** (not on every keystroke — that's noisy), and again on **submit**.

```tsx
"use client";
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleBlur = () => {
    setError(validateEmail(email) ? "" : "Enter a valid email");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Enter a valid email");
      return;
    }
    // submit
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={handleBlur}
        aria-invalid={!!error}
        aria-describedby="email-error"
      />
      {error && <p id="email-error" role="alert">{error}</p>}
      <button>Submit</button>
    </form>
  );
}
```

**Accessibility tips:**
- `noValidate` disables the browser's built-in bubbles so your messages show
- `aria-invalid` + `aria-describedby` link input to error
- `role="alert"` announces the error to screen readers

---

## 4. Validation with Zod (scalable)

For anything nontrivial, use Zod — one schema, reused on client and server.

```tsx
// lib/schemas.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

```tsx
"use client";
import { loginSchema } from "@/lib/schemas";

function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse(Object.fromEntries(fd));

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    // submit parsed.data
  };
}
```

The same schema runs on the server — never trust client validation alone.

---

## 5. Submitting to a Server Action

Client Component → Server Action. Best of both worlds: instant UI + server logic.

```tsx
// app/actions.ts
"use server";
import { loginSchema } from "@/lib/schemas";
import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const user = await authenticate(parsed.data);
  if (!user) return { error: "Wrong credentials" };

  (await cookies()).set("session", user.token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  return { success: true };
}
```

```tsx
"use client";
import { loginAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
      else router.push("/dashboard");
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {error && <p role="alert">{error}</p>}
      <button disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}
```

**Why `useTransition`?** It gives you a `pending` flag and keeps the UI responsive during the async action.

---

## 6. `useActionState` — Cleaner Server Action Forms

React 19's `useActionState` wraps a Server Action and gives you state + pending out of the box.

```tsx
"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/actions";

const initialState = { error: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {state.error && <p role="alert">{state.error}</p>}
      <button disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}
```

The Server Action signature changes:

```tsx
"use server";
export async function loginAction(prevState: { error: string }, formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const user = await authenticate(parsed.data);
  if (!user) return { error: "Wrong credentials" };
  redirect("/dashboard");
}
```

`redirect()` throws internally — don't wrap it in try/catch.

---

## 7. `useFormStatus` — Nested Submit Buttons

`useFormStatus` reads the status of the **nearest parent form**. It only works inside a component rendered *within* that form.

```tsx
"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : children}
    </button>
  );
}
```

Use it inside any `<form action={...}>`:

```tsx
<form action={loginAction}>
  <input name="email" />
  <SubmitButton>Log in</SubmitButton>
</form>
```

⚠️ Must be a **child component** of the form, not the form itself.

---

## 8. React Hook Form + Zod — The Production Combo

For large forms, dynamic arrays, and field-level validation, React Hook Form (RHF) is the standard. It's uncontrolled (fast) and integrates with Zod via `@hookform/resolvers`.

```bash
npm install react-hook-form zod @hookform/resolvers
```

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Too short"),
  email: z.string().email("Invalid email"),
  age: z.coerce.number().min(18, "Must be 18+"),
});

type FormValues = z.infer<typeof schema>;

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", age: 18 },
  });

  const onSubmit = async (data: FormValues) => {
    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input {...register("name")} aria-invalid={!!errors.name} />
      {errors.name && <p role="alert">{errors.name.message}</p>}

      <input {...register("email")} aria-invalid={!!errors.email} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <input type="number" {...register("age")} />
      {errors.age && <p role="alert">{errors.age.message}</p>}

      <button disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Sign up"}
      </button>
    </form>
  );
}
```

**Why RHF:**
- Uncontrolled inputs = fewer re-renders
- `register` spreads `name`, `onChange`, `onBlur`, `ref` in one go
- `isSubmitting`, `isDirty`, `touchedFields` come free
- `useFieldArray` for dynamic lists

### RHF with a Server Action

You can call a Server Action directly from `handleSubmit`:

```tsx
"use client";
import { createUser } from "@/app/actions";

const onSubmit = async (data: FormValues) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
  const result = await createUser(fd);
  if (result.error) setError("root", { message: result.error });
};
```

---

## 9. Dynamic Field Arrays

Add/remove rows with `useFieldArray`:

```tsx
"use client";
import { useForm, useFieldArray } from "react-hook-form";

export default function TeamForm() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: { members: [{ name: "", email: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "members" });

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      {fields.map((field, i) => (
        <div key={field.id}>
          <input {...register(`members.${i}.name`)} placeholder="Name" />
          <input {...register(`members.${i}.email`)} placeholder="Email" />
          <button type="button" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: "", email: "" })}>
        Add member
      </button>
      <button type="submit">Save</button>
    </form>
  );
}
```

Always use `field.id` as the React key — not the array index (indices shift on removal).

---

## 10. Optimistic UI

Show the result before the server confirms. Combine `useOptimistic` with a Server Action.

```tsx
"use client";
import { useOptimistic } from "react";
import { addComment } from "@/app/actions";

export function CommentList({ comments }: { comments: Comment[] }) {
  const [optimistic, addOptimistic] = useOptimistic(
    comments,
    (state, newComment: Comment) => [...state, { ...newComment, pending: true }]
  );

  const handleSubmit = async (formData: FormData) => {
    const text = formData.get("text") as string;
    addOptimistic({ id: "temp", text, pending: true });
    await addComment(formData);
  };

  return (
    <>
      <ul>
        {optimistic.map((c) => (
          <li key={c.id} style={{ opacity: c.pending ? 0.5 : 1 }}>
            {c.text}
          </li>
        ))}
      </ul>
      <form action={handleSubmit}>
        <input name="text" />
        <button>Post</button>
      </form>
    </>
  );
}
```

If the server fails, the optimistic entry disappears on the next render (since `comments` reverts).

---

## 11. File Uploads

Client Component with a FormData payload:

```tsx
"use client";
import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    // fetch doesn't give upload progress; use XMLHttpRequest for that
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress((e.loaded / e.total) * 100);
    };
    xhr.open("POST", "/api/upload");
    xhr.send(fd);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        accept="image/*"
      />
      {progress > 0 && <progress value={progress} max={100} />}
      <button disabled={!file}>Upload</button>
    </form>
  );
}
```

**Server Action alternative** — no XHR needed:

```tsx
<form action={uploadAction}>
  <input type="file" name="file" accept="image/*" />
  <button>Upload</button>
</form>
```

```tsx
"use server";
export async function uploadAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "No file" };
  if (file.size > 5_000_000) return { error: "Too large" };
  const bytes = await file.arrayBuffer();
  await saveToStorage(Buffer.from(bytes));
  revalidatePath("/files");
}
```

---

## 12. Multi-Step Forms

Keep step state in a Client Component; submit everything at the end.

```tsx
"use client";
const [step, setStep] = useState(0);
const [data, setData] = useState({ name: "", email: "", address: "" });

const next = () => setStep((s) => s + 1);
const back = () => setStep((s) => s - 1);

return (
  <form onSubmit={handleSubmit}>
    {step === 0 && <NameStep value={data.name} onChange={(v) => setData({ ...data, name: v })} />}
    {step === 1 && <EmailStep value={data.email} onChange={(v) => setData({ ...data, email: v })} />}
    {step === 2 && <AddressStep value={data.address} onChange={(v) => setData({ ...data, address: v })} />}

    {step > 0 && <button type="button" onClick={back}>Back</button>}
    {step < 2 && <button type="button" onClick={next}>Next</button>}
    {step === 2 && <button type="submit">Submit</button>}
  </form>
);
```

For persistence across page reloads, save `data` to a cookie or localStorage.

---

## 13. Error Handling Patterns

### Field-level errors

```tsx
{errors.email && <p className="error" role="alert">{errors.email.message}</p>}
```

### Form-level errors

```tsx
const [serverError, setServerError] = useState("");

const onSubmit = async (data) => {
  const res = await fetch("/api/x", { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) {
    const body = await res.json();
    setServerError(body.message ?? "Something went wrong");
    return;
  }
};

{serverError && <div role="alert">{serverError}</div>}
```

### With RHF

```tsx
const { setError } = useForm();

if (res.status === 409) {
  setError("email", { message: "Already registered" });
}
// or form-level:
setError("root", { message: "Something went wrong" });
```

---

## 14. Accessibility Checklist

- Every input has a `<label htmlFor>` or `aria-label`
- Errors use `aria-invalid` + `aria-describedby`
- Required fields have the `required` attribute or `aria-required`
- Submit button disabled only when it makes sense (e.g., during submit)
- Errors announced with `role="alert"` or `aria-live="polite"`
- Focus moves to the first error on submit failure
- Enter key submits the form (native behavior — don't block it)

---

## 15. Performance Tips

- **Prefer uncontrolled inputs** (RHF) for large forms — fewer re-renders
- **Split into sub-components** — an input changing shouldn't re-render the whole form
- **Debounce** expensive validation or API lookups
- **`useTransition`** for non-urgent updates so typing stays smooth
- **Avoid inline object/array props** to memoized children

```tsx
// ❌ new object every render
<Field config={{ required: true }} />

// ✅ stable reference
const config = useMemo(() => ({ required: true }), []);
<Field config={config} />
```

---

## 16. Full Working Example — Signup Form

Tying it all together: RHF + Zod + Server Action + pending + errors.

```tsx
// app/signup/page.tsx
import SignupForm from "./signup-form";

export default function Page() {
  return (
    <main className="max-w-md mx-auto p-6">
      <h1>Create account</h1>
      <SignupForm />
    </main>
  );
}
```

```tsx
// app/signup/signup-form.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupAction } from "./actions";

const schema = z
  .object({
    name: z.string().min(2, "At least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type Values = z.infer<typeof schema>;

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Values) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    const result = await signupAction(fd);

    if (result?.error) {
      setError("root", { message: result.error });
      return;
    }
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {errors.root && <div role="alert">{errors.root.message}</div>}

      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...register("name")} aria-invalid={!!errors.name} />
        {errors.name && <p role="alert">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <p role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register("password")} aria-invalid={!!errors.password} />
        {errors.password && <p role="alert">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirm">Confirm password</label>
        <input id="confirm" type="password" {...register("confirm")} aria-invalid={!!errors.confirm} />
        {errors.confirm && <p role="alert">{errors.confirm.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
```

```tsx
// app/signup/actions.ts
"use server";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signupAction(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };

  const existing = await db.user.findByEmail(parsed.data.email);
  if (existing) return { error: "Email already registered" };

  const user = await db.user.create({
    ...parsed.data,
    password: await hash(parsed.data.password),
  });

  await sendWelcomeEmail(user.email);
  redirect("/dashboard");
}
```

Notice:
- Same Zod schema shape reused on both sides (simplify by sharing the schema file)
- Server Action returns `{ error }` for validation/business errors
- `redirect()` throws, so no return value needed on success
- Client handles optimistic loading via `isSubmitting`

---

## Mental Model

```
Client Component (form UI)
   │
   ├── State: values, errors, touched, submitting
   ├── Validation: Zod (shared schema) — client + server
   ├── Submission: fetch / Server Action
   └── Feedback: pending, error, optimistic

        ↓ (Server Action)

Server
   ├── Re-validate with same schema
   ├── DB / external API
   ├── Set cookies / session
   └── revalidatePath / redirect
```

**Rules of thumb:**

1. Client Component for interaction; Server Action for persistence
2. Validate on client **and** server — never trust the browser
3. Prefer RHF for anything beyond 3–4 fields
4. Show `pending` on the button; disable during submit
5. Handle both field-level and form-level errors
6. Use `useOptimistic` when latency would hurt UX
7. Keep accessibility (`label`, `aria-invalid`, `role="alert"`) baked in

Want me to build a specific form next — like a payment form with Stripe Elements, an image uploader with preview + progress, or a multi-step wizard with saved drafts?