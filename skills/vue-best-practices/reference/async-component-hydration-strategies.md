# Async Component Lazy Hydration Strategies (Vue 3.5+)

## Rule

In Vue 3.5+, use hydration strategies with async components to control when SSR-rendered components become interactive. Import hydration strategies individually for tree-shaking.

## Why This Matters

In SSR applications, hydrating all components immediately can block the main thread and delay interactivity. Lazy hydration allows non-critical components to become interactive only when needed, improving Time to Interactive (TTI) metrics.

## Available Hydration Strategies

### hydrateOnIdle

Hydrates when the browser is idle using `requestIdleCallback`:

```vue
<script setup>
import { defineAsyncComponent, hydrateOnIdle } from 'vue'

// Good for non-critical, below-the-fold content
const AsyncFooter = defineAsyncComponent({
  loader: () => import('./Footer.vue'),
  hydrate: hydrateOnIdle()
})

// With max timeout (in case idle never occurs)
const AsyncSidebar = defineAsyncComponent({
  loader: () => import('./Sidebar.vue'),
  hydrate: hydrateOnIdle(5000) // Max 5 seconds
})
</script>
```

### hydrateOnVisible

Hydrates when element enters the viewport via `IntersectionObserver`:

```vue
<script setup>
import { defineAsyncComponent, hydrateOnVisible } from 'vue'

// Good for content below the fold
const AsyncComments = defineAsyncComponent({
  loader: () => import('./Comments.vue'),
  hydrate: hydrateOnVisible()
})

// With root margin for earlier hydration
const AsyncRelatedPosts = defineAsyncComponent({
  loader: () => import('./RelatedPosts.vue'),
  hydrate: hydrateOnVisible({ rootMargin: '100px' })
})
</script>
```

### hydrateOnMediaQuery

Hydrates when a media query matches:

```vue
<script setup>
import { defineAsyncComponent, hydrateOnMediaQuery } from 'vue'

// Only hydrate on mobile devices
const AsyncMobileMenu = defineAsyncComponent({
  loader: () => import('./MobileMenu.vue'),
  hydrate: hydrateOnMediaQuery('(max-width: 768px)')
})

// Only hydrate on desktop
const AsyncDesktopSidebar = defineAsyncComponent({
  loader: () => import('./DesktopSidebar.vue'),
  hydrate: hydrateOnMediaQuery('(min-width: 1024px)')
})
</script>
```

### hydrateOnInteraction

Hydrates when user interacts with the component:

```vue
<script setup>
import { defineAsyncComponent, hydrateOnInteraction } from 'vue'

// Hydrate on click
const AsyncDropdown = defineAsyncComponent({
  loader: () => import('./Dropdown.vue'),
  hydrate: hydrateOnInteraction('click')
})

// Hydrate on multiple events
const AsyncTooltip = defineAsyncComponent({
  loader: () => import('./Tooltip.vue'),
  hydrate: hydrateOnInteraction(['mouseover', 'focus'])
})
</script>
```

**Note**: The triggering event is replayed after hydration completes, so user interaction is not lost.

## Custom Hydration Strategy

```typescript
import { defineAsyncComponent, type HydrationStrategy } from 'vue'

const hydrateAfterAnimation: HydrationStrategy = (hydrate, forEachElement) => {
  // Wait for page load animation to complete
  const timeout = setTimeout(hydrate, 1000)

  return () => clearTimeout(timeout) // Cleanup
}

const AsyncWidget = defineAsyncComponent({
  loader: () => import('./Widget.vue'),
  hydrate: hydrateAfterAnimation
})
```

## Key Points

1. Hydration strategies only apply to SSR - they have no effect in client-only apps
2. Import strategies individually: `import { hydrateOnIdle } from 'vue'`
3. `hydrateOnInteraction` replays the triggering event after hydration
4. Use `hydrateOnVisible` for below-the-fold content
5. Use `hydrateOnIdle` for non-critical components
6. Use `hydrateOnMediaQuery` for device-specific components

## Strategy Selection Guide

| Component Type | Recommended Strategy |
|----------------|---------------------|
| Footer, related content | `hydrateOnIdle` |
| Below-the-fold sections | `hydrateOnVisible` |
| Interactive widgets | `hydrateOnInteraction` |
| Mobile-only components | `hydrateOnMediaQuery` |
| Critical above-the-fold | No strategy (immediate) |

## References

- [Vue.js Async Components Documentation](https://vuejs.org/guide/components/async)
