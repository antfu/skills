---
title: Preserve Reactivity When Passing Props to Composables
impact: HIGH
impactDescription: Passing prop values directly to composables loses reactivity - composable won't update when props change
type: gotcha
tags: [vue3, props, composables, reactivity, composition-api]
---

# Preserve Reactivity When Passing Props to Composables

**Impact: HIGH** - A common mistake is passing data received from a prop directly to a composable. This passes the current value, not a reactive source. When the prop updates, the composable won't receive the new value, leading to stale data.

This is one of the most frequent sources of "my composable doesn't update" bugs in Vue 3.

## Task Checklist

- [ ] Pass props to composables via computed properties or getter functions
- [ ] Use `toRefs()` when passing multiple props to maintain reactivity
- [ ] In composables, use `toValue()` to normalize inputs that may be getters or refs
- [ ] Test that composable output updates when props change

**Incorrect:**
```vue
<script setup>
import { useFetch } from './composables/useFetch'
import { useDebounce } from './composables/useDebounce'

const props = defineProps({
  userId: Number,
  searchQuery: String
})

// WRONG: Passes initial value, not reactive source
// useFetch will never refetch when userId changes!
const { data } = useFetch(`/api/users/${props.userId}`)

// WRONG: Debounced value is frozen at initial searchQuery
const debouncedQuery = useDebounce(props.searchQuery, 300)
</script>
```

**Correct:**
```vue
<script setup>
import { computed } from 'vue'
import { useFetch } from './composables/useFetch'
import { useDebounce } from './composables/useDebounce'

const props = defineProps({
  userId: Number,
  searchQuery: String
})

// CORRECT: Use computed to create reactive URL
const userUrl = computed(() => `/api/users/${props.userId}`)
const { data } = useFetch(userUrl)

// CORRECT: Pass getter function to preserve reactivity
const debouncedQuery = useDebounce(() => props.searchQuery, 300)
</script>
```

## Pattern: Using toRefs for Multiple Props

```vue
<script setup>
import { toRefs } from 'vue'
import { useUserForm } from './composables/useUserForm'

const props = defineProps({
  initialName: String,
  initialEmail: String,
  initialAge: Number
})

// Convert all props to refs, preserving reactivity
const { initialName, initialEmail, initialAge } = toRefs(props)

// Now each is a ref that tracks prop changes
const { form, isValid } = useUserForm({
  name: initialName,
  email: initialEmail,
  age: initialAge
})
</script>
```

## Writing Reactivity-Safe Composables

Composables should accept multiple input types using `toValue()`:

```javascript
// composables/useDebounce.js
import { ref, watch, toValue } from 'vue'

export function useDebounce(source, delay = 300) {
  // toValue() handles: ref, getter function, or plain value
  const debounced = ref(toValue(source))
  let timeout

  watch(
    () => toValue(source),  // Normalizes any input type
    (newValue) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        debounced.value = newValue
      }, delay)
    },
    { immediate: true }
  )

  return debounced
}
```

```javascript
// composables/useFetch.js
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  watchEffect(async () => {
    loading.value = true
    error.value = null

    try {
      // toValue() makes this work with computed, getter, or string
      const response = await fetch(toValue(url))
      data.value = await response.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  })

  return { data, error, loading }
}
```

## Quick Reference: Input Types

| Input to Composable | Reactive? | Example |
|---------------------|-----------|---------|
| `props.value` | No | `useFetch(props.userId)` |
| `computed(() => ...)` | Yes | `useFetch(computed(() => props.userId))` |
| `() => props.value` | Yes* | `useFetch(() => props.userId)` |
| `toRef(props, 'key')` | Yes | `useFetch(toRef(props, 'userId'))` |
| `toRefs(props).key` | Yes | `const { userId } = toRefs(props); useFetch(userId)` |

*Requires composable to use `toValue()` internally

## Reference
- [Vue.js Reactivity API - toValue](https://vuejs.org/api/reactivity-utilities.html#tovalue)
- [Vue.js Composables - Conventions and Best Practices](https://vuejs.org/guide/reusability/composables.html#conventions-and-best-practices)
