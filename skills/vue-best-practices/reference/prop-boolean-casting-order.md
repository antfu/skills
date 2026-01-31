---
title: Boolean Prop Type Order Affects Casting Behavior
impact: MEDIUM
impactDescription: Wrong type order causes boolean props to be parsed as empty strings instead of true
type: gotcha
tags: [vue3, props, boolean, type-casting, validation]
---

# Boolean Prop Type Order Affects Casting Behavior

**Impact: MEDIUM** - When a prop accepts multiple types including both `Boolean` and `String`, the order in the type array determines how attribute-only syntax (e.g., `<Component disabled />`) is parsed. Incorrect ordering can result in `""` (empty string) instead of `true`.

Vue applies special boolean casting rules, but String appearing before Boolean disables this casting.

## Task Checklist

- [ ] Place `Boolean` before `String` in type arrays when you want boolean casting
- [ ] Test attribute-only syntax (`<Component disabled />`) to verify expected behavior
- [ ] Consider using only `Boolean` type if the prop is truly boolean
- [ ] Document the expected usage if both String and Boolean are intentional

**Incorrect:**
```vue
<script setup>
// WRONG: String before Boolean disables boolean casting
defineProps({
  disabled: [String, Boolean]  // disabled="" is parsed as empty string ""
})
</script>

<!-- In parent template -->
<MyComponent disabled />  <!-- props.disabled === "" (empty string, not true!) -->
```

```vue
<script setup>
defineProps({
  // PROBLEMATIC: Order matters and may cause confusion
  loading: [String, Boolean],  // <Component loading /> gives ""
  active: [Boolean, String]    // <Component active /> gives true
})
</script>
```

**Correct:**
```vue
<script setup>
// CORRECT: Boolean before String enables boolean casting
defineProps({
  disabled: [Boolean, String]  // <Component disabled /> parsed as true
})
</script>

<!-- All of these work as expected -->
<MyComponent disabled />           <!-- props.disabled === true -->
<MyComponent :disabled="true" />   <!-- props.disabled === true -->
<MyComponent :disabled="false" />  <!-- props.disabled === false -->
<MyComponent disabled="custom" />  <!-- props.disabled === "custom" -->
```

```vue
<script setup>
// BEST: Use only Boolean if you don't need String values
defineProps({
  disabled: Boolean  // Clear intent, no ambiguity
})
</script>
```

## Boolean Casting Rules

| Prop Declaration | Template Usage | Resulting Value |
|-----------------|----------------|-----------------|
| `Boolean` | `<C disabled />` | `true` |
| `Boolean` | `<C />` (absent) | `false` |
| `[Boolean, String]` | `<C disabled />` | `true` |
| `[String, Boolean]` | `<C disabled />` | `""` (empty string) |
| `[Boolean, Number]` | `<C disabled />` | `true` |
| `[Number, Boolean]` | `<C disabled />` | `true` |

Note: The String type is special - it's the only type that overrides Boolean casting when placed first.

## When to Use Multiple Types

```vue
<script setup>
// Use case: Prop can be a boolean toggle OR a string configuration
defineProps({
  // Animation can be true/false OR a timing string like "fast", "slow"
  animate: {
    type: [Boolean, String],  // Boolean first for casting
    default: false
  }
})
</script>

<!-- Usage examples -->
<Dialog animate />                <!-- true - use default animation -->
<Dialog :animate="false" />       <!-- false - no animation -->
<Dialog animate="slow" />         <!-- "slow" - custom timing -->
```

## Reference
- [Vue.js Props - Boolean Casting](https://vuejs.org/guide/components/props.html#boolean-casting)
