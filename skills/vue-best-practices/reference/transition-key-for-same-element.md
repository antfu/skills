---
title: Use Key Attribute to Force Transition on Same Element Type
impact: HIGH
impactDescription: Without a key, Vue reuses the same DOM element and no transition occurs when only the content changes
type: gotcha
tags: [vue3, transition, key, animation, dom-reuse]
---

# Use Key Attribute to Force Transition on Same Element Type

**Impact: HIGH** - When transitioning between elements of the same type (e.g., two `<span>` elements or two instances of the same component), Vue's DOM diffing algorithm will reuse the existing element and only update its content. This means no transition occurs because the element is never actually inserted or removed. You must use the `key` attribute to force Vue to treat them as distinct elements.

This is one of the most common causes of "my transition isn't working" issues.

## Task Checklist

- [ ] When transitioning between same element types, always add a unique `key`
- [ ] For dynamic content in the same element, bind `key` to the changing value
- [ ] For `v-if`/`v-else` with same element types, add distinct keys to each
- [ ] Remember: without `key`, only text content updates, no animation

**Problematic Code:**
```vue
<template>
  <!-- BAD: Same element type, no key - no transition occurs! -->
  <Transition name="fade">
    <span>{{ count }}</span>
  </Transition>

  <button @click="count++">Increment</button>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<!-- The span just updates its text content, never triggers enter/leave -->
```

```vue
<template>
  <!-- BAD: Same element type in v-if/v-else without keys -->
  <Transition name="fade">
    <p v-if="isActive">Active state</p>
    <p v-else>Inactive state</p>
  </Transition>
</template>

<!-- Vue may reuse the <p> element, causing inconsistent transitions -->
```

**Correct Code:**
```vue
<template>
  <!-- GOOD: Key bound to changing value forces re-render -->
  <Transition name="fade" mode="out-in">
    <span :key="count">{{ count }}</span>
  </Transition>

  <button @click="count++">Increment</button>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<!-- Now each number change triggers a full enter/leave transition -->
```

```vue
<template>
  <!-- GOOD: Explicit keys on same element types -->
  <Transition name="fade" mode="out-in">
    <p v-if="isActive" key="active">Active state</p>
    <p v-else key="inactive">Inactive state</p>
  </Transition>
</template>
```

```vue
<template>
  <!-- GOOD: Key on dynamic components -->
  <Transition name="slide" mode="out-in">
    <component :is="currentComponent" :key="currentComponent.name" />
  </Transition>
</template>
```

## Animated Counter Example

```vue
<template>
  <div class="counter">
    <button @click="count--">-</button>

    <Transition name="slide-up" mode="out-in">
      <span :key="count" class="count-display">{{ count }}</span>
    </Transition>

    <button @click="count++">+</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<style>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.count-display {
  display: inline-block;
  min-width: 2em;
  text-align: center;
}
</style>
```

## Tab Switching with Same Component

```vue
<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="{ active: currentTab === tab.id }"
      @click="currentTab = tab.id"
    >
      {{ tab.label }}
    </button>
  </div>

  <!-- Key is essential here since all tabs use the same component -->
  <Transition name="fade" mode="out-in">
    <TabContent :key="currentTab" :tab-id="currentTab" />
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import TabContent from './TabContent.vue'

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' }
]
const currentTab = ref('home')
</script>
```

## When Keys Are NOT Needed

Keys are not necessary when transitioning between **different** element types:

```vue
<template>
  <!-- No key needed - different element types -->
  <Transition name="fade">
    <button v-if="isEditing" @click="save">Save</button>
    <span v-else>View mode</span>
  </Transition>
</template>
```

## Common Symptoms Without Key

1. No animation when content changes
2. Text updates instantly instead of fading
3. Enter/leave CSS classes never applied
4. DevTools shows element content changing but no transition state

## Reference
- [Vue.js Transition - Between Elements](https://vuejs.org/guide/built-ins/transition.html#transition-between-elements)
