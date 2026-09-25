---
name: vitepress-routing
description: File-based routing, source directory structure, clean URLs, and route rewrites
---

# Routing

VitePress uses file-based routing where markdown files map directly to HTML pages.

## File to URL Mapping

```
.
├─ index.md           →  /index.html (/)
├─ about.md           →  /about.html
├─ guide/
│  ├─ index.md        →  /guide/index.html (/guide/)
│  └─ getting-started.md → /guide/getting-started.html
```

## Project Structure

```
.
├─ docs                    # Project root
│  ├─ .vitepress          # VitePress directory
│  │  ├─ config.ts        # Configuration
│  │  ├─ theme/           # Custom theme
│  │  ├─ cache/           # Dev server cache (gitignore)
│  │  └─ dist/            # Build output (gitignore)
│  ├─ public/             # Static assets (copied as-is)
│  ├─ index.md            # Home page
│  └─ guide/
│     └─ intro.md
```

## Source Directory

Separate source files from project root:

```ts
// .vitepress/config.ts
export default {
  srcDir: './src'  // Markdown files live in ./src/
}
```

With `srcDir: 'src'`:

```
.
├─ .vitepress/           # Config stays at project root
└─ src/                  # Source directory
   ├─ index.md          →  /
   └─ guide/intro.md    →  /guide/intro.html
```

## Linking Between Pages

Use relative or absolute paths. Omit file extensions:

```md
<!-- Recommended -->
[Getting Started](./getting-started)
[Guide](/guide/)

<!-- Works but not recommended -->
[Getting Started](./getting-started.md)
[Getting Started](./getting-started.html)
```

## Clean URLs

Remove `.html` extension from URLs (requires server support):

```ts
export default {
  cleanUrls: true
}
```

**Server requirements:**
- Netlify, GitHub Pages: Supported by default
- Vercel: Enable `cleanUrls` in `vercel.json`
- Nginx: Configure `try_files $uri $uri.html $uri/ =404`

## Route Rewrites

Customize the mapping between source and output paths:

```ts
export default {
  rewrites: {
    // Static mapping
    'packages/pkg-a/src/index.md': 'pkg-a/index.md',
    'packages/pkg-a/src/foo.md': 'pkg-a/foo.md',
    
    // Dynamic parameters
    'packages/:pkg/src/:slug*': ':pkg/:slug*'
  }
}
```

This maps `packages/pkg-a/src/intro.md` → `/pkg-a/intro.html`.

**Important:** Relative links in rewritten files should be based on the rewritten path, not the source path.

Rewrites can also be a function:

```ts
export default {
  rewrites(id) {
    return id.replace(/^packages\/([^/]+)\/src\//, '$1/')
  }
}
```

## Public Directory

Files in `public/` are copied to output root as-is:

```
docs/public/
  ├─ favicon.ico     →  /favicon.ico
  ├─ robots.txt      →  /robots.txt
  └─ images/logo.png →  /images/logo.png
```

Reference with absolute paths:

```md
![Logo](/images/logo.png)
```

## Base URL

For sub-path deployment (e.g., GitHub Pages):

```ts
export default {
  base: '/repo-name/'
}
```

Set `base: './'` for a **relocatable build** (v2): pages reference everything
relative to their own location, so the same output works from any sub-path or
`file://` without rebuilding. Keep `cleanUrls` off when doing this.

All absolute paths are automatically prefixed with base. For dynamic paths in components, use `withBase`:

```vue
<script setup>
import { withBase } from 'vitepress'
</script>

<template>
  <img :src="withBase('/logo.png')" />
</template>
```

## Key Points

- `index.md` files map to directory root (`/guide/` instead of `/guide/index`)
- Use paths without extensions in links for flexibility
- `srcDir` separates source from config
- `cleanUrls` removes `.html` but requires server support
- `rewrites` enables complex source structures with clean output URLs
- `base: './'` produces a relocatable build that runs from any path or `file://`
- Dynamic routes: wrap `.paths.ts` loaders with `defineRoutes` for type hints (see dynamic-routes)

<!--
Source references:
- https://vitepress.dev/guide/routing
- https://vitepress.dev/guide/asset-handling
-->
