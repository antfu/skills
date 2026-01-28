---
name: features-css
description: CSS handling in Vite including modules, pre-processors, PostCSS, and Lightning CSS
---

# CSS Handling

Vite provides rich CSS support with HMR, `@import` inlining, and automatic URL rebasing.

## Basic CSS Import

```ts
import './styles.css'  // Injected into page with HMR support
```

## CSS Modules

Files ending with `.module.css` are treated as CSS modules:

```css
/* example.module.css */
.red {
  color: red;
}
```

```ts
import classes from './example.module.css'
element.className = classes.red
```

### Named Imports with camelCase

```ts
// vite.config.ts
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  }
})
```

```ts
// .apply-color -> applyColor
import { applyColor } from './example.module.css'
```

## CSS Pre-processors

Install the pre-processor, no Vite plugin needed:

```bash
# Sass (sass-embedded recommended for performance)
npm add -D sass-embedded

# Less
npm add -D less

# Stylus
npm add -D stylus
```

Use by file extension:

```ts
import './styles.scss'
import './styles.less'
import './styles.styl'
```

### Pre-processor Options

```ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
        importers: [/* ... */]
      },
      less: {
        math: 'parens-division'
      }
    },
    preprocessorMaxWorkers: true  // Use multiple threads
  }
})
```

### Combined with CSS Modules

```ts
import styles from './component.module.scss'
```

## PostCSS

Automatically applied if `postcss.config.js` exists:

```js
// postcss.config.js
export default {
  plugins: [
    require('postcss-nesting'),
    require('autoprefixer')
  ]
}
```

Or configure inline:

```ts
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        postcssNesting(),
        autoprefixer()
      ]
    }
  }
})
```

## Lightning CSS

Experimental faster CSS processing:

```bash
npm add -D lightningcss
```

```ts
export default defineConfig({
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        chrome: 111
      },
      cssModules: {
        // Lightning CSS modules config
      }
    }
  }
})
```

Use Lightning CSS for minification only:

```ts
export default defineConfig({
  build: {
    cssMinify: 'lightningcss'
  }
})
```

## Disable CSS Injection

Import CSS as string without injecting:

```ts
import styles from './styles.css?inline'  // Returns CSS string, not injected
```

## Source Maps

Enable CSS source maps in development:

```ts
export default defineConfig({
  css: {
    devSourcemap: true
  }
})
```

## CSS Code Splitting

By default, CSS is extracted per async chunk. Disable to get single CSS file:

```ts
export default defineConfig({
  build: {
    cssCodeSplit: false  // Single CSS file for entire app
  }
})
```

## CSS Target

Set different browser target for CSS:

```ts
export default defineConfig({
  build: {
    cssTarget: 'chrome61'  // For Android WeChat WebView
  }
})
```

## @import and URL Handling

- `@import` statements are inlined automatically
- Vite aliases work in `@import`
- `url()` references are rebased for correctness
- Works across Sass/Less files in different directories

<!-- 
Source references:
- https://vite.dev/guide/features.html#css
-->
