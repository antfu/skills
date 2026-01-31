---
title: Use $slots to Conditionally Render Slot Wrapper Elements
impact: MEDIUM
impactDescription: Empty wrapper elements render in DOM when slots have no content, affecting layout and styling
type: best-practice
tags: [vue3, slots, conditional-rendering, performance, dom-optimization]
---

# Use $slots to Conditionally Render Slot Wrapper Elements

**Impact: MEDIUM** - When building reusable components with optional slots, wrapper elements (divs, sections, etc.) will render even if no slot content is provided. This can cause layout issues, unnecessary DOM nodes, and styling problems. Use the `$slots` property to conditionally render wrappers only when slots have content.

## Task Checklist

- [ ] Check `$slots` before rendering wrapper elements for optional slots
- [ ] Use `v-if="$slots.slotName"` to conditionally render wrappers
- [ ] Remember that `$slots.default` checks the default slot
- [ ] Keep DOM clean by avoiding empty wrapper elements

**Incorrect:**
```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <!-- BAD: Header wrapper renders even with no content -->
    <div class="card-header">
      <slot name="header" />
    </div>

    <!-- BAD: Empty div with padding/margin affects layout -->
    <div class="card-body">
      <slot />
    </div>

    <!-- BAD: Footer renders as empty element -->
    <div class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.card-header { padding: 16px; border-bottom: 1px solid #eee; }
.card-footer { padding: 16px; border-top: 1px solid #eee; }
</style>
```

When used without all slots:
```vue
<!-- Results in empty .card-header and .card-footer divs with borders -->
<Card>
  <p>Just body content</p>
</Card>
```

**Correct:**
```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <!-- GOOD: Only render header wrapper if slot has content -->
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>

    <!-- GOOD: Check default slot -->
    <div v-if="$slots.default" class="card-body">
      <slot />
    </div>

    <!-- GOOD: Footer only renders when provided -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.card-header { padding: 16px; border-bottom: 1px solid #eee; }
.card-footer { padding: 16px; border-top: 1px solid #eee; }
</style>
```

Now clean DOM:
```vue
<!-- Only renders .card-body, no empty header/footer -->
<Card>
  <p>Just body content</p>
</Card>
```

## Advanced: Using $slots in Script Setup

```vue
<script setup>
import { useSlots, computed } from 'vue'

const slots = useSlots()

const hasHeader = computed(() => !!slots.header)
const hasFooter = computed(() => !!slots.footer)

// Can also check slot content conditionally in logic
function getLayoutClass() {
  if (slots.header && slots.footer) return 'full-layout'
  if (slots.header) return 'header-only'
  if (slots.footer) return 'footer-only'
  return 'minimal'
}
</script>

<template>
  <div :class="['card', getLayoutClass()]">
    <header v-if="hasHeader">
      <slot name="header" />
    </header>
    <main>
      <slot />
    </main>
    <footer v-if="hasFooter">
      <slot name="footer" />
    </footer>
  </div>
</template>
```

## When to Use This Pattern

| Scenario | Use $slots Check? |
|----------|-------------------|
| Wrapper has styling (padding, borders, background) | Yes |
| Wrapper affects layout (flex, grid) | Yes |
| Slot is always expected to have content | No |
| No wrapper element around slot | No |
| Wrapper is purely semantic (no visual impact) | Optional |

## Reference
- [Vue.js Slots - Conditional Slots](https://vuejs.org/guide/components/slots.html#conditional-slots)
