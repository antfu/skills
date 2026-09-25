---
name: migration
description: Nitro v2 to v3 migration - package rename, subpath imports, H3 v2 API, and preset changes
---

# Migration: Nitro v2 → v3

Nitro v3 has intentional breaking changes. This is the highest-value reference for agents whose training data assumes `nitropack` v2 / H3 v1 patterns.

## Package & imports

The `nitropack` package is renamed to `nitro`.

```diff
- import { defineNitroConfig } from "nitropack/config"
+ import { defineConfig } from "nitro"
```

Runtime utils moved to dedicated `nitro/*` subpaths:

| Capability | v3 import |
|---|---|
| Handlers, config, plugins, errors | `nitro` (`defineHandler`, `defineConfig`, `definePlugin`, `defineErrorHandler`, `HTTPError`, `defineWebSocketHandler`, `defineRouteMeta`, `defineServerEntry`, `serverFetch`) |
| KV storage | `nitro/kv` (`useKV`, formerly `useStorage` from `nitro/storage`) |
| Cache | `nitro/cache` (`defineCachedHandler`, `defineCachedFunction`) |
| Runtime config | `nitro/runtime-config` (`useRuntimeConfig`) |
| Database | `nitro/database` (`useDatabase`) |
| Tasks | `nitro/task` (`defineTask`, `runTask`) |
| App / hooks | `nitro/app` (`useNitroApp`, `useNitroHooks`, `getRouteRules`) |
| H3 utilities | `nitro/h3` |
| Types | `nitro/types` |
| Vite plugin | `nitro/vite` |

Removed: `nitropack/kit`, `nitropack/presets`, `nitropack/core` (use `nitro/builder`). Use `NitroModule` from `nitro/types` instead of `defineNitroModule`.

Other renames:
- `defineNitroPlugin` → `definePlugin`
- `defineNitroConfig` → `defineConfig`
- `defineNitroErrorHandler` → `defineErrorHandler`
- Node.js minimum is now **20**.
- App config (`app.config.ts` + `useAppConfig()`) was **removed** — import a regular `.ts` module instead.

## Auto-imports are removed

v2 auto-imported `defineEventHandler`, `useStorage`, `useRuntimeConfig`, `defineCachedFunction`, `defineNitroPlugin`, `#imports`, and your `server/utils/`. **All gone in v3** — the `imports` option, `#imports`, and `nitro-imports.d.ts` no longer exist. Add explicit imports everywhere, including relative imports from your own `utils/`:

```ts
import { defineHandler, definePlugin, defineErrorHandler, HTTPError, serverFetch } from "nitro";
import { useKV } from "nitro/kv";
import { useRuntimeConfig } from "nitro/runtime-config";
import { defineCachedFunction, defineCachedHandler } from "nitro/cache";
import { useDatabase } from "nitro/database";
import { defineTask, runTask } from "nitro/task";
import { useNitroApp, useNitroHooks } from "nitro/app";
import { getQuery, getCookie } from "nitro/h3";
```

## Server directory scanning is opt-in

`srcDir` is deprecated for `serverDir`, which defaults to **`false`** — nothing (`routes/`, `api/`, `middleware/`, `plugins/`, `tasks/`) is scanned until you set it. Set `serverDir: "./server"` (or `"."` for the v2 root layout; `true` = `"server"`).

## Storage & cache config renames

- `useStorage` → `useKV` (`nitro/storage` → `nitro/kv`).
- `storage` config option → `kv`; `devStorage` → `kv` inside `$development` (and `$prerender`).
- Cache: `swr` now defaults to `false` (was `true`); persist cache by mounting a `cache` point under `kv`.

## Internal server fetch

`useNitroApp().localFetch` → `serverFetch` from `nitro` (returns a web `Response`). There is also a `fetch` export routing absolute (`/`) paths to the server.

## Route rule types

`NitroRouteConfig`/`NitroRouteRules` are deprecated for `RouteRuleConfig`/`RouteRules` (from `nitro/types`). `redirect`, `proxy`, `cors`, `headers`, `cache`, `swr` are now defined by [h3-rules](https://github.com/h3js/h3-rules); `isr`, `prerender`, `static` remain Nitro-specific. There is no `auth`/`basicAuth` route rule.

## H3 v2 API

H3 v2 is built on web standards (`URL`, `Headers`, `Request`, `Response`). All H3 utils import from `nitro/h3`.

### Return / throw, don't `send`

```diff
- import { send, sendRedirect, sendStream } from "nitro/h3"
- send(event, value); sendStream(event, stream); sendRedirect(event, loc, code)
+ import { redirect } from "nitro/h3"
+ return value
+ return stream
+ return redirect(event, loc, code)
```

Also: `sendError` → `throw createError`/`HTTPError`; `sendNoContent` → `return noContent(event)`; `sendProxy` → `return proxy(event, target)`.

### Event shape

`event.web` → `event.req` (a web `Request`). `event.node.{req,res}` only exists on Node.

```diff
- const body = await readBody(event)
+ const body = await event.req.json()   // or .text() / .formData(); event.req.body for the stream
```

### Headers (always plain strings)

```diff
- getHeader(event, "x-foo"); setHeader(event, "x-foo", "bar"); getResponseStatus(event)
+ event.req.headers.get("x-foo")
+ event.res.headers.set("x-foo", "bar")
+ event.res.status
```

### Handlers & errors

```diff
- import { eventHandler, defineEventHandler, createError } from "nitro/h3"
+ import { defineHandler, HTTPError } from "nitro"
+ throw new HTTPError({ status: 404, message: "Not found" })
+ HTTPError.isError(error)
```

`lazyEventHandler` → `defineLazyEventHandler`; `useBase` → `withBase`. Node utils: `defineNodeListener`/`toNodeListener`/`fromNodeMiddleware` → `defineNodeHandler`/`toNodeHandler`/`fromNodeHandler`.

> `defineEventHandler`/`createError` still work in many places (re-exported), but prefer the v3 names: `defineHandler` and `HTTPError`.

## Cloudflare bindings

```diff
- const binding = event.context.cloudflare.env.MY_BINDING
+ const { env } = event.req.runtime.cloudflare
+ const binding = env.MY_BINDING
```

## Preset renames

| v2 | v3 |
|---|---|
| `node` | `node_middleware` (export is now `middleware`) |
| `cloudflare`, `cloudflare_worker`, `cloudflare_module_legacy` | `cloudflare_module` |
| `deno-server-legacy` / `deno` | `deno_server` (Deno v2) / `deno_deploy` |
| `netlify-builder` | `netlify` or `netlify_edge` |
| `vercel-edge` | `vercel` (Fluid compute) |
| `azure`, `azure_functions` | `azure_swa` |
| `firebase` | `firebase_app_hosting` |
| `iis` | `iis_handler` |
| `edgio`, `cli`, `service_worker` | removed/discontinued |

## Hooks

If you accessed `useNitroApp().hooks` outside a plugin it may be undefined — use `useNitroHooks()` to guarantee an instance.

## Key Points

- Replace `nitropack` with `nitro` and split imports into `nitro/*` subpaths.
- **Auto-imports are gone** — import everything explicitly; set `serverDir` or nothing is scanned.
- `useStorage`→`useKV` (`nitro/kv`), `storage`→`kv`, `devStorage`→`$development.kv`.
- Handlers **return**/**throw**; use `event.req.json()` and web `Headers` (no `send*`/`readBody`/`getHeader`).
- Use `HTTPError` instead of `createError`; `definePlugin`/`defineHandler`/`defineConfig`/`defineErrorHandler` instead of v2 names.
- Cloudflare bindings moved to `event.req.runtime.cloudflare.env`.
- Many presets were renamed/removed — update `preset` accordingly.

<!--
Source references:
- https://nitro.build/docs/migration
- https://h3.dev
-->
