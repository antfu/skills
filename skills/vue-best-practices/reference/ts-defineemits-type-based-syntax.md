---
title: Use Type-Based defineEmits for Better TypeScript Support
impact: MEDIUM
impactDescription: Type-based emit declarations provide fine-grained type checking for event payloads
type: best-practice
tags: [vue3, typescript, emits, defineEmits, composition-api, vue3.3]
---

# Use Type-Based defineEmits for Better TypeScript Support

**Impact: MEDIUM** - Vue 3.3+ introduced a more concise type-based syntax for `defineEmits` using call signatures. This provides better TypeScript integration with fine-grained control over event payloads.

## Task Checklist

- [ ] Use the call signature syntax for defineEmits (Vue 3.3+)
- [ ] Define all event names and their payload types
- [ ] Use labeled tuple elements for clearer API documentation
- [ ] Do NOT mix runtime and type-based declarations

## Vue 3.3+ Syntax (Recommended)

```vue
<script setup lang="ts">
// Most concise and type-safe approach
const emit = defineEmits<{
  change: [id: number]
  update: [value: string]
  submit: [data: FormData, validated: boolean]
  close: []  // No payload
}>()

// Usage - fully typed
emit('change', 42)           // OK
emit('update', 'new value')  // OK
emit('submit', formData, true) // OK
emit('close')                // OK

emit('change', 'string')     // Error: number expected
emit('update')               // Error: missing argument
emit('unknown')              // Error: not a declared event
</script>
```

## Pre-Vue 3.3 Syntax

Before Vue 3.3, the function signature syntax was used:

```vue
<script setup lang="ts">
// Older syntax - still works but more verbose
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
  (e: 'close'): void
}>()
</script>
```

## Runtime Declaration (Not Recommended for TypeScript)

```vue
<script setup lang="ts">
// Runtime declaration - less type-safe
const emit = defineEmits(['change', 'update', 'close'])

// emit('change', anyValue) - No type checking on payload!
// emit('typo')             - No error for unknown events
</script>
```

## Cannot Mix Declaration Styles

```typescript
// WRONG: Cannot combine runtime and type-based
const emit = defineEmits<{ change: [id: number] }>(['change'])  // Error!

// CORRECT: Choose one approach
const emit = defineEmits<{ change: [id: number] }>()  // Type-based
// OR
const emit = defineEmits(['change'])  // Runtime only
```

## Complex Payload Types

```vue
<script setup lang="ts">
interface User {
  id: string
  name: string
  email: string
}

interface FormState {
  isValid: boolean
  errors: string[]
}

const emit = defineEmits<{
  // Single complex object
  'user-selected': [user: User]

  // Multiple arguments
  'form-validated': [state: FormState, data: Record<string, unknown>]

  // Optional payload (use array with optional element)
  'modal-closed': [reason?: string]

  // Union types
  'status-changed': [status: 'pending' | 'active' | 'completed']
}>()

// Usage
emit('user-selected', { id: '1', name: 'John', email: 'john@example.com' })
emit('form-validated', formState, formData)
emit('modal-closed')          // OK - reason is optional
emit('modal-closed', 'cancel') // Also OK
emit('status-changed', 'active')
</script>
```

## Event Naming Conventions

```vue
<script setup lang="ts">
const emit = defineEmits<{
  // Use kebab-case for event names (consistent with HTML events)
  'item-selected': [item: Item]
  'page-changed': [page: number]

  // Common patterns
  'update:modelValue': [value: string]  // For v-model
  'update:visible': [visible: boolean]  // For named v-model
}>()
</script>

<template>
  <!-- Events in templates use kebab-case -->
  <ChildComponent
    @item-selected="handleItemSelected"
    @page-changed="handlePageChange"
  />
</template>
```

## Extracting Emit Types for Reuse

```typescript
// types/events.ts
export interface ListEvents<T> {
  'item-selected': [item: T]
  'item-deleted': [item: T, index: number]
  'selection-changed': [items: T[]]
}
```

```vue
<script setup lang="ts" generic="T">
import type { ListEvents } from '@/types/events'

const emit = defineEmits<ListEvents<T>>()
</script>
```

## Combining with Props for Full Component Type

```vue
<script setup lang="ts">
interface Props {
  modelValue: string
  items: string[]
}

interface Emits {
  'update:modelValue': [value: string]
  'item-added': [item: string]
  'item-removed': [item: string, index: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function addItem(item: string) {
  emit('item-added', item)
  emit('update:modelValue', props.modelValue + item)
}
</script>
```

## Reference
- [Vue.js TypeScript with Composition API - Emits](https://vuejs.org/guide/typescript/composition-api.html#typing-component-emits)
- [Vue.js Component Events](https://vuejs.org/guide/components/events.html)
