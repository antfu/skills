---
title: Wrap Destructured Props in Getters for watch and Composables
impact: MEDIUM
impactDescription: Passing destructured prop values directly to watch or composables loses reactivity
type: gotcha
tags: [vue3, props, reactivity, watch, composables, destructuring]
---

# Wrap Destructured Props in Getters for watch and Composables

**Impact: MEDIUM** - When you destructure props with `defineProps`, the destructured variables are reactive in templates but passing them directly to `watch()` or external composables will pass the current value, not a reactive source. The watcher or composable won't track future changes.

Vue 3.5+ automatically transforms destructured props for template reactivity, but external functions still need getter wrappers.

## Task Checklist

- [ ] Wrap destructured props in arrow functions when passing to `watch()`
- [ ] Use getter functions when passing destructured props to composables
- [ ] Verify composables use `toValue()` to normalize getter/ref inputs
- [ ] Consider using `props.propertyName` directly if getter syntax feels awkward

**Incorrect:**
```vue
<script setup>
import { watch } from 'vue'
import { useDebounce } from './composables'

const { searchQuery, userId } = defineProps(['searchQuery', 'userId'])

// WRONG: Passing value, not reactive source
// This captures the initial value only - changes won't trigger the watcher
watch(searchQuery, (newValue) => {
  console.log('Query changed:', newValue)  // Never fires after initial!
})

// WRONG: Composable receives static value
const debouncedQuery = useDebounce(searchQuery, 300)  // Won't update
</script>
```

**Correct:**
```vue
<script setup>
import { watch } from 'vue'
import { useDebounce } from './composables'

const { searchQuery, userId } = defineProps(['searchQuery', 'userId'])

// CORRECT: Wrap in getter function to maintain reactivity
watch(() => searchQuery, (newValue) => {
  console.log('Query changed:', newValue)  // Fires on every change
})

// CORRECT: Pass getter to composable
const debouncedQuery = useDebounce(() => searchQuery, 300)
</script>
```

## Alternative: Use props Object Directly

```vue
<script setup>
import { watch } from 'vue'

const props = defineProps(['searchQuery', 'userId'])

// Also correct: Watch via props object (no getter needed)
watch(() => props.searchQuery, (newValue) => {
  console.log('Query changed:', newValue)
})

// Watch multiple props
watch(
  () => [props.searchQuery, props.userId],
  ([newQuery, newUserId]) => {
    console.log('Props changed:', newQuery, newUserId)
  }
)
</script>
```

## Writing Composables That Accept Props

When creating composables that should work with destructured props:

```javascript
// composables/useDebounce.js
import { ref, watch, toValue } from 'vue'

export function useDebounce(source, delay = 300) {
  const debounced = ref(toValue(source))  // toValue handles both getter and ref
  let timeout

  watch(
    // toValue normalizes getter functions and refs
    () => toValue(source),
    (newValue) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        debounced.value = newValue
      }, delay)
    }
  )

  return debounced
}
```

```vue
<!-- Usage -->
<script setup>
const { query } = defineProps(['query'])

// Works with getter
const debouncedQuery = useDebounce(() => query, 300)
</script>
```

## Vue 3.5+ Reactive Destructuring

Vue 3.5+ added reactive props destructuring. The compiler transforms:

```javascript
const { foo } = defineProps(['foo'])
```

Into something like:

```javascript
const __props = defineProps(['foo'])
// foo accesses __props.foo reactively in templates
```

However, external function calls still need getters because JavaScript itself passes values, not references.

## Reference
- [Vue.js Props - Reactive Props Destructure](https://vuejs.org/guide/components/props.html#reactive-props-destructure)
- [Vue.js Watchers - Watch Source Types](https://vuejs.org/guide/essentials/watchers.html#watch-source-types)
