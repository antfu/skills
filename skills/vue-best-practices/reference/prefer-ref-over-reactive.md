---
title: Prefer ref() Over reactive() for Consistency
impact: MEDIUM
impactDescription: Using ref() as default avoids reactive() gotchas and provides consistent patterns
type: efficiency
tags: [vue3, reactivity, ref, reactive, composition-api, best-practice]
---

# Prefer ref() Over reactive() for Consistency

**Impact: MEDIUM** - The Vue documentation recommends using `ref()` as the primary API for declaring reactive state. This avoids several `reactive()` gotchas and provides a consistent pattern across your codebase.

While both `ref()` and `reactive()` create reactive state, `reactive()` has several limitations: it only works with objects (not primitives), cannot be reassigned, and loses reactivity when destructured. Using `ref()` consistently means one pattern to remember.

## Task Checklist

- [ ] Use `ref()` as the default for all reactive state
- [ ] Only use `reactive()` when you have a specific reason (e.g., group of related state)
- [ ] Be consistent within a codebase - pick one approach and stick with it
- [ ] Remember: `.value` is the price for avoiding `reactive()` gotchas

**Incorrect:**
```javascript
import { reactive } from 'vue'

// reactive() has multiple gotchas:

// 1. Cannot use with primitives
const count = reactive(0)  // Won't work - not reactive

// 2. Cannot reassign the entire object
let state = reactive({ items: [] })
state = reactive({ items: [1, 2, 3] })  // Loses reactivity!

// 3. Destructuring breaks reactivity
const { items } = state  // items is not reactive

// 4. Passing to functions can lose reactivity
someFunction(state.items)  // May lose reactivity depending on usage
```

**Correct:**
```javascript
import { ref } from 'vue'

// ref() works universally:

// 1. Works with primitives
const count = ref(0)
count.value++  // Works!

// 2. Can reassign the entire object
const state = ref({ items: [] })
state.value = { items: [1, 2, 3] }  // Reactivity preserved!

// 3. No destructuring issues (you work with .value)
const items = state.value.items  // If you need just the value

// 4. Passing refs is explicit
someFunction(state)        // Pass the ref
someFunction(state.value)  // Or pass the value explicitly
```

```javascript
// When reactive() makes sense: grouping related state
import { reactive, toRefs } from 'vue'

// Acceptable use case: form state with many related fields
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// But always use toRefs() if you need to destructure
const { username, email } = toRefs(form)
```

## Reference
- [Vue.js Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Vue.js Composition API FAQ](https://vuejs.org/guide/extras/composition-api-faq.html)
