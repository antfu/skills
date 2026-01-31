---
title: Component Events Don't Bubble
impact: MEDIUM
impactDescription: Vue component events only reach direct parent - sibling and grandparent communication requires alternative patterns
type: gotcha
tags: [vue3, events, emit, event-bubbling, provide-inject, state-management]
---

# Component Events Don't Bubble

**Impact: MEDIUM** - Unlike native DOM events, Vue component events do NOT bubble up the component tree. When a child emits an event, only its direct parent can listen for it. Grandparent components and siblings never receive the event.

This is a common source of confusion for developers coming from vanilla JavaScript where events naturally bubble up the DOM.

## Task Checklist

- [ ] Only expect events from direct child components
- [ ] Use provide/inject for deeply nested communication
- [ ] Use state management (Pinia) for complex cross-component communication
- [ ] Re-emit events at each level if manual bubbling is needed
- [ ] Consider whether your component hierarchy is too deep

## The Problem

```vue
<!-- GrandParent.vue -->
<template>
  <!-- This handler NEVER fires for grandchild events -->
  <Parent @item-selected="handleSelect" />
</template>
```

```vue
<!-- Parent.vue -->
<template>
  <Child />
</template>
```

```vue
<!-- Child.vue -->
<script setup>
const emit = defineEmits(['item-selected'])

function selectItem(item) {
  // This event reaches Parent, but NOT GrandParent
  emit('item-selected', item)
}
</script>
```

## Solution 1: Re-emit at Each Level (Simple Cases)

Manually forward events through each component.

**Correct:**
```vue
<!-- GrandParent.vue -->
<template>
  <Parent @item-selected="handleSelect" />
</template>
```

```vue
<!-- Parent.vue -->
<script setup>
const emit = defineEmits(['item-selected'])
</script>

<template>
  <!-- Re-emit to grandparent -->
  <Child @item-selected="(item) => emit('item-selected', item)" />
</template>
```

```vue
<!-- Child.vue -->
<script setup>
const emit = defineEmits(['item-selected'])

function selectItem(item) {
  emit('item-selected', item)
}
</script>
```

**Drawback:** Becomes tedious with deeply nested components.

## Solution 2: Provide/Inject (Ancestor Communication)

For deeply nested components, provide a callback from the ancestor.

**Correct:**
```vue
<!-- GrandParent.vue -->
<script setup>
import { provide } from 'vue'

function handleItemSelected(item) {
  console.log('Item selected:', item)
}

// Provide the callback to all descendants
provide('onItemSelected', handleItemSelected)
</script>

<template>
  <Parent />
</template>
```

```vue
<!-- Parent.vue - No changes needed -->
<template>
  <Child />
</template>
```

```vue
<!-- Child.vue -->
<script setup>
import { inject } from 'vue'

// Inject the callback from any ancestor
const onItemSelected = inject('onItemSelected', () => {})

function selectItem(item) {
  onItemSelected(item)
}
</script>
```

**Advantages:**
- Skips intermediate components
- No prop drilling or re-emitting
- Works at any nesting depth

## Solution 3: State Management (Complex Applications)

For cross-component communication, especially between siblings or unrelated components, use Pinia.

**Correct:**
```js
// stores/selection.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSelectionStore = defineStore('selection', () => {
  const selectedItem = ref(null)

  function selectItem(item) {
    selectedItem.value = item
  }

  return { selectedItem, selectItem }
})
```

```vue
<!-- DeepChild.vue - Updates state -->
<script setup>
import { useSelectionStore } from '@/stores/selection'

const store = useSelectionStore()

function handleSelect(item) {
  store.selectItem(item)
}
</script>
```

```vue
<!-- SiblingComponent.vue - Reacts to state -->
<script setup>
import { useSelectionStore } from '@/stores/selection'

const store = useSelectionStore()
</script>

<template>
  <div v-if="store.selectedItem">
    Selected: {{ store.selectedItem.name }}
  </div>
</template>
```

## Solution 4: Event Bus (Use Sparingly)

For truly decoupled components, a simple event bus can work:

```js
// eventBus.js
import mitt from 'mitt'
export const emitter = mitt()
```

```vue
<!-- ComponentA.vue -->
<script setup>
import { emitter } from './eventBus'

function notify() {
  emitter.emit('custom-event', { data: 'value' })
}
</script>
```

```vue
<!-- ComponentB.vue -->
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { emitter } from './eventBus'

function handleEvent(data) {
  console.log('Received:', data)
}

onMounted(() => emitter.on('custom-event', handleEvent))
onUnmounted(() => emitter.off('custom-event', handleEvent))
</script>
```

**Warning:** Event buses make data flow hard to trace. Prefer provide/inject or state management.

## Comparison Table

| Method | Best For | Complexity |
|--------|----------|------------|
| Re-emit | 1-2 levels deep | Low |
| Provide/Inject | Deep nesting, ancestor communication | Medium |
| Pinia/State | Complex apps, sibling communication | Medium |
| Event Bus | Truly decoupled, rare cases | Low (but risky) |

## Native Events DO Bubble

Note that native DOM events attached to elements still bubble normally:

```vue
<!-- GrandParent.vue -->
<template>
  <!-- Native click bubbles up from button inside Child -->
  <div @click="handleClick">
    <Parent />
  </div>
</template>
```

Only Vue component events (those emitted with `emit()`) don't bubble.

## Reference
- [Vue.js Component Events](https://vuejs.org/guide/components/events.html)
- [Vue.js Provide/Inject](https://vuejs.org/guide/components/provide-inject.html)
