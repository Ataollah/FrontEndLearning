# Building Forms with Server Actions in Next.js

Server Actions let you handle form submissions directly on the server without creating API routes. They're defined with the `"use server"` directive and can be called from Client or Server Components.

Here's a complete guide, building a **Posts** CRUD form step by step.

## 📁 Project Structure

```
app/
├── actions/
│   └── posts.ts            # Server Actions
├── posts/
│   ├── page.tsx            # List posts + create form
│   └── new/
│       └── page.tsx        # (Optional) dedicated page for creation
└── lib/
    └── db.ts               # Shared data store
```

## 1️⃣ Shared Data Store — `app/lib/db.ts`

```ts
// app/lib/db.ts
export type Post = { id: number; title: string; body: string };

// In-memory store (replace with a real DB like Prisma later)
let posts: Post[] = [
  { id: 1, title: 'Hello World', body: 'My first post' },
];

export function getPosts() {
  return posts;
}

export function addPost(data: Omit<Post, 'id'>): Post {
  const newPost: Post = {
    id: posts.length ? Math.max(...posts.map((p) => p.id)) + 1 : 1,
    ...data,
  };
  posts.push(newPost);
  return newPost;
}

export function deletePost(id: number) {
  posts = posts.filter((p) => p.id !== id);
}
```

## 2️⃣ Define Server Actions — `app/actions/posts.ts`

```ts
// app/actions/posts.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addPost, deletePost } from '@/app/lib/db';

// State shape returned to the client on validation errors
export type FormState = {
  errors?: {
    title?: string[];
    body?: string[];
  };
  message?: string | null;
};

// CREATE — used with useActionState
export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const title = formData.get('title')?.toString().trim() ?? '';
  const body = formData.get('body')?.toString().trim() ?? '';

  // Validate
  const errors: FormState['errors'] = {};
  if (!title) errors.title = ['Title is required.'];
  if (title.length > 100) errors.title = ['Title must be ≤ 100 characters.'];
  if (!body) errors.body = ['Body is required.'];

  if (Object.keys(errors).length > 0) {
    return { errors, message: 'Please fix the errors below.' };
  }

  // Persist
  addPost({ title, body });

  // Refresh cached data for the posts list
  revalidatePath('/posts');

  // Redirect back to the list (throws internally)
  redirect('/posts');
}

// DELETE — takes a FormData from a <form action={deletePost}>
export async function deletePostAction(formData: FormData) {
  const id = Number(formData.get('id'));
  if (!id) return;

  deletePost(id);
  revalidatePath('/posts');
}
```

## 3️⃣ Basic Form — No JavaScript Required

The simplest form uses a Server Action directly in `action`. This works even with JS disabled.

```tsx
// app/posts/page.tsx
import { getPosts } from '@/app/lib/db';
import { createPost, deletePostAction } from '@/app/actions/posts';

export default function PostsPage() {
  const posts = getPosts();

  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <h1>Posts</h1>

      {/* CREATE FORM */}
      <form action={createPost} style={{ display: 'grid', gap: 8 }}>
        <input name="title" placeholder="Title" required />
        <textarea name="body" placeholder="Body" required />
        <button type="submit">Create Post</button>
      </form>

      {/* LIST + DELETE */}
      <ul style={{ marginTop: 24 }}>
        {posts.map((p) => (
          <li key={p.id} style={{ marginBottom: 12 }}>
            <strong>{p.title}</strong> — {p.body}
            <form action={deletePostAction} style={{ display: 'inline', marginLeft: 8 }}>
              <input type="hidden" name="id" value={p.id} />
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

## 4️⃣ Enhanced Form — Client-Side State & Validation

To show validation errors, loading state, and pending UI, use a **Client Component** with `useActionState` (React 19 / Next 15) and `useFormStatus`.

```tsx
// app/posts/post-form.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createPost, type FormState } from '@/app/actions/posts';

const initialState: FormState = { message: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
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
          aria-invalid={!!state.errors?.title}
          aria-describedby="title-error"
        />
        {state.errors?.title && (
          <p id="title-error" style={{ color: 'red', fontSize: 12 }}>
            {state.errors.title.join(', ')}
          </p>
        )}
      </div>

      <div>
        <textarea
          name="body"
          placeholder="Body"
          aria-invalid={!!state.errors?.body}
          aria-describedby="body-error"
        />
        {state.errors?.body && (
          <p id="body-error" style={{ color: 'red', fontSize: 12 }}>
            {state.errors.body.join(', ')}
          </p>
        )}
      </div>

      {state.message && (
        <p style={{ color: 'red', fontSize: 12 }}>{state.message}</p>
      )}

      <SubmitButton />
    </form>
  );
}
```

Then use it on the page:

```tsx
// app/posts/page.tsx
import { getPosts } from '@/app/lib/db';
import { deletePostAction } from '@/app/actions/posts';
import PostForm from './post-form';

export default function PostsPage() {
  const posts = getPosts();

  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <h1>Posts</h1>
      <PostForm />

      <ul style={{ marginTop: 24 }}>
        {posts.map((p) => (
          <li key={p.id} style={{ marginBottom: 12 }}>
            <strong>{p.title}</strong> — {p.body}
            <form action={deletePostAction} style={{ display: 'inline', marginLeft: 8 }}>
              <input type="hidden" name="id" value={p.id} />
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

## 5️⃣ Progressive Enhancement with Zod (Recommended)

For robust validation, use [Zod](https://zod.dev/):

```bash
npm install zod
```

```ts
// app/actions/posts.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addPost } from '@/app/lib/db';

const PostSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(100, 'Title too long.'),
  body: z.string().min(1, 'Body is required.').max(1000, 'Body too long.'),
});

export type FormState = {
  errors?: Record<string, string[]>;
  message?: string | null;
};

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = PostSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: 'Validation failed.',
    };
  }

  addPost(parsed.data);
  revalidatePath('/posts');
  redirect('/posts');
}
```

## 6️⃣ Passing Extra Arguments with `.bind`

Server Actions can receive extra args via `.bind`:

```ts
// app/actions/posts.ts
'use server';

export async function updatePost(id: number, formData: FormData) {
  const title = formData.get('title')?.toString() ?? '';
  // ...update logic
}
```

```tsx
// In a Server Component
import { updatePost } from '@/app/actions/posts';

export default function EditForm({ post }: { post: { id: number; title: string } }) {
  const updateWithId = updatePost.bind(null, post.id);

  return (
    <form action={updateWithId}>
      <input name="title" defaultValue={post.title} />
      <button type="submit">Save</button>
    </form>
  );
}
```

## 7️⃣ Calling Actions Programmatically

You can also invoke a Server Action from an event handler (Client Component):

```tsx
'use client';

import { deletePostAction } from '@/app/actions/posts';

export default function DeleteButton({ id }: { id: number }) {
  async function handleClick() {
    const fd = new FormData();
    fd.set('id', String(id));
    await deletePostAction(fd);
  }

  return <button onClick={handleClick}>Delete</button>;
}
```

## 🔑 Key Concepts Summary

| Concept | Purpose |
|---|---|
| `'use server'` | Marks a file/function as a Server Action (server-only) |
| `action={fn}` on `<form>` | Wires form submission to the action (works without JS) |
| `formData.get('name')` | Reads input values on the server |
| `useActionState` | Returns `[state, formAction]` — for validation errors & return values |
| `useFormStatus` | Gives `pending` state — for loading spinners and disabled buttons |
| `revalidatePath()` | Invalidates cached data so the list refreshes |
| `redirect()` | Redirects after a mutation (must be outside try/catch) |
| `.bind(null, arg)` | Pre-binds extra arguments to an action |
| `hidden` inputs | Pass IDs or extra data from the form without user interaction |

## ⚠️ Common Pitfalls

1. **`redirect()` inside try/catch** — it throws internally and will be caught. Call it *after* the try/catch.
2. **`params` is a Promise** in Next 15+ — always `await params`.
3. **Actions must be async** and exported from a `'use server'` file (or declared inline with the directive).
4. **Don't put server-only code in Client Components** — only import the *action*, not the DB module.
5. **`useActionState` needs a default state** — pass `{ message: null }` initially.

## 🚀 Next Steps

- **Persist to a DB**: Swap `app/lib/db.ts` for Prisma + Postgres.
- **Add auth**: Check `cookies()` inside the action before mutating.
- **Optimistic updates**: Use `useOptimistic` to show items before the server responds.
- **File uploads**: Server Actions accept `FormData` with `File` objects natively.

Want me to extend this with **Prisma + PostgreSQL**, **optimistic UI with `useOptimistic`**, or **file uploads via Server Actions**? Just say the word.