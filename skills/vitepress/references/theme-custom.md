---
name: vitepress-custom-themes
description: Building custom themes from scratch with the theme interface, Layout component, and enhanceApp
---

# Custom Themes

Build a theme from scratch when the default theme doesn't fit your needs.

## Theme Entry

Create `.vitepress/theme/index.ts`:

```ts
// .vitepress/theme/index.ts
import Layout from './Layout.vue'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // Register global components, plugins, etc.
  }
}
```

## Theme Interface

```ts
interface Theme {
  // Required: Root layout component
  Layout: Component
  
  // Optional: Enhance Vue app instance
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  
  // Optional (v2): runs inside the root component's setup()
  setup?: () => void
  
  // Optional: Extend another theme (its enhanceApp & setup run first)
  extends?: Theme
}

interface EnhanceAppContext {
  app: App              // Vue app instance
  router: Router        // VitePress router
  siteData: Ref<SiteData>  // Site-level metadata
}
```

## Basic Layout

The Layout component must render `<Content />` for markdown:

```vue
<!-- .vitepress/theme/Layout.vue -->
<script setup>
import { useData } from 'vitepress'
const { page, frontmatter } = useData()
</script>

<template>
  <div class="layout">
    <header>
      <nav>My Site</nav>
    </header>
    
    <main>
      <div v-if="page.isNotFound">
        <h1>404 - Page Not Found</h1>
      </div>
      
      <div v-else-if="frontmatter.layout === 'home'">
        <h1>Welcome!</h1>
      </div>
      
      <article v-else>
        <Content />
      </article>
    </main>
    
    <footer>
      <p>© 2024 My Site</p>
    </footer>
  </div>
</template>
```

## Runtime API

Access VitePress data in your theme:

```vue
<script setup>
import { useData, useRoute, useRouter } from 'vitepress'

// Page and site data
const { 
  site,        // Site config (title, description, etc.)
  theme,       // Theme config
  page,        // Current page data
  frontmatter, // Current page frontmatter
  title,       // Page title
  description, // Page description
  lang,        // Current language
  isDark,      // Dark mode state
  params       // Dynamic route params
} = useData()

// Routing
const route = useRoute()
const router = useRouter()

// Navigate programmatically
const goToGuide = () => router.go('/guide/')
</script>
```

### Route Change Hooks (v2)

Assign handlers on the router instance (also available via `enhanceApp`'s
`router`). Return `false` from `onBeforeRouteChange`/`onBeforePageLoad` to cancel:

```ts
const router = useRouter()
router.onBeforeRouteChange = (to) => { /* return false to cancel */ }
router.onAfterRouteChange = (to) => console.log('navigated to', to)
```

## Built-in Components

```vue
<script setup>
import { Content } from 'vitepress'
</script>

<template>
  <!-- Renders markdown content -->
  <Content />
  
  <!-- Renders slot only on client (SSR-safe) -->
  <ClientOnly>
    <NonSSRComponent />
  </ClientOnly>
</template>
```

## Extend Another Theme

Build on top of default theme or any other:

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Your customizations
  }
}
```

## Register Plugins and Components

```ts
// .vitepress/theme/index.ts
import Layout from './Layout.vue'
import GlobalComponent from './GlobalComponent.vue'

export default {
  Layout,
  enhanceApp({ app }) {
    // Register global component
    app.component('GlobalComponent', GlobalComponent)
    
    // Register plugin
    app.use(MyPlugin)
    
    // Provide/inject
    app.provide('key', value)
  }
}
```

## Async enhanceApp

For plugins that need async initialization:

```ts
export default {
  Layout,
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      // Client-only plugin
      const plugin = await import('browser-only-plugin')
      app.use(plugin.default)
    }
  }
}
```

## Theme-Aware Layout

Handle different page layouts:

```vue
<script setup>
import { useData } from 'vitepress'
import Home from './Home.vue'
import Doc from './Doc.vue'
import Page from './Page.vue'
import NotFound from './NotFound.vue'

const { page, frontmatter } = useData()
</script>

<template>
  <NotFound v-if="page.isNotFound" />
  <Home v-else-if="frontmatter.layout === 'home'" />
  <Page v-else-if="frontmatter.layout === 'page'" />
  <Doc v-else />
</template>
```

## Distributing a Theme

As npm package:

```ts
// my-theme/index.ts
import Layout from './Layout.vue'
export default { Layout }

// Export types for config
export type { ThemeConfig } from './types'
```

Consumer usage:

```ts
// .vitepress/theme/index.ts
import Theme from 'my-vitepress-theme'

export default Theme

// Or extend it
export default {
  extends: Theme,
  enhanceApp({ app }) {
    // Additional customization
  }
}
```

## Theme Config Types

For custom theme config types, pass the type to `defineConfig` (v2 —
`defineConfigWithTheme` is deprecated):

```ts
// .vitepress/config.ts
import { defineConfig } from 'vitepress'
import type { ThemeConfig } from 'my-theme'

export default defineConfig<ThemeConfig>({
  themeConfig: {
    // Type-checked theme config
  }
})
```

## Key Points

- Theme must export `Layout` component
- `<Content />` renders the markdown content
- Use `useData()` to access page/site data
- `enhanceApp` runs on both server and client
- Check `import.meta.env.SSR` for client-only code
- Use `extends` to build on existing themes
- v2: theme `setup` hook runs inside root `setup()`; router `onBeforeRouteChange`/`onAfterRouteChange` for navigation hooks; use `defineConfig<ThemeConfig>` (not `defineConfigWithTheme`)

<!--
Source references:
- https://vitepress.dev/guide/custom-theme
-->
