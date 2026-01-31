---
title: Use PascalCase for Component Names
impact: LOW
impactDescription: Improves code clarity and IDE support, but both cases work
type: best-practice
tags: [vue3, component-registration, naming-conventions, pascalcase, ide-support]
---

# Use PascalCase for Component Names

**Impact: LOW** - Vue supports both PascalCase (`<MyComponent>`) and kebab-case (`<my-component>`) in templates, but PascalCase is recommended. It provides better IDE support, clearly distinguishes Vue components from native HTML elements, and avoids confusion with web components (custom elements).

## Task Checklist

- [ ] Name component files in PascalCase (e.g., `UserProfile.vue`)
- [ ] Use PascalCase when referencing components in templates
- [ ] Use kebab-case only when required (in-DOM templates)
- [ ] Be consistent across the entire codebase

**Less Ideal:**
```vue
<script setup>
import userProfile from './user-profile.vue'
</script>

<template>
  <!-- Works but harder to distinguish from HTML elements -->
  <user-profile :user="currentUser" />
  <header>Native HTML</header>
  <footer>Native HTML</footer>
</template>
```

**Recommended:**
```vue
<script setup>
import UserProfile from './UserProfile.vue'
</script>

<template>
  <!-- Clear visual distinction: components vs HTML elements -->
  <UserProfile :user="currentUser" />
  <header>Native HTML</header>
  <footer>Native HTML</footer>
</template>
```

## Why PascalCase?

### 1. Visual Distinction
```vue
<template>
  <!-- Immediately clear what's a component vs native HTML -->
  <PageHeader />           <!-- Component -->
  <header>...</header>     <!-- Native HTML -->

  <NavigationMenu />       <!-- Component -->
  <nav>...</nav>           <!-- Native HTML -->

  <UserAvatar />           <!-- Component -->
  <img src="..." />        <!-- Native HTML -->
</template>
```

### 2. IDE Auto-completion
PascalCase names are valid JavaScript identifiers, enabling better IDE support:
- Auto-import suggestions
- Go-to-definition
- Refactoring tools

### 3. Avoids Web Component Confusion
Web Components (custom elements) require kebab-case with a hyphen. Using PascalCase for Vue components avoids any confusion:
```vue
<template>
  <!-- Vue component -->
  <MyButton @click="handle" />

  <!-- Web component (custom element) -->
  <my-custom-element></my-custom-element>
</template>
```

## Exception: In-DOM Templates

When using in-DOM templates (HTML files without build step), you MUST use kebab-case because HTML is case-insensitive:

```html
<!-- index.html - in-DOM template -->
<div id="app">
  <!-- PascalCase won't work in HTML files -->
  <!-- <UserProfile></UserProfile> --> <!-- WRONG -->

  <!-- Must use kebab-case -->
  <user-profile :user="currentUser"></user-profile>
</div>
```

## Vue's Automatic Resolution

Vue automatically resolves PascalCase components to both casings:
```vue
<script setup>
import MyComponent from './MyComponent.vue'
</script>

<template>
  <!-- Both work, but PascalCase is preferred -->
  <MyComponent />
  <my-component />
</template>
```

## Reference
- [Vue.js Component Registration - Component Name Casing](https://vuejs.org/guide/components/registration.html#component-name-casing)
