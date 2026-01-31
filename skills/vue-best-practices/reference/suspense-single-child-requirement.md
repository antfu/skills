# Suspense Slots Only Allow One Immediate Child

## Rule

Both `#default` and `#fallback` slots of `<Suspense>` only allow for one immediate child node. Multiple root elements will cause unexpected behavior.

## Why This Matters

Vue's Suspense needs to track a single root node to manage the pending/resolved state transitions. Multiple children in the default slot can cause rendering issues or the Suspense to not work correctly.

## Bad Code

```vue
<template>
  <!-- Multiple children in default slot - problematic -->
  <Suspense>
    <AsyncHeader />
    <AsyncContent />
    <AsyncFooter />

    <template #fallback>
      <LoadingHeader />
      <LoadingContent />
    </template>
  </Suspense>
</template>
```

## Good Code

```vue
<template>
  <!-- Single root wrapper in each slot -->
  <Suspense>
    <div class="page-container">
      <AsyncHeader />
      <AsyncContent />
      <AsyncFooter />
    </div>

    <template #fallback>
      <div class="loading-container">
        <LoadingHeader />
        <LoadingContent />
      </div>
    </template>
  </Suspense>
</template>
```

## Alternative: Dedicated Layout Component

```vue
<!-- PageLayout.vue - Contains all async components -->
<script setup>
import AsyncHeader from './AsyncHeader.vue'
import AsyncContent from './AsyncContent.vue'
import AsyncFooter from './AsyncFooter.vue'
</script>

<template>
  <div class="page-layout">
    <AsyncHeader />
    <AsyncContent />
    <AsyncFooter />
  </div>
</template>
```

```vue
<!-- Usage -->
<template>
  <Suspense>
    <PageLayout />
    <template #fallback>
      <SkeletonLayout />
    </template>
  </Suspense>
</template>
```

## Key Points

1. Always wrap multiple elements in a single container element
2. This applies to both `#default` and `#fallback` slots
3. Consider extracting complex layouts into dedicated components
4. The single-child requirement helps Vue track the component tree correctly

## References

- [Vue.js Suspense Documentation](https://vuejs.org/guide/built-ins/suspense)
