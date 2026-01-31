---
title: Compose Composables for Complex Logic
impact: MEDIUM
impactDescription: Building composables from other composables creates reusable, testable building blocks
type: best-practice
tags: [vue3, composables, composition-api, patterns, code-organization]
---

# Compose Composables for Complex Logic

**Impact: MEDIUM** - Composables can (and should) call other composables. This composition pattern allows you to build complex functionality from smaller, focused, reusable pieces. Each composable handles one concern, and higher-level composables combine them.

This is one of the key advantages of the Composition API over mixins - dependencies are explicit and traceable.

## Task Checklist

- [ ] Extract reusable logic into focused, single-purpose composables
- [ ] Build complex composables by combining simpler ones
- [ ] Ensure each composable has a single responsibility
- [ ] Pass data between composed composables via parameters or refs

**Example: Building a Mouse Tracker from Smaller Composables**

```javascript
// composables/useEventListener.js - Low-level building block
import { onMounted, onUnmounted, toValue } from 'vue'

export function useEventListener(target, event, callback) {
  onMounted(() => {
    const el = toValue(target)
    el.addEventListener(event, callback)
  })

  onUnmounted(() => {
    const el = toValue(target)
    el.removeEventListener(event, callback)
  })
}

// composables/useMouse.js - Composes useEventListener
import { ref } from 'vue'
import { useEventListener } from './useEventListener'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // Reuse the event listener composable
  useEventListener(window, 'mousemove', update)

  return { x, y }
}

// composables/useMouseInElement.js - Composes useMouse
import { ref, computed } from 'vue'
import { useMouse } from './useMouse'

export function useMouseInElement(elementRef) {
  const { x, y } = useMouse()

  const elementX = computed(() => {
    if (!elementRef.value) return 0
    const rect = elementRef.value.getBoundingClientRect()
    return x.value - rect.left
  })

  const elementY = computed(() => {
    if (!elementRef.value) return 0
    const rect = elementRef.value.getBoundingClientRect()
    return y.value - rect.top
  })

  const isOutside = computed(() => {
    if (!elementRef.value) return true
    const rect = elementRef.value.getBoundingClientRect()
    return x.value < rect.left || x.value > rect.right ||
           y.value < rect.top || y.value > rect.bottom
  })

  return { x, y, elementX, elementY, isOutside }
}
```

## Pattern: Composable Dependency Chain

```javascript
// Layer 1: Primitives
export function useEventListener(target, event, callback) { /* ... */ }
export function useInterval(callback, delay) { /* ... */ }
export function useTimeout(callback, delay) { /* ... */ }

// Layer 2: Building on primitives
export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  useEventListener(window, 'resize', () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  })

  return { width, height }
}

export function useOnline() {
  const isOnline = ref(navigator.onLine)

  useEventListener(window, 'online', () => isOnline.value = true)
  useEventListener(window, 'offline', () => isOnline.value = false)

  return { isOnline }
}

// Layer 3: Complex features combining multiple composables
export function useAutoSave(dataRef, saveFunction, options = {}) {
  const { debounce = 1000, onlyWhenOnline = true } = options

  const { isOnline } = useOnline()
  const isSaving = ref(false)
  const lastSaved = ref(null)

  let timeoutId = null

  watch(dataRef, (newData) => {
    if (onlyWhenOnline && !isOnline.value) return

    clearTimeout(timeoutId)
    timeoutId = setTimeout(async () => {
      isSaving.value = true
      try {
        await saveFunction(newData)
        lastSaved.value = new Date()
      } finally {
        isSaving.value = false
      }
    }, debounce)
  }, { deep: true })

  return { isSaving, lastSaved, isOnline }
}
```

## Pattern: Code Organization with Composition

Extract inline composables when a component gets complex:

```vue
<script setup>
// BEFORE: All logic mixed together
import { ref, computed, watch, onMounted } from 'vue'

const searchQuery = ref('')
const filters = ref({ category: null, minPrice: 0 })
const products = ref([])
const isLoading = ref(false)
const error = ref(null)
const sortBy = ref('name')
const sortOrder = ref('asc')

// ...50 more lines of mixed concerns
</script>
```

```vue
<script setup>
// AFTER: Separated into focused composables
import { useProductSearch } from './composables/useProductSearch'
import { useProductFilters } from './composables/useProductFilters'
import { useProductSort } from './composables/useProductSort'

const { searchQuery, debouncedQuery } = useProductSearch()
const { filters, activeFilters, clearFilters } = useProductFilters()
const { sortBy, sortOrder, sortedProducts } = useProductSort()

// Each composable is focused, testable, and potentially reusable
</script>
```

## Passing Data Between Composed Composables

```javascript
// Composables can accept refs from other composables
export function useFilteredProducts(products, filters) {
  return computed(() => {
    let result = toValue(products)

    if (filters.value.category) {
      result = result.filter(p => p.category === filters.value.category)
    }

    if (filters.value.minPrice > 0) {
      result = result.filter(p => p.price >= filters.value.minPrice)
    }

    return result
  })
}

export function useSortedProducts(products, sortConfig) {
  return computed(() => {
    const items = [...toValue(products)]
    const { field, order } = sortConfig.value

    return items.sort((a, b) => {
      const comparison = a[field] > b[field] ? 1 : -1
      return order === 'asc' ? comparison : -comparison
    })
  })
}

// Usage - composables are chained through their outputs
const { products, isLoading } = useFetch('/api/products')
const { filters } = useFilters()
const filteredProducts = useFilteredProducts(products, filters)
const { sortConfig } = useSortConfig()
const sortedProducts = useSortedProducts(filteredProducts, sortConfig)
```

## Advantages Over Mixins

| Composables | Mixins |
|-------------|--------|
| Explicit dependencies via imports | Implicit dependencies |
| Clear data flow via parameters | Unclear which mixin provides what |
| No namespace collisions | Properties can conflict |
| Easy to trace and debug | Hard to track origins |
| TypeScript-friendly | Poor TypeScript support |

## Reference
- [Vue.js Composables](https://vuejs.org/guide/reusability/composables.html)
- [Vue.js Composables vs Mixins](https://vuejs.org/guide/reusability/composables.html#comparisons-with-other-techniques)
