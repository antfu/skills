---
title: Implement v-model Correctly in Render Functions
impact: MEDIUM
impactDescription: Incorrect v-model implementation breaks two-way binding with components
type: best-practice
tags: [vue3, render-function, v-model, two-way-binding]
---

# Implement v-model Correctly in Render Functions

**Impact: MEDIUM** - When using `v-model` on components in render functions, you must manually handle both the `modelValue` prop and the `update:modelValue` event. Missing either part breaks two-way binding.

In templates, `v-model` is syntactic sugar that expands to a `modelValue` prop and an `update:modelValue` event listener. In render functions, you must implement this expansion manually.

## Task Checklist

- [ ] Pass `modelValue` as a prop for the bound value
- [ ] Pass `onUpdate:modelValue` handler to receive updates
- [ ] For named v-models, use the corresponding prop and event names
- [ ] Use emit in child components to trigger updates

**Incorrect:**
```javascript
import { h } from 'vue'
import CustomInput from './CustomInput.vue'

export default {
  setup() {
    const text = ref('')

    return () => h(CustomInput, {
      // WRONG: Missing the update handler
      modelValue: text.value
    })
  }
}
```

```javascript
import { h } from 'vue'
import CustomInput from './CustomInput.vue'

export default {
  setup() {
    const text = ref('')

    return () => h(CustomInput, {
      // WRONG: Wrong event name format
      modelValue: text.value,
      onModelValueUpdate: (val) => text.value = val
    })
  }
}
```

**Correct:**
```javascript
import { h, ref } from 'vue'
import CustomInput from './CustomInput.vue'

export default {
  setup() {
    const text = ref('')

    return () => h(CustomInput, {
      // CORRECT: modelValue prop + onUpdate:modelValue handler
      modelValue: text.value,
      'onUpdate:modelValue': (value) => text.value = value
    })
  }
}
```

## Native Input Elements

For native inputs, use `value` and `onInput`:

```javascript
import { h, ref } from 'vue'

export default {
  setup() {
    const text = ref('')

    return () => h('input', {
      value: text.value,
      onInput: (e) => text.value = e.target.value
    })
  }
}
```

## Named v-models (Multiple v-models)

```javascript
import { h, ref } from 'vue'
import UserForm from './UserForm.vue'

export default {
  setup() {
    const firstName = ref('')
    const lastName = ref('')

    return () => h(UserForm, {
      // v-model:firstName
      firstName: firstName.value,
      'onUpdate:firstName': (val) => firstName.value = val,

      // v-model:lastName
      lastName: lastName.value,
      'onUpdate:lastName': (val) => lastName.value = val
    })
  }
}
```

## v-model with Modifiers

Handle modifiers in the child component:

```javascript
import { h, ref } from 'vue'
import CustomInput from './CustomInput.vue'

// Parent - passing modifier
export default {
  setup() {
    const text = ref('')

    return () => h(CustomInput, {
      modelValue: text.value,
      'onUpdate:modelValue': (val) => text.value = val,
      modelModifiers: { trim: true, capitalize: true }
    })
  }
}

// Child - handling modifier
export default {
  props: ['modelValue', 'modelModifiers'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleInput = (e) => {
      let value = e.target.value

      if (props.modelModifiers?.trim) {
        value = value.trim()
      }
      if (props.modelModifiers?.capitalize) {
        value = value.charAt(0).toUpperCase() + value.slice(1)
      }

      emit('update:modelValue', value)
    }

    return () => h('input', {
      value: props.modelValue,
      onInput: handleInput
    })
  }
}
```

## JSX Syntax

```jsx
import { ref } from 'vue'
import CustomInput from './CustomInput.vue'

export default {
  setup() {
    const text = ref('')
    const count = ref(0)

    return () => (
      <div>
        {/* v-model on custom component */}
        <CustomInput
          modelValue={text.value}
          onUpdate:modelValue={(val) => text.value = val}
        />

        {/* v-model on native input */}
        <input
          value={text.value}
          onInput={(e) => text.value = e.target.value}
        />

        {/* Named v-model */}
        <Counter
          count={count.value}
          onUpdate:count={(val) => count.value = val}
        />
      </div>
    )
  }
}
```

## Creating v-model-compatible Components

```javascript
import { h } from 'vue'

export default {
  props: {
    modelValue: String
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('input', {
      value: props.modelValue,
      onInput: (e) => emit('update:modelValue', e.target.value)
    })
  }
}
```

## Reference
- [Vue.js Render Functions - v-model](https://vuejs.org/guide/extras/render-function.html#v-model)
- [Vue.js Component v-model](https://vuejs.org/guide/components/v-model.html)
