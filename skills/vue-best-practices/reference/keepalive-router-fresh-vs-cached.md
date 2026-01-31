---
title: KeepAlive Router Navigation Fresh vs Cached Problem
impact: MEDIUM
impactDescription: When using KeepAlive with Vue Router, users may get cached pages when they expect fresh content
type: gotcha
tags: [vue3, keepalive, vue-router, navigation, cache, ux]
---

# KeepAlive Router Navigation Fresh vs Cached Problem

**Impact: MEDIUM** - When using KeepAlive with Vue Router, navigation from menus or breadcrumbs may show cached (stale) content when users expect a fresh page. This creates confusing UX where the page appears "stuck" on old data.

## Task Checklist

- [ ] Define clear rules for when to use cached vs fresh pages
- [ ] Use route keys strategically to control freshness
- [ ] Implement `onActivated` to refresh stale data
- [ ] Consider navigation source when deciding cache behavior

## The Problem

```vue
<!-- App.vue -->
<template>
  <nav>
    <router-link to="/products">Products</router-link>
  </nav>

  <router-view v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
```

**Scenario:**
1. User visits `/products?category=shoes` - sees shoes
2. User navigates to `/products?category=hats` - sees hats
3. User clicks "Products" nav link (to `/products`)
4. **Expected:** Fresh products page or default category
5. **Actual:** Still shows hats (cached state)!

Users clicking navigation expect a "fresh start" but get the cached state.

## Solutions

### Solution 1: Use Route Full Path as Key

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <KeepAlive>
      <!-- Different query params = different cache entry -->
      <component :is="Component" :key="route.fullPath" />
    </KeepAlive>
  </router-view>
</template>
```

**Tradeoff:** Creates separate cache entry for each unique URL. May increase memory usage.

### Solution 2: Refresh Data on Activation

```vue
<!-- Products.vue -->
<script setup>
import { ref, onActivated, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const products = ref([])
const lastParams = ref(null)

async function fetchProducts() {
  const params = route.query
  products.value = await api.getProducts(params)
  lastParams.value = JSON.stringify(params)
}

// Initial fetch
fetchProducts()

// Refresh when re-activated if params changed
onActivated(() => {
  const currentParams = JSON.stringify(route.query)
  if (currentParams !== lastParams.value) {
    fetchProducts()
  }
})

// Also watch for changes while component is active
watch(() => route.query, fetchProducts, { deep: true })
</script>
```

### Solution 3: Navigation-Aware Cache Control

Different behavior based on how user navigated:

```vue
<script setup>
import { ref, onActivated } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'

const route = useRoute()
const router = useRouter()
const shouldRefresh = ref(false)

// Mark for refresh when coming from nav link (no query params)
onBeforeRouteUpdate((to, from) => {
  // If navigating to base path without params, user wants fresh view
  if (Object.keys(to.query).length === 0 && Object.keys(from.query).length > 0) {
    shouldRefresh.value = true
  }
})

onActivated(() => {
  if (shouldRefresh.value) {
    resetToDefaultState()
    shouldRefresh.value = false
  }
})

function resetToDefaultState() {
  // Reset filters, clear search, show default view
}
</script>
```

### Solution 4: Don't Cache Route-Dependent Pages

```vue
<script setup>
// Don't cache pages where query params significantly change content
const noCacheRoutes = ['ProductSearch', 'SearchResults', 'FilteredList']
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <KeepAlive :exclude="noCacheRoutes">
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>
```

### Solution 5: Use Route Meta for Fresh Navigation

```javascript
// router.js
const routes = [
  {
    path: '/products',
    component: Products,
    meta: {
      keepAlive: true,
      refreshOnDirectNavigation: true
    }
  }
]
```

```vue
<!-- App.vue -->
<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const forceRefreshKey = ref(0)

// Watch for navigation to routes that want fresh state
watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    // Direct navigation to base path = user wants fresh
    if (route.meta.refreshOnDirectNavigation && !route.query.length) {
      forceRefreshKey.value++
    }
  }
)
</script>

<template>
  <router-view v-slot="{ Component }">
    <KeepAlive>
      <component
        :is="Component"
        :key="`${route.name}-${forceRefreshKey}`"
      />
    </KeepAlive>
  </router-view>
</template>
```

## Best Practice: Be Explicit About Cache Behavior

Document your caching rules:

```javascript
// cacheRules.js
export const CACHE_RULES = {
  // Always cached - static content, user preferences
  ALWAYS: ['Dashboard', 'Settings', 'Profile'],

  // Never cached - dynamic search/filter results
  NEVER: ['SearchResults', 'FilteredProducts'],

  // Cached but refreshes on activation
  STALE_WHILE_REVALIDATE: ['Notifications', 'Messages']
}
```

## Key Points

1. **User expectation mismatch** - Nav links often imply "fresh" but get cached
2. **Use `fullPath` key carefully** - Prevents reuse but increases memory
3. **Implement `onActivated` refresh** - Check if data needs updating
4. **Don't cache filter/search pages** - These are highly query-dependent
5. **Document cache behavior** - Make rules explicit for your team

## Reference
- [Vue.js KeepAlive Documentation](https://vuejs.org/guide/built-ins/keep-alive.html)
- [Vue Router Navigation](https://router.vuejs.org/guide/essentials/navigation.html)
- [Stack Keep-Alive Library](https://github.com/Zippowxk/stack-keep-alive)
