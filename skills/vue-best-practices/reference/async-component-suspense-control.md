# Async Components Are Suspensible by Default

## Rule

Async components created with `defineAsyncComponent` are automatically treated as async dependencies of any parent `<Suspense>` component. When wrapped by `<Suspense>`, the async component's own `loadingComponent`, `errorComponent`, `delay`, and `timeout` options are ignored.

## Why This Matters

This behavior causes confusion when developers configure loading and error states on their async components but these states never appear because a parent `<Suspense>` takes over control. The component's options are silently ignored, leading to unexpected behavior.

## Bad Code

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// These options will be IGNORED if a parent Suspense exists
const AsyncDashboard = defineAsyncComponent({
  loader: () => import('./Dashboard.vue'),
  loadingComponent: LoadingSpinner,  // Won't show!
  errorComponent: ErrorDisplay,       // Won't show!
  timeout: 3000                        // Ignored!
})
</script>

<template>
  <!-- If this is inside a Suspense somewhere up the tree -->
  <AsyncDashboard />
</template>
```

## Good Code

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// Use suspensible: false to keep control of loading/error states
const AsyncDashboard = defineAsyncComponent({
  loader: () => import('./Dashboard.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  timeout: 3000,
  suspensible: false  // Component controls its own loading state
})
</script>

<template>
  <AsyncDashboard />
</template>
```

## When to Use Each Approach

**Keep suspensible (default)** when:
- You want centralized loading/error handling at a layout level
- The parent `<Suspense>` provides appropriate feedback
- Multiple async components should show a unified loading state

**Use `suspensible: false`** when:
- You need component-specific loading indicators
- The component should handle its own error states
- You want fine-grained control over the UX

## Key Points

1. Check if your component tree has a `<Suspense>` ancestor before relying on async component options
2. Use `suspensible: false` explicitly when you need the component to manage its own states
3. The `<Suspense>` component's `#fallback` slot and `onErrorCaptured` take precedence over async component options

## References

- [Vue.js Async Components Documentation](https://vuejs.org/guide/components/async)
- [Vue.js Suspense Documentation](https://vuejs.org/guide/built-ins/suspense)
