---
title: Use Computed Properties for Filtering and Sorting Lists
impact: MEDIUM
impactDescription: Computed properties cache results and only recalculate when dependencies change - methods recalculate on every render
type: best-practice
tags: [vue3, v-for, computed, performance, list-rendering]
---

# Use Computed Properties for Filtering and Sorting Lists

**Impact: MEDIUM** - When displaying filtered or sorted versions of arrays, always prefer computed properties over inline expressions or methods. Computed properties are cached based on their reactive dependencies and only re-evaluate when those dependencies change. Methods recalculate on every render cycle.

This is especially important for large lists or complex filter/sort operations where unnecessary recalculation impacts performance.

## Task Checklist

- [ ] Use computed properties for filtered/sorted list display
- [ ] Use methods only when you need to pass parameters (e.g., nested v-for loops)
- [ ] Keep filter/sort logic in JavaScript, not in templates
- [ ] Consider performance for large lists - computed caching is your friend

**Inefficient (Recalculates Every Render):**
```html
<!-- AVOID: Inline filtering recalculates on every render -->
<li v-for="item in items.filter(i => i.isActive)" :key="item.id">
  {{ item.name }}
</li>

<!-- AVOID: Method call recalculates on every render -->
<li v-for="item in getActiveItems()" :key="item.id">
  {{ item.name }}
</li>
```

```javascript
// Method recalculates every time component re-renders
function getActiveItems() {
  return items.value.filter(item => item.isActive)
}
```

**Efficient (Cached Results):**
```javascript
const items = ref([
  { id: 1, name: 'Item 1', isActive: true },
  { id: 2, name: 'Item 2', isActive: false },
  { id: 3, name: 'Item 3', isActive: true },
])

// Computed: Only recalculates when items changes
const activeItems = computed(() => {
  return items.value.filter(item => item.isActive)
})

const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => a.name.localeCompare(b.name))
})

// Combine filtering and sorting
const activeSortedItems = computed(() => {
  return items.value
    .filter(item => item.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))
})
```

```html
<!-- CORRECT: Uses cached computed value -->
<li v-for="item in activeItems" :key="item.id">
  {{ item.name }}
</li>
```

## When Methods Are Appropriate

Use methods when you need to pass parameters, such as in nested v-for loops:

```javascript
// Method is necessary here because we need to pass 'category' as parameter
function getItemsByCategory(category) {
  return items.value.filter(item => item.category === category)
}
```

```html
<div v-for="category in categories" :key="category.id">
  <h3>{{ category.name }}</h3>
  <ul>
    <!-- Method needed here to pass category parameter -->
    <li v-for="item in getItemsByCategory(category)" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
</div>
```

## Reference
- [Vue.js List Rendering - Displaying Filtered/Sorted Results](https://vuejs.org/guide/essentials/list.html#displaying-filtered-sorted-results)
- [Vue.js Computed Properties](https://vuejs.org/guide/essentials/computed.html)
