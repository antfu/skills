---
name: features-assets
description: Static asset handling in Vite including imports, public directory, and URL handling
---

# Static Asset Handling

## Importing Assets as URL

```ts
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
// Dev: /src/img.png
// Build: /assets/img.2d8efhg.png
```

Common image, media, and font types are detected automatically.

## Import Queries

### Explicit URL Import

```ts
import workletURL from './worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Import as String (Raw)

```ts
import shaderString from './shader.glsl?raw'
```

### Control Inlining

```ts
import imgUrl1 from './img.svg?no-inline'  // Never inline
import imgUrl2 from './img.png?inline'      // Always inline as base64
```

## Asset Inlining

Assets smaller than `assetsInlineLimit` (default 4KB) are inlined as base64:

```ts
export default defineConfig({
  build: {
    assetsInlineLimit: 4096,  // 4KB
    // Or use callback for fine control
    assetsInlineLimit: (filePath) => {
      return !filePath.endsWith('.svg')
    }
  }
})
```

## The `public` Directory

Files in `public/` are:
- Served at root path `/` during dev
- Copied as-is to `dist/` root during build
- Not processed or hashed

```
public/
  favicon.ico  → /favicon.ico
  robots.txt   → /robots.txt
```

Reference with absolute paths in source:

```html
<img src="/icon.png" />
```

Configure directory:

```ts
export default defineConfig({
  publicDir: 'static'  // or false to disable
})
```

## Extending Asset Types

```ts
export default defineConfig({
  assetsInclude: ['**/*.gltf', '**/*.hdr']
})
```

## Dynamic URLs with import.meta.url

```ts
// Works natively in modern browsers
const imgUrl = new URL('./img.png', import.meta.url).href

// Dynamic pattern (limited)
function getImageUrl(name) {
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

**Limitations:**
- URL string must be static for build analysis
- Does not work with SSR (different semantics in Node.js vs browser)

## TypeScript Support

Add `vite/client` to types for asset import recognition:

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

## URL Handling in CSS

```css
.hero {
  background: url('./img.png');  /* Processed and rebased */
}
```

For dynamically constructed SVG URLs:

```ts
import imgUrl from './img.svg'
element.style.background = `url("${imgUrl}")`  // Note double quotes
```

<!-- 
Source references:
- https://vite.dev/guide/assets.html
-->
