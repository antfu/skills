---
title: Avoid Prop Drilling - Use Provide/Inject for Deep Component Trees
impact: MEDIUM
impactDescription: Passing props through many layers creates maintenance burden and tight coupling between intermediate components
type: best-practice
tags: [vue3, props, provide-inject, component-design, state-management, architecture]
---

# Avoid Prop Drilling - Use Provide/Inject for Deep Component Trees

**Impact: MEDIUM** - Prop drilling occurs when you pass props through multiple component layers just to reach a deeply nested child. This creates tight coupling, makes refactoring difficult, and clutters intermediate components with props they don't use.

Vue's provide/inject API allows ancestor components to share data with any descendant, regardless of nesting depth.

## Task Checklist

- [ ] Identify when props pass through 2+ intermediate components unchanged
- [ ] Use provide/inject for data needed by deeply nested descendants
- [ ] Use Pinia for global state shared across unrelated component trees
- [ ] Keep props for direct parent-child relationships
- [ ] Document provided values at the provider level

## The Problem: Prop Drilling

```vue
<!-- App.vue -->
<template>
  <MainLayout :user="user" :theme="theme" :locale="locale" />
</template>
```

```vue
<!-- MainLayout.vue - Doesn't use these props, just passes them -->
<template>
  <Sidebar :user="user" :theme="theme" />
  <Content :user="user" :locale="locale" />
</template>
```

```vue
<!-- Sidebar.vue - Still drilling... -->
<template>
  <UserMenu :user="user" />
  <ThemeToggle :theme="theme" />
</template>
```

```vue
<!-- UserMenu.vue - Finally uses user prop -->
<template>
  <div>{{ user.name }}</div>
</template>
```

**Problems:**
1. `MainLayout` and `Sidebar` are cluttered with props they don't use
2. Adding a new shared value requires updating every component in the chain
3. Removing a deeply nested component requires updating all ancestors
4. Difficult to trace where data originates

## Solution: Provide/Inject

**Correct - Provider (ancestor):**
```vue
<!-- App.vue -->
<script setup>
import { provide, ref, readonly } from 'vue'

const user = ref({ name: 'John', role: 'admin' })
const theme = ref('dark')
const locale = ref('en')

// Provide to all descendants
provide('user', readonly(user)) // readonly prevents mutations
provide('theme', theme)
provide('locale', locale)

// Provide update functions if needed
provide('updateTheme', (newTheme) => {
  theme.value = newTheme
})
</script>

<template>
  <MainLayout />
</template>
```

**Correct - Intermediate components are now clean:**
```vue
<!-- MainLayout.vue - No props needed -->
<template>
  <Sidebar />
  <Content />
</template>
```

```vue
<!-- Sidebar.vue - No props needed -->
<template>
  <UserMenu />
  <ThemeToggle />
</template>
```

**Correct - Consumer (descendant):**
```vue
<!-- UserMenu.vue -->
<script setup>
import { inject } from 'vue'

// Inject from any ancestor
const user = inject('user')
</script>

<template>
  <div>{{ user.name }}</div>
</template>
```

```vue
<!-- ThemeToggle.vue -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
const updateTheme = inject('updateTheme')

function toggleTheme() {
  updateTheme(theme.value === 'dark' ? 'light' : 'dark')
}
</script>

<template>
  <button @click="toggleTheme">
    Current: {{ theme }}
  </button>
</template>
```

## Best Practices for Provide/Inject

### 1. Use Symbol Keys for Large Apps

Avoid string key collisions with symbols:

```js
// keys.js
export const UserKey = Symbol('user')
export const ThemeKey = Symbol('theme')
```

```vue
<script setup>
import { provide } from 'vue'
import { UserKey, ThemeKey } from './keys'

provide(UserKey, user)
provide(ThemeKey, theme)
</script>
```

```vue
<script setup>
import { inject } from 'vue'
import { UserKey } from './keys'

const user = inject(UserKey)
</script>
```

### 2. Provide Default Values

Handle cases where no ancestor provides the value:

```vue
<script setup>
import { inject } from 'vue'

// With default value
const theme = inject('theme', 'light')

// With factory function for objects (avoids shared reference)
const config = inject('config', () => ({ debug: false }), true)
</script>
```

### 3. Use Readonly for Data Safety

Prevent descendants from mutating provided data:

```vue
<script setup>
import { provide, ref, readonly } from 'vue'

const user = ref({ name: 'John' })

// Descendants can read but not mutate
provide('user', readonly(user))

// Provide separate method for updates
provide('updateUser', (updates) => {
  Object.assign(user.value, updates)
})
</script>
```

### 4. Provide Computed Values for Reactivity

```vue
<script setup>
import { provide, computed } from 'vue'

const items = ref([1, 2, 3])

// Descendants will reactively update
provide('itemCount', computed(() => items.value.length))
</script>
```

## When to Use What

| Scenario | Solution |
|----------|----------|
| Direct parent-child | Props |
| 1-2 levels deep | Props (drilling is acceptable) |
| Deep nesting, same component tree | Provide/Inject |
| Unrelated component trees | Pinia (state management) |
| Cross-app global state | Pinia |
| Plugin configuration | Provide/Inject from plugin install |

## Provide/Inject vs Pinia

**Provide/Inject:**
- Scoped to component subtree
- Great for component library internals
- No DevTools support
- Ancestor-descendant relationships only

**Pinia:**
- Global, accessible anywhere
- Excellent DevTools integration
- Better for application state
- Works across unrelated components

## Reference
- [Vue.js Provide/Inject](https://vuejs.org/guide/components/provide-inject.html)
- [Vue.js - Prop Drilling](https://vuejs.org/guide/components/provide-inject.html#prop-drilling)
- [Pinia Documentation](https://pinia.vuejs.org/)
