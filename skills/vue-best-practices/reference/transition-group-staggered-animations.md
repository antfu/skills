---
title: Use Data Attributes for Staggered List Animations in TransitionGroup
impact: LOW
impactDescription: Best practice for creating polished staggered animation effects
type: best-practice
tags: [vue3, transition-group, animation, stagger, javascript-hooks, gsap]
---

# Use Data Attributes for Staggered List Animations in TransitionGroup

**Impact: LOW** - When creating staggered list animations where items animate in sequence with delays, use data attributes to communicate the item index to JavaScript hooks. This enables elegant cascading effects that are difficult to achieve with pure CSS.

This pattern is particularly useful for enter animations when new items are added or when the list first appears.

## Task Checklist

- [ ] Add data-index attribute to list items
- [ ] Use `:css="false"` when using JavaScript-only animations
- [ ] Calculate delay based on data-index in enter/leave hooks
- [ ] Call `done()` callback when animation completes
- [ ] Consider using animation libraries (GSAP) for complex animations

**Basic Pattern:**
```vue
<template>
  <TransitionGroup
    tag="ul"
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @leave="onLeave"
  >
    <li
      v-for="(item, index) in items"
      :key="item.id"
      :data-index="index"
    >
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>

<script setup>
function onBeforeEnter(el) {
  el.style.opacity = 0
  el.style.transform = 'translateY(20px)'
}

function onEnter(el, done) {
  const delay = el.dataset.index * 150 // 150ms between each item

  setTimeout(() => {
    el.style.transition = 'all 0.4s ease-out'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'

    // Call done after transition completes
    setTimeout(done, 400)
  }, delay)
}

function onLeave(el, done) {
  const delay = el.dataset.index * 100

  setTimeout(() => {
    el.style.transition = 'all 0.3s ease-in'
    el.style.opacity = 0
    el.style.transform = 'translateY(-20px)'

    setTimeout(done, 300)
  }, delay)
}
</script>
```

**With GSAP Animation Library:**
```vue
<template>
  <TransitionGroup
    tag="ul"
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @leave="onLeave"
  >
    <li
      v-for="(item, index) in computedList"
      :key="item.id"
      :data-index="index"
    >
      {{ item.msg }}
    </li>
  </TransitionGroup>
</template>

<script setup>
import gsap from 'gsap'

function onBeforeEnter(el) {
  el.style.opacity = 0
  el.style.height = 0
}

function onEnter(el, done) {
  gsap.to(el, {
    opacity: 1,
    height: '1.6em',
    delay: el.dataset.index * 0.15,
    onComplete: done
  })
}

function onLeave(el, done) {
  gsap.to(el, {
    opacity: 0,
    height: 0,
    delay: el.dataset.index * 0.15,
    onComplete: done
  })
}
</script>
```

## Understanding the `:css="false"` Prop

When set, Vue skips CSS transition detection:

```vue
<!-- Vue will look for CSS classes and detect durations -->
<TransitionGroup name="list">

<!-- Vue skips CSS, uses only JavaScript hooks -->
<TransitionGroup :css="false">
```

Use `:css="false"` when:
- You're handling all animations in JavaScript
- You want to avoid CSS class application overhead
- You're using a JavaScript animation library (GSAP, anime.js, etc.)

## Computed Index for Filtered Lists

When filtering a list, the index in `v-for` changes. Consider using a computed property:

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([
  { id: 1, msg: 'Bruce Lee', show: true },
  { id: 2, msg: 'Jackie Chan', show: true },
  { id: 3, msg: 'Chuck Norris', show: true }
])

const query = ref('')

const computedList = computed(() => {
  return items.value.filter(item =>
    item.msg.toLowerCase().includes(query.value.toLowerCase())
  )
})
</script>
```

## Bidirectional Stagger (Center-Out Animation)

For more advanced effects, calculate delay from center:

```javascript
function onEnter(el, done) {
  const totalItems = document.querySelectorAll('[data-index]').length
  const index = parseInt(el.dataset.index)
  const center = Math.floor(totalItems / 2)
  const distanceFromCenter = Math.abs(index - center)

  gsap.to(el, {
    opacity: 1,
    scale: 1,
    delay: distanceFromCenter * 0.1, // Items closer to center animate first
    onComplete: done
  })
}
```

## Performance Considerations

- Keep individual animation durations short (200-500ms)
- Limit total stagger time (users shouldn't wait too long)
- Consider using `will-change: transform, opacity` for performance
- For large lists, consider only staggering visible items

```css
.list-item {
  will-change: transform, opacity;
}
```

## Reference
- [Vue.js TransitionGroup Staggering Transitions](https://vuejs.org/guide/built-ins/transition-group.html#staggering-list-transitions)
- [GSAP Animation Library](https://greensock.com/gsap/)
