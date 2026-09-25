---
name: lifecycle-hooks
description: Nuxt and Nitro hooks for extending build-time and runtime behavior
---

# Lifecycle Hooks

Nuxt provides hooks to tap into the build process, application lifecycle, and server runtime.

## Build-time Hooks (Nuxt)

Used in `nuxt.config.ts` or modules:

### In nuxt.config.ts

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  hooks: {
    'build:before': () => {
      console.log('Build starting...')
    },
    'pages:extend': (pages) => {
      // Add custom pages
      pages.push({
        name: 'custom',
        path: '/custom',
        file: '~/pages/custom.vue',
      })
    },
    'components:dirs': (dirs) => {
      // Add component directories
      dirs.push({ path: '~/extra-components' })
    },
  },
})
```

### In Modules

```ts
// modules/my-module.ts
export default defineNuxtModule({
  setup(options, nuxt) {
    nuxt.hook('ready', async (nuxt) => {
      console.log('Nuxt is ready')
    })

    nuxt.hook('close', async (nuxt) => {
      console.log('Nuxt is closing')
    })

    nuxt.hook('modules:done', () => {
      console.log('All modules loaded')
    })
  },
})
```

### Common Build Hooks

| Hook | When |
|------|------|
| `ready` | Nuxt initialization complete |
| `close` | Nuxt is closing |
| `modules:done` | All modules installed |
| `build:before` | Before build starts |
| `build:done` | Build complete |
| `pages:extend` | Add/modify routes (before meta scan) |
| `pages:resolved` | After page meta is scanned (with `scanPageMeta`) |
| `components:dirs` | Component dirs being resolved |
| `imports:extend` | Auto-imports being resolved |
| `nitro:config` | Before Nitro config finalized |
| `vite:extend` | Vite context created |
| `vite:extendConfig` | Before Vite config finalized |

## App Hooks (Runtime)

Used in plugins and composables:

### In Plugins

```ts
// plugins/lifecycle.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', (vueApp) => {
    console.log('Vue app created')
  })

  nuxtApp.hook('app:mounted', (vueApp) => {
    console.log('App mounted')
  })

  nuxtApp.hook('page:start', () => {
    console.log('Page navigation starting')
  })

  nuxtApp.hook('page:finish', () => {
    console.log('Page navigation finished')
  })

  nuxtApp.hook('page:loading:start', () => {
    console.log('Page loading started')
  })

  nuxtApp.hook('page:loading:end', () => {
    console.log('Page loading ended')
  })
})
```

### Common App Hooks

| Hook | When |
|------|------|
| `app:created` | Vue app created |
| `app:mounted` | Vue app mounted (client only) |
| `app:error` | Fatal error occurred |
| `page:start` | Page navigation starting |
| `page:finish` | Page navigation finished |
| `page:loading:start` | Loading indicator should show |
| `page:loading:end` | Loading indicator should hide |
| `link:prefetch` | Link is being prefetched |

### Using Runtime Hooks

```ts
// composables/usePageTracking.ts
export function usePageTracking() {
  const nuxtApp = useNuxtApp()

  nuxtApp.hook('page:finish', () => {
    trackPageView(useRoute().path)
  })
}
```

## Server Hooks (Nitro)

Used in server plugins:

In Nitro v3 the plugin factory is `definePlugin` from `nitro`:

```ts
// server/plugins/hooks.ts
import { definePlugin } from 'nitro'

export default definePlugin((nitroApp) => {
  // Modify HTML before sending
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    html.head.push('<meta name="custom" content="value">')
    html.bodyAppend.push('<script>console.log("injected")</script>')
  })

  // Before request
  nitroApp.hooks.hook('request', (event) => {
    console.log('Request:', event.url.pathname)
  })

  // Single response hook (replaces beforeResponse/afterResponse in v3)
  nitroApp.hooks.hook('response', (response, { event }) => {
    console.log('Sending response')
  })
})
```

### Common Nitro Hooks

| Hook | When |
|------|------|
| `request` | Request received |
| `response` | Before/around sending response (replaces `beforeResponse`/`afterResponse`) |
| `render:html` | Before HTML is sent |
| `render:response` | Before response is finalized |
| `error` | Error occurred |

> **Nitro v3:** `beforeResponse`/`afterResponse` are merged into `response`. The compatibility layer re-emits them from `response` when active.

## Custom Hooks

### Define Custom Hook Types

```ts
// types/hooks.d.ts
import type { HookResult } from '@nuxt/schema'

declare module '#app' {
  interface RuntimeNuxtHooks {
    'my-app:event': (data: MyEventData) => HookResult
  }
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'my-module:init': () => HookResult
  }
}

declare module 'nitro/types' {
  interface NitroRuntimeHooks {
    'my-server:event': (data: any) => void
  }
}
```

> **Nitro v3:** `nitropack` is renamed to `nitro` — augment `nitro/types` (not `nitropack/types`).

### Call Custom Hooks

```ts
// In a plugin
export default defineNuxtPlugin((nuxtApp) => {
  // Call custom hook
  nuxtApp.callHook('my-app:event', { type: 'custom' })
})

// In a module
export default defineNuxtModule({
  setup(options, nuxt) {
    nuxt.callHook('my-module:init')
  },
})
```

> **Nuxt 5:** `callHook` may now return `void` (not always a `Promise`), for performance. Always `await` it instead of chaining `.then()`/`.catch()`. Restore the always-Promise behavior with `experimental.asyncCallHook: true`.

## useRuntimeHook

Call hooks at runtime from components:

```vue
<script setup lang="ts">
// Register a callback for a runtime hook
useRuntimeHook('app:error', (error) => {
  console.error('App error:', error)
})
</script>
```

## Hook Examples

### Page View Tracking

```ts
// plugins/analytics.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:finish', () => {
    const route = useRoute()
    analytics.track('pageview', {
      path: route.path,
      title: document.title,
    })
  })
})
```

### Performance Monitoring

```ts
// plugins/performance.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  let navigationStart: number

  nuxtApp.hook('page:start', () => {
    navigationStart = performance.now()
  })

  nuxtApp.hook('page:finish', () => {
    const duration = performance.now() - navigationStart
    console.log(`Navigation took ${duration}ms`)
  })
})
```

### Inject HTML

```ts
// server/plugins/inject.ts
import { definePlugin } from 'nitro'

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    html.head.push(`
      <script>
        window.APP_CONFIG = ${JSON.stringify(config)}
      </script>
    `)
  })
})
```

<!-- 
Source references:
- https://nuxt.com/docs/guide/going-further/hooks
- https://nuxt.com/docs/api/advanced/hooks
- https://nuxt.com/docs/getting-started/upgrade#migration-to-nitro-v3
-->
