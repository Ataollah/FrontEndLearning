Defining your schema is the foundation of working with Prisma. The `schema.prisma` file is where you describe your database structure, and Prisma uses it to generate the client and manage migrations.

### 📄 The Schema File Structure

A `schema.prisma` file has three main parts:

1.  **`generator`**: Defines what client to generate (e.g., Prisma Client).
2.  **`datasource`**: Specifies your database connection.
3.  **`model`**: Defines your data models (tables).

```prisma
// 1. Generator
generator client {
  provider = "prisma-client-js"
}

// 2. Datasource
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 3. Models
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

### 🧱 Defining Models

A **model** represents a table in your database. Each field inside a model represents a column.

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 🔑 Common Field Attributes

Attributes modify how a field behaves. Here are the most important ones:

| Attribute | Purpose | Example |
| :--- | :--- | :--- |
| `@id` | Marks the primary key | `id Int @id` |
| `@default()` | Sets a default value | `@default(autoincrement())` |
| `@unique` | Enforces a unique constraint | `email String @unique` |
| `@updatedAt` | Auto-updates timestamp on change | `updatedAt DateTime @updatedAt` |
| `@map()` | Maps field to a differently named column | `@map("user_email")` |
| `?` | Makes the field optional (nullable) | `name String?` |
| `[]` | Defines a list/array | `tags String[]` |

### 🔗 Defining Relations

Relations are one of Prisma's most powerful features. You define them by referencing other models.

**One-to-Many** (A User has many Posts):

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[] // A list of related posts
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int    // This is the foreign key
}
```

**One-to-One** (A User has one Profile):

```prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique // @unique enforces one-to-one
}
```

**Many-to-Many** (Posts and Categories):

```prisma
model Post {
  id         Int        @id @default(autoincrement())
  title      String
  categories Category[]
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
```

### 📊 Enums and Composite Keys

**Enums** restrict a field to a set of values:

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

**Composite keys** use multiple fields as a unique identifier:

```prisma
model Like {
  userId Int
  postId Int

  @@id([userId, postId]) // Composite primary key
}
```

### 🛠️ Applying Your Schema

After editing `schema.prisma`, run these commands to sync your database and regenerate the client:

```bash
# Create a migration and apply it to the database
npx prisma migrate dev --name add_post_model

# Regenerate the Prisma Client (also runs after migrate dev)
npx prisma generate
```

You can also inspect your data visually with:

```bash
npx prisma studio
```

### 💡 Best Practices

- **Use meaningful model names** in `PascalCase` (e.g., `UserProfile`, not `user_profile`).
- **Use `@map` and `@@map`** if your database uses snake_case conventions:
  ```prisma
  model User {
    id Int @id @default(autoincrement())
    @@map("users")
  }
  ```
- **Keep migrations small and descriptive** by using clear `--name` flags.
- **Never commit your `.env`** file; commit the `schema.prisma` and `migrations/` folder instead.

Would you like a deeper dive into relations (like self-relations or explicit many-to-many), or how to handle schema changes safely in production?