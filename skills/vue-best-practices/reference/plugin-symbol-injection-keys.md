# Use Symbol Injection Keys in Plugins

## Rule

When using `provide/inject` in Vue plugins, use Symbol keys (preferably with `InjectionKey<T>` for TypeScript) instead of string keys to prevent naming collisions and ensure type safety.

## Why This Matters

1. **Collision prevention**: String keys like `'i18n'` or `'api'` can easily collide between multiple plugins or different parts of your application.

2. **Type safety**: TypeScript's `InjectionKey<T>` provides automatic type inference when using `inject()`.

3. **Refactoring safety**: Symbols are unique, so renaming is safe and explicit.

4. **Debugging**: Symbols can have descriptive names for debugging while remaining unique.

## Bad Practice

```typescript
// plugin.ts
export default {
  install(app) {
    // String key - can collide with other plugins!
    app.provide('http', axios)
    app.provide('config', appConfig)
  }
}

// component.vue
const http = inject('http')  // Type is unknown
const config = inject('config')  // Type is unknown

// Another plugin accidentally uses the same key
otherPlugin.install = (app) => {
  app.provide('http', differentHttpClient)  // COLLISION! Overwrites first
}
```

## Good Practice

```typescript
// plugins/keys.ts
import type { InjectionKey } from 'vue'
import type { AxiosInstance } from 'axios'

export interface AppConfig {
  apiUrl: string
  timeout: number
}

// Typed injection keys - unique and type-safe
export const httpKey: InjectionKey<AxiosInstance> = Symbol('http')
export const configKey: InjectionKey<AppConfig> = Symbol('appConfig')

// plugin.ts
import { httpKey, configKey } from './keys'

export default {
  install(app) {
    app.provide(httpKey, axios)
    app.provide(configKey, { apiUrl: '/api', timeout: 5000 })
  }
}

// component.vue
<script setup lang="ts">
import { inject } from 'vue'
import { httpKey, configKey } from '@/plugins/keys'

// Fully typed! No 'unknown' type
const http = inject(httpKey)  // Type: AxiosInstance | undefined
const config = inject(configKey)  // Type: AppConfig | undefined
</script>
```

## Providing Default Values with Type Safety

```typescript
// With InjectionKey, default values are type-checked
const config = inject(configKey, {
  apiUrl: '/default-api',
  timeout: 3000
})
// Type: AppConfig (not undefined because default provided)

// Type error if default doesn't match!
const config = inject(configKey, {
  apiUrl: '/api'
  // Missing 'timeout' - TypeScript error!
})
```

## Organizing Injection Keys

For larger applications, organize keys by domain:

```typescript
// injection-keys/index.ts
export * from './auth'
export * from './i18n'
export * from './http'

// injection-keys/auth.ts
import type { InjectionKey } from 'vue'

export interface AuthService {
  login: (credentials: Credentials) => Promise<User>
  logout: () => Promise<void>
  currentUser: Ref<User | null>
}

export const authKey: InjectionKey<AuthService> = Symbol('auth')

// injection-keys/i18n.ts
export interface I18n {
  t: (key: string, params?: Record<string, string>) => string
  locale: Ref<string>
}

export const i18nKey: InjectionKey<I18n> = Symbol('i18n')
```

## Creating a useInject Helper

For cleaner component code, create typed composables:

```typescript
// composables/useAuth.ts
import { inject } from 'vue'
import { authKey, type AuthService } from '@/injection-keys'

export function useAuth(): AuthService {
  const auth = inject(authKey)
  if (!auth) {
    throw new Error('Auth plugin not installed. Did you forget app.use(authPlugin)?')
  }
  return auth
}

// component.vue
<script setup>
import { useAuth } from '@/composables/useAuth'

const auth = useAuth()  // Type: AuthService (not undefined)
await auth.login(credentials)
</script>
```

## When String Keys Are Acceptable

1. **Internal plugin use**: If both provide and inject are in the same plugin file
2. **Simple applications**: Very small apps with no collision risk
3. **Dynamic keys**: When the key name must be computed at runtime

Even then, consider using a namespaced string:

```typescript
// Better than plain 'config'
app.provide('myPlugin:config', config)
```

## References

- [Vue.js Provide/Inject with Symbol Keys](https://vuejs.org/guide/components/provide-inject.html#working-with-symbol-keys)
- [Vue.js TypeScript Support for Inject](https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject)
