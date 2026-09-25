---
name: nuxt
description: Nuxt full-stack Vue framework with SSR, auto-imports, and file-based routing. Use when working with Nuxt apps, server routes, useFetch, middleware, or hybrid rendering.
metadata:
  author: Anthony Fu
  version: "2026.9.25"
  source: Generated from https://github.com/nuxt/nuxt, scripts located at https://github.com/antfu/skills
---

Nuxt is a full-stack Vue framework that provides server-side rendering, file-based routing, auto-imports, and a powerful module system. It uses Nitro as its server engine for universal deployment across Node.js, serverless, and edge platforms.

> The skill is based on Nuxt 5.x (`5.0.0-0`), generated at 2026-09-25.

> **Directory layout:** the default `srcDir` is `app/` — Vue app code (`app.vue`, `components/`, `composables/`, `pages/`, etc.) lives under `app/`, while `server/`, `shared/`, `public/`, `modules/`, `layers/` and `nuxt.config.ts` stay at the project root. The `~`/`@` aliases point at `app/`; use `~~`/`@@` for the root.

> **Nuxt 5 note:** Nuxt 5 makes many former experimental flags the default. The biggest shifts for agents: server code moves to **Nitro v3** (h3 v2, Web-standard `Request`/`Response`), server utilities import from **`nuxt/server`** and are no longer auto-imported by default, `$fetch`/`useFetch` are **typed from generated route types**, routing is **case-sensitive** and **typed** by default, and the bundler is **Vite 8 (Rolldown)**. Nuxt 5 requires Node `22.19`/`24.11`+. A Nitro v2 compatibility layer (`nitroLegacy`) keeps older server code building during migration. See individual references for details.

## Core

| Topic | Description | Reference |
|-------|-------------|-----------|
| Directory Structure | Nuxt 4 `app/` srcDir, `shared/`, aliases, conventions | [core-directory-structure](references/core-directory-structure.md) |
| Configuration | nuxt.config.ts, app.config.ts, aliases, Nuxt 5 defaults, jiti removal, experimental | [core-config](references/core-config.md) |
| CLI Commands | Dev server, build, generate, preview, and utility commands | [core-cli](references/core-cli.md) |
| Routing | File-based routing, case-sensitive + typed routes, named views, layout props, middleware | [core-routing](references/core-routing.md) |
| Data Fetching | useFetch, useAsyncData, $fetch, typed routes, createUseFetch factories, caching | [core-data-fetching](references/core-data-fetching.md) |
| Modules | Creating and using Nuxt modules, Nuxt Kit utilities | [core-modules](references/core-modules.md) |
| Deployment | Platform-agnostic deployment with Nitro, Vercel, Netlify, Cloudflare | [core-deployment](references/core-deployment.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| Composables Auto-imports | Vue/Nuxt composables, custom composables, `shared/`, useAnnouncer | [features-composables](references/features-composables.md) |
| Components Auto-imports | Component naming, lazy loading, hydration strategies | [features-components-autoimport](references/features-components-autoimport.md) |
| Built-in Components | NuxtLink, NuxtPage, NuxtLayout, NuxtAnnouncer, ClientOnly, and more | [features-components](references/features-components.md) |
| State Management | useState composable, SSR-friendly state, Pinia integration | [features-state](references/features-state.md) |
| Server Routes | API routes, `nuxt/server` imports, Nitro v3 (h3 v2), sessions, middleware | [features-server](references/features-server.md) |

## Rendering

| Topic | Description | Reference |
|-------|-------------|-----------|
| Rendering Modes | Universal (SSR), client-side (SPA), hybrid rendering, route rules | [rendering-modes](references/rendering-modes.md) |

## Best Practices

| Topic | Description | Reference |
|-------|-------------|-----------|
| Data Fetching Patterns | Efficient fetching, caching, parallel requests, error handling | [best-practices-data-fetching](references/best-practices-data-fetching.md) |
| SSR & Hydration | Avoiding context leaks, hydration mismatches, composable patterns | [best-practices-ssr](references/best-practices-ssr.md) |

## Advanced

| Topic | Description | Reference |
|-------|-------------|-----------|
| Layers | Extending applications with reusable layers | [advanced-layers](references/advanced-layers.md) |
| Lifecycle Hooks | Build-time, runtime, and server hooks | [advanced-hooks](references/advanced-hooks.md) |
| Module Authoring | Publishable modules with Nuxt Kit, keyed composables, dependencies | [advanced-module-authoring](references/advanced-module-authoring.md) |
