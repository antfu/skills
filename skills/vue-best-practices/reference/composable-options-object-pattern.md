---
title: Use Options Object Pattern for Composable Parameters
impact: MEDIUM
impactDescription: Long parameter lists are error-prone and unclear; options objects are self-documenting and extensible
type: best-practice
tags: [vue3, composables, composition-api, api-design, typescript, patterns]
---

# Use Options Object Pattern for Composable Parameters

**Impact: MEDIUM** - When a composable accepts multiple parameters (especially optional ones), use an options object instead of positional arguments. This makes the API self-documenting, prevents argument order mistakes, and allows easy extension without breaking changes.

## Task Checklist

- [ ] Use options object when composable has more than 2-3 parameters
- [ ] Always use options object when most parameters are optional
- [ ] Provide sensible defaults via destructuring
- [ ] Type the options object for better IDE support
- [ ] Required parameters can be positional; optional ones in options

**Incorrect:**
```javascript
// WRONG: Many positional parameters - unclear and error-prone
export function useFetch(url, method, headers, timeout, retries, onError) {
  // What was the 4th parameter again?
}

// Usage - which boolean is which?
const { data } = useFetch('/api/users', 'GET', null, 5000, 3, handleError)

// WRONG: Easy to get order wrong
export function useDebounce(value, delay, immediate, maxWait) {
  // ...
}

// Is 500 the delay or maxWait? Is true immediate?
const debounced = useDebounce(searchQuery, 500, true, 1000)
```

**Correct:**
```javascript
// CORRECT: Options object pattern
export function useFetch(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    timeout = 30000,
    retries = 0,
    onError = null,
    immediate = true
  } = options

  // Implementation...
}

// Usage - clear and self-documenting
const { data } = useFetch('/api/users', {
  method: 'POST',
  timeout: 5000,
  retries: 3,
  onError: handleError
})

// CORRECT: With TypeScript for better IDE support
interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  onError?: (error: Error) => void
  immediate?: boolean
}

export function useFetch(url: MaybeRefOrGetter<string>, options: UseFetchOptions = {}) {
  const {
    method = 'GET',
    headers = {},
    timeout = 30000,
    retries = 0,
    onError = null,
    immediate = true
  } = options

  // TypeScript now provides autocomplete for options
}
```

## Pattern: Required + Options

Keep truly required parameters positional, bundle optional ones:

```javascript
// url is always required, options are not
export function useFetch(url, options = {}) {
  // ...
}

// Both key and storage are required for this to make sense
export function useStorage(key, storage, options = {}) {
  const { serializer = JSON, deep = true } = options
  // ...
}

// Usage
useStorage('user-prefs', localStorage, { deep: false })
```

## Pattern: Reactive Options

Options can also be reactive for dynamic behavior:

```javascript
export function useFetch(url, options = {}) {
  const {
    refetch = ref(true),  // Can be a ref!
    interval = null
  } = options

  watchEffect(() => {
    if (toValue(refetch)) {
      // Perform fetch
    }
  })
}

// Usage with reactive option
const shouldFetch = ref(true)
const { data } = useFetch('/api/data', { refetch: shouldFetch })

// Later, disable fetching
shouldFetch.value = false
```

## Pattern: Returning Configuration

Options objects also work well for return values:

```javascript
export function useCounter(options = {}) {
  const { initial = 0, min = -Infinity, max = Infinity, step = 1 } = options

  const count = ref(initial)

  function increment() {
    count.value = Math.min(count.value + step, max)
  }

  function decrement() {
    count.value = Math.max(count.value - step, min)
  }

  function set(value) {
    count.value = Math.min(Math.max(value, min), max)
  }

  return { count, increment, decrement, set }
}

// Clear, readable usage
const { count, increment, decrement } = useCounter({
  initial: 10,
  min: 0,
  max: 100,
  step: 5
})
```

## VueUse Convention

VueUse uses this pattern extensively:

```javascript
import { useDebounceFn, useThrottleFn, useLocalStorage } from '@vueuse/core'

// All use options objects
const debouncedFn = useDebounceFn(fn, 1000, { maxWait: 5000 })

const throttledFn = useThrottleFn(fn, 1000, { trailing: true, leading: false })

const state = useLocalStorage('key', defaultValue, {
  deep: true,
  listenToStorageChanges: true,
  serializer: {
    read: JSON.parse,
    write: JSON.stringify
  }
})
```

## Anti-pattern: Boolean Trap

Options objects prevent the "boolean trap":

```javascript
// BAD: What do these booleans mean?
useModal(true, false, true)

// GOOD: Self-documenting
useModal({
  closable: true,
  backdrop: false,
  keyboard: true
})
```

## Reference
- [Vue.js Composables](https://vuejs.org/guide/reusability/composables.html)
- [VueUse Composables](https://vueuse.org/) - Examples of options pattern
- [Good Practices for Vue Composables](https://dev.to/jacobandrewsky/good-practices-and-design-patterns-for-vue-composables-24lk)
