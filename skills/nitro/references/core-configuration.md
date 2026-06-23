---
name: configuration
description: nitro.config.ts, defineConfig, key build options, and runtime config in Nitro
---

# Configuration & Runtime Config

Nitro is configured via `nitro.config.ts` (loaded with [c12](https://github.com/unjs/c12)) or, when building with Vite, via the `nitro` key in `vite.config.ts`.

## Config file

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  // Nitro options
});
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [nitro()],
  nitro: {
    // Nitro options
  },
});
```

> v3 renamed the package `nitropack` → `nitro` and `defineNitroConfig` → `defineConfig`.

### Environment overrides & extending

```ts [nitro.config.ts]
export default defineConfig({
  logLevel: 3,
  $development: { debug: true },   // only during `nitro dev`
  $production: { minify: true },   // only during `nitro build`
  extends: "./base.config",        // inherit from another config/preset
});
```

Config can also live under a `nitro` key in `package.json` or in a `.nitrorc` file.

## Key options

| Option | Purpose |
|---|---|
| `preset` | Deployment target (or `NITRO_PRESET` env / `--preset`). Auto-detected in known CI. |
| `compatibilityDate` | Lock preset runtime behavior to a `YYYY-MM-DD` date. |
| `runtimeConfig` | Runtime values overridable via `NITRO_*` env vars. |
| `storage` / `devStorage` | unstorage mounts (prod / dev override). |
| `database` / `devDatabase` | DB connections (requires `experimental.database`). |
| `routeRules` | Per-route caching, headers, redirects, proxy, auth. |
| `serverDir` | Scan dir for `api/`, `routes/`, `middleware/`, `plugins/`, `utils/`, `tasks/`, `assets/`. `"./"` or `"./server"`. |
| `serverEntry` / `renderer` | Global fetch handler / catch-all renderer. |
| `features` | Built-in features (e.g. `websocket`). |
| `experimental` | Opt-in features (`tasks`, `database`, `openAPI`, `asyncContext`, `envExpansion`). |
| `prerender` | `{ routes, crawlLinks, failOnError, concurrency }` for static generation. |
| `imports` | Auto-import config (unimport). `false` disables. |
| `minify`, `sourcemap`, `inlineDynamicImports` | Build output tuning. |
| `builder` | `"rollup"` \| `"rolldown"` \| `"vite"` (auto-detected). |
| `output` | `{ dir, serverDir, publicDir }` (defaults under `.output/`). |

### Directory defaults

| Option | Default |
|---|---|
| `rootDir` | `.` |
| `buildDir` | `node_modules/.nitro` |
| `output.dir` | `.output` |
| `apiDir` / `routesDir` | `api` / `routes` |

## Runtime config

Define defaults in config; override at runtime with `NITRO_`-prefixed env vars. Only keys declared in `runtimeConfig` can be overridden — env vars cannot introduce new keys.

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  runtimeConfig: {
    apiToken: "dev_token",
    database: { host: "localhost", port: 5432 },
  },
});
```

Access it (note the dedicated subpath import):

```ts [routes/example.get.ts]
import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler((event) => {
  return useRuntimeConfig().apiToken;
});
```

Env var mapping uses `NITRO_` + `UPPER_SNAKE_CASE`, nested keys joined by `_`:

```bash [.env]
NITRO_API_TOKEN="123"
NITRO_DATABASE_HOST="db.example.com"
NITRO_DATABASE_PORT="5433"
```

- `.env` / `.env.local` are loaded only in `nitro dev`; in production use the platform's env vars.
- Values must be serializable; `undefined`/`null` fall back to `""`.
- Add a secondary prefix via `runtimeConfig.nitro.envPrefix: "APP_"` (checked alongside `NITRO_`).
- Enable `experimental.envExpansion` to expand `{{VAR}}` references inside runtime config strings.

## Environment variables (built-in)

| Variable | Effect |
|---|---|
| `NITRO_PRESET` / `SERVER_PRESET` | Override deployment preset. |
| `NITRO_COMPATIBILITY_DATE` | Set compatibility date. |
| `NITRO_APP_BASE_URL` | Override base URL (default `/`). |

## Key Points

- `defineConfig` from `nitro` is the v3 entry point; with Vite, options go under the `nitro` key.
- Use `useRuntimeConfig()` from `nitro/runtime-config` for env-overridable values; never read `process.env` in module top-level (edge runtimes only expose env during requests).
- `experimental.*` flags gate `tasks`, `database`, and `openAPI`.
- Types are imported from `nitro/types` (e.g. `NitroRuntimeConfig`), not `nitro`.

<!--
Source references:
- https://nitro.build/docs/configuration
- https://nitro.build/config
-->
