---
title: Know When to Use Directives vs Components
impact: MEDIUM
impactDescription: Using directives when components are more appropriate leads to harder maintenance and testing
type: best-practice
tags: [vue3, directives, components, architecture, best-practices]
---

# Know When to Use Directives vs Components

**Impact: MEDIUM** - Accessing the component instance from within a custom directive is often a sign that the directive should rather be a component itself. Directives are designed for low-level DOM manipulation, while components are better for encapsulating behavior that involves state, reactivity, or complex logic.

Choosing the wrong abstraction leads to code that's harder to maintain, test, and reuse.

## Task Checklist

- [ ] Use directives for simple, stateless DOM manipulations
- [ ] Use components when you need encapsulated state or complex logic
- [ ] If accessing `binding.instance` frequently, consider using a component instead
- [ ] If the behavior needs its own template, use a component
- [ ] Consider composables for stateful logic that doesn't need a template

## Decision Matrix

| Requirement | Use Directive | Use Component | Use Composable |
|-------------|--------------|---------------|----------------|
| DOM manipulation only | Yes | - | - |
| Needs own template | - | Yes | - |
| Encapsulated state | - | Yes | Maybe |
| Reusable behavior | Yes | Yes | Yes |
| Access to parent instance | Avoid | - | Yes |
| SSR support needed | Avoid | Yes | Yes |
| Third-party lib integration | Yes | - | Maybe |
| Complex reactive logic | - | Yes | Yes |

## Directive-Appropriate Use Cases

```javascript
// GOOD: Simple DOM manipulation
const vFocus = {
  mounted: (el) => el.focus()
}

// GOOD: Third-party library integration
const vTippy = {
  mounted(el, binding) {
    el._tippy = tippy(el, binding.value)
  },
  updated(el, binding) {
    el._tippy?.setProps(binding.value)
  },
  unmounted(el) {
    el._tippy?.destroy()
  }
}

// GOOD: Event handling that Vue doesn't provide
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

// GOOD: Intersection Observer
const vLazyLoad = {
  mounted(el, binding) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = binding.value
        observer.disconnect()
      }
    })
    observer.observe(el)
    el._observer = observer
  },
  unmounted(el) {
    el._observer?.disconnect()
  }
}
```

## Component-Appropriate Use Cases

```vue
<!-- GOOD: Component with template and state -->
<!-- Tooltip.vue -->
<template>
  <div class="tooltip-wrapper" @mouseenter="show" @mouseleave="hide">
    <slot></slot>
    <Transition name="fade">
      <div v-if="isVisible" class="tooltip-content">
        {{ content }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  content: String
})

const isVisible = ref(false)
const show = () => isVisible.value = true
const hide = () => isVisible.value = false
</script>
```

```vue
<!-- GOOD: Component with complex logic -->
<!-- InfiniteScroll.vue -->
<template>
  <div ref="container">
    <slot></slot>
    <div v-if="loading" class="loading-indicator">
      <slot name="loading">Loading...</slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  threshold: { type: Number, default: 100 }
})

const emit = defineEmits(['load-more'])
const container = ref(null)
const loading = ref(false)

// Complex scroll logic with state management
const handleScroll = () => {
  if (loading.value) return
  const { scrollHeight, scrollTop, clientHeight } = container.value
  if (scrollHeight - scrollTop - clientHeight < props.threshold) {
    loading.value = true
    emit('load-more', () => { loading.value = false })
  }
}

onMounted(() => container.value?.addEventListener('scroll', handleScroll))
onUnmounted(() => container.value?.removeEventListener('scroll', handleScroll))
</script>
```

## Composable-Appropriate Use Cases

```javascript
// GOOD: Reusable stateful logic without template
// useClickOutside.js
import { onMounted, onUnmounted, ref } from 'vue'

export function useClickOutside(elementRef, callback) {
  const isClickedOutside = ref(false)

  const handler = (e) => {
    if (elementRef.value && !elementRef.value.contains(e.target)) {
      isClickedOutside.value = true
      callback?.(e)
    }
  }

  onMounted(() => document.addEventListener('click', handler))
  onUnmounted(() => document.removeEventListener('click', handler))

  return { isClickedOutside }
}

// Usage in component
const dropdownRef = ref(null)
const { isClickedOutside } = useClickOutside(dropdownRef, () => {
  isOpen.value = false
})
```

## Anti-Pattern: Directive Accessing Instance Too Much

```javascript
// ANTI-PATTERN: Directive relying heavily on component instance
const vBadPattern = {
  mounted(el, binding) {
    // Accessing instance too much = should be a component
    const instance = binding.instance
    instance.someMethod()
    instance.someProperty = 'value'
    instance.$watch('someProp', (val) => {
      el.textContent = val
    })
  }
}

// BETTER: Use a component or composable
// Component version
<template>
  <div>{{ someProp }}</div>
</template>

<script setup>
const props = defineProps(['someProp'])
</script>
```

## When Instance Access is Acceptable

```javascript
// OK: Minimal instance access for specific needs
const vPermission = {
  mounted(el, binding) {
    // Checking a global permission - acceptable
    const userPermissions = binding.instance.$store?.state.user.permissions
    if (!userPermissions?.includes(binding.value)) {
      el.style.display = 'none'
    }
  }
}
```

## Reference
- [Vue.js Custom Directives](https://vuejs.org/guide/reusability/custom-directives)
- [Vue.js Composables](https://vuejs.org/guide/reusability/composables.html)
- [Vue.js Components Basics](https://vuejs.org/guide/essentials/component-basics.html)
