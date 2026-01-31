---
title: Use Symbol Keys for Provide/Inject in Large Applications
impact: MEDIUM
impactDescription: String injection keys can collide in large applications or when using third-party components
type: best-practice
tags: [vue3, provide-inject, typescript, architecture, component-library]
---

# Use Symbol Keys for Provide/Inject in Large Applications

**Impact: MEDIUM** - Using string keys for provide/inject works for small applications but can cause key collisions in large apps, component libraries, or when multiple teams work on the same codebase. Symbol keys guarantee uniqueness and provide better TypeScript integration.

## Task Checklist

- [ ] Use Symbol keys for provide/inject in large applications
- [ ] Export symbols from a dedicated keys file
- [ ] Use `InjectionKey<T>` for TypeScript type safety
- [ ] Reserve string keys for simple, local use cases only

## The Problem: String Key Collisions

**Risky - String keys can collide:**
```vue
<!-- ThemeProvider.vue (your code) -->
<script setup>
import { provide, ref } from 'vue'
provide('theme', ref('dark'))
</script>

<!-- SomeThirdPartyComponent.vue (library) -->
<script setup>
import { provide, ref } from 'vue'
// Oops! Same key, different value
provide('theme', ref({ primary: 'blue', secondary: 'gray' }))
</script>

<!-- DeepChild.vue -->
<script setup>
import { inject } from 'vue'
const theme = inject('theme') // Which one? Closest ancestor wins
</script>
```

## Solution: Symbol Keys

**Correct - Unique symbols prevent collisions:**

```js
// injection-keys.js
export const ThemeKey = Symbol('theme')
export const UserKey = Symbol('user')
export const ConfigKey = Symbol('config')
```

```vue
<!-- ThemeProvider.vue -->
<script setup>
import { provide, ref } from 'vue'
import { ThemeKey } from '@/injection-keys'

const theme = ref('dark')
provide(ThemeKey, theme)
</script>
```

```vue
<!-- ThemeConsumer.vue -->
<script setup>
import { inject } from 'vue'
import { ThemeKey } from '@/injection-keys'

const theme = inject(ThemeKey)
</script>
```

## TypeScript: InjectionKey for Type Safety

Vue provides `InjectionKey<T>` for strongly-typed injection:

```ts
// injection-keys.ts
import type { InjectionKey, Ref } from 'vue'

// Define the injected type
interface User {
  id: string
  name: string
  email: string
}

interface ThemeConfig {
  mode: 'light' | 'dark'
  primaryColor: string
}

// Create typed injection keys
export const UserKey: InjectionKey<Ref<User>> = Symbol('user')
export const ThemeKey: InjectionKey<Ref<ThemeConfig>> = Symbol('theme')
export const LoggerKey: InjectionKey<(msg: string) => void> = Symbol('logger')
```

```vue
<!-- Provider.vue -->
<script setup lang="ts">
import { provide, ref } from 'vue'
import { UserKey, ThemeKey } from '@/injection-keys'

const user = ref({
  id: '123',
  name: 'John',
  email: 'john@example.com'
})

const theme = ref({
  mode: 'dark' as const,
  primaryColor: '#007bff'
})

// TypeScript validates the provided value matches the key's type
provide(UserKey, user)
provide(ThemeKey, theme)
</script>
```

```vue
<!-- Consumer.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { UserKey, ThemeKey } from '@/injection-keys'

// TypeScript knows user is Ref<User> | undefined
const user = inject(UserKey)

// With default value, TypeScript knows it's not undefined
const theme = inject(ThemeKey, ref({ mode: 'light', primaryColor: '#000' }))

// Type-safe access
console.log(user?.value.name) // TypeScript knows the shape
console.log(theme.value.mode) // 'light' | 'dark'
</script>
```

## Pattern: Injection Keys File Organization

For larger applications, organize keys by feature:

```
src/
  injection-keys/
    index.ts          # Re-exports all keys
    auth.ts           # Auth-related keys
    theme.ts          # Theme-related keys
    feature-x.ts      # Feature-specific keys
```

```ts
// injection-keys/auth.ts
import type { InjectionKey, Ref, ComputedRef } from 'vue'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  permissions: string[]
}

export interface AuthActions {
  login: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
  checkPermission: (permission: string) => boolean
}

export const AuthStateKey: InjectionKey<Ref<AuthState>> = Symbol('auth-state')
export const AuthActionsKey: InjectionKey<AuthActions> = Symbol('auth-actions')
```

```ts
// injection-keys/index.ts
export * from './auth'
export * from './theme'
export * from './feature-x'
```

## Handling Missing Injections with Types

TypeScript helps catch missing providers:

```vue
<script setup lang="ts">
import { inject } from 'vue'
import { UserKey } from '@/injection-keys'

// Option 1: Handle undefined explicitly
const user = inject(UserKey)
if (!user) {
  throw new Error('UserKey must be provided by an ancestor component')
}

// Option 2: Provide a default
const userWithDefault = inject(UserKey, ref({
  id: 'guest',
  name: 'Guest User',
  email: ''
}))

// Option 3: Use non-null assertion (only if you're certain)
const userRequired = inject(UserKey)!
</script>
```

## When String Keys Are Still OK

String keys are acceptable for:

- Small applications with few providers
- Local component trees with clear boundaries
- Quick prototypes
- App-level provides with unique, namespaced strings

```vue
<!-- App-level provides with namespaced strings -->
<script setup>
import { provide } from 'vue'

// Namespaced strings reduce collision risk
provide('myapp:config', config)
provide('myapp:analytics', analytics)
</script>
```

## Reference
- [Vue.js Provide/Inject - Working with Symbol Keys](https://vuejs.org/guide/components/provide-inject.html#working-with-symbol-keys)
- [Vue.js TypeScript - Typing Provide/Inject](https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject)
