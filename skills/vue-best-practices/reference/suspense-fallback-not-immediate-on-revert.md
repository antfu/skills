# Suspense Fallback Not Immediately Shown on Revert

## Rule

When Suspense reverts from resolved to pending state, the fallback content is NOT immediately displayed. Instead, the previous `#default` content remains visible while waiting for new content to resolve. Use the `timeout` prop to control when the fallback appears.

## Why This Matters

This behavior prevents UI flicker for fast async operations, but can confuse users when loading takes longer than expected. Without understanding this, developers may think their fallback content is broken or Suspense isn't working correctly.

## Bad Code

```vue
<template>
  <!-- Fallback won't show immediately when content changes -->
  <Suspense>
    <component :is="currentView" :key="viewKey" />

    <template #fallback>
      <!-- This may never appear for fast loads -->
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

## Good Code

### Solution 1: Use timeout="0" for Immediate Fallback

```vue
<template>
  <!-- Fallback shows immediately on any pending state -->
  <Suspense timeout="0">
    <component :is="currentView" :key="viewKey" />

    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

### Solution 2: Use Appropriate Timeout for UX Balance

```vue
<template>
  <!-- Wait 200ms before showing fallback to avoid flicker on fast loads -->
  <Suspense :timeout="200">
    <component :is="currentView" :key="viewKey" />

    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

### Solution 3: Use Transitions for Smooth State Changes

```vue
<template>
  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <Transition mode="out-in">
        <Suspense :timeout="100">
          <component :is="Component" />

          <template #fallback>
            <div class="route-loading">
              <LoadingSpinner />
            </div>
          </template>
        </Suspense>
      </Transition>
    </template>
  </RouterView>
</template>
```

## Timeout Behavior Summary

| Timeout Value | Behavior |
|---------------|----------|
| Not specified | Previous content shown until new content resolves (no fallback on revert) |
| `timeout="0"` | Fallback shown immediately when entering pending state |
| `timeout="200"` | Wait 200ms, then show fallback if still pending |

## When to Use Each Approach

**No timeout (default)**:
- When async operations are typically fast (<100ms)
- When showing stale content is acceptable during loading
- To prevent flicker on quick navigation

**timeout="0"**:
- When you always want to show loading feedback
- For operations that typically take noticeable time
- When stale content would be confusing

**timeout with delay (e.g., 200ms)**:
- Best of both worlds for most cases
- Avoids flicker for fast loads
- Still shows loading for slower operations

## Key Points

1. Default Suspense behavior prioritizes showing stale content over fallback
2. Use `timeout="0"` if you always want the loading indicator
3. Choose timeout values based on expected async operation duration
4. Combine with `<Transition>` for smoother state changes
5. This behavior is by design to improve perceived performance

## References

- [Vue.js Suspense Documentation](https://vuejs.org/guide/built-ins/suspense#nested-suspense)
