Querying with Prisma Client is the core of interacting with your database. It provides a type-safe API that lets you read, create, update, and delete data using JavaScript/TypeScript methods instead of raw SQL.

### 🛠️ Setting Up Your Query Client

Before querying, ensure your client is instantiated. Following best practices, you should use a single instance to avoid connection issues.

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Now you can import `prisma` and start querying.

### 📖 Core Query Methods

Prisma provides clear methods for standard CRUD operations. Here are the primary ones for finding data:

| Method | Purpose | Example |
| :--- | :--- | :--- |
| **`findMany()`** | Fetch multiple records | `prisma.user.findMany()` |
| **`findUnique()`** | Fetch one record by a unique field (like `id` or `email`) | `prisma.user.findUnique({ where: { id: 1 } })` |
| **`findFirst()`** | Fetch the first record matching filters | `prisma.user.findFirst({ where: { role: 'ADMIN' } })` |

### 🔍 Filtering with `where`

The `where` object is the most powerful tool for narrowing down results. You can filter on scalar fields, combine conditions, and even filter based on related records.

**Basic Filters:**
```typescript
// Exact match
const user = await prisma.user.findMany({
  where: { email: 'alice@example.com' }
})

// Multiple conditions (implicit AND)
const users = await prisma.user.findMany({
  where: {
    email: { endsWith: '@example.com' },
    role: 'ADMIN'
  }
})
```

**Common Operators:**
- **String:** `contains`, `startsWith`, `endsWith`, `mode: 'insensitive'` (for case-insensitivity on PostgreSQL/MongoDB).
- **Number:** `lt` (less than), `lte`, `gt` (greater than), `gte`.
- **Logic:** Combine conditions with `OR`, `AND`, and `NOT`.

**Filtering on Relations:**
You can query based on related records using `some` (at least one), `every` (all), and `none`.
```typescript
// Find users who have at least one published post
const usersWithPosts = await prisma.user.findMany({
  where: {
    posts: {
      some: { published: true }
    }
  }
})
```

### 📦 Shaping Results with `select` and `include`

By default, Prisma returns all scalar fields for a model but no relations.

- **`select`**: Choose exactly which fields to return.
- **`include`**: Return all default fields *plus* the specified relations.

```typescript
// Select specific fields only
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: { id: true, name: true }
})

// Include related posts
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true }
})
```
**Important:** You cannot use `select` and `include` at the same level in a single query.

### 📊 Sorting and Pagination

Use `orderBy`, `take` (limit), and `skip` (offset) to control the order and size of your result sets.

```typescript
const posts = await prisma.post.findMany({
  where: { published: true },
  orderBy: { createdAt: 'desc' }, // Newest first
  take: 10,                       // Get 10 records
  skip: 20                        // Skip the first 20 (for page 3)
})
```

### 💡 Quick Tips for Efficient Queries

- **Select only what you need:** Avoid returning heavy fields (like large text blocks) unless necessary to keep payloads small.
- **Use `findUnique` for single lookups:** It is optimized for fields with a `@unique` constraint.
- **Leverage relations:** Prisma handles the complex `JOIN` logic for you, letting you focus on the data shape you need.

Would you like a deeper dive into **nested writes** (creating a user and their posts in one query) or **transactions**?