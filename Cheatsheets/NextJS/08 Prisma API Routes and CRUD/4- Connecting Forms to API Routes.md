# Connecting Forms to API Routes in Next.js

There are **three main approaches** to wire a form to your API. I'll show all of them, then explain when to use each.

---

## Approach Overview

| Approach | Use when |
|----------|----------|
| **A. Client Component + `fetch`** | You want JSON APIs, real-time validation, SPAs |
| **B. Server Actions** | Progressive enhancement, no separate API needed |
| **C. FormData → API Route** | Simple HTML forms, file uploads |

We'll build the **same "Create Post" form** all three ways.

---

## 1. The Shared Validation Schema (Zod)

Both client and server use the same schema — this is the killer feature.

```ts
// lib/validations/post.ts
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(10, "Content must be at least 10 characters"),
  published: z.boolean().default(false),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
```

Your API route (from the previous step) already validates with this. Now the form will too.

---

## Approach A: Client Component + `fetch` (most common)

### A1. The API route (already built)

```ts
// app/api/posts/route.ts
export async function POST(req: NextRequest) {
  try {
    const data = createPostSchema.parse(await req.json());
    const post = await prisma.post.create({ data });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return handleApiError(error); // returns { error, issues? }
  }
}
```

### A2. The form — controlled inputs + fetch

```tsx
// app/posts/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPostSchema } from "@/lib/validations/post";

type FieldErrors = Partial<Record<"title" | "content", string[]>>;

export default function NewPostForm() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", published: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    // clear field error as user types
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    // 1) Client-side validation first (fast feedback)
    const parsed = createPostSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    // 2) Send to API
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const body = await res.json();
        if (body.issues) setErrors(body.issues);
        else setServerError(body.error ?? "Something went wrong");
        return;
      }

      const post = await res.json();
      router.push(`/posts/${post.id}`);       // navigate on success
      router.refresh();                       // refresh server components
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {serverError && (
        <p className="text-red-600 bg-red-50 p-2 rounded">{serverError}</p>
      )}

      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          disabled={submitting}
          className="border rounded w-full p-2"
        />
        {errors.title && <p className="text-red-600 text-sm">{errors.title[0]}</p>}
      </div>

      <div>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={6}
          value={form.content}
          onChange={handleChange}
          disabled={submitting}
          className="border rounded w-full p-2"
        />
        {errors.content && <p className="text-red-600 text-sm">{errors.content[0]}</p>}
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="published"
          checked={form.published}
          onChange={handleChange}
          disabled={submitting}
        />
        Publish immediately
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
```

**Key ideas:**
- `safeParse` on the client avoids a round trip for obvious errors
- Errors from the server are merged back into the same `errors` state
- `router.refresh()` re-runs server components so lists update
- Disable inputs while submitting to prevent double-submit

---

## Approach B: Server Actions (Next.js 13.4+)

Server Actions let you skip the API route entirely — the form posts directly to a server function.

### B1. Define the action

```ts
// app/posts/new/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/lib/validations/post";

export type FormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function createPostAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1) Extract + validate
  const raw = {
    title: formData.get("title"),
    content: formData.get("content"),
    published: formData.get("published") === "on",
  };

  const parsed = createPostSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // 2) Write to DB
  let postId: number;
  try {
    const post = await prisma.post.create({ data: parsed.data });
    postId = post.id;
  } catch (e) {
    return { message: "Database error. Please try again." };
  }

  // 3) Revalidate & redirect
  revalidatePath("/posts");
  redirect(`/posts/${postId}`);
}
```

### B2. The form uses `useFormState` + `useFormStatus`

```tsx
// app/posts/new/page.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPostAction, FormState } from "./actions";

const initialState: FormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create Post"}
    </button>
  );
}

export default function NewPostForm() {
  const [state, formAction] = useFormState(createPostAction, initialState);

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state.message && (
        <p className="text-red-600 bg-red-50 p-2 rounded">{state.message}</p>
      )}

      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" className="border rounded w-full p-2" />
        {state.errors?.title && (
          <p className="text-red-600 text-sm">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={6}
          className="border rounded w-full p-2"
        />
        {state.errors?.content && (
          <p className="text-red-600 text-sm">{state.errors.content[0]}</p>
        )}
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="published" />
        Publish immediately
      </label>

      <SubmitButton />
    </form>
  );
}
```

**Why this is powerful:**
- Works **without JS** (progressive enhancement)
- No `fetch`, no manual `loading` state
- `useFormStatus` gives you pending state for free
- `revalidatePath` + `redirect` handle cache + navigation server-side

---

## Approach C: FormData → API Route

If you want the Server Action ergonomics but keep a real API endpoint (e.g., mobile clients will also POST here):

```ts
// app/api/posts/route.ts
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let raw: unknown;

    if (contentType.includes("application/json")) {
      raw = await req.json();
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const fd = await req.formData();
      raw = {
        title: fd.get("title"),
        content: fd.get("content"),
        published: fd.get("published") === "on",
      };
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }

    const data = createPostSchema.parse(raw);
    const post = await prisma.post.create({ data });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

Then a plain HTML form works:

```tsx
<form action="/api/posts" method="POST">
  <input name="title" />
  <textarea name="content" />
  <input type="checkbox" name="published" />
  <button type="submit">Create</button>
</form>
```

⚠️ Without JS this navigates to the JSON response. Usually you'd wrap it in a client component that intercepts submit — which brings you back to Approach A.

---

## File Uploads (bonus, since it comes up)

For file inputs, you **must** use `FormData` — you can't JSON-encode a `File`.

```tsx
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  // fd.get("avatar") is a File

  const res = await fetch("/api/upload", {
    method: "POST",
    body: fd, // ← do NOT set Content-Type; browser adds the boundary
  });
}
```

Server side:
```ts
export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const file = fd.get("avatar") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  // save to disk / S3 / uploadthing / etc.
}
```

> Never manually set `Content-Type: multipart/form-data` — the browser must add the `boundary` parameter itself.

---

## Full Working Example: Edit Form (PUT/PATCH)

```tsx
// app/posts/[id]/edit/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Post = { id: number; title: string; content: string; published: boolean };

export default function EditPostForm({ post }: { post: Post }) {
  const router = useRouter();
  const [form, setForm] = useState(post);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        published: form.published,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Failed to save");
      return;
    }

    router.push(`/posts/${post.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600">{error}</p>}

      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="border rounded w-full p-2"
      />
      <textarea
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        className="border rounded w-full p-2"
      />
      <label>
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
        Published
      </label>

      <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

Server component page passes the initial data:
```tsx
// app/posts/[id]/edit/page.tsx (server wrapper)
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditPostForm from "./EditPostForm"; // client component

export default async function Page({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: Number(params.id) } });
  if (!post) notFound();
  return <EditPostForm post={post} />;
}
```

---

## Delete with Confirmation

```tsx
"use client";
export function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    setDeleting(true);
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      router.push("/posts");
      router.refresh();
    }
  }

  return (
    <button onClick={handleDelete} disabled={deleting} className="text-red-600">
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
```

---

## Best Practices Checklist

1. **Share the Zod schema** between client and server — one source of truth.
2. **Validate on the client** for UX, **validate on the server** for security. Never rely on client validation alone.
3. **Disable the submit button** while a request is in flight.
4. **Show field-level errors** next to inputs, not just a global message.
5. **Show a top-level error** for network/server failures.
6. **Clear field errors on change** so users see progress.
7. **Revalidate after mutations** — `router.refresh()` or `revalidatePath()`.
8. **Never `JSON.stringify` a `FormData`** — send it raw for file uploads.
9. **Don't manually set `multipart/form-data` Content-Type**.
10. **Prefer Server Actions** when you don't need a public API; prefer API routes when you do (mobile apps, webhooks, third-party clients).
11. **Optimistic updates** with `useOptimistic` give snappy UIs — add later once basics work.
12. **CSRF & auth** — Server Actions have CSRF protection built-in; API routes need manual auth checks.

---

## Decision Tree

```
Do you need the endpoint callable from outside your app (mobile, webhooks)?
├─ Yes → API Route + fetch (Approach A or C)
└─ No
   ├─ Does the form need heavy client interactivity?
   │   ├─ Yes → API Route + fetch (Approach A)
   │   └─ No  → Server Action (Approach B) ← simplest
   └─ File uploads?
       └─ API Route with FormData (Approach C)
```

---

## TL;DR Flow (Approach A)

```
User submits form
     ↓
Client: Zod safeParse
     ├─ fail → show field errors (no network call)
     └─ pass → fetch("/api/posts", { method: "POST", body: JSON.stringify(data) })
                         ↓
                 API route: Zod parse again + Prisma write
                         ↓
                 ├─ 2xx → router.push() + router.refresh()
                 └─ 4xx/5xx → merge body.issues into form errors
```

**TL;DR (Approach B — Server Action):**
```
<form action={formAction}>
     ↓
Server function receives FormData
     ↓
Zod parse → Prisma write → revalidatePath() → redirect()
     ↓
useFormState exposes { errors, message } back to the UI
```

Start with **Approach A** if you're new — you see every step. Graduate to **Server Actions** once the pattern clicks; they remove a lot of boilerplate.