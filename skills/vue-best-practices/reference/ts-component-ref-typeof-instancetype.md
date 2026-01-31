---
title: Use InstanceType for Component Ref Types
impact: MEDIUM
impactDescription: Without proper typing, component refs lose type information for exposed methods and properties
type: best-practice
tags: [vue3, typescript, template-refs, component-refs, InstanceType]
---

# Use InstanceType for Component Ref Types

**Impact: MEDIUM** - When creating refs to child Vue components, use `InstanceType<typeof Component>` to properly type the ref. This enables TypeScript to recognize methods and properties exposed via `defineExpose`.

## Task Checklist

- [ ] Use `InstanceType<typeof Component>` for component refs
- [ ] Include `| null` in the type union
- [ ] Ensure child components use `defineExpose` for accessible methods
- [ ] Use `ComponentExposed` helper for generic components (Vue 3.5+)
- [ ] Consider `ComponentPublicInstance` when exact type is unavailable

## Basic Pattern

```vue
<!-- ChildComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const internalCount = ref(0)

function increment() {
  internalCount.value++
}

function reset() {
  internalCount.value = 0
}

// Expose methods/properties to parent
defineExpose({
  increment,
  reset,
  count: internalCount  // Expose ref for reading
})
</script>
```

```vue
<!-- ParentComponent.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

// Type the ref using InstanceType
const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

onMounted(() => {
  // TypeScript knows about exposed methods
  childRef.value?.increment()  // OK
  childRef.value?.reset()      // OK

  // Access exposed ref
  console.log(childRef.value?.count)  // Ref<number>
})

function handleClick() {
  childRef.value?.increment()
}
</script>

<template>
  <ChildComponent ref="childRef" />
  <button @click="handleClick">Increment Child</button>
</template>
```

## Vue 3.5+: useTemplateRef

```vue
<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

// useTemplateRef with component type
const childRef = useTemplateRef<InstanceType<typeof ChildComponent>>('child')

onMounted(() => {
  childRef.value?.increment()
})
</script>

<template>
  <ChildComponent ref="child" />
</template>
```

## Generic Components

For generic components, `InstanceType` alone doesn't capture generic parameters. Use `ComponentExposed` from `vue-component-type-helpers`:

```vue
<!-- GenericList.vue -->
<script setup lang="ts" generic="T">
defineProps<{
  items: T[]
}>()

const selectedItem = ref<T | null>(null)

function selectItem(item: T) {
  selectedItem.value = item
}

defineExpose({
  selectedItem,
  selectItem
})
</script>
```

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { ComponentExposed } from 'vue-component-type-helpers'
import GenericList from './GenericList.vue'

interface User {
  id: string
  name: string
}

// ComponentExposed preserves generic type
const listRef = useTemplateRef<ComponentExposed<typeof GenericList<User>>>('list')

function selectFirstUser() {
  const users: User[] = [{ id: '1', name: 'John' }]
  listRef.value?.selectItem(users[0])  // Properly typed as User
}
</script>

<template>
  <GenericList ref="list" :items="users" />
</template>
```

## When Exact Type is Unavailable

When you don't have access to the component's exposed types, use `ComponentPublicInstance`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import SomeThirdPartyComponent from 'third-party-lib'

// Fallback: ComponentPublicInstance gives access to $el, $refs, etc.
const thirdPartyRef = ref<ComponentPublicInstance | null>(null)

function getElement() {
  // Can access standard Vue instance properties
  return thirdPartyRef.value?.$el
}
</script>

<template>
  <SomeThirdPartyComponent ref="thirdPartyRef" />
</template>
```

## Multiple Refs with v-for

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ListItem from './ListItem.vue'

type ListItemInstance = InstanceType<typeof ListItem>

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
])

// Array of component refs
const itemRefs = ref<(ListItemInstance | null)[]>([])

function setItemRef(el: ListItemInstance | null, index: number) {
  itemRefs.value[index] = el
}

function focusItem(index: number) {
  itemRefs.value[index]?.focus()
}
</script>

<template>
  <ListItem
    v-for="(item, index) in items"
    :key="item.id"
    :item="item"
    :ref="(el) => setItemRef(el, index)"
  />
</template>
```

## Extracting Exposed Type for Reuse

```typescript
// types/components.ts
import type ChildComponent from '@/components/ChildComponent.vue'

// Create a reusable type alias
export type ChildComponentInstance = InstanceType<typeof ChildComponent>

// For use in composables or other files
export type ChildComponentRef = Ref<ChildComponentInstance | null>
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { ChildComponentRef } from '@/types/components'
import ChildComponent from '@/components/ChildComponent.vue'

const childRef: ChildComponentRef = ref(null)
</script>
```

## Common Mistake: Forgetting defineExpose

```vue
<!-- Child.vue - WRONG: No defineExpose -->
<script setup lang="ts">
function doSomething() {
  console.log('doing something')
}

// Forgot defineExpose!
</script>
```

```vue
<!-- Parent.vue -->
<script setup lang="ts">
const childRef = ref<InstanceType<typeof Child> | null>(null)

onMounted(() => {
  // childRef.value?.doSomething is undefined!
  // Script setup components don't expose anything by default
  childRef.value?.doSomething()  // Runtime: undefined is not a function
})
</script>
```

Always use `defineExpose` in `<script setup>` components to make methods/properties accessible to parent refs.

## Reference
- [Vue.js TypeScript - Component Template Refs](https://vuejs.org/guide/typescript/composition-api.html#typing-component-template-refs)
- [Vue.js Template Refs](https://vuejs.org/guide/essentials/template-refs.html#ref-on-component)
- [vue-component-type-helpers](https://www.npmjs.com/package/vue-component-type-helpers)
