---
name: vite-rolldown
description: Vite 8 Rolldown bundler and Oxc transformer migration
---

# Rolldown Migration (Vite 8)

Vite 8 replaces esbuild + Rollup with [Rolldown](https://rolldown.rs/) (Rust bundler) and [Oxc](https://oxc.rs/) (Rust transformer/minifier).

## What Changed

| Before (Vite 7) | After (Vite 8) |
|-----------------|----------------|
| esbuild (dev/JS transform) | Oxc Transformer |
| esbuild (dep pre-bundling) | Rolldown |
| esbuild (CSS minify) | Lightning CSS (default) |
| Rollup (production build) | Rolldown |
| `build.rollupOptions` | `build.rolldownOptions` |
| `worker.rollupOptions` | `worker.rolldownOptions` |
| `optimizeDeps.esbuildOptions` | `optimizeDeps.rolldownOptions` |
| `esbuild` option | `oxc` option |

## Backward Compatibility (Auto-Conversion)

Old options are **deprecated but still work** — Vite converts them internally:

- `esbuild` → `oxc`
- `build.rollupOptions` → `build.rolldownOptions` (alias)
- `optimizeDeps.esbuildOptions` → `optimizeDeps.rolldownOptions`

Migrate to the new names; the compat shims will be removed in a future major. Read the converted values from the `configResolved` hook (`config.oxc`, `config.optimizeDeps.rolldownOptions`).

## Default Browser Target Change

`build.target` / `'baseline-widely-available'` moved to newer versions (Baseline Widely Available as of 2026-01-01):

- Chrome 107 → 111, Edge 107 → 111, Firefox 104 → 114, Safari 16.0 → 16.4
- Resolves to `['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4']`
- Default `--minify` is now `oxc` (was `esbuild`)

## Config Migration

### rollupOptions → rolldownOptions

```ts
export default defineConfig({
  build: {
    rolldownOptions: {  // was rollupOptions
      external: ['vue'],
      output: { globals: { vue: 'Vue' } },
    },
  },
})
```

Prefer the top-level [`input`](../references/core-config.md) option over `build.rolldownOptions.input` — it applies in dev too.

### esbuild → oxc

```ts
export default defineConfig({
  oxc: {  // was esbuild
    jsx: {
      runtime: 'classic',
      pragma: 'h',
      pragmaFrag: 'Fragment',
    },
  },
})
```

`esbuild.jsxFactory`→`oxc.jsx.pragma`, `jsxFragment`→`oxc.jsx.pragmaFrag`, `jsx: 'transform'`→`oxc.jsx: { runtime: 'classic' }`, `jsx: 'automatic'`→`{ runtime: 'automatic' }`. `esbuild.banner`/`footer` have no equivalent — use a custom plugin `transform` hook.

### JSX Configuration

```ts
export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic',  // or 'classic'
      importSource: 'react', // for automatic runtime
    },
    jsxInject: `import React from 'react'`,  // auto-inject
  },
})
```

### Custom Transform Targets

```ts
export default defineConfig({
  oxc: {
    include: ['**/*.ts', '**/*.tsx'],
    exclude: ['node_modules/**'],
  },
})
```

## Notable Breaking Changes

- **`build()` throws `BundleError`** (JS API): typed `Error & { errors?: RolldownError[] }`. Access individual errors via `e.errors`.
- **`build.rollupOptions.output.manualChunks`**: object form removed, function form deprecated. Use Rolldown's [`codeSplitting`](https://rolldown.rs/reference/OutputOptions.codeSplitting).
- **`build.rollupOptions.watch.chokidar`** removed → `build.rolldownOptions.watch.watcher`.
- **`resolve.alias[].customResolver`** deprecated → use a custom plugin with a `resolveId` hook and `enforce: 'pre'`.
- **`build.commonjsOptions`** is now a no-op.
- **`require` calls for externalized modules** are preserved as `require`. To convert to `import`, use the re-exported `esmExternalRequirePlugin`.
- **`import.meta.hot.accept(url)`** no longer accepts a URL — pass an id.
- Unsupported by Rolldown: output format `'system'`/`'amd'`, `shouldTransformCachedModule`, `resolveImportMeta`, `renderDynamicImport`, `resolveFileUrl` hooks.
- Native decorator lowering is not yet supported by Oxc — use `@rolldown/plugin-babel` or `@rollup/plugin-swc` as a workaround.

## Detecting Rolldown-powered Vite

```ts
buildStart() {
  // only defined on Vite 8+ (Rolldown)
  if (this.meta.rolldownVersion) { /* ... */ }
}
```

Also exported from `vite`: `version`, `rolldownVersion` (`esbuildVersion`/`rollupVersion` kept only for back-compat).

## Plugin Compatibility

Most Vite plugins work unchanged — Rolldown supports Rollup's plugin API. Rolldown runs all parallel Rollup hooks sequentially. If a plugin only works during build:

```ts
{
  ...rollupPlugin(),
  enforce: 'post',
  apply: 'build',
}
```

## New Capabilities

- Full bundle mode (experimental, `vite --experimentalBundle`)
- Chunk import map optimization (`build.chunkImportMap`)
- More flexible chunk splitting / Module Federation support

## Gradual Migration

`rolldown-vite` is Vite 7 running on Rolldown *without* other Vite 8 changes — an intermediate step:

```bash
# Step 1: swap vite for rolldown-vite on Vite 7 (npm alias in package.json)
#   "vite": "npm:rolldown-vite@^7"
# Step 2: undo the alias and upgrade to Vite 8
pnpm add -D vite@8
```

If migrating from `rolldown-vite`, only the "NRV"-badged sections of the official migration guide apply.

## Overriding Vite in Frameworks

When a framework depends on older Vite:

```json
{
  "pnpm": {
    "overrides": {
      "vite": "8.0.0"
    }
  }
}
```

<!--
Source references:
- https://vite.dev/guide/migration
- https://vite.dev/blog/announcing-vite8
- https://vite.dev/config/shared-options#oxc
-->
