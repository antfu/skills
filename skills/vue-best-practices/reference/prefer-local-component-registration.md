---
title: Prefer Local Component Registration Over Global
impact: MEDIUM
impactDescription: Global registration prevents tree-shaking and creates implicit dependencies
type: best-practice
tags: [vue3, component-registration, tree-shaking, performance, maintainability]
---

# Prefer Local Component Registration Over Global

**Impact: MEDIUM** - Global registration prevents build tools from removing unused components (tree-shaking), increasing bundle size. It also creates implicit dependencies similar to global variables, making it difficult to trace where components are used and locate their implementations in large applications.

Use local registration for better maintainability, smaller bundles, and explicit dependency relationships.

## Task Checklist

- [ ] Use local registration (import in each component) by default
- [ ] Reserve global registration only for truly ubiquitous components (icons, buttons, layouts)
- [ ] When using `<script setup>`, simply import components - no explicit registration needed
- [ ] Review existing global components and migrate to local registration where possible

**Incorrect:**
```javascript
// main.js - registering many components globally
import { createApp } from 'vue'
import App from './App.vue'
import Card from './components/Card.vue'
import Modal from './components/Modal.vue'
import Table from './components/Table.vue'
import Pagination from './components/Pagination.vue'
import UserAvatar from './components/UserAvatar.vue'
import SearchBar from './components/SearchBar.vue'

const app = createApp(App)

// WRONG: All these components are now in the bundle even if unused
app.component('Card', Card)
app.component('Modal', Modal)
app.component('Table', Table)
app.component('Pagination', Pagination)
app.component('UserAvatar', UserAvatar)
app.component('SearchBar', SearchBar)

app.mount('#app')
```

```vue
<!-- SomePage.vue - uses only Card, but all components are bundled -->
<template>
  <Card>
    <p>Content</p>
  </Card>
</template>

<script setup>
// No imports - relying on global registration
// This makes dependencies invisible and hurts tree-shaking
</script>
```

**Correct:**
```javascript
// main.js - only register truly universal components globally
import { createApp } from 'vue'
import App from './App.vue'
import BaseIcon from './components/BaseIcon.vue'
import BaseButton from './components/BaseButton.vue'

const app = createApp(App)

// Only truly ubiquitous base components
app.component('BaseIcon', BaseIcon)
app.component('BaseButton', BaseButton)

app.mount('#app')
```

```vue
<!-- SomePage.vue - explicit local imports -->
<script setup>
// CORRECT: Explicit imports enable tree-shaking
// Only Card is included in the bundle for this component
import Card from '@/components/Card.vue'
import UserAvatar from '@/components/UserAvatar.vue'
</script>

<template>
  <Card>
    <UserAvatar :user="currentUser" />
    <p>Content</p>
  </Card>
</template>
```

```vue
<!-- Options API local registration -->
<script>
import Card from '@/components/Card.vue'
import UserAvatar from '@/components/UserAvatar.vue'

export default {
  components: {
    Card,
    UserAvatar
  }
}
</script>
```

## When Global Registration IS Appropriate

```javascript
// Truly universal base components used across the entire app
import BaseIcon from './components/BaseIcon.vue'
import BaseButton from './components/BaseButton.vue'
import BaseInput from './components/BaseInput.vue'

// Third-party component libraries with controlled scope
import { Button, Input } from 'some-ui-library'

app.component('BaseIcon', BaseIcon)
app.component('BaseButton', BaseButton)
app.component('BaseInput', BaseInput)
```

## Benefits of Local Registration

| Aspect | Global | Local |
|--------|--------|-------|
| Tree-shaking | Not possible | Full support |
| Dependency tracking | Implicit/hidden | Explicit imports |
| Component location | Hard to find | Follow import path |
| Bundle size | All registered components | Only used components |
| Refactoring | Risk of breaking unknown usages | Clear dependency graph |

## Reference
- [Vue.js Component Registration](https://vuejs.org/guide/components/registration.html)
