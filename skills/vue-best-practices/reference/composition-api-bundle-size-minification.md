---
title: Composition API Produces Smaller, More Efficient Bundles
impact: LOW
impactDescription: Understanding this helps justify Composition API adoption for performance-sensitive projects
type: efficiency
tags: [vue3, composition-api, bundle-size, minification, performance]
---

# Composition API Produces Smaller, More Efficient Bundles

**Impact: LOW** - The Composition API is more minification-friendly than the Options API, resulting in smaller production bundles and less runtime overhead. This is a beneficial side-effect rather than a primary reason to choose Composition API.

In `<script setup>`, variables and functions can have their names safely shortened by minifiers because they're local to the component scope. Options API properties (methods, computed, data) are accessed via string keys on `this`, which cannot be minified.

## Task Checklist

- [ ] Prefer `<script setup>` for optimal minification
- [ ] Understand that Composition API avoids the `this` proxy overhead
- [ ] For Options API-free projects, consider enabling the compile-time flag to drop Options API code
- [ ] Be aware that libraries using Options API will include that code regardless

**Bundle Size Difference:**
```javascript
// OPTIONS API - Before minification
export default {
  data() {
    return {
      userAuthenticated: false,
      currentUserProfile: null,
      navigationMenuOpen: false
    }
  },
  computed: {
    displayUserName() {
      return this.currentUserProfile?.name || 'Guest'
    }
  },
  methods: {
    handleUserAuthentication() {
      this.userAuthenticated = true
    }
  }
}

// OPTIONS API - After minification (property names preserved)
export default {
  data() {
    return {
      userAuthenticated: false,        // Cannot shorten
      currentUserProfile: null,         // Cannot shorten
      navigationMenuOpen: false         // Cannot shorten
    }
  },
  computed: {
    displayUserName() {                 // Cannot shorten
      return this.currentUserProfile?.name || 'Guest'
    }
  },
  methods: {
    handleUserAuthentication() {        // Cannot shorten
      this.userAuthenticated = true
    }
  }
}
```

```javascript
// COMPOSITION API - Before minification
<script setup>
import { ref, computed } from 'vue'

const userAuthenticated = ref(false)
const currentUserProfile = ref(null)
const navigationMenuOpen = ref(false)

const displayUserName = computed(() =>
  currentUserProfile.value?.name || 'Guest'
)

function handleUserAuthentication() {
  userAuthenticated.value = true
}
</script>

// COMPOSITION API - After minification
<script setup>
import { ref as r, computed as c } from 'vue'

const a = r(false)      // userAuthenticated -> a
const b = r(null)       // currentUserProfile -> b
const d = r(false)      // navigationMenuOpen -> d

const e = c(() => b.value?.name || 'Guest')  // displayUserName -> e

function f() { a.value = true }  // handleUserAuthentication -> f
</script>
```

## Runtime Performance

```javascript
// OPTIONS API - Every property access goes through proxy
export default {
  methods: {
    doSomething() {
      // this.count triggers proxy get trap
      // this.items.push triggers proxy get trap
      console.log(this.count)  // Proxy overhead
      this.items.push(item)    // Proxy overhead
    }
  }
}

// COMPOSITION API - Direct variable access
<script setup>
const count = ref(0)
const items = ref([])

function doSomething() {
  // Direct variable access - no proxy indirection for the variable itself
  console.log(count.value)
  items.value.push(item)
}
</script>
```

## Dropping Options API for Pure Composition API Projects

```javascript
// vite.config.js - Only for projects using exclusively Composition API
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    // This drops Options API support from the bundle
    __VUE_OPTIONS_API__: false
  }
})

// WARNING: This will break any component (including from libraries)
// that uses Options API. Only use if you're certain all components
// use Composition API.
```

## When This Matters

The bundle size difference is typically:
- **Small components**: Negligible difference
- **Large applications**: 10-15% smaller with Composition API
- **With Options API flag disabled**: Additional 5-10% savings

Choose Composition API primarily for its code organization and logic reuse benefits. The bundle size improvement is a nice bonus, not the main reason to switch.

## Reference
- [Composition API FAQ - Smaller Production Bundle](https://vuejs.org/guide/extras/composition-api-faq.html#smaller-production-bundle-and-less-overhead)
- [Vue 3 Build Feature Flags](https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags)
