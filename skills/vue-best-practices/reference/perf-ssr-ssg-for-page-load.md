---
title: Use SSR or SSG for Page Load Critical Applications
impact: HIGH
impactDescription: Client-side SPAs require JavaScript execution before content appears, severely impacting LCP and INP metrics
type: capability
tags: [vue3, performance, ssr, ssg, nuxt, page-load, architecture]
---

# Use SSR or SSG for Page Load Critical Applications

**Impact: HIGH** - Pure client-side SPAs must download, parse, and execute JavaScript before users see content. This significantly delays Largest Contentful Paint (LCP) and impacts Core Web Vitals. For page load-critical apps (marketing sites, e-commerce, content sites), use Server-Side Rendering (SSR) or Static Site Generation (SSG).

Choose your architecture based on your content's nature and page load requirements.

## Task Checklist

- [ ] Evaluate if page load performance is critical for your use case
- [ ] Choose SSR for dynamic content that changes per request
- [ ] Choose SSG for content that doesn't change frequently
- [ ] Consider hybrid approaches (SSG for marketing, SPA for app)
- [ ] Use Nuxt.js for streamlined SSR/SSG with Vue

## Architecture Decision Guide

| Content Type | Changes | Best Approach | Example |
|--------------|---------|---------------|---------|
| Marketing pages | Rarely | SSG | Landing pages, docs |
| Blog/content | On publish | SSG with regeneration | Blog, documentation |
| E-commerce catalog | Hourly/daily | SSG + ISR | Product listings |
| User dashboard | Per request | SPA (ok) | Admin panels |
| Social feed | Real-time | SSR or SPA | News feed |
| Authenticated app | Per user | SPA (ok) | Internal tools |

**Incorrect:**
```javascript
// BAD: Pure client-side SPA for a marketing site
// Users see blank page until JS loads and executes

// main.js
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')  // Nothing visible until this runs

// index.html - Users see empty #app until JS executes
// <div id="app"></div>
```

**Correct:**
```javascript
// GOOD: Use Nuxt.js for SSR/SSG
// nuxt.config.ts
export default defineNuxtConfig({
  // SSG: Pre-render at build time (best for static content)
  ssr: true,
  nitro: {
    prerender: {
      routes: ['/', '/about', '/pricing', '/blog']
    }
  }
})

// Or full SSR for dynamic content
export default defineNuxtConfig({
  ssr: true  // Server renders on each request
})
```

```vue
<!-- pages/index.vue - Works with both SSR and SSG -->
<template>
  <div>
    <HeroSection />
    <FeatureList :features="features" />
    <PricingTable />
  </div>
</template>

<script setup>
// Data fetched at build time (SSG) or request time (SSR)
const { data: features } = await useFetch('/api/features')
</script>
```

## Hybrid Approach: SSG Marketing + SPA App

```javascript
// nuxt.config.ts - Hybrid rendering
export default defineNuxtConfig({
  routeRules: {
    // Static pages - pre-rendered at build
    '/': { prerender: true },
    '/about': { prerender: true },
    '/pricing': { prerender: true },
    '/blog/**': { prerender: true },

    // Dynamic app sections - client-side only
    '/dashboard/**': { ssr: false },
    '/app/**': { ssr: false },

    // API routes - server-side
    '/api/**': { cors: true }
  }
})
```

## Manual SSR with Vue (without Nuxt)

```javascript
// server.js - Express with Vue SSR
import express from 'express'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'

const app = express()

app.get('*', async (req, res) => {
  const vueApp = createSSRApp(App)
  const html = await renderToString(vueApp)

  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>My App</title></head>
      <body>
        <div id="app">${html}</div>
        <script type="module" src="/client.js"></script>
      </body>
    </html>
  `)
})
```

## Performance Impact

| Approach | Time to First Byte | LCP | JavaScript Required |
|----------|-------------------|-----|---------------------|
| Client SPA | Fast | Slow (waits for JS) | Yes, before content |
| SSR | Slower | Fast (HTML ready) | No, for initial view |
| SSG | Fast (CDN) | Fast (HTML ready) | No, for initial view |

## When Client-Side SPA Is Acceptable

- Internal tools and dashboards (users expect loading)
- Authenticated applications (initial load happens once)
- Real-time collaborative apps (WebSocket-heavy)
- PWAs where offline-first is the priority
- Complex interactive applications (Figma-like)

## Static Site Generation with Vite

```javascript
// vite.config.js - Using vite-ssg for SSG
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  ssgOptions: {
    script: 'async',
    formatting: 'minify'
  }
})
```

## Reference
- [Vue.js Performance - Page Load Optimizations](https://vuejs.org/guide/best-practices/performance.html#page-load-optimizations)
- [Vue.js SSR Guide](https://vuejs.org/guide/scaling-up/ssr.html)
- [Nuxt.js Documentation](https://nuxt.com/)
