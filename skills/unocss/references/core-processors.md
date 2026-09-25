---
name: unocss-processors
description: Transform generated CSS layers after generation
---

# Processors

Processors are hooks that transform generated CSS. Unlike transformers (which modify source code *before* extraction), processors run *after* UnoCSS has generated its CSS layers.

## Define a Processor

A processor receives the CSS for one layer and returns the CSS that replaces it. Sync or async results are supported.

```ts
import type { CSSProcessor } from '@unocss/core'
import { defineConfig } from 'unocss'

const banner: CSSProcessor = {
  name: 'add-banner',
  order: 10,
  process(css, { layer, envMode }) {
    if (envMode !== 'build')
      return css
    return `/* generated layer: ${layer} */\n${css}`
  },
}

export default defineConfig({
  processors: [banner],
})
```

## Processing Flow

For every non-empty CSS layer:

1. Generate the raw layer CSS (preflights + any CSS layer wrapper/marker).
2. Sort processors by `order` ascending (default `0`; lower runs first).
3. Pass the layer through each processor sequentially — one's output feeds the next.
4. Cache the processed layer, exposed via `getLayer()`, `getLayers()`, and `css`.

Layers may be processed concurrently, so processors must not rely on mutable state shared across layers. When `setLayer()` changes a layer, its callback gets the raw unprocessed CSS and UnoCSS re-runs the full chain (prevents double-processing). A thrown error fails generation.

## Context

```ts
interface CSSProcessorContext<Theme extends object = object> {
  layer: string           // current generated layer name
  theme: Theme            // resolved UnoCSS theme
  envMode: 'dev' | 'build'
}
```

Processors from presets and user config are merged; the processor `name` dedups duplicates.

## Lightning CSS Processor

`@unocss/processor-lightningcss` runs each layer through [Lightning CSS](https://lightningcss.dev/) to minify, compile modern syntax, and apply compatibility transforms for browser targets. Node.js only — outside Node it warns once and returns the CSS unchanged.

```ts
import processorLightningCSS from '@unocss/processor-lightningcss'
import { defineConfig } from 'unocss'

export default defineConfig({
  processors: [
    processorLightningCSS({
      targets: {
        chrome: 111 << 16,
        safari: 15 << 16,
      },
    }),
  ],
})
```

Accepts Lightning CSS `TransformOptions` except `code`/`filename` (UnoCSS supplies these per layer; the layer name becomes the filename, e.g. `utilities.css`).

- `minify` — defaults to on when `envMode` is `build`, off in `dev`; set explicitly to override.
- `targets` — controls which compatibility transforms are applied.

<!--
Source references:
- https://unocss.dev/config/processors
- https://unocss.dev/processors/lightningcss
-->
