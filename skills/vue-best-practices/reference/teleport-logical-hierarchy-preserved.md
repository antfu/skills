---
title: Teleport Preserves Logical Component Hierarchy
impact: LOW
impactDescription: Understanding that Teleport only changes DOM structure, not Vue's component tree
type: best-practice
tags: [vue3, teleport, component-hierarchy, props, events]
---

# Teleport Preserves Logical Component Hierarchy

**Impact: LOW** - A common misconception is that Teleport breaks the Vue component relationship. In reality, `<Teleport>` only alters the rendered DOM structure, not the logical hierarchy. Props, events, provide/inject, and Vue Devtools all work as if the component wasn't teleported.

## Task Checklist

- [ ] Continue using props and events normally with teleported components
- [ ] Use provide/inject across teleported boundaries
- [ ] Check Vue Devtools for component location (shows logical parent, not DOM location)

**Key Concept:**
```vue
<!-- ParentComponent.vue -->
<template>
  <div class="parent">
    <Teleport to="body">
      <!-- ChildComponent is logically still a child of ParentComponent -->
      <!-- even though it renders in <body> -->
      <ChildComponent
        :message="parentMessage"
        @update="handleUpdate"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { provide, ref } from 'vue'

const parentMessage = ref('Hello from parent')

// Provide still works across teleport
provide('theme', 'dark')

function handleUpdate(value) {
  // Events bubble up through logical hierarchy, not DOM
  console.log('Received from teleported child:', value)
}
</script>
```

```vue
<!-- ChildComponent.vue -->
<template>
  <div class="modal">
    <p>{{ message }}</p>
    <p>Theme: {{ theme }}</p>
    <button @click="$emit('update', 'new value')">Update</button>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// Props work normally
defineProps(['message'])

// Inject works across teleport boundary
const theme = inject('theme')

// Emit works normally
defineEmits(['update'])
</script>
```

## What Teleport Changes vs. Preserves

| Aspect | Changed? | Notes |
|--------|----------|-------|
| DOM position | Yes | Content moves to `to` target |
| CSS inheritance | Yes | Styles inherit from new DOM parent |
| Props | No | Work exactly as without Teleport |
| Events (emit) | No | Bubble through logical hierarchy |
| Provide/Inject | No | Work across teleport boundaries |
| Vue Devtools | No | Shows logical component tree |
| Slots | No | Work normally |
| Template refs | No | Parent can ref teleported content |

## Practical Example: Modal with Form

```vue
<!-- ModalForm.vue -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay">
      <form @submit.prevent="handleSubmit" class="modal-form">
        <!-- Slot content receives parent's scope -->
        <slot :formData="formData" />

        <button type="submit">Submit</button>
        <button type="button" @click="$emit('close')">Cancel</button>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive } from 'vue'

defineProps(['visible'])
const emit = defineEmits(['close', 'submit'])

const formData = reactive({})

function handleSubmit() {
  emit('submit', formData)
}
</script>
```

```vue
<!-- ParentPage.vue -->
<template>
  <button @click="showModal = true">Add User</button>

  <!-- Events and slots work as expected despite teleportation -->
  <ModalForm
    :visible="showModal"
    @close="showModal = false"
    @submit="handleFormSubmit"
  >
    <template #default="{ formData }">
      <input v-model="formData.name" placeholder="Name" />
      <input v-model="formData.email" placeholder="Email" />
    </template>
  </ModalForm>
</template>

<script setup>
import { ref } from 'vue'

const showModal = ref(false)

function handleFormSubmit(data) {
  console.log('Form submitted:', data)
  showModal.value = false
}
</script>
```

## Vue Devtools Behavior

In Vue Devtools, teleported components appear under their logical parent:

```
App
└── ParentPage
    └── ModalForm        <-- Shows here (logical parent)
        └── form content
```

Not under their DOM location:
```
// This is NOT how it appears in Devtools
body
└── ModalForm  <-- Does NOT show here
```

## Reference
- [Vue.js Teleport - Component Hierarchy](https://vuejs.org/guide/built-ins/teleport.html#basic-usage)
