---
name: advanced-backend
description: Integrating Vite with traditional backend frameworks
---

# Backend Integration

Integrate Vite with traditional backends (Rails, Laravel, etc.) for asset serving.

## Configuration

```ts
// vite.config.ts
export default defineConfig({
  server: {
    cors: {
      origin: 'http://my-backend.example.com'
    }
  },
  build: {
    manifest: true,  // Generate .vite/manifest.json
    rolldownOptions: {
      input: '/path/to/main.js'  // Override HTML entry
    }
  }
})
```

Import polyfill in entry:

```ts
// main.js
import 'vite/modulepreload-polyfill'
```

## Development

Inject Vite client and entry in your backend template:

```html
<!-- Development only -->
<script type="module" src="http://localhost:5173/@vite/client"></script>
<script type="module" src="http://localhost:5173/main.js"></script>
```

### React Setup

Add before other scripts:

```html
<script type="module">
  import RefreshRuntime from 'http://localhost:5173/@react-refresh'
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true
</script>
```

### Asset Proxying

Either:
1. Proxy static asset requests to Vite
2. Set `server.origin`:

```ts
export default defineConfig({
  server: {
    origin: 'http://localhost:5173'
  }
})
```

## Production

Build generates `.vite/manifest.json`:

```json
{
  "views/foo.js": {
    "file": "assets/foo-BRBmoGS9.js",
    "src": "views/foo.js",
    "isEntry": true,
    "imports": ["_shared-B7PI925R.js"],
    "css": ["assets/foo-5UjPuW-k.css"]
  },
  "_shared-B7PI925R.js": {
    "file": "assets/shared-B7PI925R.js",
    "css": ["assets/shared-ChJ_j-JJ.css"]
  }
}
```

## Rendering Tags

For entry `views/foo.js`, render in this order:

```html
<!-- 1. Entry CSS -->
<link rel="stylesheet" href="/assets/foo-5UjPuW-k.css" />

<!-- 2. Imported chunks' CSS (recursive) -->
<link rel="stylesheet" href="/assets/shared-ChJ_j-JJ.css" />

<!-- 3. Entry script -->
<script type="module" src="/assets/foo-BRBmoGS9.js"></script>

<!-- 4. Optional: preload imports -->
<link rel="modulepreload" href="/assets/shared-B7PI925R.js" />
```

## Manifest Structure

```ts
interface ManifestChunk {
  src?: string           // Input file name
  file: string          // Output file name
  css?: string[]        // CSS files (JS chunks only)
  assets?: string[]     // Non-CSS assets (JS chunks only)
  isEntry?: boolean     // Is entry point
  isDynamicEntry?: boolean  // Is dynamic import
  imports?: string[]    // Static imports (manifest keys)
  dynamicImports?: string[]  // Dynamic imports (manifest keys)
}
```

## Processing Imports

Recursively collect all imported chunks:

```ts
function getImportedChunks(manifest, name) {
  const seen = new Set()
  const chunks = []
  
  function collect(chunk) {
    for (const file of chunk.imports ?? []) {
      if (seen.has(file)) continue
      seen.add(file)
      
      const importee = manifest[file]
      collect(importee)
      chunks.push(importee)
    }
  }
  
  collect(manifest[name])
  return chunks
}
```

## Existing Integrations

Check [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) for:
- Laravel (laravel-vite)
- Rails
- Django
- Flask
- And more

<!-- 
Source references:
- https://vite.dev/guide/backend-integration.html
-->
