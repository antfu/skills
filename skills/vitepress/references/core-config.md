---
name: vitepress-configuration
description: Config file setup, defineConfig helper, site metadata, and build options
---

# Configuration

VitePress configuration is defined in `.vitepress/config.[js|ts|mjs|mts]`. Use `defineConfig` for TypeScript intellisense.

## Basic Config

```ts
// .vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  // Site metadata
  title: 'My Docs',
  description: 'Documentation site',
  lang: 'en-US',
  
  // URL base path (for GitHub Pages: '/repo-name/')
  base: '/',
  
  // Theme configuration
  themeConfig: {
    // See theme-config.md
  }
})
```

## Site Metadata

```ts
export default defineConfig({
  title: 'VitePress',           // Displayed in nav, used in page titles
  titleTemplate: ':title - Docs', // Page title format (:title = h1)
  description: 'Site description', // Meta description
  lang: 'en-US',                 // HTML lang attribute
  dir: 'ltr',                    // Text direction: 'ltr' | 'rtl' | 'auto' (see i18n RTL)

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['script', { async: '', src: 'https://analytics.example.com/script.js' }]
  ]
})
```

## Build Options

```ts
export default defineConfig({
  // Source files directory (relative to project root)
  srcDir: './src',
  
  // Exclude patterns from source
  srcExclude: ['**/README.md', '**/TODO.md'],
  
  // Output directory
  outDir: './.vitepress/dist',
  
  // Cache directory
  cacheDir: './.vitepress/cache',
  
  // Clean URLs without .html extension (requires server support)
  cleanUrls: true,
  
  // Ignore dead links during build
  ignoreDeadLinks: true,
  // Or specific patterns:
  ignoreDeadLinks: ['/playground', /^https?:\/\/localhost/],
  
  // Get last updated timestamp from git
  lastUpdated: true
})
```

## Base URL & Relocatable Builds

`base` must start and end with `/` for sub-path deployment. The one exception is
`'./'`, which produces a **relocatable build**: every page references assets and
other pages relative to its own location, so the same output works from any
sub-path (IPFS gateways, archives, `file://`) without rebuilding. Keep
`cleanUrls` off for relocatable builds. Can also be set per build with
`vitepress build --base /base/`.

## Serving Assets from a CDN (v2)

```ts
export default defineConfig({
  base: '/',
  assetsBase: 'https://cdn.example.com/', // scripts, styles, fonts, imported images → CDN
  assetsShards: 4 // spread assets over assets/0..N-1 (for hosts that cap files per dir)
})
```

Upload `outDir/assets` to the CDN so it is reachable at `<assetsBase>/assets/*`.
HTML pages, `public/` files, and Markdown links stay on `base`. A cross-origin
CDN must send `Access-Control-Allow-Origin` (module scripts are fetched in CORS
mode). Can also be passed per build: `vitepress build --assetsBase "$CDN_URL"`.

## Icons (v2)

The build collects iconify icons rendered during SSR and emits their styles.
Icons rendered only on the client (inside `<ClientOnly>` or after hydration)
must be listed explicitly. Names are `collection:name`, resolved against the
`@iconify-json/*` packages in your dependencies.

```ts
export default defineConfig({
  icons: {
    include: ['mdi:home', 'simple-icons:discord']
  }
})
```

## Route Rewrites

Map source paths to different output paths:

```ts
export default defineConfig({
  rewrites: {
    // Static mapping
    'packages/pkg-a/src/index.md': 'pkg-a/index.md',
    
    // Dynamic parameters
    'packages/:pkg/src/:slug*': ':pkg/:slug*'
  }
})
```

## Appearance (Dark Mode)

```ts
export default defineConfig({
  appearance: true,           // Enable toggle (default)
  appearance: 'dark',         // Dark by default
  appearance: 'force-dark',   // Always dark, no toggle
  appearance: 'force-auto',   // Always follow system preference
  appearance: false           // Disable dark mode
})
```

## Vite & Vue Configuration

```ts
export default defineConfig({
  // Pass options to Vite
  vite: {
    plugins: [],
    resolve: { alias: {} },
    css: { preprocessorOptions: {} }
  },
  
  // Pass options to @vitejs/plugin-vue
  vue: {
    template: { compilerOptions: {} }
  },
  
  // Configure markdown-it
  markdown: {
    lineNumbers: true,
    toc: { level: [1, 2, 3] },
    math: true, // Requires markdown-it-mathjax3
    headers: true, // Collect headings into useData().page.headers (off by default)
    image: { lazyLoad: true }, // Renamed from `lazyLoading` in v2
    container: {
      tipLabel: 'TIP',
      warningLabel: 'WARNING',
      dangerLabel: 'DANGER',
      // Register additional containers → default titles (v2)
      customContainers: { success: 'SUCCESS' }
    }
  }
})
```

## Build Hooks

```ts
export default defineConfig({
  // Transform page data
  transformPageData(pageData, { siteConfig }) {
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'meta', { name: 'og:title', content: pageData.title }
    ])
  },
  
  // Transform head before generating each page
  async transformHead(context) {
    return [['meta', { name: 'custom', content: context.page }]]
  },
  
  // After build completes
  async buildEnd(siteConfig) {
    // Generate sitemap, RSS, etc.
  }
})
```

## Directory-Level Overrides (v2)

Override config settings for all pages in a directory by adding a `config.ts`
(or `.js`/`.mjs`/`.mts`) in that directory. Nested directories inherit and merge
from their parent. Use `defineAdditionalConfig` for intellisense.

```ts
// es/config.ts
import { defineAdditionalConfig } from 'vitepress'

export default defineAdditionalConfig({
  description: 'Generador de Sitios Estáticos con Vite y Vue.'
})
```

Only certain settings support this (title, titleTemplate, description, head,
lang, dir). The markdown renderer is created once for the whole site, so
markdown/per-locale markdown strings can only live in the main config.

## Typed Theme Config

`defineConfigWithTheme` is deprecated in v2. Pass the theme config type to
`defineConfig` instead:

```ts
import { defineConfig } from 'vitepress'
import type { ThemeConfig } from 'awesome-vitepress-theme'

export default defineConfig<ThemeConfig>({
  extends: baseConfig,
  themeConfig: { /* typed as ThemeConfig */ }
})
```

## Dynamic Config

For async configuration:

```ts
export default async () => {
  const data = await fetch('https://api.example.com/data').then(r => r.json())
  
  return defineConfig({
    title: data.title,
    themeConfig: {
      sidebar: data.sidebar
    }
  })
}
```

## Key Points

- Config file supports `.js`, `.ts`, `.mjs`, `.mts` extensions
- Use `defineConfig` for TypeScript support (`defineConfig<ThemeConfig>` for typed theme config; `defineConfigWithTheme` is deprecated)
- `base` must start and end with `/`; `base: './'` enables relocatable builds
- `srcDir` separates source files from project root
- Build hooks enable custom transformations and post-processing
- v2: `assetsBase`/`assetsShards`/`icons` are new; `metaChunk` was removed; `defineAdditionalConfig` enables directory-level overrides

<!--
Source references:
- https://vitepress.dev/reference/site-config
- https://vitepress.dev/guide/getting-started
- https://vitepress.dev/guide/asset-handling
-->
