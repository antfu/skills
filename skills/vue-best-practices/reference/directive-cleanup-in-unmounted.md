---
title: Clean Up Side Effects in Directive unmounted Hook
impact: HIGH
impactDescription: Failing to clean up intervals, event listeners, and subscriptions in directives causes memory leaks
type: gotcha
tags: [vue3, directives, memory-leak, cleanup, unmounted, event-listeners]
---

# Clean Up Side Effects in Directive unmounted Hook

**Impact: HIGH** - A common and critical mistake when creating custom directives is forgetting to clean up intervals, event listeners, and other side effects in the `unmounted` hook. This causes memory leaks and ghost handlers that continue running after the element is removed from the DOM.

The key to avoiding such bugs is always implementing the `unmounted` hook to clean up any resources created in `mounted` or other lifecycle hooks.

## Task Checklist

- [ ] Always pair resource creation in `mounted` with cleanup in `unmounted`
- [ ] Store references to intervals, timeouts, and listeners for later cleanup
- [ ] Use `el.dataset` or WeakMap to share data between directive hooks
- [ ] Test that directives properly clean up when elements are removed (v-if toggling)

**Incorrect:**
```javascript
// WRONG: No cleanup - memory leak!
const vPoll = {
  mounted(el, binding) {
    // This interval runs forever, even after element is removed!
    setInterval(() => {
      console.log('polling...')
      binding.value?.()
    }, 1000)
  }
}

// WRONG: Event listener persists after unmount
const vClickOutside = {
  mounted(el, binding) {
    document.addEventListener('click', (e) => {
      if (!el.contains(e.target)) {
        binding.value()
      }
    })
    // No cleanup - listener stays attached to document!
  }
}
```

**Correct:**
```javascript
// CORRECT: Store reference and clean up
const vPoll = {
  mounted(el, binding) {
    // Store interval ID on the element for later cleanup
    el._pollInterval = setInterval(() => {
      console.log('polling...')
      binding.value?.()
    }, 1000)
  },
  unmounted(el) {
    // Clean up the interval
    if (el._pollInterval) {
      clearInterval(el._pollInterval)
      delete el._pollInterval
    }
  }
}

// CORRECT: Named function for proper removal
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutsideHandler = (e) => {
      if (!el.contains(e.target)) {
        binding.value()
      }
    }
    document.addEventListener('click', el._clickOutsideHandler)
  },
  unmounted(el) {
    if (el._clickOutsideHandler) {
      document.removeEventListener('click', el._clickOutsideHandler)
      delete el._clickOutsideHandler
    }
  }
}
```

## Using WeakMap for Cleaner State Management

```javascript
// BEST: Use WeakMap to avoid polluting element properties
const pollIntervals = new WeakMap()
const clickHandlers = new WeakMap()

const vPoll = {
  mounted(el, binding) {
    const intervalId = setInterval(() => {
      binding.value?.()
    }, binding.arg || 1000)
    pollIntervals.set(el, intervalId)
  },
  unmounted(el) {
    const intervalId = pollIntervals.get(el)
    if (intervalId) {
      clearInterval(intervalId)
      pollIntervals.delete(el)
    }
  }
}

const vClickOutside = {
  mounted(el, binding) {
    const handler = (e) => {
      if (!el.contains(e.target)) {
        binding.value()
      }
    }
    clickHandlers.set(el, handler)
    document.addEventListener('click', handler)
  },
  unmounted(el) {
    const handler = clickHandlers.get(el)
    if (handler) {
      document.removeEventListener('click', handler)
      clickHandlers.delete(el)
    }
  }
}
```

## Complete Example with Multiple Resources

```javascript
const vAutoScroll = {
  mounted(el, binding) {
    const state = {
      intervalId: null,
      resizeObserver: null,
      scrollHandler: null
    }

    // Set up polling
    state.intervalId = setInterval(() => {
      el.scrollTop = el.scrollHeight
    }, binding.value?.interval || 100)

    // Set up resize observer
    state.resizeObserver = new ResizeObserver(() => {
      el.scrollTop = el.scrollHeight
    })
    state.resizeObserver.observe(el)

    // Set up scroll listener
    state.scrollHandler = () => {
      // Track user scroll
    }
    el.addEventListener('scroll', state.scrollHandler)

    // Store all state for cleanup
    el._autoScrollState = state
  },

  unmounted(el) {
    const state = el._autoScrollState
    if (!state) return

    // Clean up everything
    if (state.intervalId) {
      clearInterval(state.intervalId)
    }
    if (state.resizeObserver) {
      state.resizeObserver.disconnect()
    }
    if (state.scrollHandler) {
      el.removeEventListener('scroll', state.scrollHandler)
    }

    delete el._autoScrollState
  }
}
```

## Testing Directive Cleanup

```javascript
// Test that cleanup works properly
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

const vTrackInterval = {
  mounted(el) {
    el._interval = setInterval(() => {}, 100)
    window.__activeIntervals = (window.__activeIntervals || 0) + 1
  },
  unmounted(el) {
    clearInterval(el._interval)
    window.__activeIntervals--
  }
}

test('directive cleans up interval on unmount', async () => {
  const show = ref(true)
  const wrapper = mount({
    template: `<div v-if="show" v-track-interval></div>`,
    directives: { 'track-interval': vTrackInterval },
    setup: () => ({ show })
  })

  expect(window.__activeIntervals).toBe(1)

  show.value = false
  await nextTick()

  expect(window.__activeIntervals).toBe(0)
})
```

## Reference
- [Vue.js Custom Directives - Directive Hooks](https://vuejs.org/guide/reusability/custom-directives#directive-hooks)
- [Vue School - The Directive's unmounted Hook](https://vueschool.io/lessons/vue-3-the-directive-s-unmounted-hook)
