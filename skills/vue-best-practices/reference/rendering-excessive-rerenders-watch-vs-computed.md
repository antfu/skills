---
title: Avoid Excessive Re-renders from Misused Watchers
impact: HIGH
impactDescription: Using watch instead of computed, or deep watchers unnecessarily, triggers excessive component re-renders
type: gotcha
tags: [vue3, rendering, performance, watch, computed, reactivity, re-renders]
---

# Avoid Excessive Re-renders from Misused Watchers

**Impact: HIGH** - Improper use of watchers is a common cause of performance issues. Deep watchers track every nested property change, and using watch when computed would suffice creates unnecessary reactive updates that trigger re-renders.

## Task Checklist

- [ ] Use `computed` for derived values, not `watch` + manual state updates
- [ ] Avoid `deep: true` on large objects unless absolutely necessary
- [ ] When deep watching is needed, watch specific nested paths instead
- [ ] Never trigger state changes inside watch that cause the watch to re-fire

**Incorrect:**
```vue
<script setup>
import { ref, watch } from 'vue'

const user = ref({ name: 'John', settings: { theme: 'dark', notifications: true } })
const displayName = ref('')

// BAD: Using watch to compute a derived value
// This triggers an extra reactive update cycle
watch(() => user.value.name, (name) => {
  displayName.value = `User: ${name}`
}, { immediate: true })

// BAD: Deep watcher on a large object
// Fires on ANY nested change, even unrelated ones
const items = ref([/* 1000 items with nested properties */])
watch(items, (newItems) => {
  console.log('Items changed')  // Fires on every tiny change
}, { deep: true })
</script>
```

**Correct:**
```vue
<script setup>
import { ref, computed, watch } from 'vue'

const user = ref({ name: 'John', settings: { theme: 'dark', notifications: true } })

// GOOD: Use computed for derived values
// No extra reactive updates, automatically cached
const displayName = computed(() => `User: ${user.value.name}`)

// GOOD: Watch specific paths, not the entire object
const items = ref([/* 1000 items */])
watch(
  () => items.value.length,  // Only watch the length
  (newLength) => {
    console.log(`Items count: ${newLength}`)
  }
)

// GOOD: Watch specific nested property
watch(
  () => user.value.settings.theme,
  (newTheme) => {
    applyTheme(newTheme)  // Side effect - appropriate for watch
  }
)
</script>
```

## When to Use Watch vs Computed

| Use Case | Use This |
|----------|----------|
| Derive a value from state | `computed` |
| Format/transform data for display | `computed` |
| Perform side effects (API calls, DOM updates) | `watch` |
| React to route changes | `watch` |
| Sync with external systems | `watch` |

## Infinite Loop from Watch

```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)

// DANGER: Infinite loop!
watch(count, (newVal) => {
  count.value = newVal + 1  // Modifies watched source -> triggers watch again
})

// CORRECT: Use computed or avoid self-modification
const doubleCount = computed(() => count.value * 2)
</script>
```

## Efficient Deep Watching

When you must watch complex objects:

```vue
<script setup>
import { ref, watch, toRaw } from 'vue'

const formData = ref({
  personal: { name: '', email: '' },
  address: { street: '', city: '' },
  preferences: { /* many properties */ }
})

// BAD: Watches everything, including preferences changes
watch(formData, () => {
  saveForm()
}, { deep: true })

// GOOD: Watch only the sections you care about
watch(
  () => formData.value.personal,
  () => savePersonalSection(),
  { deep: true }  // Deep only on this small subtree
)

// GOOD: Watch serialized version for change detection
watch(
  () => JSON.stringify(formData.value),
  () => {
    markFormDirty()
  }
)
</script>
```

## Array Mutation Gotcha

```vue
<script setup>
import { ref, watch } from 'vue'

const items = ref([1, 2, 3])

// This watch won't trigger on sort/reverse without deep!
watch(items, () => {
  console.log('Items changed')
})

items.value.sort()  // Watch doesn't fire - array reference unchanged

// Solution 1: Use deep (performance cost)
watch(items, callback, { deep: true })

// Solution 2: Replace array instead of mutating
items.value = [...items.value].sort()
</script>
```

## Reference
- [Vue.js Watchers](https://vuejs.org/guide/essentials/watchers.html)
- [Vue.js Computed Properties](https://vuejs.org/guide/essentials/computed.html)
- [Vue.js Performance - Reactivity](https://vuejs.org/guide/best-practices/performance.html#reduce-reactivity-overhead-for-large-immutable-structures)
