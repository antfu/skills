---
title: Use immediate Option Instead of Duplicate Initial Call
impact: LOW
impactDescription: Duplicate code for initial call and watch callback reduces maintainability
type: efficiency
tags: [vue3, watch, watchers, immediate, best-practices, DRY]
---

# Use immediate Option Instead of Duplicate Initial Call

**Impact: LOW** - Calling a function manually at setup and also in a watcher leads to duplicate code. The `immediate: true` option runs the watcher callback immediately with the current value, combining both behaviors.

## Task Checklist

- [ ] Use `{ immediate: true }` instead of calling handler in onMounted/created
- [ ] Consider `watchEffect` as an alternative (always runs immediately)
- [ ] Remember immediate callback receives `undefined` as oldValue on first run

**Incorrect:**
```vue
<script setup>
import { ref, watch, onMounted } from 'vue'

const userId = ref(1)
const userData = ref(null)

// BAD: Duplicate calls - once in onMounted, once in watch
async function loadUser(id) {
  const response = await fetch(`/api/users/${id}`)
  userData.value = await response.json()
}

onMounted(() => {
  loadUser(userId.value)  // Initial call
})

watch(userId, (newId) => {
  loadUser(newId)  // On change
})
</script>
```

```javascript
// Options API - BAD: Duplicate in created and watch
export default {
  data() {
    return { userId: 1, userData: null }
  },
  created() {
    this.loadUser()  // Initial call
  },
  watch: {
    userId() {
      this.loadUser()  // On change - duplicate!
    }
  },
  methods: {
    async loadUser() {
      const response = await fetch(`/api/users/${this.userId}`)
      this.userData = await response.json()
    }
  }
}
```

**Correct:**
```vue
<script setup>
import { ref, watch } from 'vue'

const userId = ref(1)
const userData = ref(null)

// GOOD: Single watch with immediate runs on mount and on change
watch(
  userId,
  async (newId) => {
    const response = await fetch(`/api/users/${newId}`)
    userData.value = await response.json()
  },
  { immediate: true }
)
</script>
```

```javascript
// Options API - GOOD: Using immediate option
export default {
  data() {
    return { userId: 1, userData: null }
  },
  watch: {
    userId: {
      async handler(newId) {
        const response = await fetch(`/api/users/${newId}`)
        this.userData = await response.json()
      },
      immediate: true
    }
  }
}
```

## Alternative: watchEffect

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const userId = ref(1)
const userData = ref(null)

// watchEffect always runs immediately - no option needed
watchEffect(async () => {
  const response = await fetch(`/api/users/${userId.value}`)
  userData.value = await response.json()
})
</script>
```

## Handling oldValue on Initial Run

```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)

watch(
  count,
  (newVal, oldVal) => {
    // On first run with immediate: true
    // oldVal is undefined
    if (oldVal === undefined) {
      console.log('Initial run, count is:', newVal)
    } else {
      console.log(`Count changed from ${oldVal} to ${newVal}`)
    }
  },
  { immediate: true }
)
</script>
```

## One-Time Watch with once Option

```vue
<script setup>
import { ref, watch } from 'vue'

const data = ref(null)

// Run only once when data becomes available
watch(
  data,
  (value) => {
    if (value) {
      initializeWithData(value)
      // Watcher automatically stops after this
    }
  },
  { once: true }
)
</script>
```

## Reference
- [Vue.js Watchers - Eager Watchers](https://vuejs.org/guide/essentials/watchers.html#eager-watchers)
