---
title: Composition and Options API Can Coexist in Same Component
impact: LOW
impactDescription: Understanding coexistence helps gradual migration and library integration
type: best-practice
tags: [vue3, composition-api, options-api, migration, interoperability]
---

# Composition and Options API Can Coexist in Same Component

**Impact: LOW** - Vue 3 allows using both APIs in the same component via the `setup()` option. This is useful for gradual migration of existing Options API codebases or integrating Composition API libraries into Options API components.

However, this should be a transitional pattern. For new code, pick one API style and stick with it.

## Task Checklist

- [ ] Only mix APIs when migrating existing code or integrating libraries
- [ ] Use `setup()` option (not `<script setup>`) when mixing with Options API
- [ ] Return refs/reactive from setup to make them available to Options API code
- [ ] Avoid mixing long-term - plan to fully migrate eventually
- [ ] Understand that Options API `this` is NOT available in `setup()`

**Using Composition API in Options API Component:**
```javascript
import { ref, computed, onMounted } from 'vue'
import { useExternalLibrary } from 'some-composition-library'

export default {
  // Options API parts
  data() {
    return {
      legacyData: 'from options api'
    }
  },

  computed: {
    legacyComputed() {
      // Can access both Options API data AND setup() returned values
      return this.legacyData + ' - ' + this.newFeatureData
    }
  },

  methods: {
    legacyMethod() {
      // Can call methods from both APIs
      this.composableMethod()
    }
  },

  // Composition API via setup()
  setup() {
    // Use composition library that doesn't have Options API equivalent
    const { data: libraryData, doSomething } = useExternalLibrary()

    // Create new reactive state with Composition API
    const newFeatureData = ref('from composition api')

    const newComputed = computed(() =>
      newFeatureData.value.toUpperCase()
    )

    function composableMethod() {
      newFeatureData.value = 'updated'
    }

    // IMPORTANT: Return values to make them available to Options API
    return {
      libraryData,
      doSomething,
      newFeatureData,
      newComputed,
      composableMethod
    }
  }
}
```

**Common Migration Pattern:**
```javascript
// Step 1: Original Options API component
export default {
  data() {
    return {
      users: [],
      loading: false
    }
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      this.users = await api.getUsers()
      this.loading = false
    }
  },
  mounted() {
    this.fetchUsers()
  }
}

// Step 2: Extract logic to composable, use via setup()
import { useUsers } from '@/composables/useUsers'

export default {
  data() {
    return {
      // Keep some Options API data during migration
      selectedUserId: null
    }
  },

  computed: {
    selectedUser() {
      // Mix Options API computed with Composition API data
      return this.users.find(u => u.id === this.selectedUserId)
    }
  },

  setup() {
    // New logic in Composition API
    const { users, loading, fetchUsers } = useUsers()
    return { users, loading, fetchUsers }
  },

  mounted() {
    this.fetchUsers()  // Available from setup()
  }
}

// Step 3: Fully migrate to <script setup>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'

const { users, loading, fetchUsers } = useUsers()
const selectedUserId = ref(null)

const selectedUser = computed(() =>
  users.value.find(u => u.id === selectedUserId.value)
)

onMounted(() => fetchUsers())
</script>
```

**Important Limitations:**
```javascript
export default {
  data() {
    return { optionsData: 'hello' }
  },

  setup(props, context) {
    // WRONG: 'this' is NOT available in setup()
    console.log(this.optionsData)  // undefined!

    // CORRECT: Access props and context via parameters
    console.log(props.someProp)
    console.log(context.attrs)
    console.log(context.emit)

    // To access Options API data from setup,
    // you generally can't - they're in separate scopes
    // The Options API CAN access setup's returned values though

    return { /* ... */ }
  }
}
```

## When to Use This Pattern

- **Migrating large codebase**: Migrate piece by piece without rewriting everything
- **Integrating libraries**: Some libraries (like VueUse) are Composition API only
- **Team transition**: Let teams learn Composition API gradually
- **Options API components that need one composable**: Quick integration

## When NOT to Use This Pattern

- **New components**: Just use `<script setup>` from the start
- **Simple components**: Not worth the mental overhead
- **Long-term**: Plan to fully migrate; mixing adds complexity

## Reference
- [Composition API FAQ - Using Both APIs](https://vuejs.org/guide/extras/composition-api-faq.html#can-i-use-both-apis-in-the-same-component)
- [setup() option](https://vuejs.org/api/composition-api-setup.html)
