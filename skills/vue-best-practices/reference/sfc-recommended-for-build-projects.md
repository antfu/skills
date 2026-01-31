---
title: Use Single-File Components with Build Tools
impact: MEDIUM
impactDescription: SFCs provide better DX, scoped styles, and tooling support for Vue applications
type: efficiency
tags: [vue3, sfc, single-file-components, build-tools, vite]
---

# Use Single-File Components with Build Tools

**Impact: MEDIUM** - Single-File Components (SFCs) are the recommended way to author Vue components when using a build setup. They provide better organization, scoped styles, and superior tooling support.

SFCs (`.vue` files) encapsulate template, logic, and styles in a single file. While Vue can work without build tools, SFCs unlock the full power of the framework including `<script setup>`, scoped CSS, and better IDE support.

## Task Checklist

- [ ] Use `.vue` files for components when you have a build setup (Vite, Vue CLI)
- [ ] Prefer `<script setup>` syntax for Composition API - less boilerplate
- [ ] Use `<style scoped>` to prevent CSS leaking between components
- [ ] Configure IDE with Volar extension for Vue 3 (not Vetur)

**Incorrect:**
```javascript
// Defining components without SFC in a build project
// Loses benefits of scoped styles, template compilation, and tooling

// component.js
export default {
  template: `
    <div class="container">
      <h1>{{ title }}</h1>
      <button @click="handleClick">Click me</button>
    </div>
  `,
  data() {
    return { title: 'Hello' }
  },
  methods: {
    handleClick() { /* ... */ }
  }
}
```

**Correct:**
```vue
<!-- Component.vue - Single-File Component -->
<script setup>
import { ref } from 'vue'

const title = ref('Hello')

function handleClick() {
  // ...
}
</script>

<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<style scoped>
/* Styles only apply to this component */
.container {
  padding: 1rem;
}

h1 {
  color: #42b883;
}
</style>
```

## SFC Benefits

| Feature | Without SFC | With SFC |
|---------|-------------|----------|
| Template syntax highlighting | No | Yes |
| Scoped CSS | Manual (CSS Modules) | Built-in |
| TypeScript support | Basic | Full with Volar |
| Hot Module Replacement | Limited | Full support |
| Build-time optimizations | None | Template compilation |
| IDE autocompletion | Limited | Full support |

## When NOT to Use SFCs

```html
<!-- Progressive enhancement - adding Vue to existing HTML -->
<!-- SFCs not needed here -->
<div id="app">
  <button @click="count++">{{ count }}</button>
</div>

<script type="module">
import { createApp, ref } from 'vue'

createApp({
  setup() {
    return { count: ref(0) }
  }
}).mount('#app')
</script>
```

## Reference
- [Vue.js Introduction - Single-File Components](https://vuejs.org/guide/introduction.html#single-file-components)
- [SFC Syntax Specification](https://vuejs.org/api/sfc-spec.html)
