# Error Handling & HTTP Status Codes in Next.js API Routes

Good error handling is what separates a toy API from a production one. This covers **what to catch, how to map it, and what status code to return.**

---

## 1. The Mental Model

```
Request in → parse → validate → authorize → DB write → response out
              │         │           │           │
              ▼         ▼           ▼           ▼
            400       400/422     401/403     404/409/500
```

Every stage can fail. Each failure has a **correct HTTP status code**.

---

## 2. Status Code Reference (the ones you'll actually use)

### Success (2xx)
| Code | Name | When |
|------|------|------|
| `200` | OK | GET, PUT, PATCH success |
| `201` | Created | POST created a resource |
| `204` | No Content | DELETE success (empty body) |

### Client errors (4xx) — **the caller did something wrong**
| Code | Name | When |
|------|------|------|
| `400` | Bad Request | Malformed JSON, invalid ID format, missing fields |
| `401` | Unauthorized | Not logged in / bad token |
| `403` | Forbidden | Logged in but not allowed |
| `404` | Not Found | Resource doesn't exist |
| `405` | Method Not Allowed | Verb not supported on this route |
| `409` | Conflict | Unique constraint violation, version conflict |
| `422` | Unprocessable Entity | Valid syntax, semantically invalid (some teams use this for validation) |
| `429` | Too Many Requests | Rate limit hit |

### Server errors (5xx) — **your fault**
| Code | Name | When |
|------|------|------|
| `500` | Internal Server Error | Unhandled exception |
| `502` | Bad Gateway | Upstream service failed |
| `503` | Service Unavailable | DB down / maintenance |

> **Rule of thumb:** If the client could have prevented it by sending different data → **4xx**. If your code or infrastructure broke → **5xx**. Never return 200 with `{ error: "..." }` — the status code *is* the error signal.

---

## 3. The Three Error Categories You'll Handle

### (a) Validation errors (Zod)
Malformed or missing input.

### (b) Business errors (your own)
Not found, unauthorized, conflict.

### (c) Unexpected errors (bugs, DB down)
Everything else → 500.

The trick is **distinguishing them** so you return the right code.

---

## 4. Custom Error Classes (recommended)

Instead of throwing generic `Error`, throw typed errors that carry a status code.

```ts
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad request", details?: unknown) {
    super(400, "BAD_REQUEST", message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = "Resource") {
    super(404, "NOT_FOUND", `${resource} not found`);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(409, "CONFLICT", message);
  }
}
```

Now your route code reads cleanly:

```ts
if (!post) throw new NotFoundError("Post");
if (post.authorId !== user.id) throw new ForbiddenError("Not your post");
```

---

## 5. The Central Error Handler

One function maps every possible error → an HTTP response.

```ts
// lib/api-error.ts
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "./errors";

export function handleApiError(error: unknown): NextResponse {
  // 1) Our custom errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: { code: error.code, message: error.message, details: error.details },
      },
      { status: error.status }
    );
  }

  // 2) Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  // 3) Prisma known errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const field = (error.meta?.target as string[])?.join(", ") ?? "field";
        return NextResponse.json(
          {
            error: {
              code: "UNIQUE_VIOLATION",
              message: `A record with this ${field} already exists`,
              details: { field },
            },
          },
          { status: 409 }
        );
      }
      case "P2025":
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Record not found" } },
          { status: 404 }
        );
      case "P2003":
        return NextResponse.json(
          {
            error: {
              code: "FOREIGN_KEY_VIOLATION",
              message: "Referenced record does not exist",
            },
          },
          { status: 400 }
        );
      case "P2014":
        return NextResponse.json(
          { error: { code: "RELATION_VIOLATION", message: "Invalid relation" } },
          { status: 400 }
        );
      default:
        console.error("[Prisma]", error.code, error.message);
        break; // fall through to 500
    }
  }

  // 4) Prisma validation error (bad query shape — a bug)
  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error("[Prisma Validation]", error.message);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Internal server error" } },
      { status: 500 }
    );
  }

  // 5) Malformed JSON
  if (error instanceof SyntaxError && "body" in error) {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Malformed JSON body" } },
      { status: 400 }
    );
  }

  // 6) Everything else
  console.error("[Unhandled API error]", error);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Internal server error" } },
    { status: 500 }
  );
}
```

**Critical:** never leak stack traces or DB internals to the client. Log them server-side, return a generic message.

---

## 6. A Route Using the Full Pattern

```ts
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePostSchema } from "@/lib/validations/post";
import { handleApiError } from "@/lib/api-error";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/lib/errors";
import { requireUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    // 1) Auth → 401 if missing
    const user = await requireUser(req); // throws UnauthorizedError

    // 2) Validate ID → 400 if not a positive integer
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestError("Invalid post ID");
    }

    // 3) Parse & validate body → 400 via ZodError
    const body = await req.json();
    const data = updatePostSchema.parse(body);

    // 4) Fetch existing → 404 if missing
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Post");

    // 5) Authorization → 403 if not owner
    if (existing.authorId !== user.id) {
      throw new ForbiddenError("You can only edit your own posts");
    }

    // 6) Update → Prisma may throw P2002 (409) if slug conflicts
    const post = await prisma.post.update({ where: { id }, data });

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

Every failure path is a single `throw`. The handler decides the status.

---

## 7. Consistent Response Shape

Clients (and your future self) will thank you for a predictable envelope.

**Success:**
```json
{ "data": { "id": 1, "title": "Hello" } }
```

**Success (list):**
```json
{
  "data": [ /* ... */ ],
  "meta": { "total": 42, "limit": 20, "offset": 0 }
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": { "title": ["Title is required"] }
  }
}
```

Wrap success responses too, if you want symmetry:

```ts
// lib/api-response.ts
import { NextResponse } from "next/server";

export const ok = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json({ data }, init);

export const created = <T>(data: T) =>
  NextResponse.json({ data }, { status: 201 });

export const noContent = () => new NextResponse(null, { status: 204 });
```

Then routes become:
```ts
return created(post);
return ok(posts);
return noContent();
```

---

## 8. Validation Errors in Detail

Zod's `flatten().fieldErrors` is perfect for form integration:

```ts
const parsed = createPostSchema.safeParse(await req.json());
if (!parsed.success) {
  return NextResponse.json(
    {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: parsed.error.flatten().fieldErrors,
        // → { title: ["Title is required"], content: ["Too short"] }
      },
    },
    { status: 400 }
  );
}
```

Frontend consumes it directly:
```tsx
if (body.error?.details) setErrors(body.error.details);
```

---

## 9. HTTP Methods That Don't Exist

Next.js returns `405 Method Not Allowed` automatically if you don't export the method. But if you want a custom message:

```ts
export async function GET() { /* ... */ }

// Called when someone POSTs to a GET-only route
export async function POST() {
  return NextResponse.json(
    { error: { code: "METHOD_NOT_ALLOWED", message: "Use GET on this endpoint" } },
    { status: 405, headers: { Allow: "GET" } }
  );
}
```

---

## 10. Error Handling Checklist Per Route

```
☐ Wrap the whole handler in try/catch
☐ Validate params (ID format) → 400
☐ Validate body with Zod → 400
☐ Check auth → 401
☐ Check authorization → 403
☐ Check existence → 404
☐ Handle unique constraint → 409
☐ Log unexpected errors server-side
☐ Return generic 500 message to client
☐ Never expose stack traces or SQL
```

---

## 11. Client-Side Error Handling

The API returns structured errors — your form should map them.

```tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  // Empty response (204)
  if (res.status === 204) { router.refresh(); return; }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const code = body?.error?.code;

    switch (code) {
      case "VALIDATION_ERROR":
        setFieldErrors(body.error.details);
        break;
      case "UNAUTHORIZED":
        router.push("/login");
        break;
      case "FORBIDDEN":
        setBanner("You don't have permission to do that.");
        break;
      case "NOT_FOUND":
        setBanner("That item no longer exists.");
        break;
      case "CONFLICT":
        setBanner(body.error.message);
        break;
      default:
        setBanner("Something went wrong. Please try again.");
    }
    return;
  }

  router.push(`/posts/${body.data.id}`);
  router.refresh();
}
```

**Always handle:**
- Network failure (`fetch` throws)
- Non-JSON error responses (HTML error pages, gateway errors)
- Empty bodies on 204

---

## 12. Common Mistakes

| Mistake | Fix |
|---------|-----|
| Returning 200 with `{ success: false }` | Use real status codes |
| Returning 500 for user input errors | 400 for validation, 409 for conflicts |
| Leaking `error.message` from Prisma/SQL | Log server-side, return generic message |
| Catching errors silently | Log with context (route, userId, payload) |
| One giant try/catch with no typed errors | Use `ApiError` subclasses |
| Not handling malformed JSON | Catch `SyntaxError` → 400 |
| Forgetting `Content-Type` on empty responses | Use `new NextResponse(null, { status: 204 })` |
| Trusting `params.id` is a number | Parse + validate → 400 if bad |

---

## 13. Logging (production-ready)

```ts
// lib/logger.ts
export function logError(context: string, error: unknown, meta?: Record<string, unknown>) {
  const payload = {
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...meta,
    timestamp: new Date().toISOString(),
  };

  // In prod, send to Sentry/Datadog/Logtail
  console.error(JSON.stringify(payload));
}
```

Use it in the catch:
```ts
catch (error) {
  if (!(error instanceof ApiError) && !(error instanceof ZodError)) {
    logError("PATCH /api/posts/[id]", error, { id: params.id });
  }
  return handleApiError(error);
}
```

This way **expected** errors (400/404) don't spam your logs — only genuine bugs do.

---

## 14. The Full Picture (cheat sheet)

```
CLIENT sends request
   ↓
ROUTE tries:
   ├─ requireUser()              → throws UnauthorizedError → 401
   ├─ parseId()                  → throws BadRequestError    → 400
   ├─ schema.parse(body)         → throws ZodError           → 400
   ├─ prisma.findUnique()        → null → NotFoundError      → 404
   ├─ ownership check            → throws ForbiddenError     → 403
   ├─ prisma.create/update()     → throws P2002 → 409 / P2025 → 404 / P2003 → 400
   └─ success                    → 200 / 201 / 204
   ↓
CATCH → handleApiError(error)
   ↓
RESPONSE { error: { code, message, details? } } with correct status
   ↓
CLIENT switches on error.code
```

---

## TL;DR

1. **Status code = the error contract.** 4xx = client's fault, 5xx = yours.
2. **Use custom error classes** (`NotFoundError`, `ForbiddenError`, …) so route code throws intent, not strings.
3. **Centralize handling** in `handleApiError` — one place maps Zod, Prisma, and custom errors to responses.
4. **Validate early** (ID → 400, body → 400), **check existence** (404), **check ownership** (403).
5. **Return a consistent error envelope** `{ error: { code, message, details } }`.
6. **Never leak internals** — log the stack, return a generic message.
7. **Client switches on `error.code`**, not on human-readable strings.
8. **Log only unexpected errors** — don't drown in noise from normal 400s.