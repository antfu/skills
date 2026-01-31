---
title: Multiple Teleports to Same Target Append in Order
impact: LOW
impactDescription: When multiple Teleport components target the same element, they append in declaration order
type: capability
tags: [vue3, teleport, modal, order]
---

# Multiple Teleports to Same Target Append in Order

**Impact: LOW** - Multiple `<Teleport>` components can mount content to the same target element. Content appends in declaration order - later teleports appear after earlier ones in the DOM.

This is useful for notification stacks, modal layering, and tooltip systems.

## Task Checklist

- [ ] Use consistent teleport targets for related UI (e.g., all modals to `#modals`)
- [ ] Leverage natural stacking order or use z-index for layer control
- [ ] Consider a notification/modal management system for complex cases

**Basic Example:**
```vue
<template>
  <Teleport to="#notifications">
    <div class="notification">First notification</div>
  </Teleport>

  <Teleport to="#notifications">
    <div class="notification">Second notification</div>
  </Teleport>
</template>
```

**Resulting DOM:**
```html
<div id="notifications">
  <div class="notification">First notification</div>
  <div class="notification">Second notification</div>
</div>
```

## Practical Example: Notification Stack

```vue
<!-- NotificationSystem.vue -->
<template>
  <Teleport to="#notifications">
    <TransitionGroup name="notification" tag="div" class="notification-stack">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="notification.type"
      >
        {{ notification.message }}
        <button @click="dismiss(notification.id)">×</button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const notifications = ref([])

function notify(message, type = 'info') {
  const id = Date.now()
  notifications.value.push({ id, message, type })
  setTimeout(() => dismiss(id), 5000)
}

function dismiss(id) {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

defineExpose({ notify })
</script>
```

## Modal Layering

When modals open other modals, they naturally stack:

```vue
<!-- ParentModal.vue -->
<template>
  <Teleport to="#modals">
    <div v-if="visible" class="modal">
      <p>Parent Modal</p>
      <button @click="showChild = true">Open Child Modal</button>
    </div>
  </Teleport>

  <!-- Child modal teleports after parent -->
  <Teleport to="#modals">
    <div v-if="showChild" class="modal child-modal">
      <p>Child Modal (appears on top)</p>
      <button @click="showChild = false">Close</button>
    </div>
  </Teleport>
</template>

<style>
.modal {
  position: fixed;
  /* Later modals naturally have higher stacking order */
}
</style>
```

## Controlling Order with z-index

For explicit control over stacking:

```vue
<template>
  <Teleport to="#modals">
    <div v-if="showBase" class="modal" style="z-index: 100;">
      Base Modal
    </div>
  </Teleport>

  <Teleport to="#modals">
    <div v-if="showConfirm" class="modal" style="z-index: 200;">
      Confirmation Dialog (always on top)
    </div>
  </Teleport>
</template>
```

## Cross-Component Teleports

Components from different parts of the app can teleport to the same target:

```vue
<!-- Header.vue -->
<template>
  <Teleport to="#global-alerts">
    <div v-if="headerAlert" class="alert">Header alert</div>
  </Teleport>
</template>

<!-- Footer.vue -->
<template>
  <Teleport to="#global-alerts">
    <div v-if="footerAlert" class="alert">Footer alert</div>
  </Teleport>
</template>

<!-- Both appear in #global-alerts, ordered by mount timing -->
```

## Reference
- [Vue.js Teleport - Multiple Teleports on Same Target](https://vuejs.org/guide/built-ins/teleport.html#multiple-teleports-on-the-same-target)
