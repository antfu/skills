---
title: Use shallowRef for Large Objects and External Data
impact: MEDIUM
impactDescription: Deep reactivity on large objects causes performance overhead - shallowRef only tracks .value changes
type: efficiency
tags: [vue3, reactivity, shallowRef, performance, optimization]
---

# Use shallowRef for Large Objects and External Data

**Impact: MEDIUM** - By default, `ref()` makes objects deeply reactive, wrapping all nested properties in Proxies. For large data structures, external libraries, or immutable data, this causes unnecessary overhead. Use `shallowRef()` to only track `.value` changes.

`shallowRef()` is ideal for large datasets from APIs, class instances, DOM nodes, or objects managed by external libraries. Vue only tracks when `.value` is replaced, not internal mutations, significantly reducing reactivity overhead.

## Task Checklist

- [ ] Use `shallowRef()` for large API response data that won't be mutated
- [ ] Use `shallowRef()` for external library objects (maps, charts, etc.)
- [ ] Use `shallowRef()` for class instances with their own state management
- [ ] Use `markRaw()` for objects that should never be reactive (e.g., third-party instances)
- [ ] Remember: with shallowRef, you must replace `.value` entirely to trigger updates

**Incorrect:**
```javascript
import { ref } from 'vue'

// INEFFICIENT: Deep reactivity on large dataset
const users = ref(await fetchUsers()) // 10,000 users, each deeply reactive

// INEFFICIENT: External library wrapped in Proxy
const mapInstance = ref(new mapboxgl.Map({ /* ... */ }))

// INEFFICIENT: Large immutable API response
const apiResponse = ref(await fetch('/api/big-data').then(r => r.json()))
```

**Correct:**
```javascript
import { shallowRef, markRaw, triggerRef } from 'vue'

// EFFICIENT: Only .value replacement is tracked
const users = shallowRef(await fetchUsers())

// Update by replacing the entire array
users.value = await fetchUsers()

// If you mutate and need to trigger update, use triggerRef
users.value.push(newUser)
triggerRef(users) // Manually trigger watchers

// EFFICIENT: External library object
const mapInstance = shallowRef(null)
onMounted(() => {
  mapInstance.value = new mapboxgl.Map({ /* ... */ })
})

// BEST for objects that should NEVER be reactive
const thirdPartyLib = markRaw(new SomeLibrary())
// This object won't be wrapped in Proxy even if used in reactive()
```

```vue
<script setup>
import { shallowRef } from 'vue'

// Large paginated data - only care when page changes
const pageData = shallowRef([])

async function loadPage(page) {
  // Replace entirely to trigger reactivity
  pageData.value = await api.getPage(page)
}

// Template still works - shallowRef unwraps in template
</script>

<template>
  <div v-for="item in pageData" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

```javascript
// Comparison: ref() vs shallowRef()

// With ref(): Vue wraps EVERY nested property
const deep = ref({
  level1: {
    level2: {
      level3: { value: 1 }
    }
  }
})
deep.value.level1.level2.level3.value++ // Tracked!

// With shallowRef(): Only .value is tracked
const shallow = shallowRef({
  level1: {
    level2: {
      level3: { value: 1 }
    }
  }
})
shallow.value.level1.level2.level3.value++ // NOT tracked!
shallow.value = { /* new object */ } // Tracked!
```

## Reference
- [Vue.js Reactivity Fundamentals - Reducing Reactivity Overhead](https://vuejs.org/guide/best-practices/performance.html#reduce-reactivity-overhead-for-large-immutable-structures)
- [Vue.js shallowRef API](https://vuejs.org/api/reactivity-advanced.html#shallowref)
- [Vue.js markRaw API](https://vuejs.org/api/reactivity-advanced.html#markraw)
