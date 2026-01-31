# Correct Nesting Order: RouterView, Transition, KeepAlive, Suspense

## Rule

When combining `<Suspense>` with `<Transition>`, `<KeepAlive>`, and `<RouterView>`, the nesting order must be: `RouterView` -> `Transition` -> `KeepAlive` -> `Suspense`. Incorrect nesting causes components to not work together properly.

## Why This Matters

Each of these components wraps and controls its child in specific ways. Incorrect nesting leads to:
- Transitions not animating
- Components not being cached by KeepAlive
- Suspense not catching async dependencies
- Subtle bugs that are hard to diagnose

## Bad Code

```vue
<template>
  <!-- Wrong order - Suspense wrapping KeepAlive -->
  <RouterView v-slot="{ Component }">
    <Suspense>
      <KeepAlive>
        <Transition mode="out-in">
          <component :is="Component" />
        </Transition>
      </KeepAlive>
    </Suspense>
  </RouterView>
</template>
```

```vue
<template>
  <!-- Wrong - KeepAlive outside Transition -->
  <RouterView v-slot="{ Component }">
    <KeepAlive>
      <Transition mode="out-in">
        <Suspense>
          <component :is="Component" />
        </Suspense>
      </Transition>
    </KeepAlive>
  </RouterView>
</template>
```

## Good Code

```vue
<template>
  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <Transition mode="out-in">
        <KeepAlive>
          <Suspense>
            <!-- Main content -->
            <component :is="Component" />

            <!-- Loading state -->
            <template #fallback>
              <div class="route-loading">
                Loading...
              </div>
            </template>
          </Suspense>
        </KeepAlive>
      </Transition>
    </template>
  </RouterView>
</template>
```

## With Selective KeepAlive

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <template v-if="Component">
      <Transition :name="route.meta.transition || 'fade'" mode="out-in">
        <KeepAlive :include="cachedViews">
          <Suspense :timeout="200">
            <component :is="Component" :key="route.fullPath" />

            <template #fallback>
              <RouteLoadingSkeleton :route="route" />
            </template>
          </Suspense>
        </KeepAlive>
      </Transition>
    </template>
  </RouterView>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Only cache specific routes
const cachedViews = computed(() => ['Dashboard', 'Profile', 'Settings'])
</script>
```

## Why This Order?

1. **RouterView** - Provides the route component via scoped slot
2. **Transition** - Needs to wrap what animates (the cached/suspended content)
3. **KeepAlive** - Caches the Suspense + component together
4. **Suspense** - Directly wraps the async component to handle loading

## Important Notes

- Vue Router's lazy-loaded route components (via dynamic imports) don't trigger Suspense directly
- Only async components within the route component trigger Suspense
- Use `v-if="Component"` to handle the case when no route matches
- The `:key` on the component can force re-render and re-trigger Suspense

## Key Points

1. Always follow the order: `RouterView` -> `Transition` -> `KeepAlive` -> `Suspense`
2. Each wrapper serves a specific purpose in this hierarchy
3. Use `mode="out-in"` on Transition to prevent overlap during route changes
4. Consider using route-based keys for fine-grained control over when Suspense triggers

## References

- [Vue.js Suspense Documentation](https://vuejs.org/guide/built-ins/suspense#combining-with-other-components)
- [Vue Router Transitions](https://router.vuejs.org/guide/advanced/transitions)
