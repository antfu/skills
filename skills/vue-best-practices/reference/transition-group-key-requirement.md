---
title: TransitionGroup Children Must Have Unique Keys
impact: HIGH
impactDescription: Missing or non-unique keys cause broken animations and Vue warnings
type: gotcha
tags: [vue3, transition-group, animation, key, v-for, list-animation]
---

# TransitionGroup Children Must Have Unique Keys

**Impact: HIGH** - Unlike regular `<Transition>`, the `<TransitionGroup>` component **always requires** a unique `key` attribute on every child element. Without keys, Vue cannot track individual items, animations will break, and you'll see console warnings.

This is a fundamental difference from `<Transition>` which works on single elements. Since `<TransitionGroup>` animates lists of elements, Vue needs keys to track which items are entering, leaving, or moving.

## Task Checklist

- [ ] Ensure every direct child of `<TransitionGroup>` has a unique `key` attribute
- [ ] Use stable identifiers (IDs) rather than array indices for keys
- [ ] Do not use the same key for different items at different times
- [ ] When using `v-for`, always include `:key` binding

**Incorrect - Missing keys:**
```vue
<template>
  <!-- WRONG: Missing keys causes broken animations -->
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>
```

**Incorrect - Using index as key:**
```vue
<template>
  <!-- PROBLEMATIC: Index keys cause incorrect animations when list changes -->
  <TransitionGroup name="list" tag="ul">
    <li v-for="(item, index) in items" :key="index">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>
```

When using index as key:
- If you remove item at index 2, what was index 3 becomes index 2
- Vue thinks index 2 changed content rather than being removed
- Animations fire on wrong elements

**Correct - Unique stable keys:**
```vue
<template>
  <!-- CORRECT: Unique ID keys for proper tracking -->
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>
```

**Correct - Keys on static children:**
```vue
<template>
  <!-- CORRECT: Even static children need keys in TransitionGroup -->
  <TransitionGroup name="fade" tag="div">
    <span v-if="showA" key="a">Content A</span>
    <span v-if="showB" key="b">Content B</span>
    <span v-if="showC" key="c">Content C</span>
  </TransitionGroup>
</template>
```

## Common Error Messages

Without keys, you'll see warnings like:
```
[Vue warn]: <TransitionGroup> children must be keyed.
```

## With Draggable Libraries

When using `<TransitionGroup>` with libraries like `vue.draggable.next`, key issues can cause errors:

```javascript
// Error you might see without proper keys
TypeError: domElement is null
```

Ensure all draggable items have unique keys:

```vue
<template>
  <draggable v-model="items" item-key="id">
    <template #item="{ element }">
      <TransitionGroup name="list" tag="div">
        <div :key="element.id">{{ element.name }}</div>
      </TransitionGroup>
    </template>
  </draggable>
</template>
```

## Reference
- [Vue.js TransitionGroup](https://vuejs.org/guide/built-ins/transition-group.html)
- [Vue.js List Rendering Keys](https://vuejs.org/guide/essentials/list.html#maintaining-state-with-key)
