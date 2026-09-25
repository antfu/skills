---
name: vite-config
description: Vite configuration patterns using vite.config.ts
---

# Vite Configuration

## Basic Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // config options
})
```

Vite auto-resolves `vite.config.ts` from project root. Supports ES modules syntax regardless of `package.json` type.

## Conditional Config

Export a function to access command and mode:

```ts
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return { /* dev config */ }
  } else {
    return { /* build config */ }
  }
})
```

- `command`: `'serve'` during dev, `'build'` for production
- `mode`: `'development'` or `'production'` (or custom via `--mode`)

## Async Config

```ts
export default defineConfig(async ({ command, mode }) => {
  const data = await fetchSomething()
  return { /* config */ }
})
```

## Using Environment Variables in Config

`.env` files are loaded **after** config resolution. Use `loadEnv` to access them in config:

```ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load env files from cwd, include all vars (empty prefix)
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    server: {
      port: env.APP_PORT ? Number(env.APP_PORT) : 5173,
    },
  }
})
```

## Key Config Options

### input (top-level, Vite 8)

Declare entry points once at the top level. Acts as the default for `build.rolldownOptions.input`, `build.lib.entry`, `build.ssr` (when `true`), and `optimizeDeps.entries`. Useful when the app has no `index.html` entry.

```ts
export default defineConfig({
  input: 'src/main.ts',
  // or multi-page: { main: 'index.html', nested: 'nested/index.html' }
})
```

### resolve.alias

```ts
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      '~': '/src',
    },
  },
})
```

The array form's `customResolver` was removed in Vite 8 — use a custom plugin with a `resolveId` hook and `enforce: 'pre'` instead.

### define (Global Constants)

```ts
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

Values must be JSON-serializable or single identifiers. Non-strings auto-wrapped with `JSON.stringify`.

### plugins

```ts
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

Plugins array is flattened; falsy values ignored.

### server.proxy

```ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

### build.target

Default `'baseline-widely-available'` → `['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4']` (Vite 8, Baseline Widely Available as of 2026-01-01). Customize:

```ts
export default defineConfig({
  build: {
    target: 'esnext', // or 'es2020', ['chrome90', 'firefox88']
  },
})
```

To set the dev/transform target, use `oxc.target` (replaces `esbuild.target`); `build.target` takes precedence for builds.

### tsconfig (Vite 8)

Force a specific tsconfig instead of Vite's per-file discovery. Discouraged — prefer placing `tsconfig.json` near the files it configures and using TS `references`.

```ts
export default defineConfig({ tsconfig: './tsconfig.app.json' })
```

### devtools (Vite 8, experimental)

Enable [Vite DevTools](https://github.com/vitejs/devtools) integration (requires `@vitejs/devtools*` packages). Cannot be set from a plugin `config` hook.

```ts
export default defineConfig({ devtools: { apply: 'serve' } })
```

## TypeScript Intellisense

For plain JS config files:

```js
/** @type {import('vite').UserConfig} */
export default {
  // ...
}
```

Or use `satisfies`:

```ts
import type { UserConfig } from 'vite'

export default {
  // ...
} satisfies UserConfig
```

<!--
Source references:
- https://vite.dev/config/
- https://vite.dev/guide/
-->
