---
title: Use v-prefix Naming Convention for Local Directives
impact: LOW
impactDescription: Proper naming enables automatic directive recognition in script setup
type: best-practice
tags: [vue3, directives, naming, script-setup, conventions]
---

# Use v-prefix Naming Convention for Local Directives

**Impact: LOW** - In `<script setup>`, any camelCase variable starting with the `v` prefix can automatically be used as a custom directive. This convention enables seamless local directive registration without explicit configuration.

Following this naming pattern ensures Vue correctly recognizes and registers your local directives.

## Task Checklist

- [ ] Name local directive variables with `v` prefix in camelCase (e.g., `vFocus`, `vHighlight`)
- [ ] Use the directive in templates without the `v` prefix lowercase (e.g., `v-focus`, `v-highlight`)
- [ ] For multi-word directives, use camelCase in script and kebab-case in template

**Incorrect:**
```vue
<script setup>
// WRONG: No v prefix - won't be recognized as directive
const focus = {
  mounted: (el) => el.focus()
}

// WRONG: Wrong casing
const VFocus = {
  mounted: (el) => el.focus()
}

// WRONG: Kebab-case in script
const 'v-focus' = {  // Syntax error
  mounted: (el) => el.focus()
}
</script>

<template>
  <!-- These won't work -->
  <input focus />
  <input v-Focus />
</template>
```

**Correct:**
```vue
<script setup>
// CORRECT: v prefix with camelCase
const vFocus = {
  mounted: (el) => el.focus()
}

const vHighlight = {
  mounted: (el) => {
    el.classList.add('is-highlight')
  }
}

// CORRECT: Multi-word directive
const vClickOutside = {
  mounted(el, binding) {
    el._handler = (e) => {
      if (!el.contains(e.target)) binding.value(e)
    }
    document.addEventListener('click', el._handler)
  },
  unmounted(el) {
    document.removeEventListener('click', el._handler)
  }
}

// CORRECT: Function shorthand with v prefix
const vColor = (el, binding) => {
  el.style.color = binding.value
}
</script>

<template>
  <!-- Use kebab-case in template -->
  <input v-focus />
  <p v-highlight>Highlighted text</p>
  <div v-click-outside="closeMenu">Dropdown</div>
  <span v-color="'red'">Colored text</span>
</template>
```

## Template Casing Rules

In templates, directives should use kebab-case:

```vue
<script setup>
const vMyLongDirectiveName = (el) => { /* ... */ }
const vAutoFocusInput = (el) => el.focus()
const vLazyLoadImage = { /* ... */ }
</script>

<template>
  <!-- camelCase in script -> kebab-case in template -->
  <div v-my-long-directive-name></div>
  <input v-auto-focus-input />
  <img v-lazy-load-image />
</template>
```

## Options API Registration

Without `<script setup>`, directives need explicit registration:

```javascript
// Local registration with Options API
export default {
  directives: {
    // Key is directive name (without v- prefix)
    focus: {
      mounted: (el) => el.focus()
    },
    highlight: {
      mounted: (el) => el.classList.add('is-highlight')
    },
    // Multi-word uses camelCase key
    clickOutside: {
      mounted(el, binding) { /* ... */ },
      unmounted(el) { /* ... */ }
    }
  }
}
```

## Global Registration

For global directives, register on the app instance:

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// Global directive - name without v- prefix
app.directive('focus', {
  mounted: (el) => el.focus()
})

// Multi-word directive
app.directive('click-outside', {
  mounted(el, binding) { /* ... */ },
  unmounted(el) { /* ... */ }
})

// Function shorthand
app.directive('color', (el, binding) => {
  el.style.color = binding.value
})

app.mount('#app')
```

## Importing Directives

When importing directives, rename to add v prefix:

```javascript
// directives/focus.js
export const focus = {
  mounted: (el) => el.focus()
}

// In component
<script setup>
import { focus as vFocus } from '@/directives/focus'
// Now usable as v-focus in template
</script>

// Or export with v prefix already
// directives/focus.js
export const vFocus = {
  mounted: (el) => el.focus()
}

// In component
<script setup>
import { vFocus } from '@/directives/focus'
// Directly usable as v-focus
</script>
```

## Reference
- [Vue.js Custom Directives - Introduction](https://vuejs.org/guide/reusability/custom-directives#introduction)
