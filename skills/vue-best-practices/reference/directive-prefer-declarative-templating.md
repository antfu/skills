---
title: Prefer Built-in Directives Over Custom Directives
impact: MEDIUM
impactDescription: Custom directives are less efficient than built-in directives and not SSR-friendly
type: best-practice
tags: [vue3, directives, performance, ssr, best-practices]
---

# Prefer Built-in Directives Over Custom Directives

**Impact: MEDIUM** - Custom directives should only be used when the desired functionality can only be achieved via direct DOM manipulation. Declarative templating with built-in directives such as `v-bind`, `v-show`, `v-if`, and `v-on` is recommended when possible because they are more efficient and server-rendering friendly.

Before creating a custom directive, consider if the same result can be achieved with Vue's built-in reactivity and templating features.

## Task Checklist

- [ ] Before creating a custom directive, check if built-in directives can solve the problem
- [ ] Consider if a composable function would be more appropriate
- [ ] For SSR applications, evaluate if the directive will work on the server
- [ ] Only use custom directives for low-level DOM manipulation that can't be done declaratively

**Incorrect:**
```vue
<template>
  <!-- WRONG: Custom directive for something v-show does -->
  <div v-visibility="isVisible">Content</div>

  <!-- WRONG: Custom directive for class binding -->
  <div v-add-class="{ active: isActive }">Content</div>

  <!-- WRONG: Custom directive for style binding -->
  <div v-set-color="textColor">Content</div>
</template>

<script setup>
import { ref } from 'vue'

const isVisible = ref(true)
const isActive = ref(false)
const textColor = ref('blue')

// Unnecessary custom directives
const vVisibility = {
  mounted(el, binding) {
    el.style.display = binding.value ? '' : 'none'
  },
  updated(el, binding) {
    el.style.display = binding.value ? '' : 'none'
  }
}

const vAddClass = {
  mounted(el, binding) {
    Object.entries(binding.value).forEach(([cls, active]) => {
      el.classList.toggle(cls, active)
    })
  },
  updated(el, binding) {
    Object.entries(binding.value).forEach(([cls, active]) => {
      el.classList.toggle(cls, active)
    })
  }
}

const vSetColor = (el, binding) => {
  el.style.color = binding.value
}
</script>
```

**Correct:**
```vue
<template>
  <!-- CORRECT: Use built-in v-show -->
  <div v-show="isVisible">Content</div>

  <!-- CORRECT: Use built-in class binding -->
  <div :class="{ active: isActive }">Content</div>

  <!-- CORRECT: Use built-in style binding -->
  <div :style="{ color: textColor }">Content</div>
</template>

<script setup>
import { ref } from 'vue'

const isVisible = ref(true)
const isActive = ref(false)
const textColor = ref('blue')
// No custom directives needed!
</script>
```

## When Custom Directives ARE Appropriate

Custom directives are appropriate when you need:

### 1. Direct DOM API Access
```javascript
// GOOD: Focus management requires DOM API
const vFocus = {
  mounted(el) {
    el.focus()
  }
}

// Usage: Works on dynamic insertion, not just page load
// <input v-focus />
```

### 2. Third-Party Library Integration
```javascript
// GOOD: Integrating with external libraries
const vTippy = {
  mounted(el, binding) {
    el._tippy = tippy(el, {
      content: binding.value,
      ...binding.modifiers
    })
  },
  updated(el, binding) {
    el._tippy?.setContent(binding.value)
  },
  unmounted(el) {
    el._tippy?.destroy()
  }
}
```

### 3. Event Handling Outside Vue's Scope
```javascript
// GOOD: Global event that Vue doesn't provide
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => {
      if (!el.contains(e.target)) {
        binding.value(e)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}
```

### 4. Intersection/Mutation/Resize Observers
```javascript
// GOOD: IntersectionObserver requires DOM API
const vLazyLoad = {
  mounted(el, binding) {
    el._observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = binding.value
        el._observer.disconnect()
      }
    })
    el._observer.observe(el)
  },
  unmounted(el) {
    el._observer?.disconnect()
  }
}
```

## Consider Composables Instead

For complex logic, a composable might be better than a directive:

```javascript
// Composable approach - more flexible and testable
import { ref, onMounted, onUnmounted } from 'vue'

export function useClickOutside(elementRef, callback) {
  const handler = (e) => {
    if (elementRef.value && !elementRef.value.contains(e.target)) {
      callback(e)
    }
  }

  onMounted(() => document.addEventListener('click', handler))
  onUnmounted(() => document.removeEventListener('click', handler))
}

// Usage in component
const dropdownRef = ref(null)
useClickOutside(dropdownRef, () => {
  isOpen.value = false
})
```

## SSR Considerations

Custom directives don't run on the server, which can cause hydration issues:

```javascript
// PROBLEM: This directive modifies DOM, causing hydration mismatch
const vHydrationProblem = {
  mounted(el) {
    el.textContent = 'Client-side only text'
  }
}

// SOLUTION: Use built-in directives or ensure server/client match
// Or handle hydration explicitly:
const vSafeForSSR = {
  mounted(el, binding) {
    // Only add behavior, don't modify content
    el.addEventListener('click', binding.value)
  },
  unmounted(el, binding) {
    el.removeEventListener('click', binding.value)
  }
}
```

## Reference
- [Vue.js Custom Directives - Introduction](https://vuejs.org/guide/reusability/custom-directives#introduction)
- [Vue.js Composables](https://vuejs.org/guide/reusability/composables.html)
