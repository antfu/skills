---
name: vite-environment-api
description: Vite 6+ Environment API for multiple runtime environments
---

# Environment API (Vite 6+)

The Environment API formalizes multiple runtime environments beyond the traditional client/SSR split.

## Concept

Before Vite 6: Two implicit environments (`client` and `ssr`).

Vite 6+: Configure as many environments as needed (browser, node server, edge server, etc.).

## Basic Configuration

For SPA/MPA, nothing changes—options apply to the implicit `client` environment:

```ts
export default defineConfig({
  build: { sourcemap: false },
  optimizeDeps: { include: ['lib'] },
})
```

## Multiple Environments

```ts
export default defineConfig({
  build: { sourcemap: false },  // Inherited by all environments
  optimizeDeps: { include: ['lib'] },  // Client only
  environments: {
    // SSR environment
    server: {},
    // Edge runtime environment
    edge: {
      resolve: { noExternal: true },
    },
  },
})
```

Environments inherit top-level config. Some options (like `optimizeDeps`) only apply to `client` by default.

## Environment Options

```ts
interface EnvironmentOptions {
  define?: Record<string, any>
  resolve?: EnvironmentResolveOptions
  optimizeDeps: DepOptimizationOptions
  consumer?: 'client' | 'server'
  dev: DevOptions
  build: BuildOptions
}
```

## Custom Environment Instances

Runtime providers can define custom environments:

```ts
import { customEnvironment } from 'vite-environment-provider'

export default defineConfig({
  environments: {
    ssr: customEnvironment({
      build: { outDir: '/dist/ssr' },
    }),
  },
})
```

Example: Cloudflare's Vite plugin runs code in `workerd` runtime during development.

## Dev Environment Types

Environments run modules through a runner. Two dev environment shapes exist:

- **`RunnableDevEnvironment`** — evaluates modules in the **same runtime** as the Vite server, so it exchanges arbitrary JS values in-process. Its `runner.import(url)` is the modern replacement for `server.ssrLoadModule` (full HMR). Default for `ssr` and other non-client envs. Guard with `isRunnableDevEnvironment(env)`.

```ts
if (isRunnableDevEnvironment(server.environments.ssr)) {
  const mod = await server.environments.ssr.runner.import('/src/entry-server.ts')
}
```

- **`FetchableDevEnvironment`** — communicates only via the **Fetch API** (`Request`/`Response`), so it works for runtimes that can't run Vite directly (e.g. Cloudflare Workers). Preferred over `RunnableDevEnvironment` for such runtimes. Handle requests with `handleRequest`; dispatch via `env.dispatchFetch(new Request(url))`.

## Building Environments

`vite build` / `vite build --ssr` still build only client/ssr for back-compat. Setting the `builder` option (even `{}`, which is what `vite build --app` does) opts into building **all** environments.

```js [build.js]
import { createBuilder } from 'vite'

const builder = await createBuilder()      // build-time equivalent of createServer
await builder.buildApp()                    // build every configured environment
// await builder.build(builder.environments.ssr) // or one at a time
```

`createBuilder` supersedes the standalone `build()` for environment-aware builds. Customize with the `builder.buildApp` config option or the global `buildApp` plugin hook (use `environment.isBuilt` to skip already-built envs).

## Per-Environment Plugins

Restrict a plugin to specific environments with `applyToEnvironment`, or configure each env with the `configEnvironment` hook (set defaults in `config`, since the full env list isn't known there):

```ts
{
  name: 'ssr-only',
  applyToEnvironment(env) { return env.name === 'ssr' },
}
```

## Backward Compatibility

- `server.moduleGraph` returns mixed client/SSR view
- `ssrLoadModule` still works
- Existing SSR apps work unchanged

## When to Use

- **End users**: Usually don't need to configure—frameworks handle it
- **Plugin authors**: Use for environment-aware transformations
- **Framework authors**: Create custom environments for their runtime needs

## Plugin Environment Access

Plugins can access environment in hooks:

```ts
{
  name: 'env-aware',
  transform(code, id, options) {
    if (options?.ssr) {
      // SSR-specific transform
    }
  },
}
```

<!--
Source references:
- https://vite.dev/guide/api-environment
- https://vite.dev/guide/api-environment-frameworks
- https://vite.dev/guide/api-environment-plugins
- https://vite.dev/guide/api-environment-runtimes
- https://vite.dev/blog/announcing-vite6
-->
