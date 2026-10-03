Running a migration in Prisma depends on whether you are working in a **development** or a **production** environment. The commands and their behaviors are different for each.

### 🛠️ In Development: `prisma migrate dev`

In a local development environment, you use the `migrate dev` command. This command is designed to handle everything: it detects changes in your `schema.prisma` file, creates a new migration file, applies it to your database, and regenerates the Prisma Client.

**Basic Usage:**
```bash
npx prisma migrate dev --name your_migration_name
```

**What it does:**
- **Detects Schema Changes:** It compares your current schema to the last migration state.
- **Creates Migration File:** It generates a new SQL file in `prisma/migrations/` with a timestamp and the name you provide.
- **Applies the Migration:** It runs the SQL against your development database.
- **Generates Client:** It triggers `prisma generate` to update the Prisma Client types (Note: In newer versions, this might be a separate step).

**Key Options:**
- **`--name` or `-n`:** Gives the migration a descriptive name (e.g., `add_user_roles`). If omitted, Prisma will prompt you.
- **`--create-only`:** Creates the migration file **without applying it**. This is useful if you need to manually edit the SQL before it runs. You would then run `npx prisma migrate dev` again to apply it.

### 🚀 In Production: `prisma migrate deploy`

In a production, staging, or CI/CD environment, you should use `prisma migrate deploy`. This command applies any pending migrations from your `prisma/migrations` folder to the database.

**Basic Usage:**
```bash
npx prisma migrate deploy
```

**What it does (and doesn't do):**
- **Applies Pending Migrations:** It runs the SQL for migrations that haven't been applied yet.
- **No Prompts:** It runs non-interactively, making it safe for automated pipelines.
- **Does NOT Generate:** It does not create new migrations or run seed scripts.
- **Does NOT Reset:** It will not drop your database to fix issues; it will simply fail if a migration errors.

### ⚠️ Important Distinction

Never use `migrate dev` in a production environment. It is designed for development and includes features like database resets that are destructive to production data. Always use `migrate deploy` for production and staging.

### 💡 A Note on Workflow

After running a migration, it's good practice to check its status:
```bash
npx prisma migrate status
```
This command shows which migrations have been applied and which are pending, helping you verify that your database is in sync.