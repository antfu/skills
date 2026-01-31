---
title: Use Functional Components for Stateless Presentational UI
impact: LOW
impactDescription: Functional components reduce overhead for simple stateless components
type: best-practice
tags: [vue3, render-function, functional-component, performance]
---

# Use Functional Components for Stateless Presentational UI

**Impact: LOW** - Functional components are plain functions that return vnodes without component instance overhead. They're ideal for simple presentational components that don't need internal state, lifecycle hooks, or reactivity.

Functional components in Vue 3 are defined as plain functions that receive `props` and a `context` object (containing `slots`, `emit`, and `attrs`). They have slightly less overhead than stateful components.

## Task Checklist

- [ ] Consider functional components for stateless UI like icons, badges, or simple layouts
- [ ] Define `props` and `emits` as static properties on the function
- [ ] Access slots, emit, and attrs from the context parameter
- [ ] Use `inheritAttrs: false` when manually spreading attrs

**Basic Functional Component:**
```javascript
import { h } from 'vue'

// Simple functional component
function MyButton(props, { slots }) {
  return h('button', { class: 'btn' }, slots.default?.())
}

// With props definition
MyButton.props = ['disabled', 'variant']

export default MyButton
```

**With TypeScript:**
```typescript
import { h } from 'vue'
import type { FunctionalComponent } from 'vue'

interface Props {
  message: string
  type?: 'info' | 'warning' | 'error'
}

const Alert: FunctionalComponent<Props> = (props, { slots }) => {
  return h('div', {
    class: ['alert', `alert-${props.type || 'info'}`]
  }, [
    h('span', props.message),
    slots.default?.()
  ])
}

Alert.props = {
  message: { type: String, required: true },
  type: String
}

export default Alert
```

**With Emits:**
```typescript
import { h } from 'vue'
import type { FunctionalComponent } from 'vue'

interface Props {
  value: string
}

interface Emits {
  (e: 'update', value: string): void
  (e: 'clear'): void
}

const SearchInput: FunctionalComponent<Props, Emits> = (props, { emit }) => {
  return h('div', { class: 'search-input' }, [
    h('input', {
      value: props.value,
      onInput: (e: Event) => emit('update', (e.target as HTMLInputElement).value)
    }),
    h('button', { onClick: () => emit('clear') }, 'Clear')
  ])
}

SearchInput.props = ['value']
SearchInput.emits = ['update', 'clear']

export default SearchInput
```

**Disabling Attribute Inheritance:**
```javascript
import { h } from 'vue'

function CustomInput(props, { attrs }) {
  return h('div', { class: 'input-wrapper' }, [
    h('input', { ...attrs, class: 'custom-input' })
  ])
}

CustomInput.inheritAttrs = false

export default CustomInput
```

## When to Use Functional Components

**Good candidates:**
- Icons and badges
- Simple wrapper/layout components
- Pure presentational components
- Components that just format or display data

```javascript
// Icon component - good use case
function Icon(props) {
  return h('svg', {
    class: `icon icon-${props.name}`,
    width: props.size || 24,
    height: props.size || 24
  }, [
    h('use', { href: `#icon-${props.name}` })
  ])
}
Icon.props = ['name', 'size']

// Badge component - good use case
function Badge(props, { slots }) {
  return h('span', {
    class: ['badge', `badge-${props.variant || 'default'}`]
  }, slots.default?.())
}
Badge.props = ['variant']
```

**Not recommended for:**
- Components needing reactive state (use `ref`, `reactive`)
- Components needing lifecycle hooks
- Components with complex logic
- Components that need to use composables

## Functional vs Stateful Comparison

```javascript
// Functional - no reactivity, no lifecycle
function StaticLabel(props) {
  return h('span', { class: 'label' }, props.text)
}
StaticLabel.props = ['text']

// Stateful - when you need state or lifecycle
export default {
  setup(props) {
    const count = ref(0)

    onMounted(() => {
      console.log('Mounted!')
    })

    return () => h('button', {
      onClick: () => count.value++
    }, count.value)
  }
}
```

## Reference
- [Vue.js Functional Components](https://vuejs.org/guide/extras/render-function.html#functional-components)
