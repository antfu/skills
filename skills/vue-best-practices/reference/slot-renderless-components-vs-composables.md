---
title: Consider Composables Instead of Renderless Components
impact: MEDIUM
impactDescription: Renderless slot components add overhead compared to composables for pure logic reuse
type: best-practice
tags: [vue3, slots, renderless-components, composables, performance, composition-api]
---

# Consider Composables Instead of Renderless Components

**Impact: MEDIUM** - Renderless components (components that only expose logic via scoped slots without rendering their own UI) were a popular pattern in Vue 2 for logic reuse. In Vue 3, Composition API composables are often more efficient and simpler for the same use case.

## Task Checklist

- [ ] Evaluate if a composable can replace a renderless component
- [ ] Use renderless components when slot-based composition is genuinely needed
- [ ] Prefer composables for pure logic/state sharing
- [ ] Consider component overhead vs function overhead

**Renderless Component Pattern:**
```vue
<!-- MouseTracker.vue - Renderless component -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const x = ref(0)
const y = ref(0)

function update(event) {
  x.value = event.pageX
  y.value = event.pageY
}

onMounted(() => window.addEventListener('mousemove', update))
onUnmounted(() => window.removeEventListener('mousemove', update))
</script>

<template>
  <!-- Only renders the slot, no DOM of its own -->
  <slot :x="x" :y="y" />
</template>
```

```vue
<!-- Usage -->
<MouseTracker v-slot="{ x, y }">
  <div>Mouse: {{ x }}, {{ y }}</div>
</MouseTracker>
```

**Composable Alternative (Recommended):**
```typescript
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

```vue
<!-- Usage - simpler, no extra component -->
<script setup>
import { useMouse } from '@/composables/useMouse'

const { x, y } = useMouse()
</script>

<template>
  <div>Mouse: {{ x }}, {{ y }}</div>
</template>
```

## When to Use Each Pattern

| Pattern | Best For |
|---------|----------|
| **Composables** | Pure logic reuse, state management, side effects |
| **Renderless Components** | When slot composition is needed, wrapper logic with flexible children |

### Use Composables When:
- Sharing reactive state and methods
- Encapsulating side effects (event listeners, timers)
- No need for template slot composition
- Maximum performance is needed

### Use Renderless Components When:
- Need to provide context/data to arbitrary slot content
- Building provider components (like context providers)
- The slot composition pattern is genuinely useful
- Building component libraries with maximum flexibility

## Real-World Examples

**Composable is Better:**
```typescript
// Data fetching
export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(true)
  // ... fetch logic
  return { data, error, loading }
}

// Form validation
export function useForm(initialValues) {
  const values = ref(initialValues)
  const errors = ref({})
  const validate = () => { /* ... */ }
  return { values, errors, validate }
}
```

**Renderless Component is Better:**
```vue
<!-- Virtualized list that needs to wrap arbitrary item rendering -->
<VirtualScroller :items="items" :item-height="50">
  <template #default="{ item, style }">
    <!-- Consumer controls how each item renders -->
    <div :style="style" class="custom-item">
      {{ item.name }}
    </div>
  </template>
</VirtualScroller>
```

## Performance Consideration

Renderless components still:
- Create a component instance
- Go through the Vue component lifecycle
- Have reactive overhead

Composables are just functions:
- No component instance overhead
- Direct reactive primitives
- Smaller bundle size

## Reference
- [Vue.js Slots - Renderless Components](https://vuejs.org/guide/components/slots.html#renderless-components)
- [Vue.js Composables](https://vuejs.org/guide/reusability/composables.html)
