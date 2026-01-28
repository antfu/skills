---
name: features-dep-bundling
description: Dependency pre-bundling configuration and caching
---

# Dependency Pre-Bundling

Vite pre-bundles dependencies on first run for faster dev server startup.

## Why Pre-Bundling

1. **CommonJS/UMD to ESM** - Convert non-ESM dependencies
2. **Performance** - Bundle many internal modules into single file (e.g., lodash-es has 600+ modules)

```ts
// Works thanks to smart import analysis
import React, { useState } from 'react'
```

## Automatic Discovery

Vite crawls source code to find bare imports and pre-bundles them with Rolldown.

New dependencies discovered after server start trigger re-bundling.

## Including Dependencies

Force pre-bundling for dependencies not auto-discovered:

```ts
export default defineConfig({
  optimizeDeps: {
    include: [
      'some-package',
      'another-package/nested'  // Deep imports
    ]
  }
})
```

**When to include:**
- Dynamically imported (via plugin transform)
- Large dependencies with many internal modules
- CommonJS dependencies

## Excluding Dependencies

Skip pre-bundling for small ESM-only dependencies:

```ts
export default defineConfig({
  optimizeDeps: {
    exclude: ['small-esm-dep']
  }
})
```

## Monorepo Linked Dependencies

Linked packages are treated as source code by default. If not ESM:

```ts
export default defineConfig({
  optimizeDeps: {
    include: ['linked-dep']
  }
})
```

Restart with `--force` after making changes to linked deps.

## Custom Rolldown Options

```ts
export default defineConfig({
  optimizeDeps: {
    rolldownOptions: {
      plugins: [/* Rolldown plugins */],
      // Other Rolldown options
    }
  }
})
```

## Caching

### File System Cache

Located in `node_modules/.vite`. Re-runs when:

- Package lockfile changes (`package-lock.json`, `pnpm-lock.yaml`, etc.)
- Patches folder modified
- `vite.config.js` changes
- `NODE_ENV` changes

Force re-bundle:

```bash
vite --force
# Or delete node_modules/.vite
```

### Browser Cache

Pre-bundled deps are cached with `max-age=31536000,immutable`.

To debug dependencies with local edits:

1. Disable cache in browser DevTools Network tab
2. Restart Vite with `--force`
3. Reload page

## Entries

Specify custom entry points for discovery:

```ts
export default defineConfig({
  optimizeDeps: {
    entries: [
      'src/main.ts',
      'src/other-entry.ts'
    ]
  }
})
```

By default, all HTML files are used as entries.

## esbuildOptions (Deprecated)

Use `rolldownOptions` instead:

```ts
export default defineConfig({
  optimizeDeps: {
    // Deprecated
    esbuildOptions: {},
    // Use instead
    rolldownOptions: {}
  }
})
```

<!-- 
Source references:
- https://vite.dev/guide/dep-pre-bundling.html
-->
