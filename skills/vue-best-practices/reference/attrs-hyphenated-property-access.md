# Accessing Hyphenated Attributes in $attrs

## Rule

Fallthrough attributes preserve their original casing in JavaScript. Hyphenated attribute names (like `data-testid` or `aria-label`) must be accessed using bracket notation. Event listeners are exposed as camelCase functions (e.g., `@click` becomes `$attrs.onClick`).

## Why This Matters

- JavaScript identifiers cannot contain hyphens
- Using dot notation with hyphenated names causes syntax errors or undefined values
- Event listener naming follows a different convention than attribute naming
- Common source of "undefined" errors when working with attrs programmatically

## Bad Code

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

// WRONG: Syntax error - hyphen interpreted as minus
console.log(attrs.data-testid)  // Error!

// WRONG: This accesses a different property
console.log(attrs.dataTestid)   // undefined (camelCase doesn't work for attrs)

// WRONG: Expecting hyphenated event name
console.log(attrs['on-click'])  // undefined
console.log(attrs['@click'])    // undefined
</script>
```

## Good Code

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

// CORRECT: Use bracket notation for hyphenated attributes
console.log(attrs['data-testid'])    // "my-button"
console.log(attrs['aria-label'])     // "Submit form"
console.log(attrs['foo-bar'])        // "baz"

// CORRECT: Event listeners use camelCase with 'on' prefix
console.log(attrs.onClick)           // function
console.log(attrs.onCustomEvent)     // function (from @custom-event)
console.log(attrs.onMouseEnter)      // function (from @mouseenter or @mouse-enter)
</script>
```

## Attribute vs Event Naming Reference

| Parent Usage | $attrs Access |
|--------------|---------------|
| `class="foo"` | `attrs.class` |
| `data-id="123"` | `attrs['data-id']` |
| `aria-label="..."` | `attrs['aria-label']` |
| `foo-bar="baz"` | `attrs['foo-bar']` |
| `@click="fn"` | `attrs.onClick` |
| `@custom-event="fn"` | `attrs.onCustomEvent` |
| `@update:modelValue="fn"` | `attrs['onUpdate:modelValue']` |

## Common Patterns

### Checking for specific attributes

```vue
<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

// Check if data attribute exists
const hasTestId = computed(() => 'data-testid' in attrs)

// Get aria attribute with default
const ariaLabel = computed(() => attrs['aria-label'] ?? 'Default label')
</script>
```

### Filtering attributes by type

```vue
<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

// Separate event listeners from other attributes
const { listeners, otherAttrs } = computed(() => {
  const listeners = {}
  const otherAttrs = {}

  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('on') && typeof value === 'function') {
      listeners[key] = value
    } else {
      otherAttrs[key] = value
    }
  }

  return { listeners, otherAttrs }
}).value
</script>
```

### Extracting data attributes

```vue
<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

// Get all data-* attributes
const dataAttrs = computed(() => {
  const result = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key.startsWith('data-')) {
      result[key] = value
    }
  }
  return result
})
</script>

<template>
  <div v-bind="dataAttrs">
    <!-- Only data attributes are bound -->
  </div>
</template>
```

### Forwarding specific events

```vue
<script setup>
import { useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

// Call parent's click handler with custom logic
function handleClick(event) {
  console.log('Internal handling first')

  // Then forward to parent if handler exists
  if (attrs.onClick) {
    attrs.onClick(event)
  }
}
</script>

<template>
  <button @click="handleClick">
    <slot />
  </button>
</template>
```

## TypeScript Considerations

```vue
<script setup lang="ts">
import { useAttrs } from 'vue'

const attrs = useAttrs()

// attrs is typed as Record<string, unknown>
// You may need to cast for specific usage

const testId = attrs['data-testid'] as string | undefined
const onClick = attrs.onClick as ((e: MouseEvent) => void) | undefined
</script>
```

## References

- [Fallthrough Attributes - Accessing in JavaScript](https://vuejs.org/guide/components/attrs.html#accessing-fallthrough-attributes-in-javascript)
- [Vue 3 $attrs Documentation](https://vuejs.org/api/component-instance.html#attrs)
