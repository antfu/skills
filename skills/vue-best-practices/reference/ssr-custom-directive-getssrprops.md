---
title: Implement getSSRProps for Custom Directives in SSR
impact: MEDIUM
impactDescription: Custom directives without SSR handling cause hydration mismatches or missing functionality
type: best-practice
tags: [vue3, ssr, directives, custom-directive, server-side-rendering, nuxt]
---

# Implement getSSRProps for Custom Directives in SSR

**Impact: MEDIUM** - Custom directives only have access to the DOM on the client side. During SSR, the directive's `mounted` and `updated` hooks never run. If your directive sets attributes or modifies the element, you must implement `getSSRProps` to return equivalent attributes for server rendering.

Without `getSSRProps`, the server-rendered HTML won't include the directive's effects, causing hydration mismatches when the client applies the directive.

## Task Checklist

- [ ] Add `getSSRProps` hook to directives that modify element attributes
- [ ] Return an object with HTML attributes to render on server
- [ ] Test directive behavior in both SSR and client-only contexts
- [ ] Consider using components instead of directives for complex SSR cases

**Incorrect - Client-Only Directive:**
```javascript
// WRONG: No SSR handling - directive effects missing on server
const vTooltip = {
  mounted(el, binding) {
    el.setAttribute('data-tooltip', binding.value)
    el.setAttribute('aria-label', binding.value)
    el.classList.add('has-tooltip')
  }
}
```

Server renders:
```html
<!-- Missing data-tooltip, aria-label, and has-tooltip class -->
<button>Hover me</button>
```

Client after hydration:
```html
<!-- Directive applies, but causes mismatch -->
<button data-tooltip="Help text" aria-label="Help text" class="has-tooltip">
  Hover me
</button>
```

**Correct - With getSSRProps:**
```javascript
// CORRECT: SSR-compatible directive
const vTooltip = {
  // Client-side implementation
  mounted(el, binding) {
    el.setAttribute('data-tooltip', binding.value)
    el.setAttribute('aria-label', binding.value)
    el.classList.add('has-tooltip')
  },

  // SSR implementation - returns attributes to render
  getSSRProps(binding) {
    return {
      'data-tooltip': binding.value,
      'aria-label': binding.value,
      class: 'has-tooltip'
    }
  }
}
```

Server now renders:
```html
<button data-tooltip="Help text" aria-label="Help text" class="has-tooltip">
  Hover me
</button>
```

## Complete SSR Directive Example

```javascript
// directives/vFocus.js
export const vFocus = {
  // Client: Actually focus the element
  mounted(el, binding) {
    if (binding.value !== false) {
      el.focus()
    }
  },

  // SSR: Add autofocus attribute so browser focuses on load
  getSSRProps(binding) {
    if (binding.value !== false) {
      return { autofocus: true }
    }
    return {}
  }
}
```

```vue
<template>
  <input v-focus type="text" placeholder="Auto-focused input" />
</template>

<script setup>
import { vFocus } from '@/directives/vFocus'
</script>
```

## Directive with Dynamic ID

```javascript
// CORRECT: Generate consistent IDs
const vId = {
  mounted(el, binding) {
    el.id = binding.value || `el-${binding.instance?.$.uid}`
  },

  getSSRProps(binding, vnode) {
    // Use the same ID generation logic
    return {
      id: binding.value || `el-${vnode.component?.uid || 'ssr'}`
    }
  }
}
```

## Handling Complex Directives

For directives that do more than set attributes, consider:

```javascript
// Directive that only makes sense on client (e.g., drag-and-drop)
const vDraggable = {
  mounted(el, binding) {
    // Complex client-side logic
    initDragAndDrop(el, binding.value)
  },

  unmounted(el) {
    destroyDragAndDrop(el)
  },

  // SSR: Just mark element as draggable for styling/semantics
  getSSRProps(binding) {
    return {
      draggable: 'true',
      'data-draggable': '',
      role: 'listitem'
    }
  }
}
```

## Directives That Cannot Have SSR Equivalents

Some directives have no meaningful server-side representation:

```javascript
// Directive that tracks mouse position - no SSR equivalent
const vMousePosition = {
  mounted(el, binding) {
    el.addEventListener('mousemove', (e) => {
      binding.value?.(e.clientX, e.clientY)
    })
  },

  // Nothing meaningful to render on server
  getSSRProps() {
    return {} // Empty object - no attributes
  }
}
```

## Nuxt.js Directive Registration

```javascript
// plugins/directives.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('tooltip', {
    mounted(el, binding) {
      el.setAttribute('data-tooltip', binding.value)
    },
    getSSRProps(binding) {
      return { 'data-tooltip': binding.value }
    }
  })
})
```

## Testing SSR Directives

```javascript
import { renderToString } from 'vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { vTooltip } from './directives/vTooltip'

test('vTooltip renders attributes during SSR', async () => {
  const app = createSSRApp({
    directives: { tooltip: vTooltip },
    template: '<button v-tooltip="\'Help text\'">Click</button>'
  })

  const html = await renderToString(app)

  expect(html).toContain('data-tooltip="Help text"')
  expect(html).toContain('aria-label="Help text"')
})
```

## Reference
- [Vue.js Custom Directives - SSR](https://vuejs.org/guide/reusability/custom-directives.html#custom-directive-api)
- [Vue.js SSR - Custom Directives](https://vuejs.org/guide/scaling-up/ssr.html#custom-directives)
