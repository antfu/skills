---
title: Use shallowRef Pattern for External State Libraries
impact: MEDIUM
impactDescription: External state systems (Immer, XState, Redux) should use shallowRef to avoid double-wrapping in proxies
type: efficiency
tags: [vue3, reactivity, shallowRef, external-state, immer, xstate, integration]
---

# Use shallowRef Pattern for External State Libraries

**Impact: MEDIUM** - When integrating Vue with external state management libraries (Immer, XState, Redux, MobX), use `shallowRef()` to hold the external state. This prevents Vue from deep-wrapping the external state in proxies, which can cause conflicts and performance issues.

The pattern: hold external state in a `shallowRef`, and replace `.value` entirely when the external system updates. This gives Vue reactivity while letting the external library manage state internals.

## Task Checklist

- [ ] Use `shallowRef()` to hold external library state
- [ ] Replace `.value` entirely when external state changes (don't mutate)
- [ ] Integrate update functions that produce new state objects
- [ ] Consider this pattern for immutable data structures

**Integrating with Immer:**
```javascript
import { produce } from 'immer'
import { shallowRef } from 'vue'

export function useImmer(baseState) {
  const state = shallowRef(baseState)

  function update(updater) {
    // Immer produces a new immutable state
    // Replace shallowRef value entirely to trigger reactivity
    state.value = produce(state.value, updater)
  }

  return [state, update]
}

// Usage
const [todos, updateTodos] = useImmer([
  { id: 1, text: 'Learn Vue', done: false }
])

// Update with Immer's mutable API (produces immutable result)
updateTodos(draft => {
  draft[0].done = true
  draft.push({ id: 2, text: 'Use Immer', done: false })
})
```

**Integrating with XState:**
```javascript
import { createMachine, interpret } from 'xstate'
import { shallowRef, onUnmounted } from 'vue'

export function useMachine(options) {
  const machine = createMachine(options)
  const state = shallowRef(machine.initialState)

  const service = interpret(machine)
    .onTransition((newState) => {
      // Replace state entirely on each transition
      state.value = newState
    })
    .start()

  const send = (event) => service.send(event)

  onUnmounted(() => service.stop())

  return { state, send }
}

// Usage
const { state, send } = useMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active: { on: { TOGGLE: 'inactive' } }
  }
})

// In template: state.value.matches('active')
send('TOGGLE')
```

**Integrating with Redux-style stores:**
```javascript
import { shallowRef, readonly } from 'vue'

export function createStore(reducer, initialState) {
  const state = shallowRef(initialState)

  function dispatch(action) {
    state.value = reducer(state.value, action)
  }

  function getState() {
    return state.value
  }

  return {
    state: readonly(state),  // Prevent direct mutations
    dispatch,
    getState
  }
}

// Usage
const store = createStore(
  (state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + 1 }
      default:
        return state
    }
  },
  { count: 0 }
)

store.dispatch({ type: 'INCREMENT' })
console.log(store.state.value.count) // 1
```

**Why NOT use ref() for external state:**
```javascript
import { ref } from 'vue'
import { produce } from 'immer'

// WRONG: ref() deep-wraps the state
const state = ref({ nested: { value: 1 } })

// This creates double-proxying:
// 1. Vue wraps state in Proxy
// 2. External library may also wrap/expect raw objects
// 3. Causes identity issues and potential conflicts

// WRONG: Mutating ref with Immer
state.value = produce(state.value, draft => {
  draft.nested.value = 2
})
// Vue's deep proxy on state.value may interfere with Immer's proxies
```

**Correct pattern with shallowRef:**
```javascript
import { shallowRef } from 'vue'

// CORRECT: shallowRef only tracks .value replacement
const state = shallowRef({ nested: { value: 1 } })

// External library works with raw objects inside
state.value = produce(state.value, draft => {
  draft.nested.value = 2
})
// Clean separation: Vue tracks outer ref, library manages inner state
```

## Reference
- [Vue.js Reactivity in Depth - Integration with External State](https://vuejs.org/guide/extras/reactivity-in-depth.html#integration-with-external-state-systems)
- [Vue.js shallowRef API](https://vuejs.org/api/reactivity-advanced.html#shallowref)
- [Immer Documentation](https://immerjs.github.io/immer/)
- [XState Documentation](https://xstate.js.org/)
