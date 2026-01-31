# Use camelCase for Style Binding Properties

## Rule

When using `:style` bindings in Vue, prefer camelCase property names over kebab-case for consistency with JavaScript object syntax and better IDE support.

## Why This Matters

- camelCase is the standard JavaScript convention for object properties
- Kebab-case properties require quotes, adding visual noise
- IDE autocomplete and type checking work better with camelCase
- Consistent with how CSS properties are accessed via `element.style` in JavaScript
- Vue's auto-prefixing works with both, but camelCase is cleaner

## Bad Code

```vue
<template>
  <!-- Requires quotes, harder to read -->
  <div :style="{
    'font-size': fontSize + 'px',
    'background-color': bgColor,
    'margin-top': marginTop + 'px',
    'z-index': zIndex
  }">
    Content
  </div>
</template>
```

## Good Code

```vue
<template>
  <!-- Clean camelCase syntax -->
  <div :style="{
    fontSize: fontSize + 'px',
    backgroundColor: bgColor,
    marginTop: marginTop + 'px',
    zIndex: zIndex
  }">
    Content
  </div>
</template>
```

## With Computed Properties

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: Number,
  height: Number,
  isVisible: Boolean
})

// camelCase throughout
const containerStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  opacity: props.isVisible ? 1 : 0,
  transition: 'opacity 0.3s ease'
}))
</script>

<template>
  <div :style="containerStyle">
    Content
  </div>
</template>
```

## Auto-Prefixing with Multiple Values

Vue automatically detects and applies vendor prefixes. For properties that need multiple values for cross-browser support, use an array:

```vue
<template>
  <!-- Vue will use the last value supported by the browser -->
  <div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }">
    Flexbox content
  </div>
</template>
```

## Combining Static and Dynamic Styles

The `:style` directive can coexist with the regular `style` attribute:

```vue
<template>
  <!-- Static styles + dynamic styles are merged -->
  <div
    style="border: 1px solid gray"
    :style="{ backgroundColor: dynamicColor }"
  >
    Content
  </div>
</template>
```

## Merging Multiple Style Objects

Use array syntax to merge multiple style objects:

```vue
<script setup>
const baseStyles = {
  padding: '10px',
  borderRadius: '4px'
}

const themeStyles = computed(() => ({
  backgroundColor: isDark.value ? '#333' : '#fff',
  color: isDark.value ? '#fff' : '#333'
}))
</script>

<template>
  <!-- Later objects override earlier ones for conflicting properties -->
  <div :style="[baseStyles, themeStyles]">
    Content
  </div>
</template>
```

## References

- [Class and Style Bindings - Binding Inline Styles](https://vuejs.org/guide/essentials/class-and-style.html#binding-inline-styles)
