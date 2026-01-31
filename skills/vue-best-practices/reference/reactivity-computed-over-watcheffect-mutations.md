---
title: Use computed() Instead of watchEffect() for Derived State
impact: MEDIUM
impactDescription: Using watchEffect to mutate refs creates unnecessary indirection - computed() is declarative and cached
type: efficiency
tags: [vue3, reactivity, computed, watchEffect, best-practice, performance]
---

# Use computed() Instead of watchEffect() for Derived State

**Impact: MEDIUM** - When you need state that derives from other reactive state, always prefer `computed()` over using `watchEffect()` to mutate a ref. Computed properties are declarative, automatically cached, and clearly express the dependency relationship.

Using `watchEffect()` to mutate a ref works but creates unnecessary indirection: you're imperatively updating state based on dependencies rather than declaring the relationship. This makes the code harder to understand and prevents Vue from optimizing.

## Task Checklist

- [ ] Use `computed()` when the result is a pure transformation of reactive state
- [ ] Use `watchEffect()` only for side effects (DOM manipulation, logging, API calls)
- [ ] Never use watchEffect to mutate a ref just to derive a value
- [ ] Remember computed values are cached and only re-compute when dependencies change

**Incorrect:**
```javascript
import { ref, watchEffect } from 'vue'

const A0 = ref(1)
const A1 = ref(2)
const A2 = ref()  // Unnecessary ref

// WRONG: Using watchEffect to derive state
watchEffect(() => {
  A2.value = A0.value + A1.value
})

// Problems:
// 1. A2 is writable when it shouldn't be
// 2. Imperative instead of declarative
// 3. No caching optimization
// 4. Harder to trace dependencies
```

```javascript
// WRONG: Complex derived state with watchEffect
const items = ref([{ price: 10 }, { price: 20 }])
const total = ref(0)

watchEffect(() => {
  total.value = items.value.reduce((sum, item) => sum + item.price, 0)
})
```

**Correct:**
```javascript
import { ref, computed } from 'vue'

const A0 = ref(1)
const A1 = ref(2)

// CORRECT: Declarative derived state
const A2 = computed(() => A0.value + A1.value)

// Benefits:
// 1. A2 is read-only by default
// 2. Clearly declares the dependency relationship
// 3. Cached - only recalculates when A0 or A1 changes
// 4. Easy to understand data flow
```

```javascript
// CORRECT: Complex derived state with computed
const items = ref([{ price: 10 }, { price: 20 }])

const total = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price, 0)
})

// Multiple derived values
const itemCount = computed(() => items.value.length)
const averagePrice = computed(() =>
  items.value.length ? total.value / itemCount.value : 0
)
```

**When watchEffect IS appropriate:**
```javascript
import { ref, watchEffect } from 'vue'

const searchQuery = ref('')

// CORRECT: watchEffect for side effects
watchEffect(() => {
  // Logging
  console.log(`Search query changed: ${searchQuery.value}`)

  // DOM manipulation
  document.title = `Search: ${searchQuery.value}`
})

// CORRECT: watchEffect for async side effects
watchEffect(async () => {
  if (searchQuery.value) {
    // API call (side effect, not derived state)
    await api.logSearch(searchQuery.value)
  }
})
```

**Summary of when to use each:**
```javascript
// Use computed() when:
// - You're deriving a value from reactive state
// - The result is pure (no side effects)
// - You want caching
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// Use watchEffect() when:
// - You need to perform side effects
// - You're interacting with external systems
// - You need to run async operations
watchEffect(() => {
  document.title = fullName.value  // Side effect
})
```

## Reference
- [Vue.js Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Vue.js Computed Properties](https://vuejs.org/guide/essentials/computed.html)
- [Vue.js Watchers](https://vuejs.org/guide/essentials/watchers.html)
