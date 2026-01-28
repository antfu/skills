---
name: build-production
description: Building for production including targets, multi-page apps, and optimizations
---

# Building for Production

## Basic Build

```bash
vite build
```

Uses `<root>/index.html` as entry point, outputs to `dist/`.

## Browser Compatibility

Default target: Baseline Widely Available browsers (Chrome 111+, Edge 111+, Firefox 114+, Safari 16.4+).

```ts
export default defineConfig({
  build: {
    target: 'es2020',  // Or specific browsers
    // target: ['chrome64', 'firefox78', 'safari12']
  }
})
```

For legacy browsers:

```bash
npm add -D @vitejs/plugin-legacy
```

```ts
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
```

## Output Configuration

```ts
export default defineConfig({
  build: {
    outDir: 'dist',           // Output directory
    assetsDir: 'assets',      // Assets subdirectory
    emptyOutDir: true,        // Clear outDir before build
    sourcemap: true,          // Generate sourcemaps
    // sourcemap: 'inline' | 'hidden'
  }
})
```

## Public Base Path

For deploying under a subpath:

```ts
export default defineConfig({
  base: '/my-app/'
})
```

Relative base (works anywhere):

```ts
export default defineConfig({
  base: './'
})
```

Access in code:

```ts
const base = import.meta.env.BASE_URL
```

## Multi-Page App

```ts
import { resolve } from 'path'

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html')
      }
    }
  }
})
```

## Minification

```ts
export default defineConfig({
  build: {
    minify: 'oxc',     // Default, fastest
    // minify: 'terser',  // More options, slower
    // minify: false,     // Disable
    
    terserOptions: {   // If using terser
      compress: {
        drop_console: true
      }
    }
  }
})
```

## Chunk Strategy

```ts
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Manual chunks configuration
        }
      }
    },
    chunkSizeWarningLimit: 500  // KB
  }
})
```

## CSS Options

```ts
export default defineConfig({
  build: {
    cssCodeSplit: true,         // CSS per async chunk
    cssMinify: 'lightningcss',  // or 'esbuild'
    cssTarget: 'chrome61'       // Different from JS target
  }
})
```

## Asset Handling

```ts
export default defineConfig({
  build: {
    assetsInlineLimit: 4096,    // Inline assets < 4KB as base64
    copyPublicDir: true         // Copy public/ to outDir
  }
})
```

## Manifest

Generate manifest for backend integration:

```ts
export default defineConfig({
  build: {
    manifest: true  // .vite/manifest.json
  }
})
```

## Watch Mode

Rebuild on file changes:

```bash
vite build --watch
```

```ts
export default defineConfig({
  build: {
    watch: {}  // Enable programmatically
  }
})
```

## Load Error Handling

Handle dynamic import failures (e.g., after deployment):

```ts
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload()
})
```

## Build Optimizations (Automatic)

- **CSS code splitting** - CSS per async chunk
- **Preload directives** - `<link rel="modulepreload">`
- **Async chunk optimization** - Parallel fetching of dependencies

## License Generation

Generate license file for dependencies:

```ts
export default defineConfig({
  build: {
    license: true  // .vite/license.md
  }
})
```

<!-- 
Source references:
- https://vite.dev/guide/build.html
- https://vite.dev/config/build-options.html
-->
