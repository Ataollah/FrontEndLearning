Route Handlers in Next.js are custom request handlers you define inside the `app` directory to manage HTTP requests for a specific route. They serve as the modern equivalent of API Routes from the `pages` directory, allowing you to build backend functionality directly within your Next.js application.

### 📁 Convention and Structure
Route Handlers are defined in a `route.js` or `route.ts` file located anywhere inside the `app` directory. A key rule is that a `route.js` file **cannot** exist at the same route segment level as a `page.js` file to avoid conflicts.

You define behavior by exporting functions named after the HTTP methods you want to support:

```ts
// app/api/items/route.ts
export async function GET(request: Request) {
  return Response.json({ message: 'Hello World' });
}

export async function POST(request: Request) {
  const data = await request.json();
  return Response.json({ received: data }, { status: 201 });
}
```

### ⚙️ Supported HTTP Methods
You can export functions for standard HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS`. If a client calls an unsupported method, Next.js automatically returns a `405 Method Not Allowed` response.

### 🧩 Request and Response Handling
Route Handlers use the standard Web `Request` and `Response` APIs, making them familiar to work with. Next.js extends these with `NextRequest` and `NextResponse` for added convenience.

*   **Dynamic Segments**: Access URL parameters via the `context` argument. Note that in recent versions, `params` is a **Promise** that needs to be awaited.
    ```ts
    // app/api/users/[id]/route.ts
    export async function GET(
      request: Request,
      { params }: { params: Promise<{ id: string }> }
    ) {
      const { id } = await params;
      return Response.json({ userId: id });
    }
    ```
*   **Query Parameters**: Use the extended `NextRequest` object to easily read search parameters.
    ```ts
    import { type NextRequest } from 'next/server';
    
    export async function GET(request: NextRequest) {
      const searchParams = request.nextUrl.searchParams;
      const query = searchParams.get('query');
      return Response.json({ query });
    }
    ```
*   **Reading Data**: For `POST` or `PUT` requests, you can read the body using standard Web API methods like `request.json()` or `request.formData()`.

### 🚀 Advanced Capabilities
Route Handlers unlock several powerful features:
*   **Streaming**: They support streaming responses, which is particularly useful for AI applications or large data transfers. This sets them apart from traditional API Routes.
*   **Caching**: By default, Route Handlers are **not cached**. You can opt into caching for `GET` requests by exporting a route config, such as `export const dynamic = 'force-static'`.
*   **CORS**: You can set CORS headers directly within a Route Handler using standard Web API methods to control cross-origin access.
*   **Non-UI Responses**: They are perfect for generating responses that aren't HTML, such as webhooks, sitemaps (`sitemap.ts`), `robots.txt`, or Open Graph images.

### 💡 Route Resolution Rules
A `route` file is considered the lowest-level routing primitive. It does not participate in layouts or client-side navigation like a `page` does. If both a `page.js` and a `route.js` exist at the same route path, Next.js will report a conflict.

I hope this gives you a clear picture of how Route Handlers work. If you'd like to dive into a specific use case, such as handling webhooks or setting up CORS, feel free to ask.