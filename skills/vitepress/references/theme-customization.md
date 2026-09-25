---
name: extending-vitepress-default-theme
description: Customize CSS variables, use layout slots, register global components, and override theme fonts
---

# Extending Default Theme

Customize the default theme through CSS, slots, and Vue components.

## Theme Entry File

Create `.vitepress/theme/index.ts` to extend the default theme:

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme
```

## CSS Variables

Override root CSS variables:

```css
/* .vitepress/theme/custom.css */
:root {
  /* Brand colors */
  --vp-c-brand-1: #646cff;
  --vp-c-brand-2: #747bff;
  --vp-c-brand-3: #9499ff;
  
  /* Backgrounds */
  --vp-c-bg: #ffffff;
  --vp-c-bg-soft: #f6f6f7;
  
  /* Text */
  --vp-c-text-1: #213547;
  --vp-c-text-2: #476582;
}

.dark {
  --vp-c-brand-1: #747bff;
  --vp-c-bg: #1a1a1a;
}
```

See [all CSS variables](https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css).

### Navbar (v2)

The navbar draws a single background surface controlled by CSS variables, so a
frosted-glass bar needs no component overrides:

```css
:root {
  --vp-nav-height: 4rem;
  --vp-nav-bg-color: color-mix(in srgb, var(--vp-c-bg) 65%, transparent);
  --vp-nav-home-bg-color: transparent; /* while unscrolled on the home page */
  --vp-nav-backdrop-filter: saturate(180%) blur(8px);
  --vp-nav-divider-color: var(--vp-c-gutter);
  --vp-nav-screen-bg-color: var(--vp-c-bg);
}
```

When nav items don't fit, they collapse into a `⋯` overflow menu (label it with
`extraMenuLabel`). Note `backdrop-filter` has a scroll cost and Safari ≤17 skips
variable-driven backdrop filters.

## Home Hero Customization

```css
:root {
  /* Gradient name color */
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(120deg, #bd34fe, #41d1ff);
  
  /* Hero image glow */
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}
```

## Custom Fonts

Remove Inter font and use your own:

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme-without-fonts'
import './fonts.css'

export default DefaultTheme
```

```css
/* .vitepress/theme/fonts.css */
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/myfont.woff2') format('woff2');
}

:root {
  --vp-font-family-base: 'MyFont', sans-serif;
  --vp-font-family-mono: 'Fira Code', monospace;
}
```

Preload fonts in config:

```ts
// .vitepress/config.ts
export default {
  transformHead({ assets }) {
    const fontFile = assets.find(file => /myfont\.[\w-]+\.woff2/.test(file))
    if (fontFile) {
      return [
        ['link', { rel: 'preload', href: fontFile, as: 'font', type: 'font/woff2', crossorigin: '' }]
      ]
    }
  }
}
```

## Global Components

Register components available in all markdown:

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import MyComponent from './components/MyComponent.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MyComponent', MyComponent)
  }
}
```

Use in markdown:

```md
<MyComponent :prop="value" />
```

## Layout Slots

Inject content into specific locations:

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  Layout: MyLayout
}
```

```vue
<!-- .vitepress/theme/MyLayout.vue -->
<script setup>
import DefaultTheme from 'vitepress/theme'
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-outline-before>
      <div>Above outline</div>
    </template>
    
    <template #doc-before>
      <div>Before doc content</div>
    </template>
    
    <template #doc-after>
      <div>After doc content</div>
    </template>
  </Layout>
</template>
```

### Available Slots

**Doc layout (`layout: doc`):**
- `doc-top`, `doc-bottom`
- `doc-before`, `doc-after`
- `doc-footer-before`
- `sidebar-nav-before`, `sidebar-nav-after`
- `aside-top`, `aside-bottom`
- `aside-outline-before`, `aside-outline-after`
- `aside-ads-before`, `aside-ads-after`

**Home layout (`layout: home`):**
- `home-hero-before`, `home-hero-after`
- `home-hero-info-before`, `home-hero-info`, `home-hero-info-after`
- `home-hero-actions-before-actions`, `home-hero-actions-after`, `home-hero-image`
- `home-features-before`, `home-features-after`

**Page layout (`layout: page`):**
- `page-top`, `page-bottom`

**Always available:**
- `layout-top`, `layout-bottom`
- `nav-bar-title-before`, `nav-bar-title-after`
- `nav-bar-content-before`, `nav-bar-content-after`
- `not-found` (404 page)

## Using Render Functions

Alternative to template slots:

```ts
// .vitepress/theme/index.ts
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MyComponent from './MyComponent.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-outline-before': () => h(MyComponent)
    })
  }
}
```

## Override Internal Components

Replace default theme components with Vite aliases:

```ts
// .vitepress/config.ts
import { fileURLToPath, URL } from 'node:url'

export default {
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBar\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/CustomNavBar.vue', import.meta.url)
          )
        }
      ]
    }
  }
}
```

## View Transitions

Custom dark mode toggle animation:

```vue
<!-- .vitepress/theme/Layout.vue -->
<script setup>
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide } from 'vue'

const { isDark } = useData()

provide('toggle-appearance', async ({ clientX: x, clientY: y }) => {
  if (!document.startViewTransition) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    { duration: 300, easing: 'ease-in', pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)` }
  )
})
</script>

<template>
  <DefaultTheme.Layout />
</template>
```

## Icons (v2)

Render iconify icons through VitePress's pipeline (no external fetch). Use the
`VPIcon` component from `vitepress/theme` (accepts `collection:name` or `{ svg }`):

```vue-html
<VPIcon icon="lucide:rocket" />
```

Or the `useIcon` composable, passing the element ref so dev mode can resolve it:

```vue
<script setup>
import { useIcon } from 'vitepress'
import { useTemplateRef } from 'vue'

const el = useTemplateRef('el')
const iconClass = useIcon('lucide:rocket', el)
</script>

<template><span ref="el" :class="iconClass" /></template>
```

Client-only icons (inside `<ClientOnly>`) aren't collected during build — list
them in [`icons.include`](core-config.md).

## Route Change Hooks & `setup` (v2)

Assign navigation handlers on the router (return `false` to cancel), and use the
`setup` hook to run Composition API code inside the root component's `setup()`:

```ts
// .vitepress/theme/index.ts
import { watch } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    router.onBeforeRouteChange = (to) => { /* return false to cancel */ }
    router.onAfterRouteChange = (to) => console.log('navigated to', to)
  },
  setup() {
    const { page } = useData()
    watch(() => page.value.relativePath, (p) => console.log('now viewing', p))
  }
}
```

`setup` also runs during SSR/SSG — keep browser-only work in `onMounted`.

## Key Points

- Import `vitepress/theme-without-fonts` to use custom fonts
- Use layout slots to inject content without overriding components
- Global components are registered in `enhanceApp`
- Override CSS variables for theming (v2 adds navbar surface variables)
- Use Vite aliases to replace internal components
- v2: `VPIcon`/`useIcon` for iconify icons, router `onBeforeRouteChange`/`onAfterRouteChange`, and a theme `setup` hook

<!--
Source references:
- https://vitepress.dev/guide/extending-default-theme
-->
