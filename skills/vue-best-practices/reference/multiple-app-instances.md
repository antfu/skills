---
title: Use Multiple App Instances for Partial Page Control
impact: MEDIUM
impactDescription: Mounting single app to entire page when only controlling parts wastes resources and complicates SSR
type: efficiency
tags: [vue3, createApp, mount, ssr, progressive-enhancement, architecture]
---

# Use Multiple App Instances for Partial Page Control

**Impact: MEDIUM** - When Vue only controls specific parts of a page (common with server-rendered HTML or progressive enhancement), mounting a single large app instance to the entire page is inefficient and can complicate server-side rendering integration.

Vue's `createApp` API explicitly supports multiple application instances on the same page. Each instance has its own isolated scope for configuration and global assets, making this pattern safe and recommended.

## Task Checklist

- [ ] Assess whether Vue controls the entire page or just specific parts
- [ ] For partial control, create separate app instances for each Vue-managed section
- [ ] Each instance can have its own plugins, components, and configuration
- [ ] Consider shared state via external stores if instances need to communicate

**Incorrect:**
```javascript
// Server-rendered page with Vue only needed for a few interactive widgets
// WRONG: Mounting to entire page

// index.html (server-rendered)
// <body id="app">
//   <header>...</header>        <!-- static -->
//   <nav>...</nav>              <!-- static -->
//   <div class="widget-1">...</div>  <!-- needs Vue -->
//   <main>...</main>            <!-- static -->
//   <div class="widget-2">...</div>  <!-- needs Vue -->
//   <footer>...</footer>        <!-- static -->
// </body>

import { createApp } from 'vue'
import BigApp from './BigApp.vue'

// WRONG: Vue now controls entire page, including static content
createApp(BigApp).mount('#app')
```

**Correct:**
```javascript
// CORRECT: Mount separate instances to specific elements

import { createApp } from 'vue'
import SearchWidget from './widgets/SearchWidget.vue'
import CartWidget from './widgets/CartWidget.vue'
import { createPinia } from 'pinia'

// Shared store for cross-widget state
const pinia = createPinia()

// Widget 1: Search functionality
const searchApp = createApp(SearchWidget)
searchApp.use(pinia)
searchApp.mount('.widget-search')

// Widget 2: Shopping cart
const cartApp = createApp(CartWidget)
cartApp.use(pinia)  // Same Pinia instance = shared state
cartApp.mount('.widget-cart')

// Rest of page remains server-rendered static HTML
```

## Benefits of Multiple Instances

```javascript
// 1. Isolated configuration per section
const adminApp = createApp(AdminPanel)
adminApp.config.errorHandler = adminErrorHandler
adminApp.use(adminOnlyPlugin)
adminApp.mount('#admin-panel')

const publicApp = createApp(PublicWidget)
publicApp.config.errorHandler = publicErrorHandler
// Different plugins, components, configuration
publicApp.mount('#public-widget')

// 2. Independent lifecycle
// Can unmount/remount sections independently
const app1 = createApp(Widget1).mount('#widget-1')
const app2 = createApp(Widget2).mount('#widget-2')

// Later, unmount just one widget
// app1.$destroy() in Vue 2, use app.unmount() for the app instance in Vue 3
```

## Shared State Between Instances

```javascript
// Option 1: Shared Pinia store
const pinia = createPinia()

createApp(App1).use(pinia).mount('#app1')
createApp(App2).use(pinia).mount('#app2')
// Both apps share the same Pinia stores

// Option 2: Shared reactive state module
// sharedState.js
import { reactive } from 'vue'
export const sharedState = reactive({
  user: null,
  cart: []
})

// Both apps import and use sharedState directly
```

## Reference
- [Vue.js - Multiple Application Instances](https://vuejs.org/guide/essentials/application.html#multiple-application-instances)
- [Vue.js Application API](https://vuejs.org/api/application.html)
