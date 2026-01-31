---
title: Prefer Animating Transform and Opacity for Performance
impact: MEDIUM
impactDescription: Animating layout-triggering properties like height or margin causes expensive reflows and janky animations
type: best-practice
tags: [vue3, transition, animation, performance, css, transform, opacity]
---

# Prefer Animating Transform and Opacity for Performance

**Impact: MEDIUM** - When creating Vue transitions, you should prefer animating `transform` and `opacity` properties. These are GPU-accelerated and do not trigger expensive CSS layout recalculations. Animating properties like `height`, `width`, `margin`, `padding`, or `top`/`left` causes the browser to recalculate layout on every frame, resulting in janky, low-performance animations.

## Task Checklist

- [ ] Use `transform` for position and size animations (translate, scale, rotate)
- [ ] Use `opacity` for fade effects
- [ ] Avoid animating `height`, `width`, `margin`, `padding`, `top`, `left`, `right`, `bottom`
- [ ] If you must animate height, consider using `max-height` with a generous value or JavaScript-based solutions
- [ ] Use `will-change` sparingly and only when needed

**Problematic Code:**
```css
/* BAD: Animating height triggers layout recalculation every frame */
.slide-enter-active,
.slide-leave-active {
  transition: height 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  height: 0;
}

.slide-enter-to,
.slide-leave-from {
  height: 200px;
}
```

```css
/* BAD: Animating margin causes layout thrashing */
.slide-enter-active,
.slide-leave-active {
  transition: margin-top 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  margin-top: -100%;
}
```

**Correct Code:**
```css
/* GOOD: Using transform and opacity - GPU accelerated */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
```

```css
/* GOOD: Using transform for slide animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
```

```css
/* GOOD: Using scale instead of width/height */
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0);
  opacity: 0;
}
```

## When You Must Animate Height

If you absolutely need to animate height (e.g., accordion), consider these alternatives:

```vue
<template>
  <!-- Option 1: max-height trick (simple but not precise) -->
  <Transition name="expand">
    <div v-if="expanded" class="content">
      <slot />
    </div>
  </Transition>
</template>

<style>
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px; /* Set to expected max content height */
  opacity: 1;
}
</style>
```

```vue
<script setup>
// Option 2: JavaScript hooks for precise height animation
function onEnter(el, done) {
  el.style.height = '0'
  el.style.overflow = 'hidden'
  // Force reflow
  el.offsetHeight
  el.style.transition = 'height 0.3s ease'
  el.style.height = el.scrollHeight + 'px'

  el.addEventListener('transitionend', () => {
    el.style.height = ''
    el.style.overflow = ''
    done()
  }, { once: true })
}

function onLeave(el, done) {
  el.style.height = el.scrollHeight + 'px'
  el.style.overflow = 'hidden'
  el.offsetHeight
  el.style.transition = 'height 0.3s ease'
  el.style.height = '0'

  el.addEventListener('transitionend', done, { once: true })
}
</script>

<template>
  <Transition @enter="onEnter" @leave="onLeave">
    <div v-if="expanded">
      <slot />
    </div>
  </Transition>
</template>
```

## Performance Comparison

| Property | Layout | Paint | Composite | Performance |
|----------|--------|-------|-----------|-------------|
| `transform` | No | No | Yes | Excellent |
| `opacity` | No | No | Yes | Excellent |
| `background-color` | No | Yes | Yes | Good |
| `width`/`height` | Yes | Yes | Yes | Poor |
| `margin`/`padding` | Yes | Yes | Yes | Poor |
| `top`/`left` | Yes | Yes | Yes | Poor |

## Reference
- [Vue.js Transition Documentation](https://vuejs.org/guide/built-ins/transition.html)
- [CSS Triggers](https://csstriggers.com/) - Reference for which properties trigger layout/paint
- [High Performance Animations](https://web.dev/animations-guide/)
