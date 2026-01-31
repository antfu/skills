---
title: Use Function Shorthand for Simple Directives
impact: LOW
impactDescription: Function shorthand reduces boilerplate for directives with identical mounted/updated behavior
type: best-practice
tags: [vue3, directives, shorthand, code-style]
---

# Use Function Shorthand for Simple Directives

**Impact: LOW** - It's common for a custom directive to have the same behavior for `mounted` and `updated`, with no need for other hooks. In such cases, you can define the directive as a function instead of an object, reducing boilerplate and improving readability.

The function will be called for both `mounted` and `updated` lifecycle hooks.

## Task Checklist

- [ ] Use function shorthand when mounted and updated behavior is identical
- [ ] Use object syntax when you need beforeMount, beforeUpdate, or unmounted hooks
- [ ] Use object syntax when mounted and updated have different logic

**Verbose (when not needed):**
```javascript
// VERBOSE: Full object when behavior is identical
const vColor = {
  mounted(el, binding) {
    el.style.color = binding.value
  },
  updated(el, binding) {
    el.style.color = binding.value  // Same as mounted
  }
}

const vHighlight = {
  mounted(el, binding) {
    el.style.backgroundColor = binding.value || 'yellow'
  },
  updated(el, binding) {
    el.style.backgroundColor = binding.value || 'yellow'  // Duplicated
  }
}

// Global registration - verbose
app.directive('pin', {
  mounted(el, binding) {
    el.style.position = 'fixed'
    el.style.top = binding.value + 'px'
  },
  updated(el, binding) {
    el.style.position = 'fixed'
    el.style.top = binding.value + 'px'
  }
})
```

**Concise (function shorthand):**
```javascript
// CONCISE: Function shorthand
const vColor = (el, binding) => {
  el.style.color = binding.value
}

const vHighlight = (el, binding) => {
  el.style.backgroundColor = binding.value || 'yellow'
}

// Global registration - concise
app.directive('pin', (el, binding) => {
  el.style.position = 'fixed'
  el.style.top = binding.value + 'px'
})
```

## With script setup

```vue
<script setup>
// Function shorthand for local directives
const vFocus = (el) => {
  el.focus()
}

const vColor = (el, binding) => {
  el.style.color = binding.value
}

const vPin = (el, binding) => {
  el.style.position = binding.modifiers.absolute ? 'absolute' : 'fixed'
  const position = binding.arg || 'top'
  el.style[position] = binding.value + 'px'
}
</script>

<template>
  <input v-focus />
  <p v-color="'red'">Colored text</p>
  <div v-pin:left.absolute="100">Positioned element</div>
</template>
```

## When to Use Object Syntax

Use the full object syntax when:

### 1. You Need Cleanup (unmounted hook)
```javascript
// Need object syntax for cleanup
const vClickOutside = {
  mounted(el, binding) {
    el._handler = (e) => {
      if (!el.contains(e.target)) binding.value(e)
    }
    document.addEventListener('click', el._handler)
  },
  unmounted(el) {
    document.removeEventListener('click', el._handler)
  }
}
```

### 2. Different Logic for mounted vs updated
```javascript
// Need object syntax for different behavior
const vLazyLoad = {
  mounted(el, binding) {
    // Initial setup - create observer
    el._observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        el.src = binding.value
        el._observer.disconnect()
      }
    })
    el._observer.observe(el)
  },
  updated(el, binding, vnode, prevVnode) {
    // Only update if value actually changed
    if (binding.value !== binding.oldValue) {
      el.src = binding.value
    }
  },
  unmounted(el) {
    el._observer?.disconnect()
  }
}
```

### 3. You Need beforeMount or beforeUpdate
```javascript
// Need object syntax for early lifecycle hooks
const vAnimate = {
  beforeMount(el) {
    el.style.opacity = '0'
  },
  mounted(el) {
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.3s'
      el.style.opacity = '1'
    })
  },
  beforeUpdate(el) {
    el.style.opacity = '0.5'
  },
  updated(el) {
    el.style.opacity = '1'
  }
}
```

## Object Literal Values with Function Shorthand

Function shorthand works well with object literal values:

```javascript
const vDemo = (el, binding) => {
  console.log(binding.value.color)  // => "white"
  console.log(binding.value.text)   // => "hello!"

  el.style.color = binding.value.color
  el.textContent = binding.value.text
}
```

```vue
<template>
  <div v-demo="{ color: 'white', text: 'hello!' }"></div>
</template>
```

## Reference
- [Vue.js Custom Directives - Function Shorthand](https://vuejs.org/guide/reusability/custom-directives#function-shorthand)
