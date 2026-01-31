---
title: Prefer Props and Emit Over Component Refs
impact: MEDIUM
impactDescription: Component refs create tight coupling and break component abstraction
type: best-practice
tags: [vue3, component-refs, props, emit, component-design, architecture]
---

# Prefer Props and Emit Over Component Refs

**Impact: MEDIUM** - Using template refs to access child component internals creates tight coupling between parent and child. This makes components harder to maintain, refactor, and reuse. Props and emit provide a cleaner contract-based API that preserves component encapsulation.

Component refs should be reserved for imperative actions (focus, scroll, animations) that can't be expressed declaratively.

## Task Checklist

- [ ] Use props for passing data down to children
- [ ] Use emit for communicating events up to parents
- [ ] Only use component refs for imperative DOM operations
- [ ] If using refs, expose a minimal, documented API via defineExpose
- [ ] Consider if the interaction can be expressed declaratively

**Incorrect:**
```vue
<!-- ParentComponent.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import UserForm from './UserForm.vue'

const formRef = ref(null)

// WRONG: Reaching into child's internals
function submitForm() {
  // Tight coupling - parent knows child's internal structure
  if (formRef.value.isValid) {
    const data = formRef.value.formData
    formRef.value.setSubmitting(true)
    api.submit(data).then(() => {
      formRef.value.setSubmitting(false)
      formRef.value.reset()
    })
  }
}

// WRONG: Parent managing child's state
function prefillForm(userData) {
  formRef.value.formData.name = userData.name
  formRef.value.formData.email = userData.email
}
</script>

<template>
  <UserForm ref="formRef" />
  <button @click="submitForm">Submit</button>
</template>
```

```vue
<!-- UserForm.vue - exposing too much -->
<script setup>
import { ref, reactive } from 'vue'

const formData = reactive({ name: '', email: '' })
const isValid = ref(false)
const isSubmitting = ref(false)

function setSubmitting(value) {
  isSubmitting.value = value
}

function reset() {
  formData.name = ''
  formData.email = ''
}

// WRONG: Exposing internal state details
defineExpose({
  formData,
  isValid,
  isSubmitting,
  setSubmitting,
  reset
})
</script>
```

**Correct:**
```vue
<!-- ParentComponent.vue -->
<script setup>
import { ref } from 'vue'
import UserForm from './UserForm.vue'

const initialData = ref({ name: '', email: '' })
const isSubmitting = ref(false)

// CORRECT: Child communicates via events
function handleSubmit(formData) {
  isSubmitting.value = true
  api.submit(formData).finally(() => {
    isSubmitting.value = false
  })
}

function handleValidChange(isValid) {
  console.log('Form validity:', isValid)
}
</script>

<template>
  <!-- CORRECT: Props down, events up -->
  <UserForm
    :initial-data="initialData"
    :submitting="isSubmitting"
    @submit="handleSubmit"
    @valid-change="handleValidChange"
  />
</template>
```

```vue
<!-- UserForm.vue - clean props/emit interface -->
<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'valid-change'])

const formData = reactive({ ...props.initialData })

const isValid = computed(() => {
  return formData.name.length > 0 && formData.email.includes('@')
})

watch(isValid, (valid) => {
  emit('valid-change', valid)
})

function handleSubmit() {
  if (isValid.value) {
    emit('submit', { ...formData })
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.name" :disabled="submitting" />
    <input v-model="formData.email" :disabled="submitting" />
    <button type="submit" :disabled="!isValid || submitting">
      {{ submitting ? 'Submitting...' : 'Submit' }}
    </button>
  </form>
</template>
```

## When Component Refs ARE Appropriate

```vue
<!-- CORRECT: Refs for imperative DOM operations -->
<script setup>
import { ref } from 'vue'
import CustomInput from './CustomInput.vue'

const inputRef = ref(null)

// Imperative focus action - good use of refs
function focusInput() {
  inputRef.value?.focus()
}
</script>

<template>
  <CustomInput ref="inputRef" v-model="text" />
  <button @click="focusInput">Focus Input</button>
</template>
```

```vue
<!-- CustomInput.vue - minimal imperative API -->
<script setup>
import { ref } from 'vue'

const inputEl = ref(null)

// Only expose imperative methods
defineExpose({
  focus: () => inputEl.value?.focus(),
  blur: () => inputEl.value?.blur(),
  select: () => inputEl.value?.select()
})
</script>

<template>
  <input ref="inputEl" v-bind="$attrs" />
</template>
```

## Summary

| Use Case | Approach |
|----------|----------|
| Pass data to child | Props |
| Child notifies parent | Emit events |
| Two-way binding | v-model (props + emit) |
| Focus, scroll, animate | Component ref with minimal expose |
| Access child internal state | Refactor to use props/emit |

## Reference
- [Vue.js Component Basics - Props](https://vuejs.org/guide/components/props.html)
- [Vue.js Component Events](https://vuejs.org/guide/components/events.html)
- [Vue.js Template Refs - Ref on Component](https://vuejs.org/guide/essentials/template-refs.html#ref-on-component)
