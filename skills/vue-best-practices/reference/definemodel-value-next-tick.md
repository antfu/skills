---
title: defineModel Value Changes Apply After Next Tick
impact: MEDIUM
impactDescription: Reading model.value immediately after setting it returns the old value, not the new one
type: gotcha
tags: [vue3, v-model, defineModel, reactivity, timing, nextTick]
---

# defineModel Value Changes Apply After Next Tick

**Impact: MEDIUM** - When you assign a new value to a `defineModel()` ref, the change doesn't take effect immediately. Reading `model.value` right after assignment still returns the previous value. The new value is only available after Vue's next tick.

This can cause bugs when you need to perform operations with the updated value immediately after changing it.

## Task Checklist

- [ ] Don't read model.value immediately after setting it expecting the new value
- [ ] Use the value you assigned directly instead of re-reading from model
- [ ] Use nextTick() if you must read the updated value after assignment
- [ ] Consider batching related updates together

**Incorrect - Expecting immediate value update:**
```vue
<script setup>
const model = defineModel<string>()

function updateAndLog() {
  model.value = 'new value'

  // WRONG: This still logs the OLD value!
  console.log(model.value)  // Logs previous value, not 'new value'

  // WRONG: Computation uses stale value
  const length = model.value.length  // Length of OLD value

  // WRONG: Conditional check on stale value
  if (model.value === 'new value') {
    // This block may not execute!
    doSomething()
  }
}
</script>
```

**Correct - Use the value directly:**
```vue
<script setup>
const model = defineModel<string>()

function updateAndLog() {
  const newValue = 'new value'
  model.value = newValue

  // CORRECT: Use the value you just assigned
  console.log(newValue)  // Logs 'new value'

  // CORRECT: Compute from the known value
  const length = newValue.length

  // CORRECT: Check the known value
  if (newValue === 'new value') {
    doSomething()
  }
}
</script>
```

**Alternative - Use nextTick for deferred operations:**
```vue
<script setup>
import { nextTick } from 'vue'

const model = defineModel<string>()

async function updateAndProcess() {
  model.value = 'new value'

  // Wait for Vue to apply the update
  await nextTick()

  // NOW model.value reflects the new value
  console.log(model.value)  // 'new value'
  processUpdatedValue(model.value)
}

// Or using callback style
function updateWithCallback() {
  model.value = 'new value'

  nextTick(() => {
    // Safe to read updated value here
    console.log(model.value)  // 'new value'
  })
}
</script>
```

## Why This Happens

`defineModel` uses Vue's internal synchronization mechanism (`watchSyncEffect`) to sync with the parent. When you assign to `model.value`:

1. The local ref updates
2. An `update:modelValue` event is emitted to parent
3. Parent updates its ref
4. Vue syncs back to child in the next tick

During this cycle, the child's local value briefly differs from what's been committed.

## Pattern: Object Updates with Immediate Access

```vue
<script setup>
import { nextTick } from 'vue'

const model = defineModel<{ name: string; validated: boolean }>()

async function validateAndUpdate(newName: string) {
  // Build the new object
  const updated = {
    ...model.value,
    name: newName,
    validated: true
  }

  // Assign to model
  model.value = updated

  // Use 'updated' for immediate operations, not model.value
  saveToServer(updated)  // CORRECT: Use local reference

  // If you need model.value specifically (e.g., for DOM sync):
  await nextTick()
  focusValidatedField()  // Now safe to assume DOM updated
}
</script>
```

## Watch Callbacks Also See Updated Values

```vue
<script setup>
import { watch } from 'vue'

const model = defineModel<string>()

// Watch callback receives the new value
watch(model, (newValue, oldValue) => {
  // 'newValue' is reliable here
  console.log('Changed from', oldValue, 'to', newValue)
})

function update() {
  model.value = 'new value'
  // watch callback will fire with correct 'new value'
}
</script>
```

## Reference
- [Vue.js Reactivity - nextTick](https://vuejs.org/api/general.html#nexttick)
- [Vue.js Component v-model](https://vuejs.org/guide/components/v-model.html)
- [SIMPL Engineering: Vue defineModel Pitfalls](https://engineering.simpl.de/post/vue_definemodel/)
