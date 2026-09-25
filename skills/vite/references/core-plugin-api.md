---
name: vite-plugin-api
description: Vite plugin authoring with Vite-specific hooks
---

# Vite Plugin API

Vite plugins extend Rolldown's plugin interface with Vite-specific hooks.

## Basic Structure

```ts
function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    // hooks...
  }
}
```

## Vite-Specific Hooks

### config

Modify config before resolution:

```ts
const plugin = () => ({
  name: 'add-alias',
  config: () => ({
    resolve: {
      alias: { foo: 'bar' },
    },
  }),
})
```

### configResolved

Access final resolved config:

```ts
const plugin = () => {
  let config: ResolvedConfig
  return {
    name: 'read-config',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    transform(code, id) {
      if (config.command === 'serve') { /* dev */ }
    },
  }
}
```

### configureServer

Add custom middleware to dev server:

```ts
const plugin = () => ({
  name: 'custom-middleware',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // handle request
      next()
    })
  },
})
```

Return function to run **after** internal middlewares:

```ts
configureServer(server) {
  return () => {
    server.middlewares.use((req, res, next) => {
      // runs after Vite's middlewares
    })
  }
}
```

### transformIndexHtml

Transform HTML entry files:

```ts
const plugin = () => ({
  name: 'html-transform',
  transformIndexHtml(html) {
    return html.replace(/<title>(.*?)<\/title>/, '<title>New Title</title>')
  },
})
```

Inject tags:

```ts
transformIndexHtml() {
  return [
    { tag: 'script', attrs: { src: '/inject.js' }, injectTo: 'body' },
  ]
}
```

### handleHotUpdate

Custom HMR handling:

```ts
handleHotUpdate({ server, modules, timestamp }) {
  server.ws.send({ type: 'custom', event: 'special-update', data: {} })
  return [] // empty = skip default HMR
}
```

## Virtual Modules

Serve virtual content without files on disk:

```ts
const plugin = () => {
  const virtualModuleId = 'virtual:my-module'
  const resolvedId = '\0' + virtualModuleId

  return {
    name: 'virtual-module',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedId
    },
    load(id) {
      if (id === resolvedId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

Usage:

```ts
import { msg } from 'virtual:my-module'
```

Convention: prefix user-facing path with `virtual:`, prefix resolved id with `\0`.

## Plugin Ordering

Use `enforce` to control execution order:

```ts
{
  name: 'pre-plugin',
  enforce: 'pre',  // runs before core plugins
}

{
  name: 'post-plugin',
  enforce: 'post', // runs after build plugins
}
```

Order: Alias → `enforce: 'pre'` → Core → User (no enforce) → Build → `enforce: 'post'` → Post-build

## Conditional Application

```ts
{
  name: 'build-only',
  apply: 'build',  // or 'serve'
}

// Function form:
{
  apply(config, { command }) {
    return command === 'build' && !config.build.ssr
  }
}
```

## Rolldown Hooks (dev + build)

These come from Rolldown and are **per-environment** (`this.environment` available):

- `resolveId(id, importer)` - Resolve import paths
- `load(id)` - Load module content
- `transform(code, id)` - Transform module code

```ts
transform(code, id) {
  if (id.endsWith('.custom')) {
    return { code: compile(code), map: null }
  }
}
```

### Hook Filters (Vite 8)

Prefer the object form with `filter` + `handler` for `transform`/`resolveId`/`load` — filtering runs in Rust, avoiding a JS call per module:

```ts
import { exactRegex } from '@rolldown/pluginutils' // also from 'rolldown/filter'

const plugin = () => ({
  name: 'transform-file',
  transform: {
    filter: { id: /\.custom$/ },
    handler(code, id) {
      return { code: compile(code), map: null }
    },
  },
})
```

`@rolldown/pluginutils` exports helpers like `exactRegex` and `prefixRegex`.

## Per-Environment vs Global Hooks (Vite 8)

- **Global** (called once, no `this.environment`): `config`, `configResolved`, `configureServer`, `configurePreviewServer`, `closeServer`, `closePreviewServer`, `buildApp`.
- **Per-environment** (called per environment, expose `this.environment`): all Rolldown hooks, `transformIndexHtml`, `handleHotUpdate`/`hotUpdate`, `configEnvironment`, `applyToEnvironment`.

## Cleanup Hooks (Vite 8)

`closeServer({ reason })` runs after the dev server is torn down (`reason` is `'restart'` or `'close'`); `closePreviewServer()` is the preview equivalent. Use to dispose resources created in `configureServer`.

```ts
{
  name: 'close-server',
  configureServer(server) { this.resource = createResource() },
  async closeServer({ reason }) {
    if (reason === 'close') await this.resource.dispose()
  },
}
```

## Plugin Context Meta (Vite 8)

- `this.meta.viteVersion` — current Vite version string.
- `this.meta.rolldownVersion` — only defined on Rolldown-powered Vite (8+); use it to branch behavior.

## Output Bundle Metadata

During build, Vite augments Rolldown output objects with `viteMetadata` — inspect emitted CSS/assets without `build.manifest`:

```ts
{
  name: 'output-metadata',
  enforce: 'post',
  generateBundle(_, bundle) {
    for (const output of Object.values(bundle)) {
      const css = output.viteMetadata?.importedCss       // Set<string>
      const assets = output.viteMetadata?.importedAssets  // Set<string>
    }
  },
}
```

## Referencing Emitted Assets

`this.emitFile({ type: 'asset', ... })` returns a `referenceId`; resolve its final URL later:

- In JS: `import.meta.ROLLDOWN_FILE_URL_<referenceId>`
- In CSS/HTML: `__VITE_ASSET__<referenceId>__`

## Client-Server Communication

Server to client:

```ts
configureServer(server) {
  server.ws.send('my:event', { msg: 'hello' })
}
```

Client side:

```ts
if (import.meta.hot) {
  import.meta.hot.on('my:event', (data) => {
    console.log(data.msg)
  })
}
```

Client to server:

```ts
// Client
import.meta.hot.send('my:from-client', { msg: 'Hey!' })

// Server
server.ws.on('my:from-client', (data, client) => {
  client.send('my:ack', { msg: 'Got it!' })
})
```

<!--
Source references:
- https://vite.dev/guide/api-plugin
-->
