---
name: composables-auto-imports
description: Auto-imported Vue APIs, Nuxt composables, and custom utilities
---

# Composables Auto-imports

Nuxt automatically imports Vue APIs, Nuxt composables, and your custom composables/utilities.

## Built-in Auto-imports

### Vue APIs

```vue
<script setup lang="ts">
// No imports needed - all auto-imported
const count = ref(0)
const doubled = computed(() => count.value * 2)

watch(count, (newVal) => {
  console.log('Count changed:', newVal)
})

onMounted(() => {
  console.log('Component mounted')
})

// Lifecycle hooks
onBeforeMount(() => {})
onUnmounted(() => {})
onBeforeUnmount(() => {})

// Reactivity
const state = reactive({ name: 'John' })
const shallow = shallowRef({ deep: 'object' })
</script>
```

### Nuxt Composables

```vue
<script setup lang="ts">
// All auto-imported
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const appConfig = useAppConfig()
const nuxtApp = useNuxtApp()

// Data fetching
const { data } = await useFetch('/api/data')
const { data: asyncData } = await useAsyncData('key', () => fetchData())

// State
const state = useState('key', () => 'initial')
const cookie = useCookie('token')

// Head/SEO
useHead({ title: 'My Page' })
useSeoMeta({ description: 'Page description' })

// Accessibility — announce content to screen readers
const { polite, assertive } = useAnnouncer() // needs <NuxtAnnouncer> (Nuxt 4.4+)
const { set } = useRouteAnnouncer()           // automatic on navigation

// Request helpers (SSR)
const headers = useRequestHeaders()
const event = useRequestEvent()
const url = useRequestURL()
</script>
```

> **Nuxt 4 / Nitro:** in server routes, `useRuntimeConfig()` is called without the `event` argument.

### useAnnouncer (Accessibility)

Manually announce dynamic content (form validation, toasts, loading) to screen readers. Requires `<NuxtAnnouncer>` in your app. Available in Nuxt 4.4.2+.

```vue
<script setup lang="ts">
const { polite, assertive } = useAnnouncer()

async function submit() {
  try {
    await $fetch('/api/contact', { method: 'POST', body: form })
    polite('Message sent successfully')   // waits for screen reader silence
  } catch {
    assertive('Error: failed to send')    // interrupts immediately
  }
}
</script>
```

Use `useRouteAnnouncer` (with `<NuxtRouteAnnouncer>`) instead for automatic route-change announcements based on the page `<title>`.

## Custom Composables (`app/composables/`)

### Creating Composables

```ts
// composables/useCounter.ts
export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  const decrement = () => count.value--
  return { count, increment, decrement }
}
```

```ts
// composables/useAuth.ts
export function useAuth() {
  const user = useState<User | null>('user', () => null)
  const isLoggedIn = computed(() => !!user.value)

  async function login(credentials: Credentials) {
    user.value = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, isLoggedIn, login, logout }
}
```

### Using Composables

```vue
<script setup lang="ts">
// Auto-imported - no import statement needed
const { count, increment } = useCounter(10)
const { user, isLoggedIn, login } = useAuth()
</script>
```

### File Scanning Rules

Only top-level files are scanned:

```
composables/
├── useAuth.ts         → useAuth() ✓
├── useCounter.ts      → useCounter() ✓
├── index.ts           → exports ✓
└── nested/
    └── helper.ts      → NOT auto-imported ✗
```

Re-export nested composables:

```ts
// composables/index.ts
export { useHelper } from './nested/helper'
```

Or configure scanning:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    dirs: [
      'composables',
      'composables/**', // Scan all nested
    ],
  },
})
```

## Utilities (`app/utils/`)

```ts
// utils/format.ts
export function formatDate(date: Date) {
  return date.toLocaleDateString()
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
```

```vue
<script setup lang="ts">
// Auto-imported
const date = formatDate(new Date())
const price = formatCurrency(99.99)
</script>
```

## Server Utils (`server/utils/`)

```ts
// server/utils/db.ts
export function useDb() {
  return createDbConnection()
}

// server/utils/auth.ts
export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET)
}
```

```ts
// server/api/users.ts
export default defineEventHandler(() => {
  const db = useDb() // Auto-imported
  return db.query('SELECT * FROM users')
})
```

## Shared Utilities (`shared/`)

Code auto-imported in **both** the Vue app and the Nitro server (Nuxt 3.14+). Only `shared/utils/` and `shared/types/` top-level files are auto-imported. Must not import Vue or Nitro code.

```ts
// shared/utils/capitalize.ts
export function capitalize(input: string) {
  return input ? input[0].toUpperCase() + input.slice(1) : ''
}
```

```ts
// Auto-imported in app components AND server/api/*
const title = capitalize('hello')

// Non-scanned files: import via the #shared alias
import lower from '#shared/formatters/lower'
```

## Third-party Package Imports

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    presets: [
      {
        from: 'vue-i18n',
        imports: ['useI18n'],
      },
      {
        from: 'date-fns',
        imports: ['format', 'parseISO', 'differenceInDays'],
      },
      {
        from: '@vueuse/core',
        imports: ['useMouse', 'useWindowSize'],
      },
    ],
  },
})
```

## Explicit Imports

Use `#imports` alias when needed:

```vue
<script setup lang="ts">
import { ref, computed, useFetch } from '#imports'
</script>
```

## Composable Context Rules

Nuxt composables must be called in valid context:

```ts
// ❌ Wrong - module level
const config = useRuntimeConfig()

export function useMyComposable() {}
```

```ts
// ✅ Correct - inside function
export function useMyComposable() {
  const config = useRuntimeConfig()
  return { apiBase: config.public.apiBase }
}
```

**Valid contexts:**
- `<script setup>` block
- `setup()` function
- `defineNuxtPlugin()` callback
- `defineNuxtRouteMiddleware()` callback

## Disabling Auto-imports

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  // Disable all auto-imports
  imports: {
    autoImport: false,
  },

  // Or disable only directory scanning (keep Vue/Nuxt imports)
  imports: {
    scan: false,
  },
})
```

<!-- 
Source references:
- https://nuxt.com/docs/4.x/guide/concepts/auto-imports
- https://nuxt.com/docs/4.x/directory-structure/app/composables
- https://nuxt.com/docs/4.x/directory-structure/app/utils
- https://nuxt.com/docs/4.x/directory-structure/shared
- https://nuxt.com/docs/4.x/api/composables/use-announcer
-->
