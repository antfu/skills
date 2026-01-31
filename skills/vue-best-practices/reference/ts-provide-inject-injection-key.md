---
title: Use InjectionKey for Type-Safe Provide/Inject
impact: MEDIUM
impactDescription: Without InjectionKey, injected values are typed as unknown requiring manual type assertions
type: best-practice
tags: [vue3, typescript, provide-inject, injection-key, composition-api]
---

# Use InjectionKey for Type-Safe Provide/Inject

**Impact: MEDIUM** - When using `provide/inject` with TypeScript, use `InjectionKey<T>` with Symbol to achieve type-safe dependency injection. Without it, injected values have `unknown` type or require manual type assertions.

## Task Checklist

- [ ] Define injection keys using `Symbol() as InjectionKey<T>`
- [ ] Store injection keys in a shared file for provider/consumer access
- [ ] Understand that injected values are always `T | undefined`
- [ ] Provide default values to remove undefined from the type

## The Problem

```vue
<!-- Provider.vue -->
<script setup lang="ts">
import { provide } from 'vue'

interface User {
  id: string
  name: string
}

const user: User = { id: '1', name: 'John' }

// String key - no type information
provide('user', user)
</script>
```

```vue
<!-- Consumer.vue -->
<script setup lang="ts">
import { inject } from 'vue'

// Type is unknown!
const user = inject('user')  // Type: unknown

// Must manually assert type - error prone
const user = inject('user') as User  // Works but risky
</script>
```

## The Solution: InjectionKey

```typescript
// keys.ts - Shared injection keys file
import type { InjectionKey, Ref } from 'vue'

export interface User {
  id: string
  name: string
}

export interface AuthContext {
  user: Ref<User | null>
  login: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
}

// Type-safe injection keys
export const userKey: InjectionKey<User> = Symbol('user')
export const authKey: InjectionKey<AuthContext> = Symbol('auth')
```

```vue
<!-- Provider.vue -->
<script setup lang="ts">
import { provide, ref } from 'vue'
import { userKey, authKey, type User, type AuthContext } from '@/keys'

const user: User = { id: '1', name: 'John' }

// Type-checked! Must provide correct type
provide(userKey, user)

// Error if type doesn't match
provide(userKey, { wrong: 'data' })  // TypeScript error!

// Complex context
const authContext: AuthContext = {
  user: ref(null),
  login: async (creds) => { /* ... */ },
  logout: async () => { /* ... */ }
}
provide(authKey, authContext)
</script>
```

```vue
<!-- Consumer.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { userKey, authKey } from '@/keys'

// Automatically typed as User | undefined
const user = inject(userKey)

// Type: AuthContext | undefined
const auth = inject(authKey)

// Access with proper typing
if (user) {
  console.log(user.name)  // TypeScript knows this is string
}
</script>
```

## Handling the Undefined Type

Injected values are always potentially `undefined` because the provider might not exist:

```vue
<script setup lang="ts">
import { inject } from 'vue'
import { userKey, type User } from '@/keys'

// Option 1: Provide a default value (removes undefined)
const user = inject(userKey, { id: '0', name: 'Guest' })
// Type: User (not undefined)

// Option 2: Use factory function for default
const user = inject(userKey, () => ({ id: '0', name: 'Guest' }), true)
// Type: User (factory is called only if no provider)

// Option 3: Assert non-null when certain provider exists
const user = inject(userKey)!
// Type: User (use sparingly!)

// Option 4: Guard with runtime check
const user = inject(userKey)
if (!user) {
  throw new Error('User provider not found. Wrap component in UserProvider.')
}
// Type: User after check
</script>
```

## Creating a useInject Composable

For cleaner consumer code, create typed composables:

```typescript
// composables/useAuth.ts
import { inject } from 'vue'
import { authKey, type AuthContext } from '@/keys'

export function useAuth(): AuthContext {
  const auth = inject(authKey)

  if (!auth) {
    throw new Error(
      'useAuth() requires an AuthProvider ancestor. ' +
      'Make sure to wrap your component tree with <AuthProvider>.'
    )
  }

  return auth
}
```

```vue
<!-- Consumer.vue -->
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

// Clean API, guaranteed non-null, proper error message
const { user, login, logout } = useAuth()
</script>
```

## Organizing Injection Keys

For larger applications, organize keys by domain:

```
src/
├── injection-keys/
│   ├── index.ts        # Re-exports all keys
│   ├── auth.ts         # Auth-related keys
│   ├── theme.ts        # Theme-related keys
│   └── i18n.ts         # i18n-related keys
```

```typescript
// injection-keys/auth.ts
import type { InjectionKey, Ref } from 'vue'

export interface AuthState {
  isAuthenticated: Ref<boolean>
  user: Ref<User | null>
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export interface AuthContext extends AuthState, AuthActions {}

export const authStateKey: InjectionKey<AuthState> = Symbol('authState')
export const authActionsKey: InjectionKey<AuthActions> = Symbol('authActions')
export const authContextKey: InjectionKey<AuthContext> = Symbol('authContext')
```

```typescript
// injection-keys/index.ts
export * from './auth'
export * from './theme'
export * from './i18n'
```

## Generic Injection Keys

For reusable patterns with generics:

```typescript
// keys/list.ts
import type { InjectionKey, Ref } from 'vue'

export interface ListContext<T> {
  items: Ref<T[]>
  selectedItem: Ref<T | null>
  selectItem: (item: T) => void
}

// Factory function for creating typed keys
export function createListKey<T>(name: string): InjectionKey<ListContext<T>> {
  return Symbol(name) as InjectionKey<ListContext<T>>
}

// Usage
interface Product { id: string; name: string }
export const productListKey = createListKey<Product>('productList')
```

## Best Practices Summary

1. **Always use InjectionKey** for TypeScript projects
2. **Use Symbols** to prevent key collisions
3. **Create composables** like `useAuth()` for clean consumer API
4. **Throw descriptive errors** when required providers are missing
5. **Organize keys** in a shared location accessible to providers and consumers
6. **Provide default values** when the provider is optional

## Reference
- [Vue.js TypeScript with Composition API - Provide/Inject](https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject)
- [Vue.js Provide/Inject](https://vuejs.org/guide/components/provide-inject.html)
