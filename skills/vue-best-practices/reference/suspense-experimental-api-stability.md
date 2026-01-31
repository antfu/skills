# Suspense is Experimental and API May Change

## Rule

`<Suspense>` is an experimental feature in Vue 3. The API is not guaranteed to reach stable status and may change before it does. Plan for potential breaking changes when using Suspense in production applications.

## Why This Matters

Relying heavily on experimental features in production code creates maintenance risk. If the API changes, refactoring could be substantial. The Suspense API has been experimental since Vue 3's initial release (over 4 years) and developers have reported frustrations with bugs and restrictions.

## Bad Code

```vue
<script setup>
// Building critical application infrastructure on experimental API
// without fallback strategy
</script>

<template>
  <!-- Core navigation depends entirely on Suspense -->
  <Suspense>
    <RouterView />
    <template #fallback>
      <GlobalLoadingScreen />
    </template>
  </Suspense>
</template>
```

## Good Code

```vue
<script setup>
import { ref } from 'vue'

// Prepare fallback loading strategy
const isLoading = ref(false)

// Can toggle between Suspense and manual loading if needed
const useSuspense = true
</script>

<template>
  <!-- Document that this uses experimental API -->
  <!-- Consider: Suspense is experimental - monitor Vue releases -->
  <Suspense v-if="useSuspense">
    <RouterView />
    <template #fallback>
      <GlobalLoadingScreen />
    </template>
  </Suspense>

  <!-- Alternative loading strategy available -->
  <template v-else>
    <GlobalLoadingScreen v-if="isLoading" />
    <RouterView v-else />
  </template>
</template>
```

## Mitigation Strategies

1. **Isolate Suspense usage** - Don't spread Suspense throughout the codebase; centralize it
2. **Document usage** - Comment where Suspense is used for easy refactoring
3. **Test thoroughly** - Suspense edge cases may behave differently across Vue versions
4. **Follow Vue releases** - Monitor changelogs for Suspense-related changes
5. **Have a fallback plan** - Be ready to implement manual loading states if needed

## Key Points

1. Suspense has been experimental for 4+ years with no stable release date announced
2. Some developers find it "too buggy or too restrictive" for certain use cases
3. Consider Vue 2-style loading patterns as a reliable alternative for critical paths
4. Keep Suspense boundaries minimal and centralized for easier migration

## References

- [Vue.js Suspense Documentation](https://vuejs.org/guide/built-ins/suspense)
- [Vue RFC Discussion #746](https://github.com/vuejs/rfcs/discussions/746)
