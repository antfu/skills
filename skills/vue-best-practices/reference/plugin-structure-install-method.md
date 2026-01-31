# Plugin Structure: Install Method Requirements

## Rule

A Vue plugin must be either an object with an `install()` method, or a function that serves as the install function. The install function receives the app instance and optional user-provided options.

## Why This Matters

1. **API contract**: Vue's `app.use()` expects a specific interface. Incorrect structure causes silent failures or errors.

2. **Options passing**: The install method receives options that users pass to `app.use()`, enabling plugin configuration.

3. **App access**: The install method receives the app instance, providing access to `app.component()`, `app.directive()`, `app.provide()`, etc.

## Plugin Structures

### Object with install method (recommended)

```typescript
// plugins/myPlugin.ts
import type { App } from 'vue'

interface PluginOptions {
  prefix?: string
  debug?: boolean
}

const myPlugin = {
  install(app: App, options: PluginOptions = {}) {
    const { prefix = 'my', debug = false } = options

    if (debug) {
      console.log('Installing myPlugin with prefix:', prefix)
    }

    app.provide('myPlugin', { prefix })
  }
}

export default myPlugin

// Usage
app.use(myPlugin, { prefix: 'custom', debug: true })
```

### Function as install (alternative)

```typescript
// plugins/simplePlugin.ts
import type { App } from 'vue'

function simplePlugin(app: App, options?: { message: string }) {
  app.config.globalProperties.$greet = () => {
    return options?.message ?? 'Hello!'
  }
}

export default simplePlugin

// Usage
app.use(simplePlugin, { message: 'Welcome!' })
```

### Factory function pattern (most flexible)

```typescript
// plugins/configuredPlugin.ts
import type { App, Plugin } from 'vue'

interface I18nOptions {
  locale: string
  messages: Record<string, Record<string, string>>
  fallbackLocale?: string
}

export function createI18n(options: I18nOptions): Plugin {
  return {
    install(app: App) {
      // Options are captured in closure - no need to pass through app.use()
      const { locale, messages, fallbackLocale = 'en' } = options

      const translate = (key: string): string => {
        return messages[locale]?.[key]
          ?? messages[fallbackLocale]?.[key]
          ?? key
      }

      app.provide('i18n', { translate, locale })
    }
  }
}

// Usage - options passed to factory, not app.use()
const i18n = createI18n({
  locale: 'fr',
  messages: {
    en: { hello: 'Hello' },
    fr: { hello: 'Bonjour' }
  }
})

app.use(i18n)  // No second argument needed
```

## Common Plugin Capabilities

```typescript
const fullFeaturedPlugin = {
  install(app: App, options: PluginOptions) {
    // 1. Register global components
    app.component('MyButton', MyButtonComponent)
    app.component('MyInput', MyInputComponent)

    // 2. Register global directives
    app.directive('focus', focusDirective)

    // 3. Provide injectable values (recommended)
    app.provide('pluginConfig', options)

    // 4. Add global properties (use sparingly)
    app.config.globalProperties.$myHelper = helperFunction

    // 5. Add global mixins (avoid if possible)
    app.mixin({
      created() {
        // Runs for every component
      }
    })

    // 6. Custom error handling
    app.config.errorHandler = (err, vm, info) => {
      // Handle errors
    }
  }
}
```

## TypeScript: Plugin Type

Use the `Plugin` type for proper typing:

```typescript
import type { App, Plugin } from 'vue'

// With options type parameter
interface MyOptions {
  apiKey: string
}

const myPlugin: Plugin<[MyOptions]> = {
  install(app: App, options: MyOptions) {
    // options is typed as MyOptions
  }
}

// Without options
const simplePlugin: Plugin = {
  install(app: App) {
    // No options expected
  }
}
```

## Common Mistakes

### Missing install method

```typescript
// BAD - This is just an object, not a plugin
const notAPlugin = {
  doSomething() { /* ... */ }
}
app.use(notAPlugin)  // Error or silent failure

// GOOD
const actualPlugin = {
  install(app) {
    app.provide('service', { doSomething() { /* ... */ } })
  }
}
```

### Forgetting to use the app parameter

```typescript
// BAD - Does nothing
const uselessPlugin = {
  install(app, options) {
    const service = createService(options)
    // Forgot to register anything with app!
  }
}

// GOOD
const usefulPlugin = {
  install(app, options) {
    const service = createService(options)
    app.provide('service', service)  // Actually makes it available
  }
}
```

## References

- [Vue.js Plugins Documentation](https://vuejs.org/guide/reusability/plugins.html)
- [Vue.js Application API](https://vuejs.org/api/application.html)
