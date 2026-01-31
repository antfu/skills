---
title: Return State as Readonly with Explicit Update Methods
impact: MEDIUM
impactDescription: Exposing mutable state directly allows uncontrolled mutations scattered throughout the codebase
type: best-practice
tags: [vue3, composables, composition-api, readonly, encapsulation, state-management]
---

# Return State as Readonly with Explicit Update Methods

**Impact: MEDIUM** - When a composable manages state that should only be modified in controlled ways, return the state as `readonly` and provide explicit methods for updates. This prevents scattered, uncontrolled mutations and makes state changes traceable and predictable.

Exposing raw refs allows any consumer to modify state directly, leading to bugs that are hard to track because mutations can happen anywhere in the codebase.

## Task Checklist

- [ ] Use `readonly()` to wrap state that shouldn't be directly modified
- [ ] Provide explicit methods for all valid state transitions
- [ ] Document the intended ways to update state
- [ ] Consider returning `shallowReadonly()` for performance with large objects

**Incorrect:**
```javascript
// WRONG: State is fully mutable by any consumer
export function useCart() {
  const items = ref([])
  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  return { items, total }  // Anyone can mutate items directly!
}

// Consumer code - mutations scattered everywhere
const { items, total } = useCart()

// In component A
items.value.push({ id: 1, name: 'Widget', price: 10, quantity: 1 })

// In component B - different mutation pattern
items.value = items.value.filter(item => item.id !== 1)

// In component C - direct modification
items.value[0].quantity = 5

// Hard to track: where did this item come from? Why did quantity change?
```

**Correct:**
```javascript
import { ref, computed, readonly } from 'vue'

export function useCart() {
  const items = ref([])

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  // Explicit, controlled mutations
  function addItem(product, quantity = 1) {
    const existing = items.value.find(item => item.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ ...product, quantity })
    }
  }

  function removeItem(productId) {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.quantity = Math.max(0, quantity)
      if (item.quantity === 0) {
        removeItem(productId)
      }
    }
  }

  function clearCart() {
    items.value = []
  }

  return {
    // State is readonly - can't be mutated directly
    items: readonly(items),
    total,
    itemCount,
    // Only these methods can modify state
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }
}

// Consumer code - controlled mutations only
const { items, total, addItem, removeItem, updateQuantity } = useCart()

// items.value.push(...)  // TypeScript error: readonly!
// items.value = []       // TypeScript error: readonly!

// Correct way - through explicit methods
addItem({ id: 1, name: 'Widget', price: 10 })
updateQuantity(1, 3)
removeItem(1)
```

## Pattern: Internal vs External State

Keep internal state private, expose readonly view:

```javascript
export function useAuth() {
  // Internal, fully mutable
  const _user = ref(null)
  const _token = ref(null)
  const _isLoading = ref(false)
  const _error = ref(null)

  async function login(credentials) {
    _isLoading.value = true
    _error.value = null

    try {
      const response = await api.login(credentials)
      _user.value = response.user
      _token.value = response.token
    } catch (e) {
      _error.value = e.message
      throw e
    } finally {
      _isLoading.value = false
    }
  }

  function logout() {
    _user.value = null
    _token.value = null
  }

  return {
    // Readonly views of internal state
    user: readonly(_user),
    isAuthenticated: computed(() => !!_user.value),
    isLoading: readonly(_isLoading),
    error: readonly(_error),
    // Methods for state changes
    login,
    logout
  }
}
```

## When to Use readonly vs Not

| Use `readonly` | Don't Use `readonly` |
|----------------|----------------------|
| State with specific update rules | Simple two-way binding state |
| Shared state between components | Form input values |
| State that needs validation on change | Local component state |
| When debugging mutation sources matters | When consumers need full control |

```javascript
// Form input - consumers SHOULD mutate directly
export function useForm(initial) {
  const values = ref({ ...initial })
  return { values }  // No readonly - it's meant to be mutated
}

// Counter with min/max - needs controlled mutations
export function useCounter(min = 0, max = 100) {
  const _count = ref(min)

  function increment() {
    if (_count.value < max) _count.value++
  }

  function decrement() {
    if (_count.value > min) _count.value--
  }

  return {
    count: readonly(_count),
    increment,
    decrement
  }
}
```

## Performance: shallowReadonly

For large objects, use `shallowReadonly` to avoid deep readonly conversion:

```javascript
export function useLargeDataset() {
  const data = ref([/* thousands of items */])

  return {
    // shallowReadonly - only top level is readonly
    // Nested properties are still technically mutable
    // but the ref itself can't be reassigned
    data: shallowReadonly(data)
  }
}
```

## Reference
- [Vue.js Reactivity API - readonly](https://vuejs.org/api/reactivity-core.html#readonly)
- [13 Vue Composables Tips](https://michaelnthiessen.com/13-vue-composables-tips/)
