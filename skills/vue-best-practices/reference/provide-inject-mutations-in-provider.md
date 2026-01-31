---
title: Keep Provide/Inject Mutations in the Provider Component
impact: MEDIUM
impactDescription: Allowing injectors to mutate provided state leads to unpredictable data flow and difficult debugging
type: best-practice
tags: [vue3, provide-inject, state-management, architecture, debugging]
---

# Keep Provide/Inject Mutations in the Provider Component

**Impact: MEDIUM** - When using reactive provide/inject values, mutations should be kept inside the provider component whenever possible. Allowing child components to mutate injected state directly leads to confusion about where changes originate, making debugging and maintenance difficult.

## Task Checklist

- [ ] Keep all mutations to provided state in the provider component
- [ ] Provide update functions alongside reactive data for child modifications
- [ ] Use `readonly()` to prevent accidental mutations from injectors
- [ ] Document provided values and their update patterns

## The Problem: Scattered Mutations

**Wrong - Injector mutates provided state directly:**
```vue
<!-- Provider.vue -->
<script setup>
import { ref, provide } from 'vue'

const user = ref({ name: 'John', preferences: { theme: 'dark' } })
provide('user', user)
</script>
```

```vue
<!-- DeepChild.vue -->
<script setup>
import { inject } from 'vue'

const user = inject('user')

// PROBLEMATIC: Mutating from anywhere in the tree
function updateTheme(theme) {
  user.value.preferences.theme = theme // Where did this change come from?
}
</script>
```

**Problems:**
1. Hard to trace where state changes originate
2. Multiple components might mutate the same data inconsistently
3. No centralized validation or side effects
4. Debugging becomes a nightmare in large apps

## Solution: Provide Update Functions

**Correct - Provider controls all mutations:**
```vue
<!-- Provider.vue -->
<script setup>
import { ref, provide, readonly } from 'vue'

const user = ref({ name: 'John', preferences: { theme: 'dark' } })

// Mutation function with validation
function updateUserPreferences(preferences) {
  // Centralized validation
  if (preferences.theme && !['dark', 'light', 'system'].includes(preferences.theme)) {
    console.warn('Invalid theme')
    return false
  }

  // Centralized side effects
  Object.assign(user.value.preferences, preferences)
  localStorage.setItem('userPrefs', JSON.stringify(user.value.preferences))
  return true
}

function updateUserName(name) {
  if (!name || name.length < 2) {
    console.warn('Name must be at least 2 characters')
    return false
  }
  user.value.name = name
  return true
}

// Provide readonly data + update functions
provide('user', {
  data: readonly(user),
  updatePreferences: updateUserPreferences,
  updateName: updateUserName
})
</script>
```

```vue
<!-- DeepChild.vue -->
<script setup>
import { inject } from 'vue'

const { data: user, updatePreferences } = inject('user')

function changeTheme(theme) {
  // Clear intent: calling provider's update function
  const success = updatePreferences({ theme })
  if (!success) {
    // Handle validation failure
  }
}
</script>

<template>
  <!-- data is readonly, prevents accidental mutation -->
  <div>Theme: {{ user.preferences.theme }}</div>
  <button @click="changeTheme('light')">Light Mode</button>
</template>
```

## Pattern: Provide/Inject with Readonly Protection

Use `readonly()` to enforce the pattern at runtime:

```vue
<!-- Provider.vue -->
<script setup>
import { ref, provide, readonly } from 'vue'

const cart = ref([])

function addItem(item) {
  cart.value.push(item)
}

function removeItem(id) {
  cart.value = cart.value.filter(item => item.id !== id)
}

function clearCart() {
  cart.value = []
}

// Provide readonly cart + controlled mutations
provide('cart', {
  items: readonly(cart),
  addItem,
  removeItem,
  clearCart
})
</script>
```

```vue
<!-- CartDisplay.vue -->
<script setup>
import { inject } from 'vue'

const { items, removeItem } = inject('cart')

// items.push(newItem) would trigger a warning in dev mode
// Must use provided removeItem function
</script>

<template>
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
    <button @click="removeItem(item.id)">Remove</button>
  </div>
</template>
```

## Benefits of This Pattern

1. **Traceability**: All mutations go through known functions
2. **Validation**: Centralized validation in provider
3. **Side Effects**: Consistent side effects (logging, storage, API calls)
4. **Testing**: Easier to test mutation logic in isolation
5. **Debugging**: Clear mutation source in Vue DevTools

## When Direct Mutation Might Be Acceptable

In rare cases, direct mutation may be acceptable:

- Very simple, local state within a small component tree
- Form state that's isolated to a single form wizard
- Temporary state that doesn't affect app logic

Even then, consider using `readonly()` with update functions for consistency.

## Reference
- [Vue.js Provide/Inject - Working with Reactivity](https://vuejs.org/guide/components/provide-inject.html#working-with-reactivity)
- [The Complete Guide to Provide/Inject API in Vue 3](https://www.codemag.com/Article/2101091/The-Complete-Guide-to-Provide-Inject-API-in-Vue-3-Part-1)
