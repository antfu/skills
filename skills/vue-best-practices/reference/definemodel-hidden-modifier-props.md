---
title: defineModel Creates Hidden Modifier Props - Avoid Naming Conflicts
impact: MEDIUM
impactDescription: defineModel automatically adds hidden *Modifiers props that can conflict with your prop names
type: gotcha
tags: [vue3, v-model, defineModel, modifiers, props, naming]
---

# defineModel Creates Hidden Modifier Props - Avoid Naming Conflicts

**Impact: MEDIUM** - When using `defineModel()`, Vue automatically creates hidden props with the suffix `Modifiers` for each model. For example, a model named `title` will create both a `title` prop AND a hidden `titleModifiers` prop. This can cause unexpected conflicts if you have other props ending in "Modifiers".

## Task Checklist

- [ ] Don't create props that end with "Modifiers" when using defineModel
- [ ] Be aware that each defineModel creates an associated *Modifiers prop
- [ ] When using multiple models, avoid names where one model could conflict with another's modifier prop
- [ ] Document custom modifiers to help consumers understand available options

**Problem - Hidden props created automatically:**
```vue
<script setup>
// This creates TWO props: modelValue and modelValueModifiers
const model = defineModel()

// This creates TWO props: title and titleModifiers
const title = defineModel('title')

// CONFLICT: This prop name collides with the hidden titleModifiers
const props = defineProps({
  titleModifiers: Object  // WRONG: Conflicts with defineModel's hidden prop
})
</script>
```

**Parent using modifiers:**
```vue
<template>
  <!-- Vue passes modifiers via the hidden *Modifiers prop -->
  <MyComponent v-model:title.capitalize.trim="text" />

  <!-- Child receives titleModifiers = { capitalize: true, trim: true } -->
</template>
```

**Correct - Accessing modifiers in child:**
```vue
<script setup>
// Access modifiers via destructuring
const [title, titleModifiers] = defineModel('title', {
  set(value) {
    // Apply modifiers to the value
    if (titleModifiers.capitalize) {
      value = value.charAt(0).toUpperCase() + value.slice(1)
    }
    if (titleModifiers.trim) {
      value = value.trim()
    }
    return value
  }
})
</script>
```

## Multiple Models and Potential Conflicts

```vue
<script setup>
// These are OK - no conflicts
const name = defineModel('name')      // Creates: name, nameModifiers
const age = defineModel('age')        // Creates: age, ageModifiers

// PROBLEM: If you had a model named 'model', it creates:
// - 'model' prop
// - 'modelModifiers' prop
// But 'modelValue' also creates 'modelValueModifiers'!
// The names are similar and can cause confusion

// AVOID: Don't name a model something that would conflict
const model = defineModel('model')  // Creates 'model' and 'modelModifiers'
// This is confusing alongside the default modelValue/modelValueModifiers
</script>
```

**Best Practice - Clear, distinct model names:**
```vue
<script setup>
// Good: Clear, distinct names that won't conflict
const firstName = defineModel('firstName')   // firstNameModifiers
const lastName = defineModel('lastName')     // lastNameModifiers
const email = defineModel('email')           // emailModifiers

// Avoid ambiguous names
// Bad: const value = defineModel('value')  // valueModifiers - too generic
// Bad: const data = defineModel('data')    // dataModifiers - too generic
</script>
```

## Documenting Custom Modifiers

When creating components with custom modifier support, document them clearly:

```vue
<script setup>
/**
 * @prop {string} title - The title text
 * @modifiers
 *   - capitalize: Capitalizes first letter
 *   - uppercase: Converts entire string to uppercase
 *   - trim: Removes leading/trailing whitespace
 */
const [title, modifiers] = defineModel('title', {
  set(value: string) {
    let result = value
    if (modifiers.trim) result = result.trim()
    if (modifiers.capitalize) {
      result = result.charAt(0).toUpperCase() + result.slice(1)
    }
    if (modifiers.uppercase) {
      result = result.toUpperCase()
    }
    return result
  }
})
</script>

<template>
  <input v-model="title" />
</template>
```

## Reference
- [Vue.js Component v-model - Modifiers](https://vuejs.org/guide/components/v-model.html#handling-v-model-modifiers)
- [Vue.js RFC - defineModel](https://github.com/vuejs/rfcs/discussions/503)
