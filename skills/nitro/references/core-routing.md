---
name: routing
description: File-based routing, event handlers, dynamic params, middleware, and route rules in Nitro
---

# Routing & Event Handlers

Nitro maps files in `routes/` and `api/` to HTTP routes at build time (no runtime router). Handlers receive an [H3 v2](https://h3.dev) `event` and should **return** the response body or **throw** an error.

## Event handlers

```ts [routes/hello.ts]
import { defineHandler } from "nitro";

export default defineHandler((event) => {
  return { hello: "world" };
});
```

`defineHandler` gives type inference. A plain `(event) => ...` function also works. The `event` is web-standard based:

```ts
event.req            // web Request
event.res            // response init (headers, status)
event.url            // URL object (event.url.pathname, event.url.searchParams)
event.path           // request path
event.method         // HTTP method
event.context        // mutable per-request context (params, custom data)
event.context.params // route params
```

Read the body with native `Request` methods (H3 v2 dropped `readBody`):

```ts
const json = await event.req.json();
const text = await event.req.text();
const form = await event.req.formData();
```

## Filesystem routing

Files in `api/` (served under `/api`) or `routes/` (served under `/`) become routes. One handler per file.

```
routes/
  hello.ts            -> /hello
  api/
    test.ts           -> /api/test
    [org]/
      [repo]/
        index.ts      -> /api/:org/:repo
        issues.ts     -> /api/:org/:repo/issues
```

### HTTP method suffix

Append the method to match only that verb (`get`, `post`, `put`, `delete`, `patch`, `head`, `options`...):

```ts [routes/users.post.ts]
import { defineHandler } from "nitro";

export default defineHandler(async (event) => {
  const body = await event.req.json();
  return { created: body };
});
```

### Dynamic params

```ts [routes/hello/[name].ts]
export default defineHandler((event) => {
  const { name } = event.context.params!;
  return `Hello ${name}!`;
});
```

- Multiple params: each as its own folder/segment `[a]/[b]` (not in one filename).
- Catch-all: `[...name].ts` captures the rest of the path (includes `/`).
- Global catch-all: `[...].ts` matches all otherwise-unmatched routes.

### Route groups & environment handlers

- Parenthesized folders `(admin)/` group files **without** affecting the URL.
- Suffix `.dev`, `.prod`, or `.prerender` (after the method suffix) to include a handler only in that build: `test.get.prod.ts`.
- `ignore: ["routes/**/_*"]` config excludes files from scanning.

## Middleware

Files in `middleware/` run on every request before route matching. They modify the event and **must not return** (returning ends the request).

```ts [middleware/auth.ts]
import { defineHandler } from "nitro";

export default defineHandler((event) => {
  event.context.user = { name: "Nitro" };
});
```

Control execution order with numeric prefixes (`01.logger.ts`, `02.auth.ts` — pad to keep string sort correct). Scope manually with `event.url.pathname`, or register route-scoped middleware in config:

```ts [nitro.config.ts]
export default defineConfig({
  handlers: [
    { route: "/api/**", handler: "./middleware/api-auth.ts", middleware: true },
  ],
});
```

## Programmatic routes

Register handlers/middleware in config in addition to (or instead of) the filesystem:

```ts [nitro.config.ts]
export default defineConfig({
  routes: {
    "/api/hello": "./routes/api/hello.ts",
    "/api/custom": { handler: "./routes/custom.ts", method: "POST", lazy: true },
  },
  handlers: [
    { route: "/blog/**", handler: "./handlers/blog.ts", method: "get" },
  ],
});
```

Handler options: `handler`, `method`, `lazy`, `middleware`, `format` (`"web"` | `"node"`), `env`.

## Error handling

Throw `HTTPError` (replaces v2 `createError`):

```ts
import { defineHandler, HTTPError } from "nitro";

export default defineHandler((event) => {
  const user = findUser(event.context.params!.id);
  if (!user) {
    throw new HTTPError({ status: 404, message: "User not found" });
  }
  return user;
});
```

In dev, browsers (Accept: text/html) get an HTML error page; production always returns JSON. Customize with `errorHandler` config pointing to a module that exports `defineErrorHandler((error, event) => Response)`.

## Route rules

Apply per-route behavior (caching, headers, redirects, proxy, auth) by glob pattern. Rules merge least-specific to most-specific; set a rule to `false` to disable an inherited one.

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  routeRules: {
    "/blog/**": { swr: true },                  // stale-while-revalidate (cache)
    "/blog/posts/**": { swr: 600 },             // swr with maxAge seconds
    "/api/data/**": { cache: { maxAge: 60 } },  // full cache options
    "/api/realtime/**": { cache: false },       // disable caching
    "/assets/**": { headers: { "cache-control": "s-maxage=0" } },
    "/api/v1/**": { cors: true, headers: { "access-control-allow-methods": "GET" } },
    "/old-page": { redirect: "/new-page" },     // 307 by default
    "/legacy": { redirect: { to: "https://example.com/", status: 308 } },
    "/old-blog/**": { redirect: "https://blog.example.com/**" }, // wildcard preserves suffix
    "/proxy/**": { proxy: "https://api.example.com/**" },
    "/admin/**": { basicAuth: { username: "admin", password: "secret" } },
    "/about": { prerender: true },
    "/isr/**": { isr: 60 },                      // Vercel ISR
  },
});
```

Route rule keys: `headers`, `redirect`, `proxy`, `cors`, `cache`, `swr`, `static`, `basicAuth`, `prerender`, `isr`. `swr: true` is shorthand for `cache: { swr: true }`; `swr: <n>` adds `maxAge: <n>`. Rules can also be supplied via `runtimeConfig.nitro.routeRules` for env-var overrides without rebuilding.

## Key Points

- Handlers **return** the body or **throw**; H3 v1 `send*` helpers are gone.
- Use `event.req.json()/text()/formData()` instead of v2 `readBody`.
- Params live on `event.context.params`; the `!` non-null assertion is common in TS.
- Each route handler is a separate code-split chunk (set `inlineDynamicImports: true` to bundle into one file).
- Route rules wrap matching handlers in caching, proxying, redirects, and auth without handler code.

<!--
Source references:
- https://nitro.build/docs/routing
- https://nitro.build/docs/lifecycle
- https://nitro.build/config
-->
