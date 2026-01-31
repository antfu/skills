---
title: Choose v-if or v-show Based on Toggle Frequency
impact: MEDIUM
impactDescription: Wrong choice causes unnecessary DOM operations or wasted initial render cost
type: capability
tags: [vue3, conditional-rendering, v-if, v-show, performance]
---

# Choose v-if or v-show Based on Toggle Frequency

**Impact: MEDIUM** - Using the wrong directive for your use case leads to suboptimal performance. `v-if` has higher toggle costs (destroys/recreates elements), while `v-show` has higher initial render costs (always in DOM). Choosing incorrectly can cause unnecessary DOM manipulation or waste memory on hidden elements.

`v-if` is "real" conditional rendering that properly destroys and recreates event listeners and child components. `v-show` just toggles CSS `display` property, keeping everything in the DOM.

## Task Checklist

- [ ] Use `v-show` for elements that toggle frequently (modals, dropdowns, panels)
- [ ] Use `v-if` for conditions that rarely change at runtime (auth states, feature flags)
- [ ] Use `v-if` when initial condition is likely false (lazy rendering saves cost)
- [ ] Use `v-if` when child components have expensive setup/teardown
- [ ] Consider the memory cost of keeping hidden elements in DOM with v-show

**Incorrect:**
```html
<!-- WRONG: Frequent toggle with v-if causes expensive DOM operations -->
<template>
  <button @click="showPanel = !showPanel">Toggle</button>

  <!-- User clicks this frequently - v-if destroys/recreates every time -->
  <div v-if="showPanel" class="settings-panel">
    <ComplexForm />
  </div>
</template>
```

```html
<!-- WRONG: Rarely-true condition with v-show wastes initial render -->
<template>
  <!-- Admin panel shown only for admin users (rare), but v-show renders it for everyone -->
  <AdminPanel v-show="user.isAdmin" />
</template>
```

**Correct:**
```html
<!-- CORRECT: Frequent toggle with v-show - cheap CSS toggle -->
<template>
  <button @click="showPanel = !showPanel">Toggle</button>

  <!-- v-show just toggles display: none, no DOM destruction -->
  <div v-show="showPanel" class="settings-panel">
    <ComplexForm />
  </div>
</template>
```

```html
<!-- CORRECT: Rare condition with v-if - lazy rendering -->
<template>
  <!-- Only rendered for admins, non-admins don't pay the render cost -->
  <AdminPanel v-if="user.isAdmin" />
</template>
```

```html
<!-- CORRECT: Auth-gated content with v-if -->
<template>
  <!-- v-if is ideal here - auth state rarely changes -->
  <div v-if="isAuthenticated">
    <UserDashboard />
  </div>
  <div v-else>
    <LoginPrompt />
  </div>
</template>
```

## Decision Guide

| Scenario | Recommendation | Reason |
|----------|----------------|--------|
| Toggle frequently (tabs, accordions, dropdowns) | `v-show` | Cheap CSS toggle |
| Toggle rarely (auth, feature flags) | `v-if` | Lazy render, clean DOM |
| Initially false, may never be true | `v-if` | Never pays render cost |
| Complex child components with state | `v-if` | Properly resets state on toggle |
| Need to preserve component state across toggles | `v-show` | Component stays alive |

## Key Differences

```javascript
// v-if behavior:
// - Condition false: Element NOT in DOM, child components NOT created
// - Condition true: Element added, child components created, mounted hooks fire
// - Condition false again: Element removed, child components destroyed, unmounted hooks fire

// v-show behavior:
// - Condition false: Element IN DOM with display: none, child components exist
// - Condition true: display: none removed
// - Component lifecycle hooks only fire once (on initial mount)
```

## Reference
- [Vue.js Conditional Rendering - v-if vs v-show](https://vuejs.org/guide/essentials/conditional.html#v-if-vs-v-show)
