---
title: Use Computed Properties for Cached Reactive Derivations
impact: MEDIUM
impactDescription: Methods recalculate on every render while computed properties cache results
type: efficiency
tags: [vue3, computed, methods, performance, caching]
---

# Use Computed Properties for Cached Reactive Derivations

**Impact: MEDIUM** - Computed properties are cached based on their reactive dependencies and only re-evaluate when dependencies change. Methods run on every component re-render, causing performance issues for expensive operations.

When you need to derive a value from reactive state, prefer computed properties over methods for automatic caching and optimized re-renders.

## Task Checklist

- [ ] Use computed properties for values derived from reactive state
- [ ] Use methods only when you need to pass parameters or don't want caching
- [ ] Never use computed for non-reactive values like `Date.now()`
- [ ] Consider performance impact of expensive operations in methods vs computed

**Incorrect:**
```vue
<template>
  <!-- BAD: Method runs on every re-render -->
  <p>{{ getFilteredItems() }}</p>
  <p>{{ calculateTotal() }}</p>
  <p>{{ getCurrentTime() }}</p>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([/* large array */])
const prices = ref([100, 200, 300])

// BAD: Expensive operation runs every render
function getFilteredItems() {
  return items.value
    .filter(item => item.active)
    .sort((a, b) => a.name.localeCompare(b.name))
}

// BAD: Calculation runs every render even if prices unchanged
function calculateTotal() {
  return prices.value.reduce((sum, price) => sum + price, 0)
}

// This looks like a computed use case, but Date.now() is non-reactive
function getCurrentTime() {
  return Date.now()  // Will appear to work but won't update reactively
}
</script>
```

**Correct:**
```vue
<template>
  <!-- GOOD: Computed only recalculates when items change -->
  <p>{{ filteredItems }}</p>
  <p>{{ total }}</p>
  <!-- GOOD: Method for non-reactive current time -->
  <p>{{ getCurrentTime() }}</p>
</template>

<script setup>
import { ref, computed } from 'vue'

const items = ref([/* large array */])
const prices = ref([100, 200, 300])

// GOOD: Cached - only recalculates when items.value changes
const filteredItems = computed(() => {
  return items.value
    .filter(item => item.active)
    .sort((a, b) => a.name.localeCompare(b.name))
})

// GOOD: Cached - only recalculates when prices change
const total = computed(() => {
  return prices.value.reduce((sum, price) => sum + price, 0)
})

// GOOD: Use method for non-reactive values
// (or use setInterval to update a ref)
function getCurrentTime() {
  return Date.now()
}
</script>
```

## When to Use Each

| Scenario | Use Computed | Use Method |
|----------|--------------|------------|
| Derived from reactive state | Yes | No |
| Expensive calculation | Yes | No |
| Need to pass parameters | No | Yes |
| Non-reactive value (Date.now()) | No | Yes |
| Don't want caching | No | Yes |
| Triggered by user action | No | Yes |

## Non-Reactive Values Warning

Computed properties only track reactive dependencies. Non-reactive values like `Date.now()` will cause the computed to be evaluated once and never update:

```javascript
// BAD: Date.now() is not reactive - computed will never update
const now = computed(() => Date.now())

// GOOD: Use a ref with setInterval for live time
const now = ref(Date.now())
setInterval(() => {
  now.value = Date.now()
}, 1000)
```

## Reference
- [Vue.js Computed Properties - Computed Caching vs Methods](https://vuejs.org/guide/essentials/computed.html#computed-caching-vs-methods)
