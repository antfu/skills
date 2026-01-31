---
title: Treat Directive Hook Arguments as Read-Only
impact: MEDIUM
impactDescription: Modifying directive arguments causes unpredictable behavior and breaks Vue's internal state
type: gotcha
tags: [vue3, directives, hooks, read-only, dataset]
---

# Treat Directive Hook Arguments as Read-Only

**Impact: MEDIUM** - Apart from `el`, you should treat all directive hook arguments (`binding`, `vnode`, `prevVnode`) as read-only and never modify them. Modifying these objects can cause unpredictable behavior and interfere with Vue's internal workings.

If you need to share information across hooks, use the element's `dataset` attribute or a WeakMap.

## Task Checklist

- [ ] Never mutate `binding`, `vnode`, or `prevVnode` arguments
- [ ] Use `el.dataset` to share primitive data between hooks
- [ ] Use a WeakMap for complex data that needs to persist across hooks
- [ ] Only modify `el` (the DOM element) directly

**Incorrect:**
```javascript
// WRONG: Mutating binding object
const vBadDirective = {
  mounted(el, binding) {
    // DON'T DO THIS - modifying binding
    binding.value = 'modified' // WRONG!
    binding.customData = 'stored' // WRONG!
    binding.modifiers.custom = true // WRONG!
  },
  updated(el, binding) {
    // These modifications may be lost or cause errors
    console.log(binding.customData) // undefined or error
  }
}

// WRONG: Mutating vnode
const vAnotherBadDirective = {
  mounted(el, binding, vnode) {
    // DON'T DO THIS
    vnode.myData = 'stored' // WRONG!
    vnode.props.modified = true // WRONG!
  }
}
```

**Correct:**
```javascript
// CORRECT: Use el.dataset for simple data
const vWithDataset = {
  mounted(el, binding) {
    // Store data on the element's dataset
    el.dataset.originalValue = binding.value
    el.dataset.mountedAt = Date.now().toString()
  },
  updated(el, binding) {
    // Access previously stored data
    console.log('Original:', el.dataset.originalValue)
    console.log('Current:', binding.value)
    console.log('Mounted at:', el.dataset.mountedAt)
  },
  unmounted(el) {
    // Clean up dataset if needed
    delete el.dataset.originalValue
    delete el.dataset.mountedAt
  }
}

// CORRECT: Use WeakMap for complex data
const directiveState = new WeakMap()

const vWithWeakMap = {
  mounted(el, binding) {
    // Store complex state
    directiveState.set(el, {
      originalValue: binding.value,
      config: binding.arg,
      mountedAt: Date.now(),
      callbacks: [],
      observers: []
    })
  },
  updated(el, binding) {
    const state = directiveState.get(el)
    if (state) {
      console.log('Original:', state.originalValue)
      console.log('Current:', binding.value)
      // Can safely modify state object
      state.updateCount = (state.updateCount || 0) + 1
    }
  },
  unmounted(el) {
    // WeakMap auto-cleans when element is garbage collected
    // but explicit cleanup is good for observers/listeners
    const state = directiveState.get(el)
    if (state) {
      state.observers.forEach(obs => obs.disconnect())
      directiveState.delete(el)
    }
  }
}
```

## Using Element Properties

```javascript
// CORRECT: Use element properties with underscore prefix convention
const vTooltip = {
  mounted(el, binding) {
    // Store on element with underscore prefix to avoid conflicts
    el._tooltipInstance = createTooltip(el, binding.value)
    el._tooltipConfig = { ...binding.modifiers }
  },
  updated(el, binding) {
    // Access and update stored instance
    if (el._tooltipInstance) {
      el._tooltipInstance.update(binding.value)
    }
  },
  unmounted(el) {
    // Clean up
    if (el._tooltipInstance) {
      el._tooltipInstance.destroy()
      delete el._tooltipInstance
      delete el._tooltipConfig
    }
  }
}
```

## What You CAN Modify

You are allowed to modify the `el` (DOM element) itself:

```javascript
const vHighlight = {
  mounted(el, binding) {
    // CORRECT: Modifying el directly is allowed
    el.style.backgroundColor = binding.value
    el.classList.add('highlighted')
    el.setAttribute('data-highlighted', 'true')
    el.textContent = 'Modified content'
  },
  updated(el, binding) {
    // CORRECT: Update el when binding changes
    el.style.backgroundColor = binding.value
  }
}
```

## Binding Object Properties (Read-Only Reference)

The `binding` object contains:
- `value` - Current value passed to directive (read-only)
- `oldValue` - Previous value (only in beforeUpdate/updated) (read-only)
- `arg` - Argument passed (e.g., `v-dir:arg`) (read-only)
- `modifiers` - Object of modifiers (e.g., `v-dir.foo.bar`) (read-only)
- `instance` - Component instance (read-only)
- `dir` - Directive definition object (read-only)

```javascript
const vExample = {
  mounted(el, binding) {
    // READ these properties, don't modify them
    console.log(binding.value)      // Read: OK
    console.log(binding.arg)        // Read: OK
    console.log(binding.modifiers)  // Read: OK
    console.log(binding.instance)   // Read: OK

    // Store what you need for later
    el.dataset.directiveArg = binding.arg || ''
    el.dataset.hasModifierFoo = binding.modifiers.foo ? 'true' : 'false'
  }
}
```

## Reference
- [Vue.js Custom Directives - Hook Arguments](https://vuejs.org/guide/reusability/custom-directives#hook-arguments)
- [MDN - HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset)
