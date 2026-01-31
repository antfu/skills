---
title: Use withDirectives for Custom Directives in Render Functions
impact: LOW
impactDescription: Custom directives require special handling with withDirectives helper
type: best-practice
tags: [vue3, render-function, directives, custom-directive]
---

# Use withDirectives for Custom Directives in Render Functions

**Impact: LOW** - To apply custom directives to vnodes in render functions, use the `withDirectives` helper. Attempting to apply directives through props or other means will not work.

The `withDirectives` function wraps a vnode and applies directives with their values, arguments, and modifiers.

## Task Checklist

- [ ] Import `withDirectives` from 'vue' when using custom directives
- [ ] Import or define the directive object
- [ ] Pass directive as array: `[directive, value, argument, modifiers]`
- [ ] Multiple directives can be applied at once

**Incorrect:**
```javascript
import { h } from 'vue'

const vFocus = { mounted: (el) => el.focus() }

export default {
  setup() {
    return () => {
      // WRONG: Directives don't work as props
      return h('input', {
        'v-focus': true  // This doesn't work
      })
    }
  }
}
```

**Correct:**
```javascript
import { h, withDirectives } from 'vue'

// Custom directive
const vFocus = {
  mounted: (el) => el.focus()
}

export default {
  setup() {
    return () => {
      // CORRECT: Use withDirectives
      return withDirectives(
        h('input'),
        [[vFocus]]  // Array of directive tuples
      )
    }
  }
}
```

## Directive with Value, Argument, and Modifiers

The directive tuple format: `[directive, value, argument, modifiers]`

```javascript
import { h, withDirectives, resolveDirective } from 'vue'

// Directive definition
// Usage in template: <div v-pin:top.animate="200">
const vPin = {
  mounted(el, binding) {
    console.log(binding.value)    // 200
    console.log(binding.arg)      // 'top'
    console.log(binding.modifiers) // { animate: true }

    el.style.position = 'fixed'
    el.style[binding.arg] = binding.value + 'px'
  }
}

export default {
  setup() {
    return () => withDirectives(
      h('div', 'Pinned content'),
      [
        // [directive, value, argument, modifiers]
        [vPin, 200, 'top', { animate: true }]
      ]
    )
  }
}
```

## Multiple Directives

```javascript
import { h, withDirectives } from 'vue'

const vFocus = { mounted: (el) => el.focus() }
const vTooltip = {
  mounted(el, { value }) {
    el.title = value
  }
}

export default {
  setup() {
    return () => withDirectives(
      h('input', { placeholder: 'Enter text' }),
      [
        [vFocus],
        [vTooltip, 'This is a tooltip']
      ]
    )
  }
}
```

## Using Registered Directives

For globally or locally registered directives, use `resolveDirective`:

```javascript
import { h, withDirectives, resolveDirective } from 'vue'

// Assuming v-focus and v-tooltip are registered globally
export default {
  setup() {
    return () => {
      const focus = resolveDirective('focus')
      const tooltip = resolveDirective('tooltip')

      return withDirectives(
        h('input'),
        [
          [focus],
          [tooltip, 'Helpful tip']
        ]
      )
    }
  }
}
```

## Practical Example: Click Outside Directive

```javascript
import { h, withDirectives, ref } from 'vue'

const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!el.contains(event.target)) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}

export default {
  setup() {
    const isOpen = ref(true)
    const closeDropdown = () => { isOpen.value = false }

    return () => isOpen.value
      ? withDirectives(
          h('div', { class: 'dropdown' }, 'Dropdown content'),
          [[vClickOutside, closeDropdown]]
        )
      : null
  }
}
```

## JSX with Directives

Directives in JSX also require `withDirectives`:

```jsx
import { withDirectives } from 'vue'

const vFocus = { mounted: (el) => el.focus() }

export default {
  setup() {
    return () => withDirectives(
      <input placeholder="Search..." />,
      [[vFocus]]
    )
  }
}
```

## Reference
- [Vue.js Render Functions - Custom Directives](https://vuejs.org/guide/extras/render-function.html#custom-directives)
- [Vue.js Custom Directives](https://vuejs.org/guide/reusability/custom-directives.html)
