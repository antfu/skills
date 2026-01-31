# Use Computed Properties for Complex Class Logic

## Rule

When class bindings involve multiple conditions or complex logic, extract them into computed properties rather than writing inline expressions in templates.

## Why This Matters

- Inline class expressions quickly become unreadable with multiple conditions
- Computed properties are cached and only re-evaluate when dependencies change
- Logic in computed properties is easier to test and debug
- Keeps templates focused on structure, not logic

## Bad Code

```vue
<template>
  <!-- Hard to read, error-prone -->
  <div :class="{
    'btn': true,
    'btn-primary': type === 'primary' && !disabled,
    'btn-secondary': type === 'secondary' && !disabled,
    'btn-disabled': disabled,
    'btn-loading': isLoading,
    'btn-large': size === 'large',
    'btn-small': size === 'small'
  }">
    {{ label }}
  </div>

  <!-- Even worse: string concatenation -->
  <div :class="'btn btn-' + type + (disabled ? ' btn-disabled' : '') + (isLoading ? ' btn-loading' : '')">
    {{ label }}
  </div>
</template>
```

## Good Code

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'primary' },
  size: { type: String, default: 'medium' },
  disabled: Boolean,
  isLoading: Boolean,
  label: String
})

const buttonClasses = computed(() => ({
  'btn': true,
  [`btn-${props.type}`]: !props.disabled,
  'btn-disabled': props.disabled,
  'btn-loading': props.isLoading,
  'btn-large': props.size === 'large',
  'btn-small': props.size === 'small'
}))
</script>

<template>
  <div :class="buttonClasses">
    {{ label }}
  </div>
</template>
```

## Style Bindings Too

The same principle applies to style bindings:

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: String,
  fontSize: Number,
  isHighlighted: Boolean
})

const textStyles = computed(() => ({
  color: props.color,
  fontSize: `${props.fontSize}px`,
  backgroundColor: props.isHighlighted ? 'yellow' : 'transparent',
  fontWeight: props.isHighlighted ? 'bold' : 'normal'
}))
</script>

<template>
  <span :style="textStyles">Styled text</span>
</template>
```

## Combining Static and Dynamic Classes

Use array syntax to combine static classes with computed dynamic classes:

```vue
<script setup>
import { computed } from 'vue'

const dynamicClasses = computed(() => ({
  'is-active': isActive.value,
  'is-disabled': isDisabled.value
}))
</script>

<template>
  <!-- Static 'card' class + dynamic classes -->
  <div :class="['card', dynamicClasses]">
    Content
  </div>
</template>
```

## References

- [Class and Style Bindings](https://vuejs.org/guide/essentials/class-and-style.html)
- [Computed Properties](https://vuejs.org/guide/essentials/computed.html)
