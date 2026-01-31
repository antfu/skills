---
title: Use KeepAlive to Preserve Dynamic Component State
impact: MEDIUM
impactDescription: Dynamic component switching destroys and recreates components, losing all internal state unless wrapped in KeepAlive
type: best-practice
tags: [vue3, dynamic-components, keepalive, component-is, state-preservation, performance]
---

# Use KeepAlive to Preserve Dynamic Component State

**Impact: MEDIUM** - When switching between components using `<component :is="...">`, Vue destroys the old component and creates a new one. All internal state (form inputs, scroll position, fetched data) is lost. Wrapping dynamic components in `<KeepAlive>` caches them and preserves their state.

## Task Checklist

- [ ] Wrap `<component :is>` with `<KeepAlive>` when state preservation is needed
- [ ] Use `include` and `exclude` to control which components are cached
- [ ] Use `max` to limit cache size and prevent memory issues
- [ ] Implement `onActivated`/`onDeactivated` hooks for cache-aware logic
- [ ] Consider NOT using KeepAlive when fresh state is desired

## The Problem: State Loss

```vue
<script setup>
import { ref, shallowRef } from 'vue'
import TabA from './TabA.vue'
import TabB from './TabB.vue'

const currentTab = shallowRef(TabA)
</script>

<template>
  <button @click="currentTab = TabA">Tab A</button>
  <button @click="currentTab = TabB">Tab B</button>

  <!-- State is lost when switching tabs! -->
  <component :is="currentTab" />
</template>
```

If TabA has a form with user input, switching to TabB and back resets all input.

## Solution: KeepAlive

```vue
<template>
  <button @click="currentTab = TabA">Tab A</button>
  <button @click="currentTab = TabB">Tab B</button>

  <!-- State is preserved when switching -->
  <KeepAlive>
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

Now TabA's state persists even when TabB is displayed.

## Controlling What Gets Cached

### Include/Exclude by Name

Only cache specific components:

```vue
<template>
  <!-- Only cache components named 'TabA' or 'TabB' -->
  <KeepAlive include="TabA,TabB">
    <component :is="currentTab" />
  </KeepAlive>

  <!-- Cache all except 'HeavyComponent' -->
  <KeepAlive exclude="HeavyComponent">
    <component :is="currentTab" />
  </KeepAlive>

  <!-- Using regex -->
  <KeepAlive :include="/^Tab/">
    <component :is="currentTab" />
  </KeepAlive>

  <!-- Using array -->
  <KeepAlive :include="['TabA', 'TabB', 'Settings']">
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

**Important:** Components must have a `name` option to be matched:

```vue
<!-- TabA.vue -->
<script>
export default {
  name: 'TabA' // Required for include/exclude matching
}
</script>

<script setup>
// ...composition API code
</script>
```

Or in Vue 3.3+ with `<script setup>`:

```vue
<script setup>
defineOptions({
  name: 'TabA'
})
</script>
```

### Limit Cache Size

Prevent memory issues with many cached components:

```vue
<template>
  <!-- Only keep last 5 components in cache -->
  <KeepAlive :max="5">
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

When cache exceeds `max`, the least recently accessed component is destroyed.

## Lifecycle Hooks: onActivated and onDeactivated

Cached components need special lifecycle hooks:

```vue
<!-- TabA.vue -->
<script setup>
import { onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

// Only called on first mount, NOT when switching back
onMounted(() => {
  console.log('TabA mounted (once)')
})

// Only called when truly destroyed, NOT when switching away
onUnmounted(() => {
  console.log('TabA unmounted')
})

// Called EVERY time component becomes visible
onActivated(() => {
  console.log('TabA activated')
  // Refresh data, resume timers, etc.
  fetchLatestData()
})

// Called EVERY time component is hidden (but kept in cache)
onDeactivated(() => {
  console.log('TabA deactivated')
  // Pause timers, save draft, etc.
  pauseAutoRefresh()
})
</script>
```

**Common use cases for activation hooks:**
- Refresh stale data when returning to a tab
- Resume/pause video or audio playback
- Reconnect/disconnect WebSocket connections
- Save/restore scroll position
- Track analytics for tab views

## KeepAlive with Vue Router

For route-based caching:

```vue
<!-- App.vue -->
<template>
  <router-view v-slot="{ Component }">
    <KeepAlive include="Dashboard,Settings">
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
```

**With transition:**

```vue
<template>
  <router-view v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <KeepAlive>
        <component :is="Component" :key="$route.fullPath" />
      </KeepAlive>
    </Transition>
  </router-view>
</template>
```

## When NOT to Use KeepAlive

Don't cache when:

```vue
<!-- Fresh data needed each time -->
<template>
  <!-- NO KeepAlive - want fresh search results each visit -->
  <component :is="currentView" />
</template>
```

- Form should reset between visits
- Data must be fresh (real-time dashboards)
- Component has significant memory footprint
- Security-sensitive data should be cleared

## Performance Considerations

```vue
<script setup>
import { shallowRef } from 'vue'
import TabA from './TabA.vue'
import TabB from './TabB.vue'

// Use shallowRef for component references
// Regular ref would deeply track the component object unnecessarily
const currentTab = shallowRef(TabA)
</script>
```

## Reference
- [Vue.js KeepAlive](https://vuejs.org/guide/built-ins/keep-alive.html)
- [Vue.js Dynamic Components](https://vuejs.org/guide/essentials/component-basics.html#dynamic-components)
