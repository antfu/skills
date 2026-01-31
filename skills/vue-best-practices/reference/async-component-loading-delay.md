# Async Component Loading Delay for Flicker Prevention

## Rule

Use the `delay` option (default 200ms) when configuring async components with a `loadingComponent`. This prevents UI flicker on fast networks where the component loads quickly.

## Why This Matters

Without a delay, the loading component briefly appears and immediately disappears when the async component loads quickly. This creates a jarring "flash" effect that degrades user experience. The 200ms default is chosen because loads faster than this are perceived as instant.

## Bad Code

```vue
<script setup>
import { defineAsyncComponent } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const AsyncDashboard = defineAsyncComponent({
  loader: () => import('./Dashboard.vue'),
  loadingComponent: LoadingSpinner,
  delay: 0  // Loading spinner flashes immediately, causing flicker
})
</script>
```

## Good Code

```vue
<script setup>
import { defineAsyncComponent } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const AsyncDashboard = defineAsyncComponent({
  loader: () => import('./Dashboard.vue'),
  loadingComponent: LoadingSpinner,
  // delay: 200 is the default, but you can adjust based on your UX needs
})
</script>
```

```vue
<script setup>
import { defineAsyncComponent } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorDisplay from './ErrorDisplay.vue'

// For slower expected loads, consider a shorter delay
const AsyncHeavyChart = defineAsyncComponent({
  loader: () => import('./HeavyChart.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 100,    // Show loading sooner for components known to be heavy
  timeout: 30000 // Longer timeout for complex components
})
</script>
```

## Choosing the Right Delay

| Scenario | Recommended Delay |
|----------|-------------------|
| Fast network, small component | 200ms (default) |
| Known heavy component | 100ms |
| Interactive element user is waiting for | 50-100ms |
| Background content load | 300-500ms |

## Key Points

1. The default 200ms delay is a good choice for most cases
2. Never set `delay: 0` unless you explicitly want the loading state visible immediately
3. Pair `delay` with `timeout` for complete loading state management
4. Consider your network conditions and component size when tuning delay

## References

- [Vue.js Async Components Documentation](https://vuejs.org/guide/components/async)
