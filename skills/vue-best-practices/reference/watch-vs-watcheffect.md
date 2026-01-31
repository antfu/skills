---
title: Choose watch vs watchEffect Based on Dependency Control Needs
impact: MEDIUM
impactDescription: Wrong choice leads to unnecessary re-runs or missed dependency tracking
type: efficiency
tags: [vue3, watch, watchEffect, watchers, reactivity, best-practices]
---

# Choose watch vs watchEffect Based on Dependency Control Needs

**Impact: MEDIUM** - Using `watch` when `watchEffect` would be cleaner leads to repetitive code. Using `watchEffect` when `watch` is needed can cause unexpected re-runs or missed dependencies (especially with async).

Use `watchEffect` for simple cases where the callback uses the same state as what should trigger it. Use `watch` when you need precise control over what triggers the callback, access to old values, or lazy execution.

## Task Checklist

- [ ] Use `watchEffect` when callback logic uses the same state it should react to
- [ ] Use `watch` when you need old value comparison
- [ ] Use `watch` when you need lazy execution (not immediate)
- [ ] Use `watch` for async callbacks with dependencies after await
- [ ] Use `watch` when callback should not run on initial mount

## Comparison Table

| Feature | `watch` | `watchEffect` |
|---------|---------|---------------|
| Dependency tracking | Explicit (you specify) | Automatic (uses accessed properties) |
| Lazy by default | Yes (runs only on change) | No (runs immediately) |
| Access old value | Yes | No |
| Async dependency tracking | Full control | Only before first await |
| Multiple sources | Array syntax | Automatic |

**When to prefer `watchEffect`:**
```vue
<script setup>
import { ref, watchEffect } from 'vue'

const todoId = ref(1)
const data = ref(null)

// GOOD: watchEffect is cleaner when callback uses same state
watchEffect(async () => {
  const response = await fetch(
    `https://api.example.com/todos/${todoId.value}`
  )
  data.value = await response.json()
})
</script>
```

**When to prefer `watch`:**
```vue
<script setup>
import { ref, watch } from 'vue'

const todoId = ref(1)
const data = ref(null)

// BETTER with watch when:

// 1. You need old value
watch(todoId, (newId, oldId) => {
  console.log(`Changed from ${oldId} to ${newId}`)
})

// 2. You don't want immediate execution
watch(todoId, () => {
  // Only runs when todoId changes, not on mount
  fetchData()
})

// 3. You have dependencies after await
watch(todoId, async (id) => {
  const response = await fetch(`/api/todos/${id}`)
  // More reactive access here still triggers correctly
  // because we explicitly specified todoId as the source
})
</script>
```

## Avoid Redundant Code with watchEffect

```vue
<script setup>
import { ref, watch, watchEffect } from 'vue'

const searchQuery = ref('')
const category = ref('all')
const results = ref([])

// BAD: Repetitive - listing same deps in source and using in callback
watch(
  [searchQuery, category],
  ([query, cat]) => {
    fetchResults(query, cat)  // Same variables repeated
  }
)

// GOOD: watchEffect removes repetition
watchEffect(() => {
  fetchResults(searchQuery.value, category.value)
})
</script>
```

## Use watch for Lazy Behavior

```vue
<script setup>
import { ref, watch, watchEffect } from 'vue'

const userId = ref(null)

// BAD: Runs immediately even when userId is null
watchEffect(() => {
  if (userId.value) {
    loadUserProfile(userId.value)
  }
})

// GOOD: Only runs when userId actually changes
watch(userId, (id) => {
  if (id) {
    loadUserProfile(id)
  }
})

// ALSO GOOD: watch with immediate when you need both behaviors
watch(
  userId,
  (id) => {
    if (id) loadUserProfile(id)
  },
  { immediate: true }  // Explicit about running immediately
)
</script>
```

## Use watch for Old Value Comparison

```vue
<script setup>
import { ref, watch } from 'vue'

const status = ref('pending')

// Only watch() provides old value
watch(status, (newStatus, oldStatus) => {
  if (oldStatus === 'pending' && newStatus === 'approved') {
    showApprovalNotification()
  }

  if (oldStatus === 'approved' && newStatus === 'rejected') {
    showRejectionWarning()
  }
})
</script>
```

## Use watch for Complex Async Dependencies

```vue
<script setup>
import { ref, watch } from 'vue'

const filters = ref({ status: 'active', sort: 'date' })
const page = ref(1)
const results = ref([])

// BETTER: watch with explicit sources for async
// All dependencies tracked regardless of await placement
watch(
  [filters, page],
  async ([currentFilters, currentPage]) => {
    const data = await fetchWithFilters(currentFilters)

    // These are still correctly tracked:
    results.value = paginateResults(data, currentPage)
  },
  { deep: true }
)
</script>
```

## Reference
- [Vue.js Watchers - watch vs. watchEffect](https://vuejs.org/guide/essentials/watchers.html#watch-vs-watcheffect)
