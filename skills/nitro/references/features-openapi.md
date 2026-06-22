---
name: openapi
description: Auto-generated OpenAPI spec, defineRouteMeta, Scalar/Swagger UIs, and production exposure in Nitro
---

# OpenAPI

Nitro scans route handlers, reads metadata from `defineRouteMeta`, and generates an OpenAPI 3.1.0 spec plus interactive UIs ([Scalar](https://scalar.com/) and Swagger UI). **Experimental** — enable the flag.

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  experimental: { openAPI: true },
});
```

Dev endpoints once enabled:

| Endpoint | Description |
|---|---|
| `/_openapi.json` | OpenAPI 3.1.0 JSON spec |
| `/_scalar` | Scalar API reference UI |
| `/_swagger` | Swagger UI |

## Route metadata

`defineRouteMeta` is a build-time macro (no runtime overhead). Its `openAPI` field accepts a standard OpenAPI Operation Object.

```ts [routes/api/users/[id].get.ts]
import { defineRouteMeta, defineHandler } from "nitro";

defineRouteMeta({
  openAPI: {
    tags: ["users"],
    description: "Get a user by ID",
    parameters: [
      { in: "query", name: "include", schema: { type: "string" } },
    ],
    responses: {
      200: {
        description: "User found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/User" },
          },
        },
      },
      404: { description: "Not found" },
    },
    // Hoist reusable schemas into the top-level components section
    $global: {
      components: {
        schemas: {
          User: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string", format: "email" },
            },
          },
        },
      },
    },
  },
});

export default defineHandler((event) => {
  const { id } = event.context.params!;
  return { id, name: "Alice", email: "alice@example.com" };
});
```

- Route params (`[id]`/`:id`) become OpenAPI path parameters automatically — only declare extra query/header params.
- Auto-tagging by prefix: `/api/` → API Routes, `/_` → Internal, others → App Routes. Override with `tags`.
- Define a schema once under `$global.components.schemas`, reference it elsewhere with `$ref`.

## Configuration

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  experimental: { openAPI: true },
  openAPI: {
    meta: { title: "My API", description: "...", version: "2.0.0" },
    route: "/_docs/openapi.json",          // override JSON path
    ui: {
      scalar: { route: "/_docs/scalar", theme: "purple" },
      swagger: false,                       // disable a UI
    },
    production: "runtime",                   // expose in production
  },
});
```

`production` values:

| Value | Behavior |
|---|---|
| `false` (default) | Disabled in production. |
| `"runtime"` | Generated per request (allows middleware/dynamic info). |
| `"prerender"` | Generated at build time, served as a static file (most efficient). |

> If exposed in production, protect these endpoints with authentication.

## Key Points

- Requires `experimental.openAPI: true`; configure via the top-level `openAPI` option.
- `defineRouteMeta` (from `nitro`) is a build-time macro — zero runtime cost.
- Path params are inferred from the route; declare only additional parameters.
- OpenAPI is dev-only by default; opt into `"runtime"`/`"prerender"` for production and secure the routes.

<!--
Source references:
- https://nitro.build/docs/openapi
- https://nitro.build/config
-->
