---
name: build-library
description: Building libraries with Vite including proper package.json exports
---

# Library Mode

Build browser-oriented libraries for distribution.

## Basic Configuration

```ts
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',           // Global variable name for UMD
      fileName: 'my-lib'       // Output filename (without extension)
    },
    rolldownOptions: {
      external: ['vue'],       // Don't bundle these
      output: {
        globals: {
          vue: 'Vue'           // Global var for externals in UMD
        }
      }
    }
  }
})
```

## Multiple Entry Points

```ts
export default defineConfig({
  build: {
    lib: {
      entry: {
        'my-lib': resolve(__dirname, 'lib/main.js'),
        'secondary': resolve(__dirname, 'lib/secondary.js')
      },
      name: 'MyLib'
    }
  }
})
```

## Output Formats

Single entry defaults: `['es', 'umd']`
Multiple entries defaults: `['es', 'cjs']`

```ts
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      formats: ['es', 'cjs', 'umd', 'iife']
    }
  }
})
```

## Custom File Names

```ts
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      cssFileName: 'styles'  // For bundled CSS
    }
  }
})
```

## Package.json Configuration

### Single Entry

```json
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

### Multiple Entries

```json
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

### With CSS

```json
{
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    },
    "./style.css": "./dist/my-lib.css"
  }
}
```

## Library Entry File

```ts
// lib/main.js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

export { Foo, Bar }
```

## Environment Variables

In library mode:
- `import.meta.env.*` is statically replaced
- `process.env.*` is NOT replaced (consumers can change it)

To replace `process.env`:

```ts
export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
```

## Notes

- `assetsInlineLimit` is ignored - assets always inlined
- `cssCodeSplit` defaults to `false`
- For non-browser libraries, consider using [tsdown](https://tsdown.dev/) or Rolldown directly

<!-- 
Source references:
- https://vite.dev/guide/build.html#library-mode
-->
