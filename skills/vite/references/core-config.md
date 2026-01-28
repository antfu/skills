---
name: core-config
description: Vite configuration file setup, defineConfig helper, conditional and async configs
---

# Vite Configuration

Vite automatically resolves a config file named `vite.config.*` in the project root.

## Basic Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // config options
})
```

Use `defineConfig` for TypeScript intellisense. Alternatively, use JSDoc annotations:

```js
/** @type {import('vite').UserConfig} */
export default {
  // config options
}
```

## Conditional Config

Export a function to conditionally determine options based on command, mode, or build type:

```ts
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    // dev specific config
    return {
      define: {
        __DEV__: true
      }
    }
  } else {
    // build specific config
    return {
      define: {
        __DEV__: false
      }
    }
  }
})
```

- `command` is `'serve'` during dev (`vite`, `vite dev`, `vite serve`) and `'build'` for production
- `mode` defaults to `'development'` for serve, `'production'` for build

## Async Config

```ts
import { defineConfig } from 'vite'

export default defineConfig(async ({ command, mode }) => {
  const data = await fetchRemoteConfig()
  return {
    // config using fetched data
  }
})
```

## Key Configuration Options

### Root and Base

```ts
export default defineConfig({
  root: './src',           // Project root directory (where index.html is)
  base: '/my-app/',        // Public base path for assets
  publicDir: 'public',     // Static assets directory
  cacheDir: 'node_modules/.vite'  // Cache directory
})
```

### Resolve Aliases

```ts
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src/components')
    },
    // File extensions to try for imports without extension
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  }
})
```

### Define Global Constants

```ts
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __API_URL__: JSON.stringify('https://api.example.com')
  }
})
```

Values must be JSON-serializable or a single identifier. Add TypeScript declarations:

```ts
// vite-env.d.ts
declare const __APP_VERSION__: string
declare const __API_URL__: string
```

### JSON Handling

```ts
export default defineConfig({
  json: {
    namedExports: true,  // Support named imports from JSON
    stringify: 'auto'    // Stringify large JSON for performance
  }
})
```

## Using Environment Variables in Config

Variables from `.env` files are NOT automatically available in config. Use `loadEnv`:

```ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load env vars from .env files
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    },
    server: {
      port: env.APP_PORT ? Number(env.APP_PORT) : 5173
    }
  }
})
```

## Specifying Config File

```bash
vite --config my-config.ts
```

## Config Loading Methods

```bash
# Default: bundle with Rolldown (may have issues in monorepos)
vite

# Use module runner (no temp file, transforms on the fly)
vite --configLoader runner

# Use native runtime (requires Node.js with TypeScript support)
vite --configLoader native
```

<!-- 
Source references:
- https://vite.dev/config/
-->
