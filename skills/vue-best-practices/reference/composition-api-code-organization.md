---
title: Organize Composition API Code by Logical Concern, Not Option Type
impact: MEDIUM
impactDescription: Poor code organization in Composition API leads to spaghetti code worse than Options API
type: best-practice
tags: [vue3, composition-api, code-organization, refactoring, maintainability]
---

# Organize Composition API Code by Logical Concern, Not Option Type

**Impact: MEDIUM** - The Composition API removes the "guard rails" of Options API that force code into data/methods/computed buckets. Without intentional organization, Composition API code can become more disorganized than Options API. Group related code together by feature or logical concern.

The key insight is that Composition API gives you flexibility - which requires discipline. Apply the same code organization principles you would use for any well-structured JavaScript code.

## Task Checklist

- [ ] Group related state, computed, and methods together by feature
- [ ] Extract related logic into composables when it grows
- [ ] Don't scatter related code throughout the script section
- [ ] Use comments or regions to delineate logical sections in larger components
- [ ] Consider splitting large components into smaller ones or composables

**Disorganized (Bad):**
```vue
<script setup>
// Scattered code - hard to understand what relates to what
import { ref, computed, onMounted, watch } from 'vue'

const searchQuery = ref('')
const items = ref([])
const selectedItem = ref(null)
const isModalOpen = ref(false)
const sortOrder = ref('asc')
const filterCategory = ref('all')
const isLoading = ref(false)
const error = ref(null)

const filteredItems = computed(() => {
  return items.value.filter(i => i.category === filterCategory.value)
})

function openModal() { isModalOpen.value = true }

const sortedItems = computed(() => {
  return [...filteredItems.value].sort(/* ... */)
})

function closeModal() { isModalOpen.value = false }

watch(searchQuery, async (query) => { /* fetch */ })

function selectItem(item) { selectedItem.value = item }

const searchResults = computed(() => {
  return items.value.filter(i => i.name.includes(searchQuery.value))
})

onMounted(() => { fetchItems() })

async function fetchItems() { /* ... */ }
</script>
```

**Organized by Concern (Good):**
```vue
<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// ============================================
// DATA FETCHING & STATE
// ============================================
const items = ref([])
const isLoading = ref(false)
const error = ref(null)

async function fetchItems() {
  isLoading.value = true
  try {
    items.value = await api.getItems()
  } catch (e) {
    error.value = e
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchItems())

// ============================================
// SEARCH
// ============================================
const searchQuery = ref('')

const searchResults = computed(() =>
  items.value.filter(i =>
    i.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

watch(searchQuery, async (query) => {
  if (query.length > 2) {
    await fetchItems({ search: query })
  }
})

// ============================================
// FILTERING & SORTING
// ============================================
const filterCategory = ref('all')
const sortOrder = ref('asc')

const filteredItems = computed(() =>
  searchResults.value.filter(i =>
    filterCategory.value === 'all' || i.category === filterCategory.value
  )
)

const sortedItems = computed(() =>
  [...filteredItems.value].sort((a, b) =>
    sortOrder.value === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  )
)

// ============================================
// SELECTION & MODAL
// ============================================
const selectedItem = ref(null)
const isModalOpen = ref(false)

function selectItem(item) {
  selectedItem.value = item
  openModal()
}

function openModal() { isModalOpen.value = true }
function closeModal() {
  isModalOpen.value = false
  selectedItem.value = null
}
</script>
```

**Best: Extract to Composables:**
```vue
<script setup>
import { useItems } from '@/composables/useItems'
import { useSearch } from '@/composables/useSearch'
import { useModal } from '@/composables/useModal'

// Each composable encapsulates a logical concern
const { items, isLoading, error, fetchItems } = useItems()
const { searchQuery, searchResults } = useSearch(items)
const {
  selectedItem,
  isOpen: isModalOpen,
  open: openModal,
  close: closeModal
} = useModal()

function selectItem(item) {
  selectedItem.value = item
  openModal()
}
</script>

// composables/useItems.js
export function useItems() {
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchItems(params = {}) {
    isLoading.value = true
    try {
      items.value = await api.getItems(params)
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => fetchItems())

  return { items, isLoading, error, fetchItems }
}
```

## Signs Your Component Needs Refactoring

1. **Scrolling between related code** - If you're jumping around to understand one feature
2. **300+ lines in script setup** - Consider extracting composables
3. **Multiple unrelated features** - Each should be its own composable
4. **Similar patterns repeated** - Extract to shared composable

## When to Extract to Composables

```javascript
// Extract when:
// - Logic is reused across components
// - A feature is self-contained (search, pagination, form handling)
// - Component is getting too large (>200 lines)
// - You want to test logic in isolation

// Keep inline when:
// - Logic is simple and component-specific
// - Extracting would add more complexity than it removes
// - The component is already small and focused
```

## Reference
- [Composition API FAQ - More Flexible Code Organization](https://vuejs.org/guide/extras/composition-api-faq.html#more-flexible-code-organization)
- [Composables](https://vuejs.org/guide/reusability/composables.html)
