---
title: v-model Breaking Changes from Vue 2 to Vue 3
impact: HIGH
impactDescription: Vue 3 changed v-model prop/event names and removed .sync modifier - migration required
type: migration
tags: [vue3, vue2, v-model, migration, breaking-changes, sync]
---

# v-model Breaking Changes from Vue 2 to Vue 3

**Impact: HIGH** - Vue 3 fundamentally changed how v-model works on custom components. Code using the Vue 2 pattern will silently fail - the component won't receive the prop value and changes won't propagate to the parent.

## Task Checklist

- [ ] Change prop name from `value` to `modelValue`
- [ ] Change event name from `input` to `update:modelValue`
- [ ] Replace `.sync` modifier with `v-model:propName`
- [ ] Remove `model` component option (use defineModel or named v-model)
- [ ] Update any v-bind.sync to v-model with named argument

## Key Breaking Changes

| Feature | Vue 2 | Vue 3 |
|---------|-------|-------|
| Default prop | `value` | `modelValue` |
| Default event | `input` | `update:modelValue` |
| Custom name | `model: { prop, event }` | `v-model:customName` |
| Sync modifier | `v-bind:prop.sync` | `v-model:prop` |
| Multiple models | Not supported | Fully supported |

**Vue 2 Pattern (No longer works in Vue 3):**
```vue
<!-- Vue 2 Child Component -->
<script>
export default {
  props: ['value'],  // WRONG in Vue 3
  methods: {
    update(val) {
      this.$emit('input', val)  // WRONG in Vue 3
    }
  }
}
</script>

<template>
  <input :value="value" @input="update($event.target.value)">
</template>
```

**Vue 3 Pattern (Options API):**
```vue
<!-- Vue 3 Child Component -->
<script>
export default {
  props: ['modelValue'],  // Changed from 'value'
  emits: ['update:modelValue'],  // Declare emits
  methods: {
    update(val) {
      this.$emit('update:modelValue', val)  // Changed from 'input'
    }
  }
}
</script>

<template>
  <input :value="modelValue" @input="update($event.target.value)">
</template>
```

**Vue 3 Pattern (Composition API with defineModel):**
```vue
<!-- Vue 3 Child Component - Recommended -->
<script setup>
const model = defineModel()  // Handles prop and emit automatically
</script>

<template>
  <input v-model="model">
</template>
```

## Migrating the .sync Modifier

Vue 2's `.sync` modifier is removed. Use named v-model instead.

**Vue 2:**
```vue
<!-- Parent -->
<MyComponent :title.sync="pageTitle" />

<!-- Child -->
<script>
export default {
  props: ['title'],
  methods: {
    updateTitle(val) {
      this.$emit('update:title', val)  // .sync pattern
    }
  }
}
</script>
```

**Vue 3:**
```vue
<!-- Parent -->
<MyComponent v-model:title="pageTitle" />

<!-- Child with defineModel -->
<script setup>
const title = defineModel('title')
</script>

<template>
  <input v-model="title">
</template>

<!-- Child with manual props/emits -->
<script setup>
const props = defineProps(['title'])
const emit = defineEmits(['update:title'])
</script>

<template>
  <input
    :value="props.title"
    @input="emit('update:title', $event.target.value)"
  >
</template>
```

## Migrating Custom model Option

Vue 2's `model` component option is removed.

**Vue 2:**
```vue
<script>
export default {
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: ['checked']
}
</script>
```

**Vue 3:**
```vue
<!-- Use named v-model argument instead -->
<!-- Parent -->
<MyCheckbox v-model:checked="isChecked" />

<!-- Child -->
<script setup>
const checked = defineModel('checked')
</script>
```

## Multiple v-model Bindings (New in Vue 3)

Vue 3 allows multiple v-model directives on a single component:

```vue
<!-- Parent -->
<UserForm
  v-model:firstName="first"
  v-model:lastName="last"
  v-model:email="email"
/>

<!-- Child -->
<script setup>
const firstName = defineModel('firstName')
const lastName = defineModel('lastName')
const email = defineModel('email')
</script>

<template>
  <input v-model="firstName" placeholder="First Name">
  <input v-model="lastName" placeholder="Last Name">
  <input v-model="email" type="email" placeholder="Email">
</template>
```

## Reference
- [Vue 3 Migration Guide - v-model](https://v3-migration.vuejs.org/breaking-changes/v-model)
- [Vue.js Component v-model](https://vuejs.org/guide/components/v-model.html)
