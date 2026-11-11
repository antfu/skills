---
name: configuration
description: Nuxt configuration files including nuxt.config.ts, app.config.ts, and runtime configuration
---

# Nuxt Configuration

Nuxt uses configuration files to customize application behavior. The main configuration options are `nuxt.config.ts` for build-time settings and `app.config.ts` for runtime settings.

## nuxt.config.ts

The main configuration file at the root of your project:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  // Configuration options
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
})
```

### Path Aliases

The default `srcDir` is `app/`, so path aliases resolve as:

| Alias | Resolves to |
|-------|-------------|
| `~` / `@` | `<rootDir>/app` |
| `~~` / `@@` | `<rootDir>` (project root) |
| `#shared` | `<rootDir>/shared` |
| `#server` | `<rootDir>/server` |

Reference root-level paths (modules, server handlers) with `~~` or `#server`:

```ts
export default defineNuxtConfig({
  modules: ['~~/custom-modules/awesome.js'], // relative to rootDir
  serverHandlers: [
    { route: '/foo/**', handler: '#server/foohandler.ts' },
  ],
})
```

### `nuxt.config` Loading (Nuxt 5: no more `jiti`)

Nuxt 5 no longer bundles `jiti`. `nuxt.config.ts`, files in `modules/`, and layer configs are loaded by the Node runtime directly (requires Node `22.19`/`24.11`+, which strip types natively). Two consequences:

- **Relative imports in these files need an explicit extension** — write `./build/plugin.ts`, not `./build/plugin` (TS reports `TS2835`). Bare package imports are unaffected.
- **Use erasable TypeScript only** in config/module files — no `enum`, `namespace`, constructor parameter properties, or decorators (TS reports `TS1294`).

App and `shared/` code go through Vite and are unaffected. Published layers/modules must ship compiled JS (a shipped config as `nuxt.config.mjs`). Install `jiti` (`-D`) to restore the old fallback behavior; a `nuxt.schema` file always needs it.

### Compatibility Version

Nuxt 5 behavior is now the default. `future.compatibilityVersion` is mostly historical — Nuxt 4 code paths that were opt-in are now unconditional. Individual behaviors are restored via specific `experimental`/config options (see each section below and the [upgrade notes](#nuxt-5-default-changes)).

### Environment Overrides

Configure environment-specific settings:

```ts
export default defineNuxtConfig({
  $production: {
    routeRules: {
      '/**': { isr: true },
    },
  },
  $development: {
    // Development-specific config
  },
  $env: {
    staging: {
      // Staging environment config
    },
  },
})
```

Use `--envName` flag to select environment: `nuxt build --envName staging`

## Runtime Config

For values that need to be overridden via environment variables:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-only keys
    apiSecret: '123',
    // Keys within public are exposed to client
    public: {
      apiBase: '/api',
    },
  },
})
```

Override with environment variables:

```ini
# .env
NUXT_API_SECRET=api_secret_token
NUXT_PUBLIC_API_BASE=https://api.example.com
```

Access in components/composables:

```vue
<script setup lang="ts">
const config = useRuntimeConfig()
// Server: config.apiSecret, config.public.apiBase
// Client: config.public.apiBase only
</script>
```

## App Config

For public tokens determined at build time (not overridable via env vars):

```ts
// app/app.config.ts
export default defineAppConfig({
  title: 'Hello Nuxt',
  theme: {
    dark: true,
    colors: {
      primary: '#ff0000',
    },
  },
})
```

Access in components:

```vue
<script setup lang="ts">
const appConfig = useAppConfig()
</script>
```

## runtimeConfig vs app.config

| Feature | runtimeConfig | app.config |
|---------|--------------|------------|
| Client-side | Hydrated | Bundled |
| Environment variables | Yes | No |
| Reactive | Yes | Yes |
| Hot module replacement | No | Yes |
| Non-primitive JS types | No | Yes |

**Use runtimeConfig** for secrets and values that change per environment.
**Use app.config** for public tokens, theme settings, and non-sensitive config.

## External Tool Configuration

Nuxt uses `nuxt.config.ts` as single source of truth. Configure external tools within it:

```ts
export default defineNuxtConfig({
  // Nitro configuration
  nitro: {
    // nitro options (storage mounts are `nitro.kv` + `useKV()`; `nitro.storage`/`useStorage()` are deprecated)
  },
  // Prerendering applies to any server builder; Nitro-only options (concurrency, failOnError) stay in `nitro.prerender`
  prerender: {
    routes: ['/user/1', '/user/2'],
    ignore: ['/dynamic'],
    crawlLinks: true,
  },
  // Client bundler: 'vite' (default) | 'webpack' | 'rsbuild' (`rspack` is deprecated, use rsbuild + `rsbuild: {}` options)
  // builder: 'rsbuild',
  // Vite configuration
  vite: {
    // vite options
    vue: {
      // @vitejs/plugin-vue options
    },
  },
  // PostCSS configuration
  postcss: {
    // postcss options
  },
})
```

### Environment-specific Vite Config

Top-level `vite` options are shared. Use `$client` and `$server` to target a single Vite build:

```ts
export default defineNuxtConfig({
  vite: {
    $client: {
      build: { sourcemap: true },
    },
    $server: {
      build: { sourcemap: 'inline' }, // `sourcemap` also accepts 'hidden' | 'nosource' at the top level
    },
  },
})
```

Vite 8 / Rolldown: `vite.esbuild` and `vite.optimizeDeps.esbuildOptions` are deprecated for `vite.oxc` and `vite.optimizeDeps.rolldownOptions`; `build.rollupOptions` for `build.rolldownOptions`. A Nitro rollup plugin that must run before Vite's resolution needs to be a Vite plugin with `enforce: 'pre'` (scope server-only plugins with `applyToEnvironment: env => env.name === 'nitro'`).

## Vue Configuration

Enable Vue experimental features:

```ts
export default defineNuxtConfig({
  vue: {
    propsDestructure: true,
  },
})
```

## Nuxt 5 Default Changes

Many former experimental flags are now on by default. Each can be reverted via the named option:

| Behavior | Now default | Restore Nuxt 4 with |
|----------|-------------|---------------------|
| Case-sensitive page routing | `router.options.sensitive: true` | `router.options.sensitive: false` |
| Typed pages (`useRoute`/`navigateTo`/`<NuxtLink>` type-checked) | on | `experimental.typedPages: false` |
| Page component name = route name | on | `experimental.normalizePageNames: false` |
| All serializable `definePageMeta` written to route record | on | `experimental.extractSerializablePageMeta: false` |
| Payload inlined in HTML, `_payload.json` only for SPA nav | `experimental.payloadExtraction: 'client'` | `payloadExtraction: true` |
| `clearNuxtState` resets to `useState` init value | on | `experimental.defaults.useState.resetOnClear: false` |
| `await navigateTo()` early-returns from `setup()` | on | `experimental.navigateToEarlyReturn: false` |
| `callHook` may return `void` (not always a Promise) | on | `experimental.asyncCallHook: true` |
| Client-only SSR placeholder is a comment node, not `<div>` | on | `experimental.clientNodePlaceholder: false` |
| Reuse builder's file watcher | `experimental.watcher: 'builder'` | `watcher: 'chokidar'` |
| Server auto-imports (Nitro helpers) | off | `experimental.nitroAutoImports: true` |
| Error format: page errors return the HTML error page, server route errors return JSON (request headers no longer matter) | `experimental.inlineErrorRendering` on | `experimental.inlineErrorRendering: false` |
| `$fetch` is not set on `globalThis` in the browser (import from `#build/fetch`) | on | provide your own instance via a plugin (`provide: { api: $fetch.create(...) }`) |
| `routeRules` keys use URLPattern: `*` matches nested paths, one `*`/`**` per key, regex constraints cannot match encoded chars | on | use named params (`/blog/:slug`) |
| `server/utils/` subdirectories not auto-imported (warns `NUXT_B9006`) | on | re-export from a top-level file, or `nitroLegacy.imports` |
| h3 v1 / `nitropack` imports in your `server/` dir | not supported (`NUXT_B9005` lists them) | `nitroLegacy: true` (or per-switch object) while migrating |
| `error.data` parsed (never stringified) | forced on | — (`parseErrorData` no longer configurable) |
| Vue Options API compiled out of client bundle | on | `vue: { optionsApi: true }` |
| `noUncheckedSideEffectImports` in generated tsconfig | on | `typescript.tsConfig.compilerOptions.noUncheckedSideEffectImports: false` |

**Removed options** (behavior now unconditional): `experimental.viteEnvironmentApi`, `experimental.routeTypedFetch`, `experimental.renderJsonPayloads`, `experimental.externalVue`. Delete them from config.

`unhead.legacy` is ignored (setting it warns); Capo title sorting is always on.

## Other Experimental Flags

On by default (disable with `false`): `serverPathFallback` (client navigation to a path matching no page, e.g. `<NuxtLink to="/rss.xml">`, loads as a full document so public files/server routes respond), `templateDiagnostics` (build warnings `NUXT_B4025` for `<NuxtLink to>` matching no route, `B3014` `v-on`/`v-model` on server components, `B3015` function/class props to server components or `<NuxtIsland>`), `deferPrefetchHints` (prefetch hints rendered as `data-href`, activated by `onNuxtReady`), `compileHints` (V8 compile hint on entry/layout/page chunks, Vite prod builds), `compilerComponentResolution` (auto-imported components resolved in the Vue compiler).

Notable opt-in flags under `experimental` (see source for the full list):

```ts
export default defineNuxtConfig({
  experimental: {
    // Stream the HTML shell first, then render body progressively (better TTFB)
    ssrStreaming: true,
    // Reject fetches to paths no server route answers (true | 'isomorphic')
    strictRouteTypes: true,
    // Respond 404 for unmatched paths without loading the Vue app/plugins/middleware
    early404: true,
    // Prerender error.vue into 404.html at build time
    prerenderErrorPages: true,
    // Default options for core composables/components
    defaults: {
      nuxtLink: { prefetch: true, prefetchOn: { visibility: true } },
      // Opt back into nested reactivity; Nuxt 4/5 uses shallow data by default
      useAsyncData: { deep: true },
    },
  },
})
```

<!-- 
Source references:
- https://nuxt.com/docs/getting-started/configuration
- https://nuxt.com/docs/getting-started/upgrade
- https://nuxt.com/docs/guide/going-further/runtime-config
- https://nuxt.com/docs/api/nuxt-config
- https://nuxt.com/docs/guide/going-further/experimental-features
- https://nuxt.com/docs/getting-started/prerendering
- https://nuxt.com/docs/errors/b4025
- https://nuxt.com/docs/errors/b3014
- https://nuxt.com/docs/errors/b3015
-->
