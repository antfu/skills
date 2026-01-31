---
title: Use Teleport disabled Prop for Responsive Design
impact: LOW
impactDescription: Toggle teleportation conditionally for responsive layouts
type: best-practice
tags: [vue3, teleport, responsive, mobile]
---

# Use Teleport disabled Prop for Responsive Design

**Impact: LOW** - The `disabled` prop on `<Teleport>` allows conditional teleportation. This is useful for responsive designs where content should render as an overlay on desktop but inline on mobile.

## Task Checklist

- [ ] Use `:disabled` binding for dynamic teleport control
- [ ] Combine with CSS media queries for complete responsive behavior
- [ ] Consider accessibility implications of position changes

**Basic Usage:**
```vue
<template>
  <Teleport to="body" :disabled="isMobile">
    <div class="sidebar">
      <!-- On mobile: renders inline -->
      <!-- On desktop: teleports to body as overlay -->
      <nav>Navigation content</nav>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>
```

## Responsive Modal Pattern

```vue
<template>
  <button @click="open = true">Open Menu</button>

  <!-- Teleport on desktop, inline sheet on mobile -->
  <Teleport to="body" :disabled="isMobile">
    <Transition :name="isMobile ? 'slide-up' : 'fade'">
      <div v-if="open" :class="isMobile ? 'bottom-sheet' : 'modal-overlay'">
        <div :class="isMobile ? 'sheet-content' : 'modal-content'">
          <slot />
          <button @click="open = false">Close</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'

const open = ref(false)
const isMobile = useMediaQuery('(max-width: 768px)')
</script>

<style scoped>
/* Desktop: Centered modal overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
}

/* Mobile: Bottom sheet */
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
}

.sheet-content {
  background: white;
  border-radius: 16px 16px 0 0;
  padding: 24px;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
}
</style>
```

## Sidebar Navigation Example

```vue
<!-- AppLayout.vue -->
<template>
  <div class="layout">
    <header>
      <button @click="sidebarOpen = !sidebarOpen" class="menu-toggle">
        Menu
      </button>
    </header>

    <main>
      <slot />
    </main>

    <!-- Desktop: Sidebar in normal flow -->
    <!-- Mobile: Teleport to body as overlay -->
    <Teleport to="body" :disabled="!isMobile">
      <aside v-if="sidebarOpen || !isMobile" class="sidebar">
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </aside>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'

const sidebarOpen = ref(false)
const isMobile = useMediaQuery('(max-width: 1024px)')
</script>

<style>
.layout {
  display: flex;
}

/* Desktop: sidebar in flex layout */
@media (min-width: 1025px) {
  .sidebar {
    width: 250px;
    height: 100vh;
    position: sticky;
    top: 0;
  }
}

/* Mobile: overlay sidebar */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    inset: 0;
    background: white;
    z-index: 1000;
  }
}
</style>
```

## VueUse Integration

Use `@vueuse/core` for reactive media queries:

```vue
<script setup>
import { useMediaQuery, useBreakpoints } from '@vueuse/core'

// Simple media query
const isMobile = useMediaQuery('(max-width: 768px)')

// Or use breakpoints
const breakpoints = useBreakpoints({
  mobile: 0,
  tablet: 768,
  desktop: 1024,
})

const isMobileOrTablet = breakpoints.smaller('desktop')
</script>

<template>
  <Teleport to="body" :disabled="isMobileOrTablet">
    <ModalContent />
  </Teleport>
</template>
```

## Reference
- [Vue.js Teleport - Disabling Teleport](https://vuejs.org/guide/built-ins/teleport.html#disabling-teleport)
- [VueUse - useMediaQuery](https://vueuse.org/core/useMediaQuery/)
