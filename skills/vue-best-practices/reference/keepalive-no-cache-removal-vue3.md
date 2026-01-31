---
title: Vue 3 KeepAlive Has No Direct Cache Removal API
impact: MEDIUM
impactDescription: Unlike Vue 2, there is no way to programmatically remove a specific component from KeepAlive cache in Vue 3
type: gotcha
tags: [vue3, keepalive, cache, migration, vue2-to-vue3]
---

# Vue 3 KeepAlive Has No Direct Cache Removal API

**Impact: MEDIUM** - Vue 3 removed the `$destroy()` method that Vue 2 developers used to indirectly clear KeepAlive cache entries. There is no direct API to remove a specific cached component in Vue 3.

## Task Checklist

- [ ] Do not rely on programmatic cache removal from Vue 2 patterns
- [ ] Use `include`/`exclude` props for dynamic cache control
- [ ] Use key changes to force cache invalidation
- [ ] Set appropriate `max` prop to auto-evict old entries

## The Problem

### Vue 2 Pattern (No Longer Works)

```javascript
// Vue 2: Could destroy specific component instance
this.$children[0].$destroy()
```

### Vue 3: No Equivalent API

```javascript
// Vue 3: $destroy() does not exist
// There is NO direct way to remove a specific cached instance
```

## Solutions

### Solution 1: Dynamic Include/Exclude

Control cache membership via reactive props:

```vue
<script setup>
import { ref, computed } from 'vue'

const cachedViews = ref(['Dashboard', 'Settings', 'Profile'])

function removeFromCache(viewName) {
  cachedViews.value = cachedViews.value.filter(v => v !== viewName)
}

function addToCache(viewName) {
  if (!cachedViews.value.includes(viewName)) {
    cachedViews.value.push(viewName)
  }
}
</script>

<template>
  <KeepAlive :include="cachedViews">
    <component :is="currentView" />
  </KeepAlive>
</template>
```

When a component is removed from `include`, it will be destroyed on next switch.

### Solution 2: Key-Based Cache Invalidation

Change the key to force a fresh instance:

```vue
<script setup>
import { ref, reactive } from 'vue'

const currentView = ref('Dashboard')
const viewKeys = reactive({
  Dashboard: 0,
  Settings: 0,
  Profile: 0
})

function invalidateCache(viewName) {
  viewKeys[viewName]++
}

function switchView(viewName) {
  currentView.value = viewName
}

// Force fresh Dashboard on next visit
function refreshDashboard() {
  invalidateCache('Dashboard')
}
</script>

<template>
  <KeepAlive>
    <component
      :is="currentView"
      :key="`${currentView}-${viewKeys[currentView]}`"
    />
  </KeepAlive>
</template>
```

### Solution 3: Conditional KeepAlive

Wrap or unwrap based on cache need:

```vue
<script setup>
import { ref } from 'vue'

const currentView = ref('Dashboard')
const shouldCache = ref(true)

function clearCacheAndSwitch(viewName) {
  shouldCache.value = false
  currentView.value = viewName
  // Re-enable caching after the switch
  nextTick(() => {
    shouldCache.value = true
  })
}
</script>

<template>
  <KeepAlive v-if="shouldCache">
    <component :is="currentView" />
  </KeepAlive>
  <component v-else :is="currentView" />
</template>
```

### Solution 4: Use Max for Automatic Eviction

Let LRU cache handle cleanup:

```vue
<template>
  <!-- Automatically evicts least recently used when cache is full -->
  <KeepAlive :max="5">
    <component :is="currentView" />
  </KeepAlive>
</template>
```

## Vue Router: Clear Cache on Certain Navigations

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const cachedRoutes = ref(['Dashboard', 'Settings'])

// Clear specific route from cache when navigating from certain paths
watch(() => route.name, (newRoute, oldRoute) => {
  if (oldRoute === 'Login') {
    // User just logged in - clear and refresh Dashboard
    cachedRoutes.value = cachedRoutes.value.filter(r => r !== 'Dashboard')
    nextTick(() => {
      cachedRoutes.value.push('Dashboard')
    })
  }
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <KeepAlive :include="cachedRoutes">
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
```

## Key Points

1. **No `$destroy()` in Vue 3** - Cannot directly remove cached instances
2. **Use dynamic `include`** - Reactively control which components are cached
3. **Use key changes** - Changing key creates a new cache entry
4. **Use `max` prop** - LRU eviction handles cleanup automatically
5. **Plan cache strategy** - Design around these constraints upfront

## Reference
- [Vue.js KeepAlive Documentation](https://vuejs.org/guide/built-ins/keep-alive.html)
- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [Vue RFC Discussion #283: Custom cache strategy for KeepAlive](https://github.com/vuejs/rfcs/discussions/283)
