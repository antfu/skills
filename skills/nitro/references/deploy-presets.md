---
name: deploy-presets
description: Deployment presets for runtimes and providers, compatibility dates, and platform integration in Nitro
---

# Deployment Presets

Nitro builds the same code into different output formats via **presets**. Most providers are auto-detected in CI; otherwise set the preset explicitly.

```bash
nitro build --preset cloudflare_module
# or env var:
NITRO_PRESET=vercel nitro build
```

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  preset: "cloudflare_pages",
  defaultPreset: "node_cluster", // fallback when nothing is detected
});
```

The default production preset is `node_server`; dev always uses the isolated `nitro_dev` preset.

## Runtime presets

| Preset | Runtime / Notes |
|---|---|
| `node_server` | Default. `node .output/server/index.mjs` starts a ready server. |
| `node_cluster` | Multi-core via `node:cluster` (`NITRO_CLUSTER_WORKERS`). |
| `node_middleware` | Exports a `(req, res)` middleware/`listener` for custom servers. |
| `bun` | Optimized [Bun](https://bun.sh) output: `bun run ./.output/server/index.mjs`. |
| `deno_server` | [Deno](https://deno.com) server output. |

Node server env vars: `NITRO_PORT`/`PORT` (3000), `NITRO_HOST`/`HOST`, `NITRO_UNIX_SOCKET`, `NITRO_SSL_CERT`/`NITRO_SSL_KEY`, and graceful-shutdown controls (`NITRO_SHUTDOWN_*`).

## Provider presets

| Provider | Preset(s) | Auto-detect |
|---|---|---|
| Cloudflare | `cloudflare_module` (recommended), `cloudflare_pages` | ✅ |
| Vercel | `vercel` (Fluid compute) | ✅ |
| Netlify | `netlify`, `netlify_edge` | ✅ |
| AWS | `aws_amplify`, `aws_lambda` | Amplify ✅ |
| Azure | `azure_swa` | ✅ |
| Deno Deploy | `deno_deploy` | — |
| Firebase | `firebase_app_hosting` | ✅ |
| Others | GitHub/GitLab Pages, DigitalOcean, Heroku, Render, Zeabur, Stormkit, Koyeb, ... | varies |

## Compatibility dates

Providers evolve; Nitro uses a compatibility date to lock behavior at project creation and opt into updates deliberately.

```ts [nitro.config.ts]
export default defineConfig({
  compatibilityDate: "2025-01-01",
});
```

## Platform integration highlights

**Cloudflare** (`cloudflare_module`): access bindings via `event.req.runtime.cloudflare.env`:

```ts
import { defineHandler } from "nitro";

export default defineHandler(async (event) => {
  const { env } = event.req.runtime.cloudflare;
  const { results } = await env.MY_D1.prepare("SELECT id FROM t").all();
  return results;
});
```

Dev uses Miniflare to emulate bindings (define them in `wrangler.json`/`.toml` or inline via `cloudflare.wrangler`). `scheduledTasks` auto-generate Cron Triggers. Platform hooks: `cloudflare:scheduled`, `cloudflare:email`, `cloudflare:queue`, `cloudflare:tail`.

**Vercel** (`vercel`): use `routes/api/` (not `api/`). `scheduledTasks` → Vercel Cron Jobs (secure with `CRON_SECRET`); `isr` route rules → ISR; external `proxy` route rules become CDN rewrites. Per-route function config via `vercel.functionRules`; Bun runtime via `vercel.functions.runtime`. Vercel Queues via the `vercel:queue` hook.

> Prefer Nitro's portable abstractions ([storage](core-storage.md), [database](features-database.md)) over low-level platform bindings for stability across targets.

## Key Points

- One codebase → many targets; switch with `preset` / `NITRO_PRESET` / `--preset`.
- `node_server` is the default; `bun` and `deno_server` optimize for those runtimes.
- Cloudflare/Vercel/Netlify are zero-config in their CI; set the preset explicitly elsewhere.
- Set `compatibilityDate` and update it deliberately (test after each bump).
- v2→v3 renamed many presets (e.g. `cloudflare*` → `cloudflare_module`, `vercel-edge` → `vercel`, `azure*` → `azure_swa`).

<!--
Source references:
- https://nitro.build/deploy
- https://nitro.build/deploy/runtimes/node
- https://nitro.build/deploy/providers/cloudflare
- https://nitro.build/deploy/providers/vercel
-->
