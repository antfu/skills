---
name: directory-structure
description: Nuxt project folder structure, conventions, and file organization
---

# Directory Structure

Nuxt uses a conventions-based directory structure. Understanding it is key to effective development.

> **Nuxt 4 change:** The default `srcDir` is now `app/`. All Vue application code (`app.vue`, `components/`, `composables/`, `pages/`, etc.) lives inside `app/`, while `server/`, `shared/`, `public/`, `modules/`, `layers/` and `nuxt.config.ts` stay at the project root. (In Nuxt 3 these app directories lived at the root by default.)

## Standard Project Structure (Nuxt 4)

```
my-nuxt-app/
├── app/                    # srcDir — all Vue app code (default in Nuxt 4)
│   ├── app.vue             # Root component
│   ├── app.config.ts       # App configuration (runtime)
│   ├── error.vue           # Error page
│   ├── assets/             # Build-processed assets (CSS, images)
│   ├── components/         # Auto-imported Vue components
│   ├── composables/        # Auto-imported composables
│   ├── layouts/            # Layout components
│   ├── middleware/         # Route middleware
│   ├── pages/              # File-based routing
│   ├── plugins/            # Nuxt plugins
│   └── utils/              # Auto-imported utilities
├── server/                 # Server-side code (root level)
│   ├── api/                # API routes (/api/*)
│   ├── routes/             # Server routes
│   ├── middleware/         # Server middleware
│   ├── plugins/            # Nitro plugins
│   └── utils/              # Server utilities (auto-imported)
├── shared/                 # Code shared between app and server
│   ├── utils/              # Auto-imported in both app and server
│   └── types/              # Auto-imported types
├── public/                 # Static assets (served as-is)
├── content/                # Content files (@nuxt/content)
├── layers/                 # Local layers (auto-scanned)
├── modules/                # Local modules
├── nuxt.config.ts          # Nuxt configuration
├── package.json
└── tsconfig.json
```

## Key Directories

### `app/` Directory

The `app/` directory is the default `srcDir` in Nuxt 4 and holds all Vue application code. Customize it if needed:

```ts
// nuxt.config.ts - customize source directory
export default defineNuxtConfig({
  srcDir: 'src/', // Use 'src/' instead of the default 'app/'
})
```

**Aliases** (Nuxt 4 defaults):

| Alias | Resolves to |
|-------|-------------|
| `~` / `@` | `<rootDir>/app` (the srcDir) |
| `~~` / `@@` | `<rootDir>` (project root) |
| `#shared` | `<rootDir>/shared` |
| `#server` | `<rootDir>/server` |

Because `~` now points at `app/`, reference root-level files (modules, server handlers) with `~~` or the dedicated aliases — e.g. `~~/server/handler.ts` or `#server/handler.ts`.

### `app/components/`

Vue components auto-imported by name:

```
components/
├── Button.vue           → <Button />
├── Card.vue             → <Card />
├── base/
│   └── Button.vue       → <BaseButton />
├── ui/
│   ├── Input.vue        → <UiInput />
│   └── Modal.vue        → <UiModal />
└── TheHeader.vue        → <TheHeader />
```

**Lazy loading**: Prefix with `Lazy` for dynamic import:

```vue
<template>
  <LazyHeavyChart v-if="showChart" />
</template>
```

**Client/Server only**:

```
components/
├── Comments.client.vue  → Only rendered on client
└── ServerData.server.vue → Only rendered on server
```

### `app/composables/`

Vue composables auto-imported (top-level files only):

```
composables/
├── useAuth.ts           → useAuth()
├── useFoo.ts            → useFoo()
└── nested/
    └── utils.ts         → NOT auto-imported
```

Re-export nested composables:

```ts
// composables/index.ts
export { useHelper } from './nested/utils'
```

### `app/pages/`

File-based routing:

```
pages/
├── index.vue            → /
├── about.vue            → /about
├── blog/
│   ├── index.vue        → /blog
│   └── [slug].vue       → /blog/:slug
├── users/
│   └── [id]/
│       └── profile.vue  → /users/:id/profile
├── [...slug].vue        → /* (catch-all)
├── [[optional]].vue     → /:optional? (optional param)
└── (marketing)/         → Route group (not in URL)
    └── pricing.vue      → /pricing
```

**Pages are optional**: Without `pages/`, no vue-router is included.

### `app/layouts/`

Layout components wrapping pages:

```
layouts/
├── default.vue          → Default layout
├── admin.vue            → Admin layout
└── blank.vue            → No layout
```

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <TheHeader />
    <slot />
    <TheFooter />
  </div>
</template>
```

Use in pages:

```vue
<script setup>
definePageMeta({
  layout: 'admin',
  // layout: false // Disable layout
})
</script>
```

### `app/middleware/`

Route middleware:

```
middleware/
├── auth.ts              → Named middleware
├── admin.ts             → Named middleware
└── logger.global.ts     → Global middleware (runs on every route)
```

### `app/plugins/`

Nuxt plugins (auto-registered):

```
plugins/
├── 01.analytics.ts      → Order with number prefix
├── 02.auth.ts
├── vue-query.client.ts  → Client-only plugin
└── server-init.server.ts → Server-only plugin
```

### `server/` Directory

Nitro server code (stays at the project root, not under `app/`):

```
server/
├── api/
│   ├── users.ts         → GET /api/users
│   ├── users.post.ts    → POST /api/users
│   └── users/[id].ts    → /api/users/:id
├── routes/
│   └── sitemap.xml.ts   → /sitemap.xml
├── middleware/
│   └── auth.ts          → Runs on every request
├── plugins/
│   └── db.ts            → Server startup plugins
└── utils/
    └── db.ts            → Auto-imported server utilities
```

### `shared/` Directory

Code usable in **both** the Vue app and the Nitro server (Nuxt 3.14+). Cannot import any Vue or Nitro code.

```
shared/
├── utils/
│   └── format.ts        → Auto-imported in app AND server
└── types/
    └── api.ts           → Auto-imported types
```

Only top-level files in `shared/utils/` and `shared/types/` are auto-imported. Import anything else via the `#shared` alias:

```ts
import { capitalize } from '#shared/utils/format'
import lower from '#shared/formatters/lower'
```

### `public/` Directory

Static assets served at root URL:

```
public/
├── favicon.ico          → /favicon.ico
├── robots.txt           → /robots.txt
└── images/
    └── logo.png         → /images/logo.png
```

### `app/assets/` Directory

Build-processed assets (under `app/` in Nuxt 4):

```
app/assets/
├── css/
│   └── main.css
├── images/
│   └── hero.png
└── fonts/
    └── custom.woff2
```

Reference in components:

```vue
<template>
  <img src="~/assets/images/hero.png" />
</template>

<style>
@import '~/assets/css/main.css';
</style>
```

## Special Files

| File | Purpose |
|------|---------|
| `app.vue` | Root component (optional with pages/) |
| `app.config.ts` | Runtime app configuration |
| `error.vue` | Custom error page |
| `nuxt.config.ts` | Build-time configuration |
| `.nuxtignore` | Ignore files from Nuxt |
| `.env` | Environment variables |

## File Naming Conventions

| Pattern | Meaning |
|---------|---------|
| `[param]` | Dynamic route parameter |
| `[[param]]` | Optional parameter |
| `[...slug]` | Catch-all route |
| `(group)` | Route group (not in URL) |
| `.client.vue` | Client-only component |
| `.server.vue` | Server-only component |
| `.global.ts` | Global middleware |

<!-- 
Source references:
- https://nuxt.com/docs/4.x/directory-structure
- https://nuxt.com/docs/4.x/directory-structure/app
- https://nuxt.com/docs/4.x/directory-structure/server
- https://nuxt.com/docs/4.x/directory-structure/shared
- https://nuxt.com/docs/4.x/api/nuxt-config#alias
-->
