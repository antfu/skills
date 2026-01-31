---
title: Avoid Using Custom Directives on Components
impact: HIGH
impactDescription: Custom directives on multi-root components are silently ignored, causing unexpected behavior
type: gotcha
tags: [vue3, directives, components, multi-root, best-practices]
---

# Avoid Using Custom Directives on Components

**Impact: HIGH** - Using custom directives on components is not recommended and can lead to unexpected behavior. When applied to a multi-root component, the directive will be ignored and a warning will be thrown. Unlike attributes, directives cannot be passed to a different element with `v-bind="$attrs"`.

Custom directives are designed for direct DOM manipulation on native HTML elements, not Vue components.

## Task Checklist

- [ ] Only apply custom directives to native HTML elements, not components
- [ ] If a component needs directive-like behavior, consider making it part of the component's API
- [ ] For components, use props and events instead of directives
- [ ] If you must use a directive on a component, ensure it has a single root element

**Incorrect:**
```vue
<template>
  <!-- WRONG: Directive on a component - may be ignored -->
  <MyComponent v-focus />

  <!-- WRONG: Multi-root component - directive is ignored with warning -->
  <MultiRootComponent v-highlight />
</template>

<script setup>
import MyComponent from './MyComponent.vue'
import MultiRootComponent from './MultiRootComponent.vue'

// MultiRootComponent.vue has:
// <template>
//   <div>First root</div>
//   <div>Second root</div>
// </template>
</script>
```

**Correct:**
```vue
<template>
  <!-- CORRECT: Directive on native HTML element -->
  <input v-focus />

  <!-- CORRECT: Use props/events for component behavior -->
  <MyComponent :should-focus="true" />

  <!-- CORRECT: Wrap component in element if directive is needed -->
  <div v-highlight>
    <MyComponent />
  </div>
</template>

<script setup>
import MyComponent from './MyComponent.vue'
</script>
```

## When a Directive on Component Works

Directives only work reliably on components with a **single root element**. The directive applies to the root node, similar to fallthrough attributes:

```vue
<!-- SingleRootComponent.vue -->
<template>
  <div>I am the only root</div>
</template>

<!-- Parent.vue -->
<template>
  <!-- This works because SingleRootComponent has one root -->
  <SingleRootComponent v-my-directive />
</template>
```

However, this is still not recommended because:
1. It's fragile - refactoring to multi-root breaks the directive silently
2. It's unclear which element receives the directive
3. The component author may not expect external DOM manipulation

## Better Patterns

### Option 1: Component Prop
```vue
<!-- FocusableInput.vue -->
<template>
  <input ref="inputRef" v-bind="$attrs" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  autofocus: Boolean
})

const inputRef = ref(null)

onMounted(() => {
  if (props.autofocus) {
    inputRef.value?.focus()
  }
})
</script>

<!-- Usage -->
<FocusableInput autofocus />
```

### Option 2: Exposed Method
```vue
<!-- FocusableInput.vue -->
<template>
  <input ref="inputRef" />
</template>

<script setup>
import { ref } from 'vue'

const inputRef = ref(null)

const focus = () => inputRef.value?.focus()

defineExpose({ focus })
</script>

<!-- Parent.vue -->
<template>
  <FocusableInput ref="myInput" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const myInput = ref(null)

onMounted(() => {
  myInput.value?.focus()
})
</script>
```

## Reference
- [Vue.js Custom Directives - Usage on Components](https://vuejs.org/guide/reusability/custom-directives#usage-on-components)
