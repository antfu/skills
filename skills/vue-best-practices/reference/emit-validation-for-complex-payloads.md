---
title: Use Event Validation for Complex Payloads
impact: LOW
impactDescription: Event validation catches payload errors early with console warnings during development
type: best-practice
tags: [vue3, emits, defineEmits, validation, debugging]
---

# Use Event Validation for Complex Payloads

**Impact: LOW** - Vue allows you to validate event payloads using object syntax for `defineEmits`. When a validation function returns `false`, Vue logs a console warning. This helps catch bugs early during development, especially for events with complex payload requirements.

## Task Checklist

- [ ] Use object syntax for `defineEmits` when validation is needed
- [ ] Return `true` for valid payloads, `false` for invalid
- [ ] Add meaningful console warnings in validators
- [ ] Consider TypeScript for compile-time validation instead

## Basic Validation

**Using object syntax with validators:**
```vue
<script setup>
const emit = defineEmits({
  // No validation - just declaration
  cancel: null,

  // Validate that email is present
  submit: (payload) => {
    if (!payload || !payload.email) {
      console.warn('Submit event requires an email field')
      return false
    }
    if (!payload.email.includes('@')) {
      console.warn('Submit event requires a valid email')
      return false
    }
    return true
  },

  // Validate ID is a number
  select: (id) => {
    if (typeof id !== 'number') {
      console.warn('Select event requires a numeric ID')
      return false
    }
    return true
  }
})

function handleSubmit(formData) {
  // If validation fails, Vue logs warning but event still emits
  emit('submit', formData)
}
</script>
```

## What Happens on Validation Failure

```vue
<script setup>
const emit = defineEmits({
  submit: (data) => {
    if (!data?.email) {
      return false  // Validation fails
    }
    return true
  }
})

function badSubmit() {
  emit('submit', {})  // Missing email
  // Console: [Vue warn]: Invalid event arguments: event validation failed for event "submit"
  // Event STILL fires - validation is advisory only
}
</script>
```

**Important:** Validation failure only logs a warning. The event still emits. This is intentional for development debugging, not runtime enforcement.

## Common Validation Patterns

### Required Fields
```vue
const emit = defineEmits({
  'user-created': (user) => {
    const required = ['id', 'name', 'email']
    const missing = required.filter(field => !user?.[field])
    if (missing.length) {
      console.warn(`user-created missing fields: ${missing.join(', ')}`)
      return false
    }
    return true
  }
})
```

### Type Checking
```vue
const emit = defineEmits({
  'page-change': (page) => typeof page === 'number' && page > 0,

  'items-selected': (items) => Array.isArray(items),

  'filter-applied': (filter) => {
    return filter && typeof filter.field === 'string' && filter.value !== undefined
  }
})
```

### Range Validation
```vue
const emit = defineEmits({
  'rating-change': (rating) => {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      console.warn('Rating must be a number between 1 and 5')
      return false
    }
    return true
  }
})
```

## TypeScript Alternative

For compile-time validation, prefer TypeScript types over runtime validators:

```vue
<script setup lang="ts">
interface SubmitPayload {
  email: string
  password: string
  rememberMe?: boolean
}

const emit = defineEmits<{
  submit: [payload: SubmitPayload]
  cancel: []
  'page-change': [page: number]
}>()

// TypeScript catches errors at compile time
emit('submit', { email: 'test@test.com' })
// Error: Property 'password' is missing
</script>
```

TypeScript validation is:
- Caught at compile time, not runtime
- Provides IDE autocompletion
- Zero runtime overhead

## When to Use Runtime Validation

Use object syntax validation when:
- You're not using TypeScript
- You need to validate values that can't be expressed in types (ranges, formats)
- You want runtime debugging help during development
- You're building a component library and want helpful dev warnings

## Combining Both Approaches

```vue
<script setup lang="ts">
interface FormData {
  email: string
  age: number
}

// TypeScript handles type structure
// Runtime validator handles value constraints
const emit = defineEmits({
  submit: (data: FormData) => {
    if (data.age < 0 || data.age > 150) {
      console.warn('Age must be between 0 and 150')
      return false
    }
    if (!data.email.includes('@')) {
      console.warn('Invalid email format')
      return false
    }
    return true
  }
})
</script>
```

## Reference
- [Vue.js Component Events - Events Validation](https://vuejs.org/guide/components/events.html#events-validation)
