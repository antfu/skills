# Use Suspense Events for Loading State Tracking

## Rule

`<Suspense>` emits three events: `pending`, `resolve`, and `fallback`. Use these events to track loading states, implement analytics, coordinate UI updates, or trigger side effects at appropriate times.

## Why This Matters

Relying solely on the fallback slot for loading indication limits your options. The events provide programmatic access to Suspense state changes, enabling:
- Loading progress tracking
- Analytics for perceived performance
- Coordinated animations
- Custom loading indicators outside the Suspense boundary
- Debugging async component behavior

## Basic Usage

```vue
<script setup>
import { ref } from 'vue'

const loadingState = ref('idle')
const loadStartTime = ref(null)

const onPending = () => {
  loadingState.value = 'pending'
  loadStartTime.value = Date.now()
  console.log('Suspense entered pending state')
}

const onResolve = () => {
  loadingState.value = 'resolved'
  const loadTime = Date.now() - loadStartTime.value
  console.log(`Content resolved in ${loadTime}ms`)

  // Track performance
  analytics.track('page_load_time', { duration: loadTime })
}

const onFallback = () => {
  loadingState.value = 'fallback'
  console.log('Fallback content is now visible')
}
</script>

<template>
  <Suspense
    @pending="onPending"
    @resolve="onResolve"
    @fallback="onFallback"
  >
    <AsyncPage />
    <template #fallback>
      <LoadingSkeleton />
    </template>
  </Suspense>
</template>
```

## Advanced: Global Loading Indicator

```vue
<!-- App.vue -->
<script setup>
import { ref, provide } from 'vue'

const globalLoading = ref(false)
const pendingCount = ref(0)

provide('globalLoading', globalLoading)

const onSuspensePending = () => {
  pendingCount.value++
  globalLoading.value = true
}

const onSuspenseResolve = () => {
  pendingCount.value--
  if (pendingCount.value === 0) {
    globalLoading.value = false
  }
}
</script>

<template>
  <!-- Global loading bar -->
  <Transition name="fade">
    <LoadingBar v-if="globalLoading" />
  </Transition>

  <RouterView v-slot="{ Component }">
    <Suspense
      @pending="onSuspensePending"
      @resolve="onSuspenseResolve"
    >
      <component :is="Component" />
      <template #fallback>
        <PageSkeleton />
      </template>
    </Suspense>
  </RouterView>
</template>
```

## Event Sequence

```
Initial Load:
1. @pending - Suspense enters pending state
2. @fallback - Fallback content is displayed (may not fire if resolved quickly)
3. @resolve - Async content is ready

On Content Change (with timeout):
1. @pending - New async dependency detected
2. (Previous content still visible during timeout period)
3. @fallback - Timeout exceeded, fallback shown
4. @resolve - New content ready

On Content Change (fast):
1. @pending - New async dependency detected
2. @resolve - Resolved before timeout, fallback never shown
```

## Coordinating with Transitions

```vue
<script setup>
import { ref } from 'vue'

const isTransitioning = ref(false)

const onPending = () => {
  isTransitioning.value = true
}

const onResolve = () => {
  // Delay to allow enter transition to complete
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
}
</script>

<template>
  <div :class="{ 'is-loading': isTransitioning }">
    <Transition mode="out-in" @after-leave="onAfterLeave">
      <Suspense @pending="onPending" @resolve="onResolve">
        <component :is="currentView" :key="viewKey" />
        <template #fallback>
          <LoadingView />
        </template>
      </Suspense>
    </Transition>
  </div>
</template>
```

## Key Points

1. `@pending` fires when Suspense starts waiting for async dependencies
2. `@fallback` fires when fallback content becomes visible (respects timeout)
3. `@resolve` fires when default slot content is ready to display
4. Use events for analytics, debugging, and coordinating UI outside Suspense
5. Events enable global loading indicators across multiple Suspense boundaries
6. `@fallback` may not fire if content resolves before the timeout

## References

- [Vue.js Suspense Events](https://vuejs.org/guide/built-ins/suspense#events)
