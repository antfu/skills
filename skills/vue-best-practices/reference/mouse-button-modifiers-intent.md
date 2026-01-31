---
title: Mouse Button Modifiers Represent Intent, Not Physical Buttons
impact: LOW
impactDescription: Mouse modifiers .left/.right/.middle may not match physical buttons on left-handed mice or other input devices
type: gotcha
tags: [vue3, events, mouse, accessibility, modifiers]
---

# Mouse Button Modifiers Represent Intent, Not Physical Buttons

**Impact: LOW** - Vue's mouse button modifiers (`.left`, `.right`, `.middle`) are named based on a typical right-handed mouse layout, but they actually represent "main", "secondary", and "auxiliary" pointing device triggers. This means they may not correspond to physical button positions on left-handed mice, trackpads, or other input devices.

## Task Checklist

- [ ] Understand that `.left` means "primary/main" action, not physical left button
- [ ] Understand that `.right` means "secondary" action (usually context menu)
- [ ] Consider accessibility when relying on specific mouse buttons
- [ ] Don't assume users have a traditional right-handed mouse

**Potentially Confusing:**
```html
<template>
  <!-- Documentation says "left click only" but... -->
  <div @click.left="handlePrimaryAction">
    <!-- On left-handed mouse: fires on physical RIGHT button -->
    <!-- On trackpad: fires on single-finger tap -->
    <!-- On touch screen: fires on tap -->
  </div>
</template>
```

**Clear Understanding:**
```html
<template>
  <!-- Think of it as "primary action" -->
  <div @click.left="handlePrimaryAction">
    Primary action (main button)
  </div>

  <!-- Think of it as "secondary/context action" -->
  <div @click.right="handleSecondaryAction">
    Secondary action (context menu button)
  </div>

  <!-- Think of it as "auxiliary action" -->
  <div @click.middle="handleAuxiliaryAction">
    Auxiliary action (scroll wheel click)
  </div>
</template>
```

## What the Modifiers Actually Mean

```javascript
// Vue modifier → MouseEvent.button value → Actual meaning

// .left    → button === 0 → "Main button" (primary action)
// .right   → button === 2 → "Secondary button" (context menu)
// .middle  → button === 1 → "Auxiliary button" (middle click)

// The browser handles remapping for:
// - Left-handed mouse settings
// - Trackpad gestures
// - Touch devices
// - Stylus/pen input
```

## Device Behaviors

```html
<!-- How different devices trigger these modifiers -->

<!-- Traditional right-handed mouse -->
<!-- .left = physical left button -->
<!-- .right = physical right button -->
<!-- .middle = scroll wheel press -->

<!-- Left-handed mouse (swapped in OS settings) -->
<!-- .left = physical RIGHT button (remapped by OS) -->
<!-- .right = physical LEFT button (remapped by OS) -->
<!-- .middle = scroll wheel press -->

<!-- Trackpad -->
<!-- .left = single-finger tap/click -->
<!-- .right = two-finger tap/click (or corner click) -->
<!-- .middle = three-finger tap (if configured) -->

<!-- Touch screen -->
<!-- .left = tap -->
<!-- .right = long press (context menu) -->
<!-- .middle = typically not available -->
```

## Best Practice: Semantic Naming in Comments

```html
<template>
  <!-- Use comments to clarify intent -->

  <!-- Primary action (select item) -->
  <div @click.left="selectItem">

  <!-- Context menu action -->
  <div @click.right.prevent="showContextMenu">

  <!-- Open in new tab (auxiliary/middle click convention) -->
  <a @click.middle="openInNewTab" href="...">
</template>
```

## Accessibility Considerations

```html
<template>
  <!-- Don't require specific mouse buttons for essential actions -->

  <!-- BETTER: Provide keyboard alternatives -->
  <div
    @click.left="select"
    @click.right.prevent="showMenu"
    @keydown.enter="select"
    @keydown.space="select"
    @contextmenu.prevent="showMenu"
    tabindex="0"
    role="button"
  >
    Accessible interactive element
  </div>
</template>
```

## Reference
- [Vue.js Event Handling - Mouse Button Modifiers](https://vuejs.org/guide/essentials/event-handling.html#mouse-button-modifiers)
- [MDN - MouseEvent.button](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button)
