---
title: Use kebab-case for Event Listeners in Templates
impact: LOW
impactDescription: Vue auto-converts camelCase emits to kebab-case listeners but consistency improves readability
type: best-practice
tags: [vue3, events, emit, naming-convention, templates]
---

# Use kebab-case for Event Listeners in Templates

**Impact: LOW** - Vue automatically converts event names between camelCase and kebab-case. You can emit in camelCase (`emit('someEvent')`) and listen with kebab-case (`@some-event`). However, following consistent conventions improves code readability and matches HTML attribute conventions.

## Task Checklist

- [ ] Emit events using camelCase in JavaScript: `emit('updateValue')`
- [ ] Listen to events using kebab-case in templates: `@update-value`
- [ ] Be consistent across your codebase
- [ ] Understand Vue's automatic case conversion

## The Convention

**Recommended pattern:**
```vue
<!-- ChildComponent.vue -->
<script setup>
const emit = defineEmits(['updateValue', 'itemSelected', 'formSubmit'])

function handleChange(value) {
  // Emit in camelCase (JavaScript convention)
  emit('updateValue', value)
}

function selectItem(item) {
  emit('itemSelected', item)
}
</script>
```

```vue
<!-- ParentComponent.vue -->
<template>
  <!-- Listen in kebab-case (HTML attribute convention) -->
  <ChildComponent
    @update-value="handleUpdate"
    @item-selected="handleSelect"
    @form-submit="handleSubmit"
  />
</template>
```

## Vue's Automatic Conversion

Vue handles these automatically **in template syntax only**:

| Emitted (camelCase) | Listener (kebab-case) | Works? |
|---------------------|----------------------|--------|
| `emit('updateValue')` | `@update-value` | Yes |
| `emit('itemSelected')` | `@item-selected` | Yes |
| `emit('formSubmit')` | `@form-submit` | Yes |

```vue
<!-- All of these work equivalently in Vue 3 templates -->
<Child @updateValue="handler" />  <!-- camelCase listener -->
<Child @update-value="handler" /> <!-- kebab-case listener (preferred) -->
```

### Important: Template-Only Behavior

This auto-conversion **only works in template syntax** (`@event-name`). It does **NOT** work in render functions or programmatic event listeners:

```ts
// In render functions, use camelCase with 'on' prefix
import { h } from 'vue'

// CORRECT - camelCase event name with 'on' prefix
h(ChildComponent, {
  onUpdateValue: (value) => handleUpdate(value),
  onItemSelected: (item) => handleSelect(item)
})

// WRONG - kebab-case does NOT work in render functions
h(ChildComponent, {
  'onUpdate-value': (value) => handleUpdate(value),  // Won't work!
  'on-update-value': (value) => handleUpdate(value)  // Won't work!
})
```

```ts
// Programmatic listeners also require camelCase
import { ref, onMounted } from 'vue'

const childRef = ref<ComponentPublicInstance | null>(null)

onMounted(() => {
  // CORRECT - camelCase
  childRef.value?.$on?.('updateValue', handler)

  // WRONG - kebab-case won't match
  childRef.value?.$on?.('update-value', handler)  // Won't work!
})
```

**Summary:**
- **Templates**: Auto-conversion works (`@update-value` matches `emit('updateValue')`)
- **Render functions**: Must use `onEventName` format (camelCase with `on` prefix)
- **Programmatic listeners**: Must use the exact emitted event name (typically camelCase)

## Why kebab-case in Templates?

1. **HTML convention**: HTML attributes are case-insensitive and traditionally kebab-case
2. **Consistency with props**: Props follow the same pattern (`props.userName` -> `user-name="..."`)
3. **Readability**: `@user-profile-updated` is easier to read than `@userProfileUpdated`
4. **Vue style guide**: Vue's official style guide recommends this pattern

## TypeScript Declarations

When using TypeScript, define emits in camelCase:

```vue
<script setup lang="ts">
const emit = defineEmits<{
  updateValue: [value: string]         // camelCase
  itemSelected: [item: Item]           // camelCase
  'update:modelValue': [value: string] // Special v-model syntax (with colon)
}>()
</script>
```

## v-model Events

For v-model, the `update:` prefix uses a colon, not kebab-case:

```vue
<script setup>
// Correct: colon separator for v-model updates
const emit = defineEmits(['update:modelValue', 'update:firstName'])

function updateValue(newValue) {
  emit('update:modelValue', newValue)
}
</script>
```

```vue
<!-- Parent - v-model handles the event automatically -->
<CustomInput v-model="value" />
<CustomInput v-model:first-name="firstName" />
```

## Vue 2 Difference

In Vue 2, event names did NOT have automatic case conversion. This caused issues:

```js
// Vue 2 - camelCase events couldn't be listened to in templates
this.$emit('updateValue') // Emitted as 'updateValue'

// Template converts to lowercase
<child @updatevalue="handler">  // Listened as 'updatevalue' - NO MATCH!
```

Vue 3 fixed this with automatic camelCase-to-kebab-case conversion.

## Reference
- [Vue.js Component Events](https://vuejs.org/guide/components/events.html)
- [Vue.js Style Guide - Event Names](https://vuejs.org/style-guide/)
