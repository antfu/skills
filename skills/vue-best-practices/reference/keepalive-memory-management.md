---
title: KeepAlive Memory Management - Prevent Memory Leaks
impact: HIGH
impactDescription: Unbounded KeepAlive caching can cause severe memory issues, especially with large or numerous components
type: gotcha
tags: [vue3, keepalive, memory-leak, performance, cache, max-prop]
---

# KeepAlive Memory Management - Prevent Memory Leaks

**Impact: HIGH** - KeepAlive caches component instances in memory. Without proper limits and cleanup, this can lead to memory exhaustion, especially in applications with many routes or large component trees.

## Task Checklist

- [ ] Always use the `max` prop to limit cached instances
- [ ] Clean up resources in `onDeactivated` hook
- [ ] Monitor memory usage when using KeepAlive extensively
- [ ] Be cautious with KeepAlive on memory-heavy components
- [ ] Test on memory-constrained devices (mobile, low-spec laptops)

## The Problem: Unbounded Cache Growth

```vue
<template>
  <!-- DANGEROUS: No limit on cached components -->
  <KeepAlive>
    <component :is="currentView" />
  </KeepAlive>
</template>
```

When users navigate through many different components, each instance stays in memory:
- Chrome memory grows continuously
- VueComponent count keeps increasing
- App becomes sluggish or crashes

## Solution: Set Cache Limits

```vue
<template>
  <!-- LRU cache: keeps max 10, evicts least recently used -->
  <KeepAlive :max="10">
    <component :is="currentView" />
  </KeepAlive>
</template>
```

**How `max` works:**
- KeepAlive uses an LRU (Least Recently Used) cache algorithm
- When cache exceeds `max`, the oldest unused component is destroyed
- This caps memory usage to a predictable maximum

### Choose `max` Based on Your Use Case

```vue
<template>
  <!-- Tab-based UI: usually 3-5 tabs max -->
  <KeepAlive :max="5">
    <component :is="currentTab" />
  </KeepAlive>

  <!-- Route-based caching: limit to frequently visited pages -->
  <router-view v-slot="{ Component }">
    <KeepAlive :max="3" include="Dashboard,Settings,Profile">
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
```

## Clean Up Resources in Deactivated Hook

Even with `max`, cached components hold resources. Clean up when deactivated:

```vue
<script setup>
import { ref, onActivated, onDeactivated, onUnmounted } from 'vue'

const chartInstance = ref(null)
const websocket = ref(null)
const intervalId = ref(null)

onActivated(() => {
  // Resume or recreate resources
  websocket.value = new WebSocket('...')
  intervalId.value = setInterval(fetchData, 5000)
})

onDeactivated(() => {
  // IMPORTANT: Clean up to reduce memory footprint while cached
  chartInstance.value?.destroy()
  chartInstance.value = null

  websocket.value?.close()
  websocket.value = null

  clearInterval(intervalId.value)
  intervalId.value = null
})

// Final cleanup when truly destroyed
onUnmounted(() => {
  // Same cleanup for when component is evicted from cache
  chartInstance.value?.destroy()
  websocket.value?.close()
  clearInterval(intervalId.value)
})
</script>
```

## Third-Party Library Cleanup

Libraries that manipulate the DOM outside Vue need explicit cleanup:

```vue
<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue'

const mapContainer = ref(null)
let mapInstance = null

onMounted(() => {
  mapInstance = new MapLibrary(mapContainer.value)
})

onDeactivated(() => {
  // Some map libraries hold significant memory
  // Destroy and recreate on reactivation if needed
  mapInstance?.remove()
  mapInstance = null
})

onUnmounted(() => {
  mapInstance?.remove()
  mapInstance = null
})
</script>
```

## Avoid KeepAlive for Memory-Heavy Components

Some components should NOT be cached:

```vue
<script setup>
const heavyComponents = ['VideoPlayer', 'LargeDataGrid', 'MapView']
</script>

<template>
  <!-- Exclude memory-heavy components from cache -->
  <KeepAlive :exclude="heavyComponents" :max="5">
    <component :is="currentView" />
  </KeepAlive>
</template>
```

## Monitor Memory in Development

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

if (import.meta.env.DEV) {
  onActivated(() => {
    console.log('Activated - Memory:', performance.memory?.usedJSHeapSize)
  })

  onDeactivated(() => {
    console.log('Deactivated - Memory:', performance.memory?.usedJSHeapSize)
  })
}
</script>
```

## Key Points

1. **Always set `max`** - Never use KeepAlive without a reasonable limit
2. **Clean up in `onDeactivated`** - Don't wait for unmount to release resources
3. **Exclude heavy components** - Large data grids, media players, maps
4. **Test on target devices** - Mobile users have less memory
5. **Monitor in development** - Watch for growing memory usage

## Reference
- [Vue.js KeepAlive - Max Cached Instances](https://vuejs.org/guide/built-ins/keep-alive.html#max-cached-instances)
- [Vue.js Avoiding Memory Leaks](https://v2.vuejs.org/v2/cookbook/avoiding-memory-leaks.html)
- [GitHub Issue: Memory leak with keep-alive](https://github.com/vuejs/vue/issues/6759)
