---
name: advanced-api
description: Vite's JavaScript API for programmatic usage
---

# JavaScript API

Vite's APIs are fully typed. Use TypeScript or enable JS type checking for intellisense.

## `createServer`

Create a development server programmatically:

```ts
import { createServer } from 'vite'

const server = await createServer({
  configFile: false,
  root: __dirname,
  server: {
    port: 1337
  }
})

await server.listen()
server.printUrls()
server.bindCLIShortcuts({ print: true })
```

### ViteDevServer Interface

```ts
interface ViteDevServer {
  config: ResolvedConfig
  middlewares: Connect.Server      // Connect app for custom middleware
  httpServer: http.Server | null   // Node HTTP server
  watcher: FSWatcher               // Chokidar watcher
  ws: WebSocketServer              // WebSocket for HMR
  moduleGraph: ModuleGraph         // Module import relationships
  
  // Transform without HTTP
  transformRequest(url: string): Promise<TransformResult | null>
  
  // Apply HTML transforms
  transformIndexHtml(url: string, html: string): Promise<string>
  
  // Load module for SSR
  ssrLoadModule(url: string): Promise<Record<string, any>>
  
  // Fix SSR error stack traces
  ssrFixStacktrace(e: Error): void
  
  // Control
  listen(port?: number): Promise<ViteDevServer>
  restart(): Promise<void>
  close(): Promise<void>
}
```

## `build`

Build for production:

```ts
import { build } from 'vite'

await build({
  root: './project',
  base: '/foo/',
  build: {
    rolldownOptions: {
      // ...
    }
  }
})
```

## `preview`

Preview production build locally:

```ts
import { preview } from 'vite'

const previewServer = await preview({
  preview: {
    port: 8080,
    open: true
  }
})

previewServer.printUrls()
```

## `resolveConfig`

Resolve config without starting server:

```ts
import { resolveConfig } from 'vite'

const config = await resolveConfig(
  { root: './project' },
  'serve',        // 'serve' | 'build'
  'development'   // default mode
)
```

## `mergeConfig`

Deep merge two configs:

```ts
import { mergeConfig } from 'vite'

const merged = mergeConfig(baseConfig, overrideConfig)
```

Merge callback config:

```ts
import { defineConfig, mergeConfig } from 'vite'

export default defineConfig((env) =>
  mergeConfig(configAsCallback(env), configAsObject)
)
```

## `loadEnv`

Load .env files:

```ts
import { loadEnv } from 'vite'

// Load VITE_* vars
const env = loadEnv('development', process.cwd())

// Load all vars (empty prefix)
const allEnv = loadEnv('development', process.cwd(), '')
```

## `searchForWorkspaceRoot`

Find monorepo workspace root:

```ts
import { searchForWorkspaceRoot } from 'vite'

const workspaceRoot = searchForWorkspaceRoot(process.cwd())
```

## `normalizePath`

Normalize paths for cross-platform:

```ts
import { normalizePath } from 'vite'

normalizePath('foo\\bar')  // 'foo/bar'
```

## `transformWithOxc`

Transform JS/TS with Oxc Transformer:

```ts
import { transformWithOxc } from 'vite'

const result = await transformWithOxc(
  code,
  'file.ts',
  { target: 'es2020' }
)
```

## `preprocessCSS`

Pre-process CSS files:

```ts
import { preprocessCSS, resolveConfig } from 'vite'

const config = await resolveConfig({}, 'serve')
const result = await preprocessCSS(code, 'styles.scss', config)
// result.code - plain CSS
// result.modules - CSS modules mapping
```

## `loadConfigFromFile`

Load config file manually:

```ts
import { loadConfigFromFile } from 'vite'

const result = await loadConfigFromFile(
  { command: 'serve', mode: 'development' },
  'vite.config.ts'
)
// result.config, result.path, result.dependencies
```

## InlineConfig

Extends UserConfig with:

```ts
interface InlineConfig extends UserConfig {
  configFile?: string | false  // Config file path or false to skip
  mode?: string
}
```

<!-- 
Source references:
- https://vite.dev/guide/api-javascript.html
-->
