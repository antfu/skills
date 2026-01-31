---
title: Use Composables Instead of Mixins for Logic Reuse
impact: HIGH
impactDescription: Mixins cause naming conflicts, unclear data origins, and inflexible logic - composables solve all these problems
type: best-practice
tags: [vue3, composition-api, composables, mixins, refactoring, code-reuse]
---

# Use Composables Instead of Mixins for Logic Reuse

**Impact: HIGH** - Mixins, the primary logic reuse mechanism in Options API, have fundamental flaws that make code hard to maintain. Composables (Composition API functions) solve all mixin drawbacks: unclear property origins, naming conflicts, and inability to parameterize.

The ability to create clean, reusable logic through composables is the primary advantage of the Composition API.

## Task Checklist

- [ ] Migrate existing mixins to composables when refactoring
- [ ] Never create new mixins - use composables instead
- [ ] Use explicit imports to make data origins clear
- [ ] Parameterize composables to make them flexible
- [ ] Prefix composables with "use" (useAuth, useFetch, useForm)

**Problems with Mixins:**
```javascript
// userMixin.js
export const userMixin = {
  data() {
    return {
      user: null,
      loading: false  // Conflict waiting to happen!
    }
  },
  methods: {
    fetchUser() { /* ... */ }
  }
}

// authMixin.js
export const authMixin = {
  data() {
    return {
      token: null,
      loading: false  // NAME CONFLICT with userMixin!
    }
  },
  methods: {
    login() { /* ... */ }
  }
}

// Component using mixins - PROBLEMATIC
export default {
  mixins: [userMixin, authMixin],

  mounted() {
    // PROBLEM 1: Where does 'user' come from? Have to check mixins
    console.log(this.user)

    // PROBLEM 2: Which 'loading'? Last mixin wins, silently!
    console.log(this.loading)  // Is this user loading or auth loading?

    // PROBLEM 3: Can't customize behavior per-component
    this.fetchUser()  // Always fetches the same way
  }
}
```

**Composables Solution:**
```javascript
// composables/useUser.js
import { ref } from 'vue'

export function useUser(userId) {  // Can accept parameters!
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchUser() {
    loading.value = true
    try {
      user.value = await api.getUser(userId)
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  return { user, loading, error, fetchUser }
}

// composables/useAuth.js
import { ref } from 'vue'

export function useAuth() {
  const token = ref(null)
  const loading = ref(false)  // No conflict - it's scoped!

  async function login(credentials) { /* ... */ }
  function logout() { /* ... */ }

  return { token, loading, login, logout }
}

// Component using composables - CLEAR AND FLEXIBLE
<script setup>
import { useUser } from '@/composables/useUser'
import { useAuth } from '@/composables/useAuth'

// SOLUTION 1: Clear where everything comes from
const { user, loading: userLoading, fetchUser } = useUser(123)
const { token, loading: authLoading, login } = useAuth()

// SOLUTION 2: Rename to avoid any conflicts
// userLoading vs authLoading - explicit!

// SOLUTION 3: Parameterize behavior
const adminUser = useUser(adminId)
const currentUser = useUser(currentUserId)
// Each has its own state!

onMounted(() => {
  fetchUser()  // Explicitly from useUser
})
</script>
```

## Migrating from Mixins

```javascript
// BEFORE: Mixin with options
export const formMixin = {
  data() {
    return { errors: {}, submitting: false }
  },
  methods: {
    validate() { /* ... */ },
    submit() { /* ... */ }
  }
}

// AFTER: Composable with flexibility
export function useForm(initialValues, validationSchema) {
  const values = ref({ ...initialValues })
  const errors = ref({})
  const submitting = ref(false)
  const touched = ref({})

  function validate() {
    errors.value = validationSchema.validate(values.value)
    return Object.keys(errors.value).length === 0
  }

  async function submit(onSubmit) {
    if (!validate()) return

    submitting.value = true
    try {
      await onSubmit(values.value)
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    values.value = { ...initialValues }
    errors.value = {}
    touched.value = {}
  }

  return {
    values,
    errors,
    submitting,
    touched,
    validate,
    submit,
    reset
  }
}

// Usage - now parameterizable and explicit
const loginForm = useForm(
  { email: '', password: '' },
  loginValidationSchema
)

const registerForm = useForm(
  { email: '', password: '', name: '' },
  registerValidationSchema
)
```

## Composition Over Mixins Benefits

| Aspect | Mixins | Composables |
|--------|--------|-------------|
| Property origin | Unclear | Explicit import |
| Naming conflicts | Silent overwrites | Explicit rename |
| Parameters | Not possible | Fully supported |
| Type inference | Poor | Excellent |
| Reuse instances | One per component | Multiple allowed |
| Tree-shaking | Not possible | Fully supported |

## Reference
- [Composition API FAQ - Better Logic Reuse](https://vuejs.org/guide/extras/composition-api-faq.html#better-logic-reuse)
- [Composables](https://vuejs.org/guide/reusability/composables.html)
- [VueUse - Collection of Composables](https://vueuse.org/)
