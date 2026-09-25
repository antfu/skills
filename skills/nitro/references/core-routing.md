---
name: routing
description: File-based routing, event handlers, dynamic params, middleware, and route rules in Nitro
---

# Routing & Event Handlers

Nitro maps files in `routes/` and `api/` to HTTP routes at build time (no runtime router). Handlers receive an [H3 v2](https://h3.dev) `event` and should **return** the response body or **throw** an error.

> **v3:** filesystem routing only runs when [`serverDir`](core-configuration.md) (or `scanDirs`) is set — no directories are scanned by default. Auto-imports are removed, so import `defineHandler`/`HTTPError` explicitly.

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

Append the method to match only that verb (`get`, `post`, `put`, `delete`, `patch`, `head`, `options`, `query`, `connect`, `trace`):

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
- Global catch-all: `[...].ts` matches all otherwise-unmatched routes; its wildcard is on `event.context.params._`. It chains before the [server entry](core-rendering.md) and renderer.

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

Control execution order with numeric prefixes (`1.logger.ts`, `2.auth.ts` — pad to `01.` etc. beyond 9 to keep string sort correct). Scope manually with `event.url.pathname`, or register route-scoped middleware in config (keep the file **outside** `middleware/` so it isn't also registered globally):

```ts [nitro.config.ts]
export default defineConfig({
  handlers: [
    { route: "/api/**", handler: "./utils/api-auth.ts", middleware: true },
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

`HTTPError` has several forms: `new HTTPError("msg", { status: 400 })`, `HTTPError.status(400, "Bad Request")`, or the full object form. Any other thrown value is treated as unhandled (always `500`, message/stack hidden).

In dev, browsers (Accept: text/html) get an HTML error page; production always returns JSON (`{ error, status, message, data }`). Customize with the `errorHandler` config (a path or array of paths) to a module exporting `defineErrorHandler((error, event) => Response)` from `nitro`. Handlers run in order (first response wins; built-in default is always appended); `devErrorHandler` overrides dev-only rendering.

## Route rules

Apply per-route behavior (caching, headers, redirects, proxy, CORS) by glob pattern (rou3 syntax). Rules merge least-specific to most-specific; set a rule to `false` to disable an inherited one. When `cache` is set, matching handlers are auto-wrapped with `defineCachedHandler`.

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  routeRules: {
    "/blog/**": { swr: 600 },                   // stale-while-revalidate w/ maxAge
    "/api/data/**": { cache: { maxAge: 60 } },  // full cache options
    "/api/realtime/**": { cache: false },       // disable caching
    "/assets/**": { headers: { "cache-control": "s-maxage=0" } },
    "/api/public/**": { cors: true },           // permissive CORS defaults
    "/api/v1/**": { cors: { origin: ["https://app.example.com"], credentials: true } },
    "/old-page": { redirect: "/new-page" },     // 307 by default
    "/legacy": { redirect: { to: "https://example.com/", status: 308 } },
    "/old-blog/**": { redirect: "https://blog.example.com/**" }, // wildcard preserves suffix
    "/proxy/**": { proxy: "https://api.example.com/**" },
    "/about": { prerender: true },
    "/isr/**": { isr: 60 },                      // Vercel ISR
  },
});
```

Route rule keys: `headers`, `redirect`, `proxy`, `cors`, `cache`, `swr`, `static`, `prerender`, `isr`. `swr: true` = `cache: { swr: true }` (1s default `maxAge`); `swr: <n>` adds `maxAge: <n>`. Rules can also be supplied via `runtimeConfig.nitro.routeRules` for env-var overrides without rebuilding.

> **No `auth`/`basicAuth` route rule.** Auth needs executable logic → use [middleware](#middleware). For a single route use h3's `basicAuth` from `nitro/h3` in the handler's `middleware` array:
> ```ts
> import { defineHandler } from "nitro";
> import { basicAuth } from "nitro/h3";
> export default defineHandler({
>   middleware: [basicAuth({ username: "admin", password: "secret" })],
>   handler: (event) => `Hello, ${event.context.basicAuth?.username}!`,
> });
> ```

### Method-scoped rules

Prefix a key with an uppercase HTTP method + space to scope it; unprefixed keys apply to every method and are merged underneath:

```ts
routeRules: {
  "/api/**": { headers: { "x-api": "true" } },     // every method
  "POST /api/**": { headers: { "x-write": "true" } },
  "GET /feed": { swr: 600 },
}
```

> Platform-native static config (Netlify/Cloudflare `_headers`/`_redirects`, Vercel `config.json`) does not split by method — prefer method-agnostic keys for `headers`/`redirect`/`proxy` you expect emitted statically. Do not combine `prerender` and `isr` on the same route.

## Key Points

- Handlers **return** the body or **throw**; H3 v1 `send*` helpers are gone.
- Use `event.req.json()/text()/formData()` instead of v2 `readBody`.
- Params live on `event.context.params` (unnamed catch-all on `params._`).
- Each route handler is a separate code-split chunk (set `inlineDynamicImports: true` to bundle into one file).
- Route rules wrap matching handlers in caching, proxying, redirects, and CORS without handler code — auth goes in middleware.

<!--
Source references:
- https://nitro.build/docs/routing
- https://nitro.build/docs/lifecycle
- https://nitro.build/config
-->
