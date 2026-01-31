---
title: Prefer Templates Over Render Functions for Compiler Optimizations
impact: MEDIUM
impactDescription: Render functions bypass Vue's compile-time optimizations, resulting in more work during updates
type: best-practice
tags: [vue3, rendering, performance, templates, render-functions, optimization]
---

# Prefer Templates Over Render Functions for Compiler Optimizations

**Impact: MEDIUM** - Vue's template compiler applies automatic optimizations (static hoisting, patch flags, tree flattening) that are impossible with hand-written render functions. Using render functions means every vnode must be traversed and diffed on every update, even if nothing changed.

Only use render functions when you genuinely need full JavaScript power for highly dynamic component logic.

## Task Checklist

- [ ] Default to templates for all components
- [ ] Only use render functions for highly dynamic rendering logic (e.g., dynamic tag selection)
- [ ] If using render functions, understand you're opting out of compile-time optimizations
- [ ] Consider JSX if you need render function power with better readability

## Why Templates Are Faster

Vue's compiler analyzes templates and generates optimized render functions with:

1. **Static Hoisting**: Static elements are created once and reused across re-renders
2. **Patch Flags**: Dynamic bindings are marked so Vue only checks what can change
3. **Tree Flattening**: Only dynamic nodes are traversed during reconciliation

**Incorrect:**
```vue
<script setup>
import { h, ref } from 'vue'

const count = ref(0)
const items = ref(['a', 'b', 'c'])

// BAD: Hand-written render function - no compile-time optimizations
// Every render: all vnodes created anew, all nodes diffed
const render = () => h('div', [
  h('header', { class: 'static-header' }, 'My App'),  // Static but recreated every render
  h('p', `Count: ${count.value}`),
  h('ul', items.value.map(item => h('li', { key: item }, item)))
])
</script>
```

**Correct:**
```vue
<template>
  <div>
    <!-- GOOD: Static header hoisted, never recreated or diffed -->
    <header class="static-header">My App</header>

    <!-- GOOD: Patch flag marks only text as dynamic -->
    <p>Count: {{ count }}</p>

    <!-- GOOD: Only list items are tracked as dynamic -->
    <ul>
      <li v-for="item in items" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const items = ref(['a', 'b', 'c'])
</script>
```

## When Render Functions Are Appropriate

Use render functions when:
- Rendering logic is highly dynamic (dynamic component types based on data)
- Building reusable library components with complex slot forwarding
- Need programmatic control that templates cannot express

```js
// ACCEPTABLE: Dynamic component type based on data
function render() {
  return h(props.level > 2 ? 'h3' : 'h' + props.level, slots.default?.())
}

// ACCEPTABLE: Complex library component with dynamic children manipulation
function render() {
  const children = slots.default?.() || []
  return h('div', children.filter(shouldRender).map(wrapChild))
}
```

## Compiler Optimizations You Lose

| Optimization | With Templates | With Render Functions |
|--------------|---------------|----------------------|
| Static Hoisting | Automatic | Manual (you must do it) |
| Patch Flags | Automatic | None |
| Tree Flattening | Automatic | None |
| SSR Hydration Optimization | Full | Partial |
| Block-level fast paths | Yes | No |

## If You Must Use Render Functions

```js
import { h, ref } from 'vue'

// Manually hoist static vnodes outside component
const staticHeader = h('header', { class: 'static' }, 'Title')

export default {
  setup() {
    const count = ref(0)

    return () => h('div', [
      staticHeader,  // Reused, not recreated
      h('p', `Count: ${count.value}`)
    ])
  }
}
```

## Reference
- [Vue.js Rendering Mechanism - Templates vs Render Functions](https://vuejs.org/guide/extras/rendering-mechanism.html#templates-vs-render-functions)
- [Vue.js Render Functions & JSX](https://vuejs.org/guide/extras/render-function.html)
