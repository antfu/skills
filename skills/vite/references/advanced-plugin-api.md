---
name: advanced-plugin-api
description: Creating Vite plugins, hooks, virtual modules, and client-server communication
---

# Plugin API

Vite plugins extend Rolldown's plugin interface with Vite-specific hooks.

## Basic Plugin Structure

```ts
export default function myPlugin(options = {}) {
  return {
    name: 'vite-plugin-my-plugin',
    
    // Hooks...
  }
}
```

## Naming Conventions

- Vite-only plugins: `vite-plugin-*`
- Rollup-compatible: `rollup-plugin-*`
- Framework-specific: `vite-plugin-vue-*`, `vite-plugin-react-*`

## Universal Hooks (from Rolldown)

Called on server start:
- `options` - Modify Rolldown options
- `buildStart` - Build starting

Called per module request:
- `resolveId` - Resolve import paths
- `load` - Load module content
- `transform` - Transform module code

Called on server close:
- `buildEnd`
- `closeBundle`

## Vite-Specific Hooks

### `config`

Modify config before resolution:

```ts
{
  name: 'modify-config',
  config(config, { command, mode }) {
    if (command === 'build') {
      return {
        resolve: {
          alias: { foo: 'bar' }
        }
      }
    }
  }
}
```

### `configResolved`

Access final resolved config:

```ts
{
  name: 'read-config',
  configResolved(config) {
    this.config = config
  }
}
```

### `configureServer`

Add dev server middleware:

```ts
{
  name: 'configure-server',
  configureServer(server) {
    // Before Vite's middlewares
    server.middlewares.use((req, res, next) => {
      // Handle request
      next()
    })
    
    // Return function to run after Vite's middlewares
    return () => {
      server.middlewares.use((req, res, next) => {
        // Post middleware
      })
    }
  }
}
```

### `transformIndexHtml`

Transform HTML files:

```ts
{
  name: 'html-transform',
  transformIndexHtml(html) {
    return html.replace(/<title>(.*?)<\/title>/, '<title>New Title</title>')
  }
}
```

Inject tags:

```ts
{
  name: 'html-inject',
  transformIndexHtml() {
    return {
      tags: [
        {
          tag: 'script',
          attrs: { src: '/inject.js' },
          injectTo: 'body'  // 'head' | 'body' | 'head-prepend' | 'body-prepend'
        }
      ]
    }
  }
}
```

### `handleHotUpdate`

Custom HMR handling:

```ts
{
  name: 'custom-hmr',
  handleHotUpdate({ file, server, modules }) {
    if (file.endsWith('.custom')) {
      server.ws.send({
        type: 'custom',
        event: 'custom-update',
        data: { file }
      })
      return []  // Prevent default HMR
    }
  }
}
```

## Virtual Modules

Provide build-time information to source code:

```ts
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedId = '\0' + virtualModuleId

  return {
    name: 'virtual-module',
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedId
      }
    },
    
    load(id) {
      if (id === resolvedId) {
        return `export const msg = "from virtual module"`
      }
    }
  }
}
```

Usage:

```ts
import { msg } from 'virtual:my-module'
```

## Client-Server Communication

### Server to Client

```ts
{
  configureServer(server) {
    server.ws.on('connection', () => {
      server.ws.send('my:greetings', { msg: 'hello' })
    })
  }
}
```

Client receives:

```ts
if (import.meta.hot) {
  import.meta.hot.on('my:greetings', (data) => {
    console.log(data.msg)
  })
}
```

### Client to Server

```ts
// Client
if (import.meta.hot) {
  import.meta.hot.send('my:from-client', { msg: 'Hey!' })
}

// Server (in plugin)
{
  configureServer(server) {
    server.ws.on('my:from-client', (data, client) => {
      console.log(data.msg)
      client.send('my:reply', { msg: 'Got it!' })
    })
  }
}
```

## Transform with Filtering

```ts
{
  name: 'transform-js',
  transform: {
    filter: {
      id: /\.js$/  // Only .js files
    },
    handler(code, id) {
      return transformCode(code)
    }
  }
}
```

## Path Normalization

Use POSIX separators for cross-platform compatibility:

```ts
import { normalizePath } from 'vite'

normalizePath('foo\\bar')  // 'foo/bar'
```

<!-- 
Source references:
- https://vite.dev/guide/api-plugin.html
-->
