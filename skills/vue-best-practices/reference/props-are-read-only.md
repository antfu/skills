---
title: Props Are Read-Only - Never Mutate Props
impact: HIGH
impactDescription: Mutating props breaks one-way data flow and causes unpredictable parent-child state synchronization issues
type: gotcha
tags: [vue3, props, one-way-data-flow, mutation, component-design]
---

# Props Are Read-Only - Never Mutate Props

**Impact: HIGH** - Props in Vue follow one-way data flow: parent to child only. Mutating a prop in a child component violates this contract, triggering Vue warnings and causing hard-to-debug state synchronization issues. The parent component loses control of the data it passed down.

Props are "snapshots" from the parent at render time. Vue's reactivity system tracks props at the parent level - mutating in the child doesn't notify the parent, leading to state inconsistencies.

This is especially dangerous with object/array props because JavaScript passes them by reference, allowing mutation without assignment.

## Task Checklist

- [ ] Never assign new values to props
- [ ] Never mutate object or array prop properties directly
- [ ] Use emit to request parent to make changes
- [ ] Create local copies if you need to modify prop-based data
- [ ] Use computed properties for derived values

## The Problem

**Incorrect - Direct primitive prop mutation:**
```vue
<script setup>
const props = defineProps({
  count: Number
})

// WRONG: Vue will warn about mutating props
function increment() {
  props.count++ // Mutation attempt - this WILL fail
}
</script>
```

**Incorrect - Object/array prop mutation (silent but dangerous):**
```vue
<script setup>
const props = defineProps({
  user: Object,
  items: Array
})

// WRONG: No warning, but breaks data flow!
function updateUser() {
  props.user.name = 'New Name' // Mutates parent's object
}

function addItem() {
  props.items.push({ id: 1 }) // Mutates parent's array
}
</script>
```

This pattern is dangerous because:
1. Parent component doesn't know about the change
2. Data can become out of sync
3. Makes debugging difficult - where did the change come from?
4. Breaks the component contract

## Pattern 1: Emit Events to Parent

Let the parent handle all data changes.

**Correct:**
```vue
<!-- ChildComponent.vue -->
<script setup>
const props = defineProps({
  count: Number,
  user: Object
})

const emit = defineEmits(['update:count', 'update-user'])

function increment() {
  emit('update:count', props.count + 1)
}

function updateName(newName) {
  emit('update-user', { ...props.user, name: newName })
}
</script>
```

```vue
<!-- ParentComponent.vue -->
<template>
  <ChildComponent
    :count="count"
    :user="user"
    @update:count="count = $event"
    @update-user="user = $event"
  />
</template>
```

## Pattern 2: Local Copy for Editable Data (Prop as Initial Value)

When the component needs to work with a modified version of prop data.

**Correct:**
```vue
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialValue: String,
  user: Object
})

// Local copy for editing
const localValue = ref(props.initialValue)

// Deep copy for objects
const localUser = ref({ ...props.user })

// Sync when parent changes the prop
watch(() => props.initialValue, (newVal) => {
  localValue.value = newVal
})

watch(() => props.user, (newUser) => {
  localUser.value = { ...newUser }
}, { deep: true })
</script>

<template>
  <input v-model="localValue" />
  <input v-model="localUser.name" />
</template>
```

## Pattern 3: Computed Properties for Transformations

When you need a derived/transformed version of the prop.

**Correct:**
```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: String,
  items: Array
})

// Derived value - doesn't mutate prop
const uppercaseText = computed(() => props.text.toUpperCase())

// Filtered view - doesn't mutate prop
const activeItems = computed(() =>
  props.items.filter(item => item.active)
)
</script>
```

## Pattern 4: v-model for Two-Way Binding

For form-like components that need two-way binding.

**Correct:**
```vue
<!-- CustomInput.vue -->
<script setup>
const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
```

```vue
<!-- ParentComponent.vue -->
<template>
  <!-- v-model is shorthand for :modelValue + @update:modelValue -->
  <CustomInput v-model="text" />
</template>
```

## Common Mistake: Thinking Object Mutation Is Safe

```vue
<script setup>
const props = defineProps({ config: Object })

// This "works" but is an anti-pattern!
props.config.theme = 'dark' // No Vue warning, but still wrong
</script>
```

Vue doesn't warn because it can't efficiently detect deep mutations. But this still:
- Breaks one-way data flow
- Makes the component unpredictable
- Causes maintenance nightmares

**Always treat props as if they were deeply frozen.**

## Reference
- [Vue.js Props - One-Way Data Flow](https://vuejs.org/guide/components/props.html#one-way-data-flow)
- [Vue.js Props - Mutating Object/Array Props](https://vuejs.org/guide/components/props.html#mutating-object-array-props)
