# Next.js Interceptor

[中文文档](./README.ZH.md)

A powerful and flexible Next.js middleware interceptor for handling request and response operations.

## Features

- 🚀 Built on Next.js Middleware
- 🛡️ Support for request and response interception and modification
- 🔄 Flexible middleware chain calls
- 📦 TypeScript support
- 🎯 Zero configuration, plug and play
- 🔧 Highly customizable interception rules

## Installation

Install dependencies using pnpm:

```bash
pnpm add nextjs-interceptor
```

## Usage

1. Create a `middleware.ts` file in your Next.js project:

```typescript
import { NextResponse } from "next/server";
import { interceptorRegistry } from "nextjs-interceptor";
export { interceptorMiddleware as middleware } from "nextjs-interceptor";

// Authentication interceptor
interceptorRegistry.use(
  {
    id: "auth",
    pattern: "/demo/*",
    priority: 1,
  },
  async ({ request }) => { 
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Returning null automatically continues to the next interceptor
    return null;
  }
);

// Configure matching paths: intercept most addresses, which can then be handed over to InterceptorRegistry for processing
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

```

2.Play With `auth.js`,you can customize the request type like `NextAuthRequest` in the following way:

```typescript
import { NextResponse } from "next/server";
import { InterceptorRegistry } from "nextjs-interceptor";
export { interceptorMiddleware as middleware } from "nextjs-interceptor";

// You can use custom request type
const interceptorRegistry = new InterceptorRegistry<NextAuthRequest>()

// Authentication interceptor
interceptorRegistry.use(
  {
    id: "auth",
    pattern: "/demo/*",
    priority: 1,
  },
  async ({ request }) => { 
      if (!request.auth?.user) {
      return NextResponse.rewrite(new URL('/auth/signin?callbackUrl=/user', request.url))
    }
  }
);
// Don't forget to export the middleware
export const middleware = auth(async request => {
  return interceptorRegistry.handle(request)
})

export const config = {
  matcher: [ 
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

```

3.Support `NextFetchEvent`

```typescript
import { NextResponse } from "next/server";
import { interceptorRegistry } from "nextjs-interceptor";
interceptorRegistry.use(
  {
    id: 'logger',
    pattern: '/*',
  },
  async (req,event) => {
    event.waitUntil(
    fetch('https://my-analytics-platform.com', {
      method: 'POST',
      body: JSON.stringify({ pathname: req.nextUrl.pathname }),
      })
    )
  }
)

export const middleware = interceptorRegistry.handle
```

4.Support exclude patterns

You can use the `exclude` option to exclude specific paths from interception:

```typescript
import { NextResponse } from "next/server";
import { interceptorRegistry } from "nextjs-interceptor";

// This interceptor will match all /api/* paths except /api/public/*
interceptorRegistry.use(
  {
    id: "api-auth",
    pattern: "/api/*",
    exclude: "/api/public/*", // Exclude public API routes
    priority: 1,
  },
  async (request) => {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return; // Continue to next interceptor
  }
);

// You can also use arrays and regex patterns for exclude
interceptorRegistry.use(
  {
    id: "admin-protection",
    pattern: "/admin/*",
    exclude: [
      "/admin/login",
      "/admin/public/*",
      /\/admin\/assets\/.*/  // Regex pattern
    ],
    priority: 2,
  },
  async (request) => {
    // Check admin authentication
    const isAdmin = checkAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return;
  }
);

export { interceptorMiddleware as middleware } from "nextjs-interceptor";
```

## Development

```bash
# Start the development server
pnpm dev

# Build the project
pnpm build

# Run tests
pnpm test
```

## License

ISC

## Author

liuhuapiaoyuan
