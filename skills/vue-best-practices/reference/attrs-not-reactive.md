---
title: useAttrs() Object Is Not Reactive
impact: MEDIUM
impactDescription: Watching attrs directly does not trigger - use onUpdated() or convert to props
type: gotcha
tags: [vue3, attrs, reactivity, composition-api]
---

# useAttrs() Object Is Not Reactive

**Impact: MEDIUM** - The object returned by `useAttrs()` is NOT reactive. While it always reflects the latest fallthrough attributes, you cannot use `watch()` or `watchEffect()` to observe its changes. Watchers on attrs properties will NOT trigger when attributes change.

## Task Checklist

- [ ] Never use `watch()` to observe attrs changes - it won't trigger
- [ ] Use `onUpdated()` lifecycle hook for side effects based on attrs
- [ ] Convert frequently-accessed attrs to props if you need reactivity
- [ ] Remember attrs ARE always current in templates and event handlers

**Incorrect:**
```vue
<script setup>
import { watch, useAttrs } from 'vue'

const attrs = useAttrs()

// WRONG: This watcher will NEVER trigger when attrs change!
watch(
  () => attrs.someAttr,
  (newValue) => {
    console.log('Attribute changed:', newValue)
    // This callback never runs on attr changes
  }
)

// WRONG: watchEffect also doesn't track attrs
watchEffect(() => {
  console.log(attrs.class) // Only runs on mount, NOT when class changes
})
</script>
```

**Correct:**
```vue
<script setup>
import { onUpdated, useAttrs } from 'vue'

const attrs = useAttrs()

// CORRECT: Use onUpdated to access latest attrs
onUpdated(() => {
  console.log('Current attrs:', attrs)
  // Perform side effects with latest attrs here
})
</script>
```

```vue
<script setup>
import { watch } from 'vue'

// CORRECT: If you need reactivity, declare it as a prop
const props = defineProps({
  someAttr: String
})

// Now you can watch it
watch(
  () => props.someAttr,
  (newValue) => {
    console.log('Attribute changed:', newValue)
  }
)
</script>
```

## Why Attrs Are Not Reactive

Vue's official documentation states:

> "Note that although the attrs object here always reflects the latest fallthrough attributes, it isn't reactive (for performance reasons). You cannot use watchers to observe its changes."

This is a deliberate design decision for performance - making attrs reactive would add overhead to every component that uses fallthrough attributes.

## When Attrs DO Reflect Current Values

Despite not being reactive, attrs always have current values in these contexts:

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

// In event handlers - attrs are current when handler executes
function handleClick() {
  console.log(attrs.class) // Current value at click time
}
</script>

<template>
  <!-- In templates - always current -->
  <div :class="attrs.class">
    {{ attrs.title }}
  </div>

  <!-- Using v-bind to spread all attrs -->
  <input v-bind="attrs" />
</template>
```

## Computed Properties with Attrs

Computed properties that reference attrs will update when the component re-renders:

```vue
<script setup>
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

// This DOES update - because computed re-evaluates on render
const hasCustomClass = computed(() => {
  return !!attrs.class
})
</script>

<template>
  <div v-bind="attrs">
    <span v-if="hasCustomClass">Has custom styling</span>
  </div>
</template>
```

Note: The computed updates because the component re-renders when props/attrs change, not because attrs is reactive.

## Alternative: Use getCurrentInstance() (Advanced)

For advanced use cases, you can access attrs through the component instance:

```vue
<script setup>
import { watch, getCurrentInstance } from 'vue'

const instance = getCurrentInstance()

// This may work in some cases, but is NOT officially supported
// getCurrentInstance() is an internal API and may change
watch(
  () => instance?.attrs.someAttr,
  (newValue) => {
    console.log('Attribute changed:', newValue)
  }
)
</script>
```

> **Warning:** `getCurrentInstance()` is an internal API. Prefer `onUpdated()` or converting to props.

## Reference
- [Fallthrough Attributes - Accessing in JavaScript](https://vuejs.org/guide/components/attrs.html#accessing-fallthrough-attributes-in-javascript)
- [Vue 3 Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
