---
name: preset-web-fonts
description: Easy Google Fonts and other web fonts integration
---

# Preset Web Fonts

Easily use web fonts from Google Fonts and other providers.

## Installation

```ts
import { defineConfig, presetWebFonts, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Roboto',
        mono: 'Fira Code',
      },
    }),
  ],
})
```

## Providers

- `google` - Google Fonts (default)
- `bunny` - Privacy-friendly alternative
- `fontshare` - Quality fonts by ITF
- `fontsource` - Self-hosted open source fonts
- `coollabs` - Privacy-friendly drop-in replacement
- `none` - Treat as system font

## Font Configuration

```ts
fonts: {
  // Simple
  sans: 'Roboto',
  
  // Multiple (fallback)
  mono: ['Fira Code', 'Fira Mono:400,700'],
  
  // Detailed
  lato: [
    {
      name: 'Lato',
      weights: ['400', '700'],
      italic: true,
    },
    {
      name: 'sans-serif',
      provider: 'none',
    },
  ],
}
```

## Usage

```html
<p class="font-sans">Roboto</p>
<code class="font-mono">Fira Code</code>
```

## Local Fonts

Self-host fonts:

```ts
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'

presetWebFonts({
  provider: 'none',
  fonts: { sans: 'Roboto' },
  processors: createLocalFontProcessor({
    cacheDir: 'node_modules/.cache/unocss/fonts',
    fontAssetsDir: 'public/assets/fonts',
    fontServeBaseUrl: '/assets/fonts',
  })
})
```

### Emit Fonts to Build Output

In CI or a first build, fonts downloaded to `public` may not reach `dist` before the build finishes. Use the `onDownload` callback to collect fonts and emit them as Vite assets:

```ts
// vite.config.ts
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'

const emittedFonts = new Map()

export const fontProcessor = createLocalFontProcessor({
  onDownload(filename, buf) {
    emittedFonts.set(filename, buf)
  },
})

export default defineConfig({
  plugins: [
    UnoCSS(),
    {
      name: 'unocss:font-emit',
      apply: 'build',
      generateBundle() {
        for (const [filename, source] of emittedFonts)
          this.emitFile({ type: 'asset', fileName: `assets/fonts/${filename}`, source })
        emittedFonts.clear()
      },
    },
  ],
})
```

Then pass `fontProcessor` to `presetWebFonts({ processors: [fontProcessor] })` in `uno.config.ts`.

<!-- 
Source references:
- https://unocss.dev/presets/web-fonts
-->
