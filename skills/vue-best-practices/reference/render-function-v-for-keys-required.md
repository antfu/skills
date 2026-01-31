---
title: Always Include key Props When Rendering Lists in Render Functions
impact: HIGH
impactDescription: Missing keys cause inefficient re-renders and state bugs in dynamic lists
type: best-practice
tags: [vue3, render-function, v-for, performance, key]
---

# Always Include key Props When Rendering Lists in Render Functions

**Impact: HIGH** - Omitting `key` props when rendering lists with `h()` or JSX causes Vue to use an inefficient "in-place patch" strategy, leading to performance issues and state bugs when list items have internal state or are reordered.

When rendering lists in render functions using `.map()`, always include a unique `key` prop on each item. This is the render function equivalent of using `:key` with `v-for` in templates.

## Task Checklist

- [ ] Always provide a `key` prop when mapping over arrays in render functions
- [ ] Use unique, stable identifiers (like `id`) for keys, not array indices
- [ ] Ensure keys are primitive values (strings or numbers)
- [ ] Never use the same key for different items in the same list

**Incorrect:**
```javascript
import { h } from 'vue'

export default {
  setup() {
    const items = ref([
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Banana' }
    ])

    return () => h('ul',
      // WRONG: No keys - causes inefficient patching
      items.value.map(item =>
        h('li', item.name)
      )
    )
  }
}
```

```jsx
// WRONG: Using array index as key when list can be reordered
export default {
  setup() {
    const todos = ref([...])

    return () => (
      <ul>
        {todos.value.map((todo, index) => (
          <TodoItem
            key={index}  // Bad: index changes when list reorders
            todo={todo}
          />
        ))}
      </ul>
    )
  }
}
```

**Correct:**
```javascript
import { h } from 'vue'

export default {
  setup() {
    const items = ref([
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Banana' }
    ])

    return () => h('ul',
      // CORRECT: Unique id as key
      items.value.map(item =>
        h('li', { key: item.id }, item.name)
      )
    )
  }
}
```

```jsx
// CORRECT: Using stable unique identifier as key
export default {
  setup() {
    const todos = ref([
      { id: 'a1', text: 'Learn Vue' },
      { id: 'b2', text: 'Build app' }
    ])

    return () => (
      <ul>
        {todos.value.map(todo => (
          <TodoItem
            key={todo.id}  // Good: stable unique identifier
            todo={todo}
          />
        ))}
      </ul>
    )
  }
}
```

```javascript
import { h } from 'vue'

export default {
  setup() {
    const users = ref([])

    return () => h('div', [
      h('h2', 'User List'),
      h('ul',
        users.value.map(user =>
          h('li', { key: user.email }, [  // email is unique
            h('span', user.name),
            h('span', ` (${user.email})`)
          ])
        )
      )
    ])
  }
}
```

## When Index Keys Are Acceptable

Using array indices as keys is acceptable ONLY when:
1. The list is static and will never be reordered
2. Items will never be inserted or removed from the middle
3. Items have no internal component state

```javascript
// Index is OK here: static list that never changes
const staticLabels = ['Name', 'Email', 'Phone']

return () => h('tr',
  staticLabels.map((label, index) =>
    h('th', { key: index }, label)
  )
)
```

## Why Keys Matter

Without keys, Vue uses an "in-place patch" strategy:
1. It reuses DOM elements in place
2. Updates element content to match new data
3. This breaks when components have internal state or transitions

With proper keys:
1. Vue tracks each item's identity
2. Elements are moved, created, or destroyed correctly
3. Component state is preserved during reorders

## Reference
- [Vue.js Render Functions - v-for](https://vuejs.org/guide/extras/render-function.html#v-for)
