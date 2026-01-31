---
title: KeepAlive Include/Exclude Requires Component Name
impact: MEDIUM
impactDescription: The include and exclude props match against component name option, which must be explicitly declared
type: gotcha
tags: [vue3, keepalive, component-name, include, exclude, sfc]
---

# KeepAlive Include/Exclude Requires Component Name

**Impact: MEDIUM** - When using `include` or `exclude` props on KeepAlive, the matching is done against the component's `name` option. Components without an explicit name will not match and caching behavior will be unexpected.

## Task Checklist

- [ ] Declare `name` option on components used with include/exclude
- [ ] Use `defineOptions({ name: '...' })` in `<script setup>`
- [ ] Note: Since Vue 3.2.34, SFC filename is auto-inferred as name
- [ ] Verify names match exactly (case-sensitive)

## The Problem

```vue
<!-- App.vue -->
<template>
  <KeepAlive include="TabA,TabB">
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

```vue
<!-- TabA.vue - NO NAME DECLARED -->
<script setup>
// No name option - will NOT match "TabA" in include!
const count = ref(0)
</script>

<template>
  <div>Count: {{ count }}</div>
</template>
```

**Result:** TabA is NOT cached because it has no `name` option to match against.

## Solutions

### Solution 1: Use defineOptions (Vue 3.3+)

```vue
<!-- TabA.vue -->
<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'TabA'  // Now matches include="TabA"
})

const count = ref(0)
</script>

<template>
  <div>Count: {{ count }}</div>
</template>
```

### Solution 2: Dual Script Block

```vue
<!-- TabA.vue -->
<script>
export default {
  name: 'TabA'
}
</script>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <div>Count: {{ count }}</div>
</template>
```

### Solution 3: Rely on Auto-Inference (Vue 3.2.34+)

Since Vue 3.2.34, SFCs using `<script setup>` automatically infer their name from the filename:

```
TabA.vue  -> name is "TabA"
UserProfile.vue -> name is "UserProfile"
my-component.vue -> name is "my-component" (kebab-case preserved)
```

```vue
<!-- Works automatically since Vue 3.2.34+ -->
<!-- File: TabA.vue -->
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <div>Count: {{ count }}</div>
</template>
```

```vue
<!-- App.vue -->
<template>
  <!-- Matches filename "TabA" -->
  <KeepAlive include="TabA">
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

## Common Mistakes

### Mistake 1: Name Doesn't Match

```vue
<script>
export default {
  name: 'tab-a'  // lowercase kebab-case
}
</script>
```

```vue
<template>
  <!-- DOESN'T MATCH - include uses PascalCase -->
  <KeepAlive include="TabA">
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

**Fix:** Ensure names match exactly:

```vue
<KeepAlive include="tab-a">  <!-- or change component name to 'TabA' -->
```

### Mistake 2: Dynamic Components Without Names

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// Async component - might not have name!
const AsyncTab = defineAsyncComponent(() => import('./Tab.vue'))
</script>
```

**Fix:** Ensure the imported component has a name declared.

### Mistake 3: Using Props in Options API

```vue
<script>
export default {
  // This doesn't set the component name!
  props: ['name']  // 'name' prop is different from component name option
}
</script>
```

## Debugging Name Issues

Check what name Vue sees for your component:

```vue
<script setup>
import { getCurrentInstance, onMounted } from 'vue'

onMounted(() => {
  const instance = getCurrentInstance()
  console.log('Component name:', instance?.type?.name)
  console.log('Component __name:', instance?.type?.__name)
})
</script>
```

## Using Different Match Formats

```vue
<template>
  <!-- String (comma-delimited) -->
  <KeepAlive include="TabA,TabB,TabC">
    <component :is="current" />
  </KeepAlive>

  <!-- RegExp -->
  <KeepAlive :include="/^Tab/">
    <component :is="current" />
  </KeepAlive>

  <!-- Array -->
  <KeepAlive :include="['TabA', 'TabB']">
    <component :is="current" />
  </KeepAlive>
</template>
```

## Key Points

1. **Name must match exactly** - Case-sensitive string matching
2. **Vue 3.2.34+ auto-infers name** - From filename for `<script setup>` SFCs
3. **Use `defineOptions`** - Clean way to set name in `<script setup>`
4. **Debug with getCurrentInstance** - Check what name Vue actually sees
5. **Multiple formats available** - String, RegExp, or Array for include/exclude

## Reference
- [Vue.js KeepAlive - Include/Exclude](https://vuejs.org/guide/built-ins/keep-alive.html#include-exclude)
- [Vue.js SFC `<script setup>`](https://vuejs.org/api/sfc-script-setup.html)
- [defineOptions documentation](https://vuejs.org/api/sfc-script-setup.html#defineoptions)
