---
title: Vue 3 Directive Hooks Renamed from Vue 2
impact: HIGH
impactDescription: Using Vue 2 hook names in Vue 3 causes directives to silently fail
type: gotcha
tags: [vue3, vue2, migration, directives, hooks, breaking-change]
---

# Vue 3 Directive Hooks Renamed from Vue 2

**Impact: HIGH** - Vue 3 renamed all custom directive lifecycle hooks to align with component lifecycle hooks. Using Vue 2 hook names will cause your directives to silently fail since the hooks won't be called. Additionally, the `update` hook was removed entirely.

This is a breaking change that requires updating all custom directives when migrating from Vue 2 to Vue 3.

## Task Checklist

- [ ] Rename `bind` to `beforeMount`
- [ ] Rename `inserted` to `mounted`
- [ ] Replace `update` with `beforeUpdate` or `updated` (update was removed)
- [ ] Rename `componentUpdated` to `updated`
- [ ] Rename `unbind` to `unmounted`
- [ ] Add `beforeUpdate` if you need the old `update` behavior

## Hook Name Mapping

| Vue 2           | Vue 3          |
|-----------------|----------------|
| `bind`          | `beforeMount`  |
| `inserted`      | `mounted`      |
| `update`        | **removed**    |
| `componentUpdated` | `updated`   |
| `unbind`        | `unmounted`    |
| (none)          | `created`      |
| (none)          | `beforeUpdate` |
| (none)          | `beforeUnmount`|

**Vue 2 (old):**
```javascript
// Vue 2 directive - WILL NOT WORK IN VUE 3
Vue.directive('demo', {
  bind(el, binding, vnode) {
    // Called when directive is first bound to element
  },
  inserted(el, binding, vnode) {
    // Called when element is inserted into parent
  },
  update(el, binding, vnode, oldVnode) {
    // Called on every VNode update (REMOVED in Vue 3)
  },
  componentUpdated(el, binding, vnode, oldVnode) {
    // Called after component and children update
  },
  unbind(el, binding, vnode) {
    // Called when directive is unbound from element
  }
})
```

**Vue 3 (new):**
```javascript
// Vue 3 directive - Correct hook names
app.directive('demo', {
  created(el, binding, vnode) {
    // NEW: called before element's attributes or event listeners are applied
  },
  beforeMount(el, binding, vnode) {
    // Was: bind
  },
  mounted(el, binding, vnode) {
    // Was: inserted
  },
  beforeUpdate(el, binding, vnode, prevVnode) {
    // NEW: called before the element itself is updated
  },
  updated(el, binding, vnode, prevVnode) {
    // Was: componentUpdated
    // Note: 'update' was removed - use this or beforeUpdate instead
  },
  beforeUnmount(el, binding, vnode) {
    // NEW: called before element is unmounted
  },
  unmounted(el, binding, vnode) {
    // Was: unbind
  }
})
```

## Migration Examples

### Simple Focus Directive
```javascript
// Vue 2
Vue.directive('focus', {
  inserted(el) {
    el.focus()
  }
})

// Vue 3
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})
```

### Directive with Cleanup
```javascript
// Vue 2
Vue.directive('click-outside', {
  bind(el, binding) {
    el._handler = (e) => {
      if (!el.contains(e.target)) binding.value(e)
    }
    document.addEventListener('click', el._handler)
  },
  unbind(el) {
    document.removeEventListener('click', el._handler)
  }
})

// Vue 3
app.directive('click-outside', {
  beforeMount(el, binding) {  // or mounted
    el._handler = (e) => {
      if (!el.contains(e.target)) binding.value(e)
    }
    document.addEventListener('click', el._handler)
  },
  unmounted(el) {
    document.removeEventListener('click', el._handler)
  }
})
```

### Directive with Updates
```javascript
// Vue 2 - using update hook
Vue.directive('color', {
  bind(el, binding) {
    el.style.color = binding.value
  },
  update(el, binding) {
    // Called on every VNode update
    el.style.color = binding.value
  }
})

// Vue 3 - update removed, use function shorthand or updated
app.directive('color', (el, binding) => {
  // Function shorthand: called for both mounted AND updated
  el.style.color = binding.value
})

// Or with object syntax
app.directive('color', {
  mounted(el, binding) {
    el.style.color = binding.value
  },
  updated(el, binding) {
    // Use updated instead of update
    el.style.color = binding.value
  }
})
```

## Why `update` Was Removed

In Vue 2, `update` was called on every VNode update (before children updated), while `componentUpdated` was called after. The distinction was confusing and rarely needed. In Vue 3:

- `beforeUpdate` is called before the element updates
- `updated` is called after the element and all its children have updated

```javascript
// Vue 3 - if you need both before and after
app.directive('track-updates', {
  beforeUpdate(el, binding) {
    console.log('Before update, old value:', binding.oldValue)
  },
  updated(el, binding) {
    console.log('After update, new value:', binding.value)
  }
})
```

## vnode Structure Changes

In Vue 3, the `vnode` and `prevVnode` arguments also have different structure:

```javascript
// Vue 2
{
  update(el, binding, vnode, oldVnode) {
    // vnode.context was the component instance
    console.log(vnode.context)
  }
}

// Vue 3
{
  updated(el, binding, vnode, prevVnode) {
    // Use binding.instance instead of vnode.context
    console.log(binding.instance)
  }
}
```

## Reference
- [Vue 3 Migration Guide - Custom Directives](https://v3-migration.vuejs.org/breaking-changes/custom-directives)
- [Vue.js Custom Directives - Directive Hooks](https://vuejs.org/guide/reusability/custom-directives#directive-hooks)
