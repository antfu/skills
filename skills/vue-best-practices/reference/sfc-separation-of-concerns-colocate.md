---
title: Colocate Template, Script, and Style in SFCs for Maintainability
impact: MEDIUM
impactDescription: Separating template, logic, and styles into different files reduces component cohesion and maintainability
type: best-practice
tags: [vue3, sfc, architecture, separation-of-concerns, maintainability]
---

# Colocate Template, Script, and Style in SFCs for Maintainability

**Impact: MEDIUM** - Vue SFCs are designed to colocate template, logic, and styles because these concerns are inherently coupled within a component. Separating them into different files based on file type (not concern) makes components harder to understand and maintain.

## Task Checklist

- [ ] Keep template, script, and style in the same `.vue` file by default
- [ ] Only use `src` imports when files become extremely large (500+ lines)
- [ ] Group related components in folders rather than separating by file type
- [ ] Use component composition to manage complexity instead of file splitting

**Not Recommended:**
```
components/
├── UserCard.vue          # Just template
├── UserCard.js           # Logic
├── UserCard.css          # Styles
```

**Recommended:**
```vue
<!-- components/UserCard.vue - Everything in one file -->
<script setup>
import { computed } from 'vue'
import { useUserStatus } from '@/composables/useUserStatus'

const props = defineProps({
  user: { type: Object, required: true }
})

const { isOnline } = useUserStatus(props.user.id)
const displayName = computed(() =>
  `${props.user.firstName} ${props.user.lastName}`
)
</script>

<template>
  <div class="user-card">
    <img :src="user.avatar" :alt="displayName" class="avatar" />
    <div class="info">
      <h3 class="name">{{ displayName }}</h3>
      <span :class="['status', { online: isOnline }]">
        {{ isOnline ? 'Online' : 'Offline' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.user-card {
  display: flex;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.info {
  margin-left: 1rem;
}

.name {
  margin: 0 0 0.25rem;
}

.status {
  font-size: 0.875rem;
  color: #666;
}

.status.online {
  color: #22c55e;
}
</style>
```

## Why Colocation is Preferred

### 1. Coupled Concerns Should Stay Together

Template, logic, and styles within a component are inherently coupled:
- Template references reactive data from the script
- Styles target classes used in the template
- Changes in one often require changes in others

```vue
<!-- Everything references each other -->
<script setup>
const isExpanded = ref(false)  // Used by template and affects styling
</script>

<template>
  <!-- Uses isExpanded from script, applies class for styling -->
  <div :class="{ expanded: isExpanded }">...</div>
</template>

<style scoped>
/* Targets class from template, shows visual state from script */
.expanded { max-height: 500px; }
</style>
```

### 2. Easier Navigation and Understanding

Single file = single place to look:

```vue
<!-- Open one file, understand the whole component -->
<script setup>
// All logic here
</script>

<template>
  <!-- All markup here -->
</template>

<style scoped>
/* All styles here */
</style>
```

### 3. Better Refactoring Experience

Renaming a class? Everything is in one file:

```vue
<!-- Before: .card-title used in both template and style -->
<!-- After: Rename to .user-title in one file, one commit -->
```

## When Src Imports Are Acceptable

For genuinely large components (rare), use src imports:

```vue
<!-- LargeDataTable.vue -->
<script src="./LargeDataTable.ts" lang="ts"></script>
<template src="./LargeDataTable.html"></template>
<style src="./LargeDataTable.scss" scoped lang="scss"></style>
```

But first, consider if the component should be split into smaller components.

## Managing Complexity Without File Splitting

### Extract Logic to Composables

```typescript
// composables/useDataTable.ts
export function useDataTable(initialData: Ref<Item[]>) {
  const sortColumn = ref<string | null>(null)
  const sortDirection = ref<'asc' | 'desc'>('asc')
  const currentPage = ref(1)

  const sortedData = computed(() => { ... })
  const paginatedData = computed(() => { ... })

  function sort(column: string) { ... }
  function goToPage(page: number) { ... }

  return {
    sortColumn,
    sortDirection,
    currentPage,
    sortedData,
    paginatedData,
    sort,
    goToPage
  }
}
```

```vue
<!-- DataTable.vue - Component stays focused -->
<script setup>
import { useDataTable } from '@/composables/useDataTable'

const props = defineProps(['items'])
const { sortedData, sort, goToPage } = useDataTable(toRef(props, 'items'))
</script>
```

### Break Into Smaller Components

```vue
<!-- Instead of one 500-line component -->
<template>
  <div class="data-table">
    <DataTableHeader @sort="handleSort" />
    <DataTableBody :rows="visibleRows" />
    <DataTablePagination
      :total="total"
      :current="currentPage"
      @change="handlePageChange"
    />
  </div>
</template>
```

## The Real Separation of Concerns

True separation of concerns in Vue means:
- **Components** handle their own template/logic/style (coupled by nature)
- **Composables** handle reusable stateful logic
- **Utilities** handle pure functions
- **Stores** handle global state

This is more maintainable than separating HTML/CSS/JS into different files.

## Reference
- [Vue.js SFC Introduction](https://vuejs.org/guide/scaling-up/sfc.html#what-about-separation-of-concerns)
- [Vue.js SFC Src Imports](https://vuejs.org/api/sfc-spec.html#src-imports)
