# Error Handling in Next.js Forms with Server Actions

Error handling with Server Actions has a few distinct layers: **validation errors**, **expected runtime errors**, **unexpected exceptions**, and **UI-level error boundaries**. Here's how to handle each properly.

## 🎯 The Four Layers of Error Handling

| Layer | What it handles | Tool |
|---|---|---|
| **1. Validation** | Bad user input (empty fields, wrong format) | Return `FormState` with `errors` |
| **2. Expected errors** | Business logic failures (not found, unauthorized) | Return `FormState` with `message` |
| **3. Unexpected errors** | Crashes, DB down, bugs | Throw → caught by `error.tsx` |
| **4. UI safety net** | Anything that escapes the above | `error.tsx` + `global-error.tsx` |

---

## 1️⃣ Validation Errors — Return, Don't Throw

Validation errors are **expected** — they should be returned as state, not thrown.

```ts
// app/actions/posts.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addPost } from '@/app/lib/db';

const PostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required.')
    .max(100, 'Title must be ≤ 100 characters.'),
  body: z
    .string()
    .min(1, 'Body is required.')
    .max(1000, 'Body must be ≤ 1000 characters.'),
});

export type FormState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string | null;
  values?: { title?: string; body?: string }; // preserve input on error
};

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    title: formData.get('title')?.toString() ?? '',
    body: formData.get('body')?.toString() ?? '',
  };

  const parsed = PostSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please fix the errors below.',
      values: raw, // so the form can repopulate
    };
  }

  // ✅ Success path — outside try/catch so redirect() isn't caught
  addPost(parsed.data);
  revalidatePath('/posts');
  redirect('/posts');
}
```

### ⚠️ Critical: `redirect()` must NOT be inside `try/catch`

`redirect()` throws a special `NEXT_REDIRECT` error internally. If you wrap it in try/catch, you'll swallow it and the redirect won't happen.

```ts
// ❌ BAD — redirect gets swallowed
try {
  addPost(data);
  redirect('/posts');
} catch (e) {
  return { message: 'Something failed' };
}

// ✅ GOOD — redirect is outside
try {
  addPost(data);
} catch (e) {
  return { message: 'Something failed' };
}
redirect('/posts');
```

---

## 2️⃣ Expected Runtime Errors — Return Them Too

Things like "not found", "unauthorized", or "duplicate" are **expected**. Return them as a `message` so the form can display them.

```ts
// app/actions/posts.ts
'use server';

import { addPost, findPostByTitle } from '@/app/lib/db';
import { redirect } from 'next/navigation';

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // ...validation as above...

  // Check for duplicates — an expected business error
  const existing = findPostByTitle(parsed.data.title);
  if (existing) {
    return {
      success: false,
      errors: { title: ['A post with this title already exists.'] },
      message: 'Duplicate title.',
      values: parsed.data,
    };
  }

  addPost(parsed.data);
  revalidatePath('/posts');
  redirect('/posts');
}
```

---

## 3️⃣ Unexpected Errors — Let Them Bubble Up

For truly unexpected failures (DB down, bug, network), **don't** swallow them. Throw — Next.js will route them to `error.tsx`.

```ts
// app/actions/posts.ts
'use server';

import { addPost } from '@/app/lib/db';

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // ...validation...

  // Let unexpected errors bubble to error.tsx
  const created = await addPost(parsed.data); // if this throws, error.tsx catches it

  revalidatePath('/posts');
  redirect('/posts');
}
```

### Optional: Log and rethrow

If you want to log before bubbling:

```ts
try {
  await addPost(parsed.data);
} catch (error) {
  console.error('[createPost] DB failure:', error);
  throw error; // rethrow so error.tsx handles it
}

revalidatePath('/posts');
redirect('/posts');
```

---

## 4️⃣ The `error.tsx` Boundary

An `error.tsx` file catches any error thrown in its segment (and children). It must be a **Client Component** and receives `error` + `reset`.

```tsx
// app/posts/error.tsx
'use client';

import { useEffect } from 'react';

export default function PostsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Posts error:', error);
  }, [error]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Something went wrong 😢</h2>
      <p style={{ color: '#888', fontSize: 12 }}>
        {error.digest && `Reference: ${error.digest}`}
      </p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Global fallback — `app/global-error.tsx`

Catches errors in the root layout itself. Must include `<html>` and `<body>`.

```tsx
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went very wrong.</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

---

## 5️⃣ Full Client Form with Error Display

```tsx
// app/posts/post-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createPost, type FormState } from '@/app/actions/posts';

const initialState: FormState = { success: false, message: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Creating…' : 'Create Post'}
    </button>
  );
}

export default function PostForm() {
  const [state, formAction] = useActionState(createPost, initialState);

  return (
    <form action={formAction} style={{ display: 'grid', gap: 8 }}>
      <div>
        <input
          name="title"
          placeholder="Title"
          defaultValue={state.values?.title}
          aria-invalid={!!state.errors?.title}
          aria-describedby="title-error"
        />
        {state.errors?.title && (
          <p id="title-error" role="alert" style={{ color: 'crimson', fontSize: 12 }}>
            {state.errors.title.join(', ')}
          </p>
        )}
      </div>

      <div>
        <textarea
          name="body"
          placeholder="Body"
          defaultValue={state.values?.body}
          aria-invalid={!!state.errors?.body}
          aria-describedby="body-error"
        />
        {state.errors?.body && (
          <p id="body-error" role="alert" style={{ color: 'crimson', fontSize: 12 }}>
            {state.errors.body.join(', ')}
          </p>
        )}
      </div>

      {state.message && !state.errors && (
        <p role="alert" style={{ color: 'crimson', fontSize: 12 }}>
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
```

---

## 6️⃣ Handling Errors in a `DELETE` Action

For simple delete actions that don't need to return state, you can still return values or throw:

```ts
// app/actions/posts.ts
'use server';

import { revalidatePath } from 'next/cache';
import { deletePost, findPostById } from '@/app/lib/db';

export async function deletePostAction(formData: FormData) {
  const id = Number(formData.get('id'));

  if (!id || Number.isNaN(id)) {
    // Invalid input → expected error → return message
    return { message: 'Invalid post ID.' };
  }

  const post = findPostById(id);
  if (!post) {
    return { message: 'Post not found.' };
  }

  // Unexpected errors bubble up to error.tsx
  await deletePost(id);
  revalidatePath('/posts');
}
```

---

## 7️⃣ The `useActionState` Return Contract

| Field | Purpose | UI treatment |
|---|---|---|
| `errors` | Field-specific validation messages | Inline below each input |
| `message` | Form-level message (general error, duplicate, etc.) | Banner above/below the form |
| `values` | Echo back submitted values | `defaultValue` on inputs |
| `success` | Optional flag for branching | Show success toast |

---

## 8️⃣ Try/Catch Best Practices

```ts
// ✅ CORRECT PATTERN
export async function createPost(prevState, formData) {
  // 1. Validate → return on failure
  const parsed = Schema.safeParse(...);
  if (!parsed.success) return { errors: ... };

  // 2. Wrap ONLY the risky operation
  try {
    await db.insert(parsed.data);
  } catch (error) {
    // 3a. Expected DB errors → return message
    if (isDuplicateKeyError(error)) {
      return { message: 'Duplicate title.' };
    }
    // 3b. Unexpected → log and rethrow for error.tsx
    console.error(error);
    throw error;
  }

  // 4. Revalidate + redirect OUTSIDE try/catch
  revalidatePath('/posts');
  redirect('/posts');
}
```

```ts
// ❌ WRONG — catches NEXT_REDIRECT and NEXT_NOT_FOUND
try {
  await db.insert(data);
  revalidatePath('/posts');
  redirect('/posts'); // this throw gets caught!
} catch (e) {
  return { message: 'Failed' }; // redirect never happens
}
```

---

## 9️⃣ Common Pitfalls Cheat Sheet

| Pitfall | Fix |
|---|---|
| `redirect()` swallowed by `try/catch` | Move it outside the try block |
| `notFound()` swallowed by `try/catch` | Same — move outside, or rethrow if `error.digest?.startsWith('NEXT_')` |
| Form loses input after error | Return `values` in `FormState` and use `defaultValue` |
| Errors don't reset between submissions | `useActionState` handles this automatically — no action needed |
| `error.tsx` doesn't catch errors from Server Actions | It does for *thrown* errors, but **not** for errors returned as state |
| Errors in production hide the message | Next.js sanitizes messages in production; use `error.digest` to correlate with server logs |
| `useFormStatus` returns `pending: false` | It must be called from a **child** of the `<form>`, not the same component |

---

## 🔟 Escaping `try/catch` Safely (Advanced)

If you *must* wrap a block that contains `redirect()` or `notFound()`, rethrow Next.js's internal errors:

```ts
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { isNotFoundError } from 'next/dist/client/components/not-found-error';

try {
  await doWork();
  redirect('/posts');
} catch (error) {
  if (isRedirectError(error) || isNotFoundError(error)) throw error;
  return { message: 'Operation failed.' };
}
```

> ⚠️ These are internal APIs and may change. Prefer restructuring so `redirect()` is outside the try/catch.

---

## ✅ Error Handling Checklist

- [ ] Validate input with Zod (or similar) and **return** field errors
- [ ] Return business errors (duplicates, not found) as `message`
- [ ] Log unexpected errors and **rethrow** them
- [ ] Keep `redirect()` / `notFound()` **outside** try/catch
- [ ] Add `error.tsx` to each route segment that can throw
- [ ] Add `global-error.tsx` for root layout failures
- [ ] Use `useFormStatus` for pending UI
- [ ] Preserve form input via `values` in state
- [ ] Use `role="alert"` for accessibility

---

Want me to extend this with **optimistic UI (`useOptimistic`)**, **toast notifications on success**, or **a full Prisma + Zod + error handling production template**? Just say the word.