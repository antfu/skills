# Suspense Only Reverts to Pending on Root Node Replacement

## Rule

Once resolved, `<Suspense>` only reverts to a pending state if the root node of the `#default` slot is replaced. New async dependencies nested deeper in the tree will NOT cause `<Suspense>` to revert to a pending state.

## Why This Matters

This is a common source of confusion. Developers expect Suspense to show the fallback whenever any async component in the tree starts loading, but it only triggers for root-level changes. Nested async updates complete silently without showing any loading indicator.

## Bad Code

```vue
<script setup>
import { ref } from 'vue'

const activeTab = ref('dashboard')
</script>

<template>
  <Suspense>
    <!-- This wrapper is always the same component -->
    <TabContainer>
      <!-- Tab changes won't trigger Suspense fallback! -->
      <AsyncDashboard v-if="activeTab === 'dashboard'" />
      <AsyncSettings v-else-if="activeTab === 'settings'" />
      <AsyncProfile v-else-if="activeTab === 'profile'" />
    </TabContainer>

    <template #fallback>
      Loading... <!-- Only shows on initial load -->
    </template>
  </Suspense>
</template>
```

## Good Code

### Solution 1: Use :key to Force Root Replacement

```vue
<script setup>
import { ref, defineAsyncComponent } from 'vue'

const activeTab = ref('dashboard')

const tabs = {
  dashboard: defineAsyncComponent(() => import('./Dashboard.vue')),
  settings: defineAsyncComponent(() => import('./Settings.vue')),
  profile: defineAsyncComponent(() => import('./Profile.vue'))
}
</script>

<template>
  <Suspense>
    <!-- Key change forces root replacement, triggering Suspense -->
    <component :is="tabs[activeTab]" :key="activeTab" />

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

### Solution 2: Nested Suspense with suspensible Prop (Vue 3.3+)

```vue
<template>
  <Suspense>
    <TabContainer>
      <!-- Inner Suspense handles nested async components -->
      <Suspense suspensible>
        <AsyncDashboard v-if="activeTab === 'dashboard'" />
        <AsyncSettings v-else-if="activeTab === 'settings'" />
        <AsyncProfile v-else-if="activeTab === 'profile'" />

        <template #fallback>
          <TabLoadingSpinner />
        </template>
      </Suspense>
    </TabContainer>

    <template #fallback>
      <PageLoadingSkeleton />
    </template>
  </Suspense>
</template>
```

### Solution 3: Manual Loading State for Nested Content

```vue
<script setup>
import { ref, watch } from 'vue'

const activeTab = ref('dashboard')
const isTabLoading = ref(false)

watch(activeTab, () => {
  isTabLoading.value = true
})

const onTabLoaded = () => {
  isTabLoading.value = false
}
</script>

<template>
  <Suspense>
    <TabContainer>
      <div v-if="isTabLoading" class="tab-loading">
        Loading tab...
      </div>
      <AsyncTab
        v-else
        :tab="activeTab"
        @vue:mounted="onTabLoaded"
      />
    </TabContainer>

    <template #fallback>
      Initial loading...
    </template>
  </Suspense>
</template>
```

## Key Points

1. Suspense tracks the root node identity, not the entire subtree
2. Use `:key` to force root node replacement when you need Suspense to re-trigger
3. For Vue 3.3+, nested `<Suspense>` with `suspensible` prop handles deeply nested async components
4. Consider manual loading states for fine-grained control over nested content
5. Without the `suspensible` prop, inner Suspense is treated as sync and causes multiple patching cycles

## References

- [Vue.js Suspense Documentation](https://vuejs.org/guide/built-ins/suspense#nested-suspense)
