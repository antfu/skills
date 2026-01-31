---
title: Prefer Type-Based defineProps Declaration
impact: MEDIUM
impactDescription: Type-based declaration provides better TypeScript integration and cleaner syntax
type: best-practice
tags: [vue3, typescript, props, defineProps, composition-api]
---

# Prefer Type-Based defineProps Declaration

**Impact: MEDIUM** - Vue 3 supports two ways to declare props with TypeScript: runtime declaration and type-based declaration. Type-based declaration is recommended as it provides more straightforward TypeScript integration and cleaner syntax.

## Task Checklist

- [ ] Use type-based declaration for new TypeScript components
- [ ] Extract props interface for reusability and clarity
- [ ] Use `withDefaults()` for default values (Vue 3.4 and below)
- [ ] Use reactive props destructure for defaults (Vue 3.5+)
- [ ] NEVER mix runtime and type-based declarations

## The Two Declaration Styles

**Runtime Declaration (traditional):**
```vue
<script setup lang="ts">
const props = defineProps({
  foo: { type: String, required: true },
  bar: Number,
  items: { type: Array as PropType<string[]>, default: () => [] }
})
</script>
```

**Type-Based Declaration (recommended):**
```vue
<script setup lang="ts">
interface Props {
  foo: string
  bar?: number
  items?: string[]
}

const props = defineProps<Props>()
</script>
```

## Cannot Mix Both Styles

```typescript
// WRONG: Cannot use both runtime and type-based declaration
const props = defineProps<{ foo: string }>({
  foo: { type: String, required: true }  // Error!
})

// CORRECT: Choose one style
const props = defineProps<{ foo: string }>()  // Type-based only
// OR
const props = defineProps({                    // Runtime only
  foo: { type: String, required: true }
})
```

## Default Values with Type-Based Declaration

Type-based declaration requires `withDefaults()` macro for default values (prior to Vue 3.5):

```vue
<script setup lang="ts">
interface Props {
  msg?: string
  labels?: string[]
  config?: { theme: string }
}

// CRITICAL: Mutable types (arrays, objects) MUST use factory functions
const props = withDefaults(defineProps<Props>(), {
  msg: 'hello',
  labels: () => ['one', 'two'],      // Factory function required!
  config: () => ({ theme: 'light' }) // Factory function required!
})
</script>
```

## Vue 3.5+: Reactive Props Destructure

In Vue 3.5+, use destructuring with default values directly:

```vue
<script setup lang="ts">
interface Props {
  msg?: string
  labels?: string[]
}

// Vue 3.5+ - defaults in destructuring
const { msg = 'hello', labels = ['one', 'two'] } = defineProps<Props>()
</script>
```

## Import Types from External Files

```typescript
// types/user.ts
export interface UserProps {
  id: string
  name: string
  email?: string
}
```

```vue
<script setup lang="ts">
import type { UserProps } from '@/types/user'

// Imported types work with defineProps (Vue 3.3+)
const props = defineProps<UserProps>()
</script>
```

## When to Use Runtime Declaration

Runtime declaration is still useful when you need:

1. **Runtime type validation** with complex validator functions
2. **Prop type coercion** (e.g., Boolean casting behavior)
3. **Dynamic prop definitions** based on runtime conditions

```vue
<script setup lang="ts">
import type { PropType } from 'vue'

// Runtime declaration for complex validation
const props = defineProps({
  status: {
    type: String as PropType<'active' | 'inactive'>,
    required: true,
    validator: (value: string) => ['active', 'inactive'].includes(value)
  }
})
</script>
```

## TypeScript Limitations (Prior to Vue 3.3)

In Vue 3.2 and below, type-based declaration only supported:
- Type literals defined inline
- References to local interfaces

Vue 3.3+ supports:
- Imported types
- Limited complex types
- BUT NOT conditional types for the entire props object

```typescript
// Vue 3.3+ supports this
import type { UserProps } from './types'
defineProps<UserProps>()

// Still NOT supported: conditional types for entire props
type ConditionalProps<T> = T extends string ? { foo: string } : { bar: number }
defineProps<ConditionalProps<SomeType>>()  // Error!

// Conditional types ARE supported for individual props
interface Props {
  value: SomeType extends string ? string : number  // OK
}
```

## Reference
- [Vue.js TypeScript with Composition API - Props](https://vuejs.org/guide/typescript/composition-api.html#typing-component-props)
- [Vue.js SFC Script Setup](https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)
