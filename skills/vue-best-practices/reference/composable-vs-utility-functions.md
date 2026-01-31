---
title: Don't Wrap Utility Functions as Composables
impact: MEDIUM
impactDescription: Wrapping stateless utility functions as composables adds unnecessary complexity without any benefit
type: best-practice
tags: [vue3, composables, composition-api, utilities, patterns]
---

# Don't Wrap Utility Functions as Composables

**Impact: MEDIUM** - Not every function needs to be a composable. Composables are specifically for encapsulating **stateful logic** that uses Vue's reactivity system. Pure utility functions that just transform data or perform calculations should remain as regular JavaScript functions.

Wrapping utility functions as composables adds unnecessary abstraction, makes code harder to understand, and provides no benefits since there's no reactive state to manage.

## Task Checklist

- [ ] Identify if the function manages reactive state or uses Vue lifecycle hooks
- [ ] Keep pure transformation/calculation functions as regular utilities
- [ ] Export utilities directly, not wrapped in a function that returns them
- [ ] Reserve the "use" prefix for actual composables

**Incorrect:**
```javascript
// WRONG: These are just utility functions wrapped unnecessarily

// Adds no value - no reactive state
export function useFormatters() {
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US').format(date)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return { formatDate, formatCurrency, capitalize }
}

// WRONG: Pure calculation, no reactive state
export function useMath() {
  const add = (a, b) => a + b
  const multiply = (a, b) => a * b
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

  return { add, multiply, clamp }
}

// Usage adds ceremony for no benefit
const { formatDate, formatCurrency } = useFormatters()
const { clamp } = useMath()
```

**Correct:**
```javascript
// CORRECT: Export as regular utility functions

// utils/formatters.js
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US').format(date)
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// utils/math.js
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// Usage - simple and direct
import { formatDate, formatCurrency } from '@/utils/formatters'
import { clamp } from '@/utils/math'
```

## When to Use Composables vs Utilities

| Use Composable When... | Use Utility When... |
|------------------------|---------------------|
| Managing reactive state (`ref`, `reactive`) | Pure data transformation |
| Using lifecycle hooks (`onMounted`, `onUnmounted`) | Stateless calculations |
| Setting up watchers (`watch`, `watchEffect`) | String/array manipulation |
| Creating computed properties | Formatting functions |
| Needs cleanup on component unmount | Validation functions |
| State changes over time | Mathematical operations |

## Examples: Composables vs Utilities

```javascript
// COMPOSABLE: Has reactive state and lifecycle
export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  function update() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return { width, height }
}

// UTILITY: Pure transformation, no state
export function parseQueryString(queryString) {
  return Object.fromEntries(new URLSearchParams(queryString))
}

// COMPOSABLE: Manages form state over time
export function useForm(initialValues) {
  const values = ref({ ...initialValues })
  const errors = ref({})
  const isDirty = computed(() =>
    JSON.stringify(values.value) !== JSON.stringify(initialValues)
  )

  function reset() {
    values.value = { ...initialValues }
    errors.value = {}
  }

  return { values, errors, isDirty, reset }
}

// UTILITY: Stateless validation
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateRequired(value) {
  return value !== null && value !== undefined && value !== ''
}
```

## Mixed Pattern: Composable Using Utilities

It's perfectly fine for composables to use utility functions:

```javascript
// utils/validators.js
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// composables/useEmailInput.js
import { ref, computed } from 'vue'
import { validateEmail } from '@/utils/validators'

export function useEmailInput(initialValue = '') {
  const email = ref(initialValue)
  const isValid = computed(() => validateEmail(email.value))
  const error = computed(() =>
    email.value && !isValid.value ? 'Invalid email format' : null
  )

  return { email, isValid, error }
}
```

## File Organization

```
src/
  composables/        # Stateful reactive logic
    useAuth.js
    useFetch.js
    useLocalStorage.js
  utils/              # Pure utility functions
    formatters.js
    validators.js
    math.js
    strings.js
```

## Reference
- [Vue.js Composables - What is a Composable](https://vuejs.org/guide/reusability/composables.html#what-is-a-composable)
- [Common Mistakes Creating Composition Functions](https://www.telerik.com/blogs/common-mistakes-creating-composition-functions-vue)
