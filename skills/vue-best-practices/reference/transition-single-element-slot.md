---
title: Transition Only Supports Single Element or Component as Slot Content
impact: HIGH
impactDescription: Using multiple elements inside Transition causes the transition to fail silently or produce unexpected results
type: gotcha
tags: [vue3, transition, animation, slot, single-element]
---

# Transition Only Supports Single Element or Component as Slot Content

**Impact: HIGH** - The `<Transition>` component can only wrap a single element or component. If you pass multiple elements or a component with multiple root elements, the transition will not work correctly and may fail silently without any error message.

This is one of the most common mistakes when using Vue transitions, especially for developers coming from other frameworks or when refactoring existing code.

## Task Checklist

- [ ] Ensure only ONE element or component is inside `<Transition>`
- [ ] If wrapping a component, verify the component has only ONE root element
- [ ] When using `v-if`/`v-else`, elements must be mutually exclusive (only one visible at a time)
- [ ] Use a wrapper `<div>` if you need to transition multiple elements together

**Problematic Code:**
```vue
<template>
  <!-- BAD: Multiple elements inside Transition -->
  <Transition name="fade">
    <h1>Title</h1>
    <p>Content</p>
  </Transition>
</template>
```

```vue
<template>
  <!-- BAD: Component with multiple root elements -->
  <Transition name="fade">
    <MyMultiRootComponent v-if="show" />
  </Transition>
</template>

<!-- MyMultiRootComponent.vue -->
<template>
  <header>Header</header>
  <main>Main</main>
  <footer>Footer</footer>
</template>
```

**Correct Code:**
```vue
<template>
  <!-- GOOD: Single wrapper element -->
  <Transition name="fade">
    <div v-if="show">
      <h1>Title</h1>
      <p>Content</p>
    </div>
  </Transition>
</template>
```

```vue
<template>
  <!-- GOOD: v-if/v-else with mutually exclusive elements -->
  <Transition name="fade" mode="out-in">
    <button v-if="isEditing" @click="save">Save</button>
    <button v-else @click="edit">Edit</button>
  </Transition>
</template>
```

```vue
<template>
  <!-- GOOD: Component with single root -->
  <Transition name="fade">
    <MyComponent v-if="show" />
  </Transition>
</template>

<!-- MyComponent.vue -->
<template>
  <div class="my-component">
    <header>Header</header>
    <main>Main</main>
    <footer>Footer</footer>
  </div>
</template>
```

## Dynamic Components with Transition

```vue
<template>
  <!-- GOOD: Dynamic components work as single elements -->
  <Transition name="fade" mode="out-in">
    <component :is="currentView" />
  </Transition>
</template>

<script setup>
import { shallowRef } from 'vue'
import Home from './Home.vue'
import About from './About.vue'

const currentView = shallowRef(Home)
</script>
```

## Common Symptoms of This Issue

1. No transition animation occurs
2. Elements appear/disappear instantly
3. Inconsistent animation behavior
4. Vue devtools shows no transition state changes

## Reference
- [Vue.js Transition Documentation](https://vuejs.org/guide/built-ins/transition.html)
- [Vue.js Dynamic Components](https://vuejs.org/guide/essentials/component-basics.html#dynamic-components)
