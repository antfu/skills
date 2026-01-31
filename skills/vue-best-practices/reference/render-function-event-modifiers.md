---
title: Use withModifiers for Event Modifiers in Render Functions
impact: MEDIUM
impactDescription: Manual modifier implementation is error-prone; use withModifiers helper
type: best-practice
tags: [vue3, render-function, events, modifiers]
---

# Use withModifiers for Event Modifiers in Render Functions

**Impact: MEDIUM** - When using render functions, event modifiers like `.stop`, `.prevent`, or `.self` require special handling. Use Vue's `withModifiers` helper function instead of manually implementing modifier logic, which is error-prone.

In templates, you can use modifiers like `@click.stop.prevent`. In render functions, you must either use camelCase concatenation for simple modifiers or the `withModifiers` helper for more complex ones.

## Task Checklist

- [ ] Use camelCase concatenation for capture, once, and passive modifiers
- [ ] Use `withModifiers()` helper for stop, prevent, self, and key modifiers
- [ ] Import `withModifiers` from 'vue' when needed
- [ ] Combine multiple modifiers by passing them as an array

**Incorrect:**
```javascript
import { h } from 'vue'

export default {
  setup() {
    const handleClick = (e) => {
      // WRONG: Manual modifier implementation is error-prone
      e.stopPropagation()
      e.preventDefault()
      // ... actual handler logic
    }

    return () => h('button', { onClick: handleClick }, 'Click')
  }
}
```

```javascript
// WRONG: Forgetting to handle modifier in complex scenarios
const handleDivClick = (e) => {
  // Intended: only trigger when clicking div itself, not children
  // This manual check is easy to get wrong
  if (e.target !== e.currentTarget) return
  // ...
}
```

**Correct:**
```javascript
import { h, withModifiers } from 'vue'

export default {
  setup() {
    const handleClick = () => {
      console.log('clicked!')
    }

    return () => h('button',
      {
        // CORRECT: Use withModifiers for stop and prevent
        onClick: withModifiers(handleClick, ['stop', 'prevent'])
      },
      'Click'
    )
  }
}
```

## CamelCase Modifiers (No Helper Needed)

For `capture`, `once`, and `passive` modifiers, use camelCase concatenation:

```javascript
import { h } from 'vue'

export default {
  setup() {
    const handler = () => console.log('event!')

    return () => h('div', {
      // @click.capture -> onClickCapture
      onClickCapture: handler,

      // @keyup.once -> onKeyupOnce
      onKeyupOnce: handler,

      // @scroll.passive -> onScrollPassive
      onScrollPassive: handler,

      // @mouseover.once.capture -> onMouseoverOnceCapture
      onMouseoverOnceCapture: handler
    })
  }
}
```

## withModifiers Examples

```javascript
import { h, withModifiers } from 'vue'

export default {
  setup() {
    const handleClick = () => console.log('clicked')
    const handleSubmit = () => console.log('submitted')

    return () => h('div', [
      // .stop modifier
      h('button', {
        onClick: withModifiers(handleClick, ['stop'])
      }, 'Stop Propagation'),

      // .prevent modifier
      h('form', {
        onSubmit: withModifiers(handleSubmit, ['prevent'])
      }, [
        h('button', { type: 'submit' }, 'Submit')
      ]),

      // .self modifier - only trigger if event.target is the element itself
      h('div', {
        onClick: withModifiers(handleClick, ['self']),
        style: { padding: '20px', background: '#eee' }
      }, [
        h('button', 'Click me (won\'t trigger parent)')
      ]),

      // Multiple modifiers
      h('a', {
        href: '/path',
        onClick: withModifiers(handleClick, ['stop', 'prevent'])
      }, 'Link')
    ])
  }
}
```

## Key Modifiers

For keyboard events, use `withKeys` for key modifiers:

```javascript
import { h, withKeys } from 'vue'

export default {
  setup() {
    const handleEnter = () => console.log('Enter pressed')
    const handleEscape = () => console.log('Escape pressed')

    return () => h('input', {
      // @keyup.enter
      onKeyup: withKeys(handleEnter, ['enter']),

      // Multiple keys
      onKeydown: withKeys(handleEscape, ['escape', 'esc'])
    })
  }
}
```

## JSX Equivalent

```jsx
import { withModifiers, withKeys } from 'vue'

export default {
  setup() {
    const handleClick = () => console.log('clicked')

    return () => (
      <div>
        <button onClick={withModifiers(handleClick, ['stop'])}>
          Stop
        </button>

        <div onClick={withModifiers(handleClick, ['self'])}>
          <span>Child content</span>
        </div>

        <input onKeyup={withKeys(() => {}, ['enter'])} />
      </div>
    )
  }
}
```

## Reference
- [Vue.js Render Functions - Event Modifiers](https://vuejs.org/guide/extras/render-function.html#event-modifiers)
