# Prisma + API Routes + CRUD in Next.js

Let me break this down piece by piece.

## 1. What is Prisma?

**Prisma** is an ORM (Object-Relational Mapper) for Node.js/TypeScript. It lets you talk to your database using JavaScript instead of raw SQL.

**Three main parts:**
- **Prisma Schema** (`schema.prisma`) — defines your models and DB connection
- **Prisma Client** — auto-generated, type-safe query builder
- **Prisma Migrate** — manages database schema changes

**Example schema:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

After editing the schema, run:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

This creates the table in your DB and generates a typed client you can import.

---

## 2. What are API Routes in Next.js?

API Routes let you write backend endpoints **inside** your Next.js app — no separate server needed.

- **Pages Router:** files in `pages/api/*.ts` → each file is an endpoint
- **App Router (Next 13+):** files in `app/api/*/route.ts` → use exported `GET`, `POST`, etc.

**Example (App Router):**
```ts
// app/api/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

---

## 3. What is CRUD?

CRUD = **C**reate, **R**ead, **U**pdate, **D**elete — the four basic operations on any data.

| Operation | HTTP Method | Prisma Method |
|-----------|-------------|---------------|
| Create    | POST        | `create`      |
| Read      | GET         | `findMany` / `findUnique` |
| Update    | PUT/PATCH   | `update`      |
| Delete    | DELETE      | `delete`      |

---

## 4. Putting It All Together

### Step 1 — Set up Prisma Client singleton

Prevents connection exhaustion in dev (hot reload creates new clients otherwise).

```ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Step 2 — Full CRUD API (App Router)

**`app/api/users/route.ts`** — collection endpoints (Create + Read all)
```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// READ all
export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

// CREATE
export async function POST(req: Request) {
  const body = await req.json();
  const user = await prisma.user.create({
    data: { name: body.name, email: body.email },
  });
  return NextResponse.json(user, { status: 201 });
}
```

**`app/api/users/[id]/route.ts`** — item endpoints (Read one, Update, Delete)
```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// READ one
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findUnique({
    where: { id: Number(params.id) },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

// UPDATE
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const user = await prisma.user.update({
    where: { id: Number(params.id) },
    data: { name: body.name, email: body.email },
  });
  return NextResponse.json(user);
}

// DELETE
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.user.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
}
```

### Step 3 — Call from the frontend

```tsx
// app/users/page.tsx
"use client";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(setUsers);
  }, []);

  async function addUser() {
    await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "a@x.com" }),
    });
    // refresh...
  }

  return <div>{users.map(u => <p key={u.id}>{u.name}</p>)}</div>;
}
```

---

## 5. The Request Flow

```
Client (fetch)
    ↓
API Route (app/api/users/route.ts)  ← validation, auth
    ↓
Prisma Client (prisma.user.create)
    ↓
Database (Postgres / MySQL / SQLite)
    ↓
Response (NextResponse.json) → Client
```

---

## 6. Common Patterns & Tips

- **Validation** — use Zod to validate `req.json()` before hitting Prisma.
- **Error handling** — wrap Prisma calls in `try/catch`; Prisma throws `PrismaClientKnownRequestError` for things like unique-constraint violations (P2002) or missing records (P2025).
- **Alternative: Server Actions** — in the App Router you can skip API routes entirely and call Prisma directly from a server action:
  ```ts
  "use server";
  export async function createUser(formData: FormData) {
    await prisma.user.create({ data: { name: formData.get("name") as string }});
  }
  ```
- **Never expose Prisma to the client** — only import it in server components, API routes, or server actions.
- **Migrations in prod** — use `prisma migrate deploy` in CI/CD, not `migrate dev`.

---

## TL;DR

- **Prisma** = typed database toolkit
- **API Routes** = your backend endpoints inside Next.js
- **CRUD** = the 4 operations you perform on data
- Together they let you build a full-stack app with a single codebase: React frontend → API route → Prisma → database.