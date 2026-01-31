---
title: TransitionGroup Does Not Support Transition Modes
impact: LOW
impactDescription: Developers expecting mode prop from Transition will find it doesn't work
type: gotcha
tags: [vue3, transition-group, animation, mode, in-out, out-in]
---

# TransitionGroup Does Not Support Transition Modes

**Impact: LOW** - Unlike `<Transition>`, the `<TransitionGroup>` component does not support the `mode` prop (`in-out` or `out-in`). This is because `<TransitionGroup>` handles multiple elements that can enter and leave simultaneously, rather than alternating between mutually exclusive elements.

If you need sequenced enter/leave behavior, you must implement it manually with JavaScript hooks or rethink your animation approach.

## Task Checklist

- [ ] Do not use `mode` prop on `<TransitionGroup>` (it will be ignored)
- [ ] For sequential animations, use JavaScript hooks with delays
- [ ] For single element alternation, use `<Transition>` instead
- [ ] Consider staggered animations as an alternative to mode-based sequencing

**Incorrect - mode prop is ignored:**
```vue
<template>
  <!-- mode="out-in" has NO EFFECT on TransitionGroup -->
  <TransitionGroup name="list" tag="ul" mode="out-in">
    <li v-for="item in items" :key="item.id">{{ item }}</li>
  </TransitionGroup>
</template>
```

## When to Use Transition vs TransitionGroup

| Scenario | Component |
|----------|-----------|
| Single element toggling (v-if) | `<Transition>` |
| Alternating between two components | `<Transition>` with `mode` |
| List of items (v-for) | `<TransitionGroup>` |
| Multiple simultaneous animations | `<TransitionGroup>` |

**Single element - use Transition with mode:**
```vue
<template>
  <!-- Transition supports mode for single/alternating elements -->
  <Transition name="fade" mode="out-in">
    <component :is="currentComponent" :key="currentKey" />
  </Transition>
</template>
```

**List of elements - use TransitionGroup:**
```vue
<template>
  <!-- TransitionGroup for lists, no mode support -->
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">{{ item }}</li>
  </TransitionGroup>
</template>
```

## Simulating Sequential Behavior

If you need items to leave before new items enter, use JavaScript hooks:

```vue
<template>
  <TransitionGroup
    name="list"
    tag="ul"
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @leave="onLeave"
  >
    <li v-for="item in items" :key="item.id">{{ item }}</li>
  </TransitionGroup>
</template>

<script setup>
import { ref } from 'vue'

const isLeaving = ref(false)
const enterQueue = []

function onBeforeEnter(el) {
  el.style.opacity = 0
  if (isLeaving.value) {
    // Queue enters while leaves are happening
    enterQueue.push(el)
  }
}

function onEnter(el, done) {
  if (isLeaving.value) {
    // Wait for leaves to complete
    return
  }

  // Animate enter
  el.offsetHeight // Force reflow
  el.style.transition = 'opacity 0.3s'
  el.style.opacity = 1

  setTimeout(done, 300)
}

function onLeave(el, done) {
  isLeaving.value = true

  el.style.transition = 'opacity 0.3s'
  el.style.opacity = 0

  setTimeout(() => {
    done()
    isLeaving.value = false

    // Process queued enters
    enterQueue.forEach(queuedEl => {
      queuedEl.style.transition = 'opacity 0.3s'
      queuedEl.style.opacity = 1
    })
    enterQueue.length = 0
  }, 300)
}
</script>
```

## Staggered Animation Alternative

Instead of sequential mode behavior, consider staggered animations for a polished effect:

```vue
<template>
  <TransitionGroup
    name="list"
    tag="ul"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
  >
    <li
      v-for="(item, index) in items"
      :key="item.id"
      :data-index="index"
    >
      {{ item }}
    </li>
  </TransitionGroup>
</template>

<script setup>
function onBeforeEnter(el) {
  el.style.opacity = 0
  el.style.transform = 'translateY(20px)'
}

function onEnter(el, done) {
  const delay = el.dataset.index * 100

  setTimeout(() => {
    el.style.transition = 'all 0.3s ease'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'

    setTimeout(done, 300)
  }, delay)
}
</script>
```

## Reference
- [Vue.js TransitionGroup](https://vuejs.org/guide/built-ins/transition-group.html)
- [Vue.js Transition Modes](https://vuejs.org/guide/built-ins/transition.html#transition-modes)
