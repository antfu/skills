---
title: Provide Fallback Content for Slots
impact: LOW
impactDescription: Components without slot fallbacks may render empty or broken when content is not provided
type: best-practice
tags: [vue3, slots, fallback-content, component-design, reusability]
---

# Provide Fallback Content for Slots

**Impact: LOW** - Providing sensible default content inside `<slot>` elements makes components more resilient and user-friendly. Fallback content renders when no slot content is provided by the parent.

## Task Checklist

- [ ] Add fallback content inside slot elements for optional slots
- [ ] Use meaningful defaults that make sense standalone
- [ ] Consider i18n for text fallbacks in internationalized apps
- [ ] Document which slots have fallbacks and what they display

**Without Fallback (fragile):**
```vue
<!-- SubmitButton.vue -->
<template>
  <button type="submit" class="btn-primary">
    <!-- Empty if no content provided -->
    <slot></slot>
  </button>
</template>
```

```vue
<!-- Usage without content - renders empty button -->
<SubmitButton />
<!-- Result: <button type="submit" class="btn-primary"></button> -->
```

**With Fallback (resilient):**
```vue
<!-- SubmitButton.vue -->
<template>
  <button type="submit" class="btn-primary">
    <slot>Submit</slot>
  </button>
</template>
```

```vue
<!-- Usage without content - shows default -->
<SubmitButton />
<!-- Result: <button type="submit" class="btn-primary">Submit</button> -->

<!-- Usage with content - overrides default -->
<SubmitButton>Save Changes</SubmitButton>
<!-- Result: <button type="submit" class="btn-primary">Save Changes</button> -->
```

## Named Slots with Fallbacks

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <header class="card-header">
      <slot name="header">
        <h3>Card Title</h3>
      </slot>
    </header>

    <main class="card-body">
      <slot>
        <p>No content provided.</p>
      </slot>
    </main>

    <footer class="card-footer">
      <slot name="footer">
        <button>Close</button>
      </slot>
    </footer>
  </div>
</template>
```

## Complex Fallback Content

Fallback content can include multiple elements and logic:

```vue
<!-- UserAvatar.vue -->
<template>
  <div class="avatar-container">
    <slot name="image">
      <!-- Complex fallback with conditional logic -->
      <img
        v-if="user?.avatar"
        :src="user.avatar"
        :alt="user.name"
      />
      <div v-else class="avatar-placeholder">
        {{ initials }}
      </div>
    </slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: Object
})

const initials = computed(() => {
  if (!props.user?.name) return '?'
  return props.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
})
</script>
```

## When to Use Fallbacks

| Slot Purpose | Fallback Recommended? | Example |
|--------------|----------------------|---------|
| Button text | Yes | "Submit", "Click here" |
| Icon slot | Yes | Default icon component |
| Modal title | Yes | "Dialog" |
| Required content area | No | Main content slot |
| Customization only | Optional | Action buttons slot |

## Reference
- [Vue.js Slots - Fallback Content](https://vuejs.org/guide/components/slots.html#fallback-content)
