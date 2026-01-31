---
title: Props Are Validated Before Component Instance Creation
impact: MEDIUM
impactDescription: Instance properties like data and computed are unavailable in prop default/validator functions
type: gotcha
tags: [vue3, props, validation, lifecycle, default-values]
---

# Props Are Validated Before Component Instance Creation

**Impact: MEDIUM** - Prop validation and default value functions execute before the component instance is created. This means `this`, `data`, `computed`, injections, and other instance properties are not available inside `default` or `validator` functions.

This timing catches developers who expect to use component state in prop validation logic.

## Task Checklist

- [ ] Never reference `this` or instance properties in prop default/validator functions
- [ ] Use factory functions for object/array defaults that only use the function parameters
- [ ] For validation depending on other props, use the second `props` parameter in validators
- [ ] Move complex validation logic to watchers or lifecycle hooks if instance access is needed

**Incorrect:**
```vue
<script>
export default {
  data() {
    return {
      validOptions: ['a', 'b', 'c'],
      defaultMessage: 'Hello'
    }
  },
  props: {
    option: {
      type: String,
      // WRONG: 'this' is undefined during prop validation
      validator(value) {
        return this.validOptions.includes(value)  // TypeError!
      }
    },
    message: {
      type: String,
      // WRONG: Cannot access data properties
      default() {
        return this.defaultMessage  // TypeError!
      }
    },
    config: {
      type: Object,
      // WRONG: Cannot access computed properties
      default() {
        return this.computedDefaults  // TypeError!
      }
    }
  }
}
</script>
```

**Correct:**
```vue
<script>
// Define validation data outside the component
const VALID_OPTIONS = ['a', 'b', 'c']
const DEFAULT_MESSAGE = 'Hello'

export default {
  props: {
    option: {
      type: String,
      // CORRECT: Use external constants
      validator(value) {
        return VALID_OPTIONS.includes(value)
      }
    },
    message: {
      type: String,
      // CORRECT: Use external constant or inline value
      default: DEFAULT_MESSAGE
    },
    config: {
      type: Object,
      // CORRECT: Factory function with no instance dependencies
      default() {
        return { theme: 'light', size: 'medium' }
      }
    }
  }
}
</script>
```

## Using the `props` Parameter in Validators

Validators receive the full props object as the second parameter for cross-prop validation:

```vue
<script setup>
const props = defineProps({
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  value: {
    type: Number,
    required: true,
    // CORRECT: Access other props via second parameter
    validator(value, props) {
      return value >= props.min && value <= props.max
    }
  }
})
</script>
```

## Using rawProps in Default Functions

Default factory functions receive `rawProps` for accessing other prop values:

```vue
<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium'
  },
  padding: {
    type: Number,
    // Access other prop values via rawProps parameter
    default(rawProps) {
      // Use size to determine default padding
      return rawProps.size === 'large' ? 20 : 10
    }
  }
})
</script>
```

## Post-Mount Validation Pattern

For validation that needs instance access, use lifecycle hooks:

```vue
<script setup>
import { onMounted, inject, warn } from 'vue'

const props = defineProps({
  theme: String
})

const availableThemes = inject('availableThemes', [])

// Validation that needs injected values
onMounted(() => {
  if (props.theme && !availableThemes.includes(props.theme)) {
    console.warn(`Invalid theme "${props.theme}". Available: ${availableThemes.join(', ')}`)
  }
})
</script>
```

## Reference
- [Vue.js Props - Prop Validation](https://vuejs.org/guide/components/props.html#prop-validation)
