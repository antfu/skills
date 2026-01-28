---
name: build-ssr
description: Server-side rendering setup and configuration with Vite
---

# Server-Side Rendering (SSR)

Low-level API for framework authors. For applications, use higher-level tools from [Awesome Vite SSR](https://github.com/vitejs/awesome-vite#ssr).

## Project Structure

```
├── index.html
├── server.js              # Express/Node server
└── src/
    ├── main.js            # Universal app code
    ├── entry-client.js    # Mounts app to DOM
    └── entry-server.js    # Renders app with SSR API
```

## index.html

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="app"><!--ssr-outlet--></div>
    <script type="module" src="/src/entry-client.js"></script>
  </body>
</html>
```

## Development Server

```ts
// server.js
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  app.use(vite.middlewares)

  app.use('*all', async (req, res, next) => {
    const url = req.originalUrl

    try {
      // 1. Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      )

      // 2. Apply Vite transforms
      template = await vite.transformIndexHtml(url, template)

      // 3. Load server entry
      const { render } = await vite.ssrLoadModule('/src/entry-server.js')

      // 4. Render app HTML
      const appHtml = await render(url)

      // 5. Inject into template
      const html = template.replace('<!--ssr-outlet-->', appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      next(e)
    }
  })

  app.listen(5173)
}

createServer()
```

## Conditional Logic

```ts
if (import.meta.env.SSR) {
  // Server-only code (tree-shaken on client)
}
```

## Production Build

```json
{
  "scripts": {
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

### Production Server

```ts
// Differences from dev:
// 1. Use dist/client/index.html as template
// 2. Use import('./dist/server/entry-server.js') instead of ssrLoadModule
// 3. Serve static files from dist/client
```

## SSR Manifest

For preload directives:

```bash
vite build --outDir dist/client --ssrManifest
```

Generates `dist/client/.vite/ssr-manifest.json` with module-to-chunk mappings.

## SSR Externals

Dependencies are externalized by default. To transform with Vite:

```ts
export default defineConfig({
  ssr: {
    noExternal: ['package-that-needs-transform'],
    external: ['package-to-externalize']
  }
})
```

## SSR-specific Plugin Logic

```ts
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // SSR-specific transform
      }
    }
  }
}
```

## SSR Target

```ts
export default defineConfig({
  ssr: {
    target: 'node',      // Default
    // target: 'webworker'  // For edge runtimes
  }
})
```

## SSR Bundle

Bundle all dependencies (for workers):

```ts
export default defineConfig({
  ssr: {
    noExternal: true  // Bundle everything
  }
})
```

## Resolve Conditions

```ts
export default defineConfig({
  ssr: {
    resolve: {
      conditions: ['node'],
      externalConditions: ['node']
    }
  }
})
```

## Pre-Rendering / SSG

Pre-render routes with known data into static HTML at build time.

<!-- 
Source references:
- https://vite.dev/guide/ssr.html
-->
