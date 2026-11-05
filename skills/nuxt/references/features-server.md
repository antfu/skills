---
name: server-routes
description: API routes, server middleware, and Nitro server engine in Nuxt
---

# Server Routes

Nuxt includes the Nitro server engine for building full-stack applications with API routes and server middleware. Nuxt 5 runs on **Nitro v3** (built on h3 v2 and srvx, using Web-standard `Request`/`Response`).

## Nuxt 5: `nuxt/server` Imports (auto-imports off by default)

In Nuxt 5, Nitro's server helpers (`defineEventHandler`, `getQuery`, `readBody`, cookie/header helpers, `createError`, `sendRedirect`, `getRouteRules`, `useRuntimeConfig`, sessions…) are **no longer auto-imported by default**. Import them explicitly from **`nuxt/server`** — the runtime-agnostic surface that resolves to whatever server builder is configured and survives h3/Nitro majors:

```ts
// server/api/hello.ts
import { defineEventHandler, getQuery } from 'nuxt/server'

export default defineEventHandler((event) => {
  const { name } = getQuery<{ name?: string }>(event)
  return { message: `Hello, ${name ?? 'world'}!` }
})
```

- Your own exports from `server/utils/` and `shared/utils/` are still auto-imported.
- Server code should import shared Nuxt composables from `#imports/server` (not `#imports`).
- Re-enable Nitro auto-imports while migrating: `experimental.nitroAutoImports: true`.
- `defineEventHandler` preserves your handler's return type — this is what types `$fetch`/`useFetch` calls to the route. Annotate the returned value, not the handler.
- Helpers not in the `nuxt/server` surface (e.g. `readMultipartFormData`, `lazyEventHandler`, `useKV`, `defineCachedHandler`, `defineTask`) still come from `nitro/h3`, `nitro/kv`, `nitro/cache`, `nitro/task`, etc.
- Also in `nuxt/server`: `getRequestHost`/`getRequestProtocol` (pass `{ xForwardedHost: true, xForwardedProto: true }` only behind a trusted proxy), `parseCookies`, `matchRouteRules` (rules for another path), `serverFetch(event, path)` (in-process fetch of an app route; forwards `cookie`/`authorization`), and `useServerHooks()` (renderer hooks like `render:html`). `toNuxtRequestEvent` was removed.
- A handler file must default-export `defineEventHandler` from `nuxt/server` (not h3's). It may return JSON-serializable data, a `Response`, or a `ReadableStream`. For a handler needing the runtime's own event (`proxyRequest`, `event.waitUntil()`, ...), import `defineEventHandler` from `nitro/h3` instead (Nitro v3 only, register as `nitro3`).
- Only files directly in `server/utils/` are auto-imported; re-export from a top-level file for subdirectory helpers.
- Don't import `nuxt/server` in Nuxt-process code (`nuxt.config.ts`, module `setup`, dev server handlers): runtime/app config come back empty. Read `nuxt.options` there.

## API Routes

Create files in `server/api/` directory:

```ts
// server/api/hello.ts
import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler((event) => {
  return { message: 'Hello World' }
})
```

Access at `/api/hello`. Return typing flows automatically to `$fetch('/api/hello')`.

> The examples below omit the `import` lines for brevity; add them from `nuxt/server` (or enable `nitroAutoImports`).

### HTTP Methods

```ts
// server/api/users.get.ts - GET /api/users
export default defineEventHandler(() => {
  return getUsers()
})

// server/api/users.post.ts - POST /api/users
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return createUser(body)
})

// server/api/users/[id].put.ts - PUT /api/users/:id
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  return updateUser(id, body)
})

// server/api/users/[id].delete.ts - DELETE /api/users/:id
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  return deleteUser(id)
})
```

### Route Parameters

```ts
// server/api/posts/[id].ts
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  return getPost(id)
})

// Catch-all: server/api/[...path].ts
export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path')
  return { path }
})
```

### Query Parameters

```ts
// server/api/search.ts
// GET /api/search?q=nuxt&page=1
export default defineEventHandler((event) => {
  const query = getQuery(event)
  // { q: 'nuxt', page: '1' }
  return search(query.q, Number(query.page))
})
```

### Request Body

```ts
// server/api/submit.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // Validate and process body
  return { success: true, data: body }
})
```

### Headers and Cookies

```ts
// server/api/auth.ts
import { defineEventHandler, getCookie, getRequestHeader, setCookie } from 'nuxt/server'

export default defineEventHandler((event) => {
  // Read a request header
  const auth = getRequestHeader(event, 'authorization')

  // Read a cookie
  const token = getCookie(event, 'token')

  // Set a response header (Web Headers API)
  event.res.headers.set('X-Custom-Header', 'value')

  // Set a cookie
  setCookie(event, 'token', 'new-token', {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24, // 1 day
  })

  return { authenticated: !!token }
})
```

## Server Middleware

Runs on every request before routes:

```ts
// server/middleware/auth.ts
export default defineEventHandler((event) => {
  const token = getCookie(event, 'token')

  // Attach data to event context
  event.context.user = token ? verifyToken(token) : null
})

// server/middleware/log.ts
export default defineEventHandler((event) => {
  console.log(`${event.req.method} ${event.url.pathname}`)
})
```

Access context in routes:

```ts
// server/api/profile.ts
export default defineEventHandler((event) => {
  const user = event.context.user
  if (!user) {
    throw createError({ status: 401, message: 'Unauthorized' })
  }
  return user
})
```

## Error Handling

Nitro v3 / h3 v2 rename the error fields to Web-standard names: `status`/`statusText` (was `statusCode`/`statusMessage`):

```ts
// server/api/users/[id].ts
import { createError, defineEventHandler, getRouterParam } from 'nuxt/server'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const user = findUser(id)

  if (!user) {
    throw createError({
      status: 404,
      statusText: 'User not found',
    })
  }

  return user
})
```

Notes for Nitro v3:

- The server error class is now `HTTPError` (from `nitro/h3`); `createError` from `nuxt/server` builds a `NuxtError`. `NuxtError` is no longer a subclass of `HTTPError`, so narrow with `HTTPError.isError(error)` or `isNuxtError(error)` rather than `instanceof HTTPError`.
- `useRuntimeConfig()` no longer accepts (or needs) the `event` argument in server routes.
- The `H3Event` uses Web-standard APIs: `event.url.pathname` (not `event.path`), `event.req.method`/`event.req.headers` (Web `Headers`), `event.res.status`/`event.res.headers.set(...)` (not `event.node.res`).

## Request Validation

`readValidatedBody` / `getValidatedQuery` accept any [Standard Schema](https://standardschema.dev) (Zod, Valibot, ArkType). Validated shapes also type the matching `$fetch`/`useFetch` request:

```ts
// server/api/users.post.ts
import { defineEventHandler, readValidatedBody } from 'nuxt/server'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const user = await readValidatedBody(event, z.object({ name: z.string() }))
  return { created: user.name }
})
```

Invalid input is rejected with a `400` whose `data.issues` lists the failures.

## Sessions

`useSession` (and `getSession`/`updateSession`/`clearSession`) come from `nuxt/server` and seal a sealed cookie session with `iron-webcrypto`, so they run under any server builder. No `password` is required — without one the session is sealed with a secret derived from `appSecret` (`NUXT_APP_SECRET`); pass a `password` of ≥32 chars to override. Default cookie name is `nuxt-session`.

```ts
// server/api/visits.ts
import { defineEventHandler, useSession } from 'nuxt/server'

export default defineEventHandler(async (event) => {
  const session = await useSession<{ visits: number }>(event)
  await session.update(data => ({ visits: (data.visits ?? 0) + 1 }))
  return { visits: session.data.visits }
})
```

> h3 ships its own same-named session helpers (`import { useSession } from 'nitro/h3'`); they are a separate, non-interchangeable implementation (cookie name `h3`).

## Server Utils

Auto-imported in `server/utils/`:

```ts
// server/utils/db.ts
export function useDb() {
  return createDbConnection()
}
```

```ts
// server/api/users.ts
export default defineEventHandler(() => {
  const db = useDb() // Auto-imported
  return db.query('SELECT * FROM users')
})
```

## Server Plugins

Run once when server starts. In Nitro v3 the factory is `definePlugin` from `nitro`:

```ts
// server/plugins/db.ts
import { definePlugin } from 'nitro'

export default definePlugin((nitroApp) => {
  // Initialize database connection
  const db = createDbConnection()

  // Add to context
  nitroApp.hooks.hook('request', (event) => {
    event.context.db = db
  })
})
```

> The `beforeResponse`/`afterResponse` hooks are replaced by a single `response` hook in Nitro v3.

## Streaming Responses

```ts
// server/api/stream.ts
export default defineEventHandler((event) => {
  event.res.headers.set('Content-Type', 'text/event-stream')
  event.res.headers.set('Cache-Control', 'no-cache')
  event.res.headers.set('Connection', 'keep-alive')

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        controller.enqueue(`data: ${JSON.stringify({ count: i })}\n\n`)
        await new Promise(r => setTimeout(r, 1000))
      }
      controller.close()
    },
  })

  return stream
})
```

## Nitro Builder

Nitro bundles the server with Rolldown by default. With the webpack/Rspack app builder, pick another via `nitro.builder` (or `NITRO_BUILDER`), e.g. `builder: 'rspack', nitro: { builder: 'rspack' }`. The Nitro `rspack` and `bun` builders are experimental; with `experimental.nitroViteEnvironment`, Vite builds the server and `nitro.builder` is ignored.

## Server Storage

Key-value storage with multiple drivers. In Nitro v3 it is the KV layer: `useKV` comes from `nitro/kv` (was `useStorage`) and mounts are configured with `nitro.kv` (was `nitro.storage`):

```ts
// server/api/cache.ts
import { defineEventHandler } from 'nuxt/server'
import { useKV } from 'nitro/kv'

export default defineEventHandler(async (event) => {
  const storage = useKV()

  // Set value
  await storage.setItem('key', { data: 'value' })

  // Get value
  const data = await storage.getItem('key')

  return data
})
```

Configure KV drivers in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  nitro: {
    kv: {
      redis: {
        driver: 'redis',
        url: 'redis://localhost:6379',
      },
    },
  },
})
```

<!-- 
Source references:
- https://nuxt.com/docs/getting-started/server
- https://nuxt.com/docs/directory-structure/server
- https://nuxt.com/docs/guide/going-further/server-imports
- https://nuxt.com/docs/getting-started/upgrade#migration-to-nitro-v3
- https://nuxt.com/docs/guide/modules/server-compatibility
- https://nitro.build/blog/v3-beta
-->
