---
name: advanced-performance
description: Performance optimization tips for Vite dev server and builds
---

# Performance Optimization

## Browser Setup

- Use dev-only browser profile without extensions
- Disable "Disable Cache" in DevTools when using Vite
- Extensions can interfere with requests and slow startup

## Audit Plugin Performance

1. **Lazy load large dependencies** in plugins
2. **Avoid long operations** in `buildStart`, `config`, `configResolved`
3. **Optimize transform hooks** - check `id` extension before processing

Debug transform times:

```bash
vite --debug plugin-transform
```

Use [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) to inspect transforms.

## Profiling

```bash
vite --profile
# Visit site, press 'p + enter' to record .cpuprofile
# Open in https://www.speedscope.app
```

## Reduce Resolve Operations

Be explicit with extensions to avoid filesystem checks:

```ts
// Slow: checks .mjs, .js, .mts, .ts, .jsx, .tsx, .json
import Component from './Component'

// Fast: direct hit
import Component from './Component.tsx'
```

Enable TypeScript path resolution for explicit imports:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true
  }
}
```

## Avoid Barrel Files

Barrel files (`index.js` re-exporting everything) cause all files to load:

```ts
// Slow: loads all utils
import { slash } from './utils'

// Fast: loads only slash.js
import { slash } from './utils/slash.js'
```

## Warm Up Frequently Used Files

Pre-transform files that are always loaded:

```ts
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/components/BigComponent.vue',
        './src/utils/big-utils.js'
      ],
      ssrFiles: ['./src/server/modules/*.js']
    }
  }
})
```

Find files to warm up:

```bash
vite --debug transform
```

## Use Native/Less Tooling

**Do less work:**
- CSS instead of Sass/Less (PostCSS has nesting)
- Don't transform SVGs to components - import as strings/URLs
- Skip Babel in `@vitejs/plugin-react` if not needed

**Use native tools:**
- Try Lightning CSS for faster CSS processing

```ts
export default defineConfig({
  css: {
    transformer: 'lightningcss'
  }
})
```

## Server Options

### Open Browser Automatically

Triggers warmup of entry point:

```ts
export default defineConfig({
  server: {
    open: true
  }
})
```

### Limit File Watching

```ts
export default defineConfig({
  server: {
    watch: {
      ignored: ['**/large-folder/**']
    }
  }
})
```

## Build Performance

### Disable Reporting

Skip gzip size calculation for large projects:

```ts
export default defineConfig({
  build: {
    reportCompressedSize: false
  }
})
```

### Sourcemaps

Disable if not needed:

```ts
export default defineConfig({
  build: {
    sourcemap: false
  }
})
```

<!-- 
Source references:
- https://vite.dev/guide/performance.html
-->
