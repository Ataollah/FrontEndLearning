# Data Modeling in Prisma (for Next.js CRUD APIs)

Data modeling is the process of deciding **what entities exist, what fields they have, and how they relate to each other** before you write any API code. In Prisma, this all lives in `schema.prisma`.

---

## 1. The Building Blocks

### Models → database tables
```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
}
```
Each `model` becomes a table; each field becomes a column.

### Field types
| Prisma type | SQL (Postgres) | Notes |
|-------------|----------------|-------|
| `Int` | `INTEGER` | |
| `String` | `TEXT`/`VARCHAR` | |
| `Boolean` | `BOOLEAN` | |
| `DateTime` | `TIMESTAMP` | |
| `Float` / `Decimal` | `DOUBLE` / `DECIMAL` | use `Decimal` for money |
| `Json` | `JSONB` | |
| `Bytes` | `BYTEA` | |
| `BigInt` | `BIGINT` | |

### Field modifiers
- `?` → nullable (`String?`)
- `[]` → list (`String[]` → Postgres array)
- `@id` → primary key
- `@unique` → unique constraint
- `@default(...)` → default value (`autoincrement()`, `now()`, `uuid()`, `cuid()`)
- `@updatedAt` → auto-set on update
- `@map("...")` / `@@map("...")` → rename column/table in DB

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  published Boolean  @default(false)

  @@map("posts") // table name in DB
}
```

---

## 2. Relationships — the heart of data modeling

Prisma needs **both sides** of a relation declared.

### One-to-Many (most common)
A `User` has many `Post`s; each `Post` belongs to one `User`.

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]           // "many" side (virtual, no column)
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  authorId Int            // FK column
  author   User @relation(fields: [authorId], references: [id])
}
```

### One-to-One
Add `@unique` on the FK.

```prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  bio    String
  userId Int  @unique       // <-- makes it 1:1
  user   User @relation(fields: [userId], references: [id])
}
```

### Many-to-Many — implicit
Prisma creates the join table for you.

```prisma
model Post {
  id         Int        @id @default(autoincrement())
  title      String
  categories Category[]
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String
  posts Post[]
}
```

### Many-to-Many — explicit (when the join carries data)
```prisma
model Post {
  id       Int        @id @default(autoincrement())
  title    String
  tags     PostTag[]
}

model Tag {
  id    Int       @id @default(autoincrement())
  name  String
  posts PostTag[]
}

model PostTag {
  postId Int
  tagId  Int
  addedAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id])
  tag  Tag  @relation(fields: [tagId],  references: [id])

  @@id([postId, tagId]) // composite PK
}
```

### Self-relations (e.g., followers, comments)
```prisma
model User {
  id        Int    @id @default(autoincrement())
  name      String
  followers User[] @relation("Follows")
  following User[] @relation("Follows")
}
```

### Referential actions
Decide what happens when the parent is deleted.

```prisma
model Post {
  authorId Int
  author   User @relation(fields: [authorId], references: [id],
                          onDelete: Cascade, onUpdate: Cascade)
}
```
Options: `Cascade`, `Restrict`, `NoAction`, `SetNull`, `SetDefault`.

---

## 3. Modeling Constraints & Indexes

```prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  username String

  @@unique([username, email])   // composite unique
  @@index([username])           // speed up lookups
}
```

**Rules of thumb:**
- Index foreign keys and columns you filter/sort by
- Composite unique = "these two fields together must be unique"
- Don't over-index — every index slows writes

---

## 4. Enum, Composite Types, and Advanced

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id   Int  @id @default(autoincrement())
  role Role @default(USER)
}
```

Composite types (Postgres/MongoDB only):
```prisma
type Address {
  street String
  city   String
  zip    String
}

model User {
  id      Int     @id @default(autoincrement())
  address Address
}
```

---

## 5. A Realistic Example

A blog with users, posts, comments, tags, and likes:

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String?
  role      Role      @default(USER)
  posts     Post[]
  comments  Comment[]
  likes     Like[]
  createdAt DateTime  @default(now())
}

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  slug      String    @unique
  content   String?
  published Boolean   @default(false)
  authorId  Int
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments  Comment[]
  tags      PostTag[]
  likes     Like[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([authorId])
  @@index([published, createdAt])
}

model Comment {
  id       Int      @id @default(autoincrement())
  body     String
  postId   Int
  authorId Int
  post     Post     @relation(fields: [postId],   references: [id], onDelete: Cascade)
  author   User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parentId Int?
  parent   Comment? @relation("Replies", fields: [parentId], references: [id])
  replies  Comment[] @relation("Replies")

  @@index([postId])
}

model Tag {
  id    Int       @id @default(autoincrement())
  name  String    @unique
  posts PostTag[]
}

model PostTag {
  postId Int
  tagId  Int
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId],  references: [id], onDelete: Cascade)

  @@id([postId, tagId])
}

model Like {
  userId Int
  postId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@id([userId, postId])
}

enum Role {
  USER
  ADMIN
}
```

Note how:
- `PostTag` and `Like` use **composite primary keys** to prevent duplicates
- Self-relation on `Comment` enables nested replies
- `onDelete: Cascade` prevents orphans
- Indexes on `authorId` and `(published, createdAt)` support common queries

---

## 6. Querying Relations (what modeling unlocks)

```ts
// Include related records
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true, comments: true },
});

// Nested create
await prisma.user.create({
  data: {
    email: "a@x.com",
    posts: {
      create: [{ title: "Hello" }, { title: "World" }],
    },
  },
});

// Filter on relation
const posts = await prisma.post.findMany({
  where: { author: { email: "a@x.com" }, published: true },
  include: { tags: { include: { tag: true } } },
});
```

---

## 7. Best Practices

1. **Model the domain, not the UI** — start from real-world entities (User, Order, Product), not screens.
2. **Always use both sides of a relation** — Prisma requires it and it prevents bugs.
3. **Pick the right ID strategy:**
   - `autoincrement()` → simple, sequential, but leaks counts and is hard to shard
   - `cuid()` / `uuid()` → safe for distributed systems, exposes less info
4. **Index foreign keys** — Prisma doesn't auto-index FKs on all DBs.
5. **Use `@@map` for naming** — snake_case in DB, camelCase in code.
6. **Prefer explicit M2M joins** if the link might ever carry data (timestamps, roles).
7. **Use enums** for finite value sets (roles, statuses) instead of free-form strings.
8. **Version control the schema** — every change goes through `prisma migrate dev` and a migration file.
9. **Normalize first, denormalize later** — only duplicate data once you have a proven perf need.
10. **Watch referential actions** — the default is often `Restrict`, which can surprise you in production.

---

## 8. Common Pitfalls

| Pitfall | Fix |
|--------|-----|
| Missing `@unique` on 1:1 FK → becomes 1:many | Add `@unique` on the FK |
| Using `Float` for money | Use `Decimal` |
| No index on filtered columns | Add `@@index([...])` |
| Cascade delete wipes too much | Use `SetNull` or soft-delete (`deletedAt DateTime?`) |
| Deeply nested includes → N+1 | Use `select` to limit fields, or split queries |
| Changing field names breaks API | Migrate + update API routes together |
| Nullable everything "just in case" | Prefer required fields; nulls hide bugs |

---

## 9. How It Connects to Your CRUD API

Once the schema is set, the CRUD route code almost writes itself:

```ts
// app/api/posts/route.ts
export async function GET() {
  return NextResponse.json(
    await prisma.post.findMany({
      where: { published: true },
      include: { author: { select: { name: true } }, tags: { include: { tag: true } } },
    })
  );
}
```

Good modeling → simple, safe queries. Bad modeling → complex joins, orphaned rows, and bugs that leak into your API.

---

## TL;DR

1. **Models = tables, fields = columns**, with types and modifiers
2. **Relations** (1:1, 1:N, M:N, self) are declared on **both sides**
3. Use **`@unique`, `@index`, `@@id`, referential actions** to enforce integrity
4. Model your **domain**, not your screens; normalize first
5. Schema changes go through **`prisma migrate`** → which flows straight into your Next.js API routes