---
title: Use Teleport to Avoid CSS Positioning Issues
impact: MEDIUM
impactDescription: Modals and overlays can break when parent elements have transform, perspective, or filter CSS properties
type: best-practice
tags: [vue3, teleport, modal, css, z-index, positioning]
---

# Use Teleport to Avoid CSS Positioning Issues

**Impact: MEDIUM** - CSS `position: fixed` only positions relative to the viewport when no ancestor has `transform`, `perspective`, or `filter` properties. Without Teleport, modals nested deep in the DOM can break when parent elements use these CSS properties.

This is a common issue when using CSS animations on parent elements or when modals are deeply nested in component hierarchies.

## Task Checklist

- [ ] Use `<Teleport>` for modals, tooltips, and other fixed-position overlays
- [ ] Teleport to a container outside the Vue app hierarchy (e.g., `body` or `#modals`)
- [ ] Avoid relying on `z-index` alone for stacking - teleport ensures proper layering

**Problem - Without Teleport:**
```vue
<template>
  <div class="animated-container">
    <!-- Modal is nested inside animated parent -->
    <button @click="showModal = true">Open Modal</button>

    <!-- BROKEN: position: fixed is relative to .animated-container, not viewport -->
    <div v-if="showModal" class="modal">
      <p>This modal will be mispositioned!</p>
    </div>
  </div>
</template>

<style>
.animated-container {
  /* This breaks position: fixed in descendants */
  transform: translateX(0);
  /* Or any of these: */
  /* perspective: 1000px; */
  /* filter: blur(0); */
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;  /* z-index constrained by parent stacking context */
}
</style>
```

**Solution - With Teleport:**
```vue
<template>
  <div class="animated-container">
    <button @click="showModal = true">Open Modal</button>

    <!-- Teleport moves modal outside the problematic parent -->
    <Teleport to="body">
      <div v-if="showModal" class="modal">
        <p>Modal now positions correctly relative to viewport!</p>
        <button @click="showModal = false">Close</button>
      </div>
    </Teleport>
  </div>
</template>

<style>
.animated-container {
  transform: translateX(0);  /* No longer affects modal */
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;  /* z-index now works as expected */
}
</style>
```

## Z-Index Stacking Context Issues

Even without transform/filter, deeply nested elements create stacking contexts that constrain z-index:

```vue
<template>
  <div class="sidebar" style="z-index: 100; position: relative;">
    <div class="nested-component">
      <!-- Without Teleport: z-index: 9999 is constrained within sidebar -->
      <div v-if="showDropdown" class="dropdown" style="z-index: 9999;">
        This dropdown may be covered by other elements
      </div>
    </div>
  </div>

  <div class="content" style="z-index: 200; position: relative;">
    <!-- This will cover the dropdown because parent z-index is higher -->
  </div>
</template>
```

**Solution:**
```vue
<template>
  <div class="sidebar">
    <div class="nested-component">
      <Teleport to="body">
        <div v-if="showDropdown" class="dropdown">
          Dropdown now renders at body level - no z-index constraints
        </div>
      </Teleport>
    </div>
  </div>
</template>
```

## When to Use Teleport

| UI Element | Should Teleport? | Reason |
|------------|-----------------|--------|
| Full-screen modals | Yes | Fixed positioning, need to escape stacking contexts |
| Tooltips | Often | May need to escape overflow: hidden containers |
| Dropdowns | Sometimes | Depends on container overflow/positioning |
| Notifications/toasts | Yes | Should appear above all content |
| Inline popups | Usually no | Position relative to trigger element |

## Reference
- [Vue.js Teleport - Basic Usage](https://vuejs.org/guide/built-ins/teleport.html#basic-usage)
- [MDN - Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)
