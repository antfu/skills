---
title: Use defineSlots for TypeScript Type Safety
impact: MEDIUM
impactDescription: Without defineSlots, scoped slot props lack type inference causing potential runtime errors
type: best-practice
tags: [vue3, slots, typescript, type-safety, defineSlots, vue3.3]
---

# Use defineSlots for TypeScript Type Safety

**Impact: MEDIUM** - Vue 3.3+ introduced the `defineSlots` macro to add type definitions for slots. Without it, scoped slot props are typed as `any`, losing TypeScript benefits and risking runtime errors from incorrect prop usage.

## Task Checklist

- [ ] Use `defineSlots` in TypeScript components that expose scoped slots
- [ ] Define the props each slot receives
- [ ] The return type is currently ignored but use `any` by convention
- [ ] Consumers get autocomplete and type checking for slot props

**Without defineSlots (no type safety):**
```vue
<!-- FancyList.vue -->
<script setup lang="ts">
interface Item {
  id: number
  name: string
  price: number
}

const props = defineProps<{
  items: Item[]
}>()
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <!-- Slot props are typed as 'any' for consumers -->
      <slot :item="item" :index="index" />
    </li>
  </ul>
</template>
```

```vue
<!-- Consumer.vue - No type checking! -->
<FancyList :items="products">
  <!-- 'item' is 'any', typos like 'item.nmae' won't be caught -->
  <template #default="{ item }">
    {{ item.nmae }} <!-- Typo not caught by TypeScript -->
  </template>
</FancyList>
```

**With defineSlots (full type safety):**
```vue
<!-- FancyList.vue -->
<script setup lang="ts">
interface Item {
  id: number
  name: string
  price: number
}

const props = defineProps<{
  items: Item[]
}>()

// Define slot types
defineSlots<{
  default(props: { item: Item; index: number }): any
  header(props: { count: number }): any
  empty(): any  // Slot with no props
}>()
</script>

<template>
  <div>
    <header v-if="$slots.header">
      <slot name="header" :count="items.length" />
    </header>

    <ul v-if="items.length">
      <li v-for="(item, index) in items" :key="item.id">
        <slot :item="item" :index="index" />
      </li>
    </ul>

    <div v-else>
      <slot name="empty" />
    </div>
  </div>
</template>
```

```vue
<!-- Consumer.vue - Full type checking! -->
<script setup lang="ts">
import FancyList from './FancyList.vue'

const products = ref([
  { id: 1, name: 'Widget', price: 9.99 }
])
</script>

<template>
  <FancyList :items="products">
    <template #header="{ count }">
      <!-- 'count' is typed as number -->
      <h2>{{ count }} items</h2>
    </template>

    <template #default="{ item, index }">
      <!-- 'item' is typed as Item, 'index' as number -->
      <!-- TypeScript catches: item.nmae (typo) -->
      <span>{{ index + 1 }}. {{ item.name }} - ${{ item.price }}</span>
    </template>

    <template #empty>
      <p>No items found</p>
    </template>
  </FancyList>
</template>
```

## Generic Slots

For components with generic item types:

```vue
<script setup lang="ts" generic="T">
defineProps<{
  items: T[]
}>()

defineSlots<{
  default(props: { item: T; index: number }): any
}>()
</script>
```

## Naming Collision Warning

Avoid slot prop names that match parent component data:

```vue
<!-- If parent has 'item' in scope, slot prop 'item' can cause confusion -->
<FancyList :items="products">
  <template #default="{ item }">
    <!-- 'item' here is the slot prop, not parent's 'item' -->
    {{ item.name }}
  </template>
</FancyList>
```

Consider renaming slot props to be more specific when collisions are likely:
```typescript
defineSlots<{
  default(props: { listItem: T; itemIndex: number }): any
}>()
```

## Requirements

- Vue 3.3+ for `defineSlots` macro
- TypeScript project setup
- Volar extension for IDE support

## Reference
- [Vue.js Slots - TypeScript](https://vuejs.org/guide/components/slots.html#slots-with-typescript)
- [Escuela Vue - Typing slots with defineSlots](https://escuelavue.es/en/devtips/typescript-vue-scoped-slots-defineslots)
