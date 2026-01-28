---
name: core-features
description: Core Vite features including TypeScript, JSX, CSS, and HTML processing
---

# Core Features

## TypeScript

Vite supports `.ts` files out of the box with transpilation via Oxc Transformer (20-30x faster than tsc).

### Important: Transpile Only

Vite does NOT perform type checking. Run type checking separately:

```bash
# Production build
tsc --noEmit && vite build

# During development (separate process)
tsc --noEmit --watch

# Or use vite-plugin-checker for browser error reporting
```

### TypeScript Configuration

Required `tsconfig.json` settings:

```json
{
  "compilerOptions": {
    "isolatedModules": true,
    "useDefineForClassFields": true,
    "skipLibCheck": true
  }
}
```

### Client Types

Add Vite's client types for `import.meta.env` and asset imports:

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

This provides types for:
- Asset imports (`.svg`, `.png`, etc.)
- `import.meta.env` constants
- `import.meta.hot` HMR API

### Custom Type Overrides

Override default asset import types:

```ts
// vite-env-override.d.ts
declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGElement>>
  export default content
}
```

### Path Aliases with tsconfig

Enable tsconfig paths resolution:

```ts
// vite.config.ts
export default defineConfig({
  resolve: {
    tsconfigPaths: true
  }
})
```

## JSX

`.jsx` and `.tsx` files are supported out of the box. Custom JSX configuration:

```ts
export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'classic',  // or 'automatic'
      pragma: 'h',
      pragmaFrag: 'Fragment'
    },
    // Auto-inject JSX helpers
    jsxInject: `import React from 'react'`
  }
})
```

## HTML

`index.html` is the entry point, not tucked away in `public/`. Vite processes it as part of the module graph.

### Supported Elements

Vite processes these HTML element attributes:

- `<script type="module" src>`
- `<link href>` (stylesheets)
- `<img src>`, `<img srcset>`
- `<video src>`, `<video poster>`
- `<audio src>`
- `<source src>`, `<source srcset>`
- `<meta content>` (for og:image, twitter:image, etc.)

### Opt-out of Processing

```html
<script vite-ignore type="module" src="https://cdn.example.com/lib.js"></script>
```

### Multi-Page Apps

Access any HTML file by its path:

- `<root>/index.html` → `http://localhost:5173/`
- `<root>/about.html` → `http://localhost:5173/about.html`
- `<root>/blog/index.html` → `http://localhost:5173/blog/index.html`

## JSON

Direct import with named exports support:

```ts
// Import entire object
import json from './data.json'

// Named imports (tree-shakeable)
import { field } from './data.json'
```

## Framework Support

Official framework plugins:

| Framework | Plugin |
|-----------|--------|
| Vue 3 | `@vitejs/plugin-vue` |
| Vue 3 JSX | `@vitejs/plugin-vue-jsx` |
| React | `@vitejs/plugin-react` |
| React (SWC) | `@vitejs/plugin-react-swc` |
| React Server Components | `@vitejs/plugin-rsc` |
| Legacy browsers | `@vitejs/plugin-legacy` |

## Content Security Policy

Configure nonce for CSP:

```ts
export default defineConfig({
  html: {
    cspNonce: 'PLACEHOLDER'  // Replace per-request
  }
})
```

<!-- 
Source references:
- https://vite.dev/guide/features.html
-->
