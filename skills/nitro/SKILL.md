---
name: nitro
description: Nitro is the framework-agnostic server toolkit (powering Nuxt) for building and deploying web servers anywhere. Use when working with nitro.config, server routes/event handlers, route rules, caching, storage, tasks, websockets, or deploying to Node/Bun/Deno/Cloudflare/Vercel.
metadata:
  author: Anthony Fu
  version: "2026.6.22"
  source: Generated from https://github.com/nitrojs/nitro, scripts located at https://github.com/antfu/skills
---

> The skill is based on Nitro v3 (beta), generated at 2026-06-22.

Nitro is a framework-agnostic, deployment-agnostic server toolkit powered by [H3](https://h3.dev) v2, [unstorage](https://unstorage.unjs.io), and Vite/Rolldown/Rollup. It powers Nuxt and works standalone. From one codebase it builds optimized output for Node.js, Bun, Deno, Cloudflare, Vercel, Netlify, and more.

Key capabilities:
- **Filesystem routing** with H3 v2 event handlers, dynamic params, and method suffixes.
- **Route rules** for declarative caching, headers, redirects, proxying, and auth.
- **Caching** layer (cached handlers/functions, SWR) on top of **unstorage** KV.
- **Runtime config** overridable via `NITRO_*` env vars.
- **Tasks** (on-demand + scheduled/cron), **WebSockets**/SSE, a SQL **database** layer, and **OpenAPI** auto-docs.
- **Plugins & lifecycle hooks**, custom **renderer**/**server entry**, and portable **deployment presets**.

> Nitro v3 renamed the package `nitropack` → `nitro` and adopts H3 v2 (web-standard `Request`/`Response`). If unsure about v2-vs-v3 APIs, read [advanced-migration](references/advanced-migration.md) first.

## Core

| Topic | Description | Reference |
|-------|-------------|-----------|
| Routing | File-based routes, `defineHandler`, params, middleware, route rules, errors | [core-routing](references/core-routing.md) |
| Configuration | `nitro.config.ts`, `defineConfig`, key options, runtime config | [core-configuration](references/core-configuration.md) |
| Storage | unstorage KV, mount points, drivers, dynamic mounts | [core-storage](references/core-storage.md) |
| Cache | `defineCachedHandler`, `defineCachedFunction`, SWR, invalidation | [core-cache](references/core-cache.md) |
| Assets | Public assets, compression, server assets via storage | [core-assets](references/core-assets.md) |
| Rendering | Renderer (HTML/SSR), server entry, framework integration | [core-rendering](references/core-rendering.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| Plugins & Hooks | `definePlugin`, runtime lifecycle hooks, error capture | [features-plugins](references/features-plugins.md) |
| Tasks | On-demand & scheduled (cron) tasks, `runTask` | [features-tasks](references/features-tasks.md) |
| WebSocket & SSE | `defineWebSocketHandler`, pub/sub, namespaces, event streams | [features-websocket](references/features-websocket.md) |
| Database | Built-in SQL layer via db0, `useDatabase`, connectors | [features-database](references/features-database.md) |
| OpenAPI | Auto spec from `defineRouteMeta`, Scalar/Swagger UIs | [features-openapi](references/features-openapi.md) |

## Advanced / Deployment

| Topic | Description | Reference |
|-------|-------------|-----------|
| Deployment Presets | Runtimes & providers, compatibility dates, platform integration | [deploy-presets](references/deploy-presets.md) |
| v2 → v3 Migration | Package rename, `nitro/*` imports, H3 v2 API, preset changes | [advanced-migration](references/advanced-migration.md) |
