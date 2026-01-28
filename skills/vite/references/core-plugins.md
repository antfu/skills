---
name: core-plugins
description: Adding, configuring, and ordering Vite plugins
---

# Using Plugins

Vite extends Rolldown's plugin interface with extra Vite-specific options.

## Adding Plugins

Install and add to config:

```bash
npm add -D @vitejs/plugin-vue
```

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()]
})
```

## Plugin Arrays

Plugins can return arrays (for complex features):

```ts
// Framework plugin returning multiple plugins
export default function framework(config) {
  return [
    frameworkRefresh(config),
    frameworkDevtools(config)
  ]
}
```

## Conditional Plugins

Falsy values are ignored:

```ts
export default defineConfig({
  plugins: [
    vue(),
    process.env.ANALYZE && visualizer()  // Only if ANALYZE is set
  ]
})
```

## Enforcing Plugin Order

Control when plugin runs relative to Vite core:

```ts
export default defineConfig({
  plugins: [
    {
      ...somePlugin(),
      enforce: 'pre'  // Before Vite core plugins
    },
    {
      ...anotherPlugin(),
      enforce: 'post'  // After Vite build plugins
    }
  ]
})
```

**Order:**
1. Alias
2. Plugins with `enforce: 'pre'`
3. Vite core plugins
4. Plugins without enforce
5. Vite build plugins
6. Plugins with `enforce: 'post'`
7. Vite post-build plugins (minify, manifest)

## Conditional Application

Apply only during serve or build:

```ts
export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build'  // Only during build
    },
    {
      ...devOnlyPlugin(),
      apply: 'serve'  // Only during dev
    }
  ]
})
```

Function form for more control:

```ts
{
  ...myPlugin(),
  apply(config, { command }) {
    // Apply only on build but not for SSR
    return command === 'build' && !config.build.ssr
  }
}
```

## Finding Plugins

1. Check [Vite Features Guide](https://vite.dev/guide/features.html) - many use cases are built-in
2. Official plugins in [Vite Plugins](https://vite.dev/plugins/)
3. Community plugins in [awesome-vite](https://github.com/vitejs/awesome-vite#plugins)
4. Search npm for `vite-plugin-*` or `rollup-plugin-*`

## Official Plugins

| Plugin | Purpose |
|--------|---------|
| `@vitejs/plugin-vue` | Vue 3 SFC support |
| `@vitejs/plugin-vue-jsx` | Vue 3 JSX support |
| `@vitejs/plugin-react` | React with Babel/Oxc |
| `@vitejs/plugin-react-swc` | React with SWC |
| `@vitejs/plugin-rsc` | React Server Components |
| `@vitejs/plugin-legacy` | Legacy browser support |

## Rollup/Rolldown Plugin Compatibility

Many Rollup plugins work directly with Vite if they:
- Don't use `moduleParsed` hook
- Don't rely on Rolldown-specific options
- Don't have strong coupling between bundle and output phases

For build-only Rollup plugins:

```ts
export default defineConfig({
  build: {
    rolldownOptions: {
      plugins: [rollupPluginForBuildOnly()]
    }
  }
})
```

<!-- 
Source references:
- https://vite.dev/guide/using-plugins.html
-->
