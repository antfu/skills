---
name: vitepress-internationalization
description: Setting up multi-language sites with locale configuration and RTL support
---

# Internationalization

VitePress supports multi-language sites through locale configuration.

## Directory Structure

Organize content by locale:

```
docs/
├─ en/
│  ├─ guide.md
│  └─ index.md
├─ zh/
│  ├─ guide.md
│  └─ index.md
└─ fr/
   ├─ guide.md
   └─ index.md
```

Or with root as default language:

```
docs/
├─ guide.md        # English (root)
├─ index.md
├─ zh/
│  ├─ guide.md
│  └─ index.md
└─ fr/
   ├─ guide.md
   └─ index.md
```

## Configuration

```ts
// .vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/'
    },
    fr: {
      label: 'Français',
      lang: 'fr',
      link: '/fr/'
    }
  }
})
```

## Locale-Specific Config

Override site config per locale:

```ts
locales: {
  root: {
    label: 'English',
    lang: 'en',
    title: 'My Docs',
    description: 'Documentation site',
    themeConfig: {
      nav: [
        { text: 'Guide', link: '/guide/' }
      ],
      sidebar: {
        '/guide/': [
          { text: 'Introduction', link: '/guide/' }
        ]
      }
    }
  },
  zh: {
    label: '简体中文',
    lang: 'zh-CN',
    link: '/zh/',
    title: '我的文档',
    description: '文档站点',
    themeConfig: {
      nav: [
        { text: '指南', link: '/zh/guide/' }
      ],
      sidebar: {
        '/zh/guide/': [
          { text: '介绍', link: '/zh/guide/' }
        ]
      }
    }
  }
}
```

## Locale-Specific Properties

Each locale can override:

```ts
interface LocaleSpecificConfig {
  lang?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  title?: string
  titleTemplate?: string | boolean
  description?: string
  head?: HeadConfig[]       // Merged with existing
  themeConfig?: ThemeConfig // Shallow merged
}
```

## Search i18n

### Local Search

```ts
themeConfig: {
  search: {
    provider: 'local',
    options: {
      locales: {
        zh: {
          translations: {
            button: {
              buttonText: '搜索',
              buttonAriaLabel: '搜索'
            },
            modal: {
              noResultsText: '没有结果',
              resetButtonTitle: '重置搜索',
              footer: {
                selectText: '选择',
                navigateText: '导航',
                closeText: '关闭'
              }
            }
          }
        }
      }
    }
  }
}
```

### Algolia Search

```ts
themeConfig: {
  search: {
    provider: 'algolia',
    options: {
      appId: '...',
      apiKey: '...',
      indexName: '...',
      locales: {
        zh: {
          placeholder: '搜索文档',
          translations: {
            button: { buttonText: '搜索文档' }
          }
        }
      }
    }
  }
}
```

## Separate Locale Directories

For fully separated locales without root fallback:

```
docs/
├─ en/
│  └─ index.md
├─ zh/
│  └─ index.md
└─ fr/
   └─ index.md
```

Requires server redirect for `/` → `/en/`. Netlify example:

```
/* /en/:splat 302 Language=en
/* /zh/:splat 302 Language=zh
/* /en/:splat 302
```

## Persisting Language Choice

Set cookie on language change:

```vue
<!-- .vitepress/theme/Layout.vue -->
<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData, inBrowser } from 'vitepress'
import { watchEffect } from 'vue'

const { lang } = useData()

watchEffect(() => {
  if (inBrowser) {
    document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2030 00:00:00 UTC; path=/`
  }
})
</script>

<template>
  <DefaultTheme.Layout />
</template>
```

## Per-locale Markdown Strings (v2)

Override renderer-baked strings (custom container / GitHub-alert default titles,
code copy button text) per locale via the `markdown` key. Values fall back to the
root `markdown` options. Must live in the main config (the renderer is created
once for the whole site); registering new containers per-locale is unsupported.

```ts
locales: {
  root: { label: 'English', lang: 'en' },
  zh: {
    label: '简体中文',
    lang: 'zh-Hans',
    markdown: {
      container: { tipLabel: '提示', warningLabel: '警告' },
      codeCopyButton: { tooltipText: '复制代码', copiedText: '已复制' }
    }
  }
}
```

## Custom Locale Link (i18nRouting) (v2)

Set `themeConfig.i18nRouting` to a function to customize the target link when
switching locale (see theme-config).

## RTL Support (v2)

Native, no longer experimental. Set `dir: 'rtl'` (site-wide, per-locale, or per
page via frontmatter). The default theme uses CSS logical properties, so layout,
nav, and directional icons mirror automatically — **do not** add an RTLCSS
PostCSS plugin (it would double-flip). Code blocks stay LTR.

```ts
locales: {
  ar: { label: 'العربية', lang: 'ar', dir: 'rtl' }
}
```

For your own styles, prefer logical properties (`margin-inline-start`) and mirror
custom directional icons:

```css
[dir='rtl'] .my-arrow-icon { scale: -1 1; }
```

## Organizing Config

Split config into separate files:

```
.vitepress/
├─ config/
│  ├─ index.ts      # Main config, merges locales
│  ├─ en.ts         # English config
│  ├─ zh.ts         # Chinese config
│  └─ shared.ts     # Shared config
```

```ts
// .vitepress/config/index.ts
import { defineConfig } from 'vitepress'
import { shared } from './shared'
import { en } from './en'
import { zh } from './zh'

export default defineConfig({
  ...shared,
  locales: {
    root: { label: 'English', ...en },
    zh: { label: '简体中文', ...zh }
  }
})
```

## Key Points

- Use `locales` object in config with `root` for default language
- Each locale can override title, description, and themeConfig
- `themeConfig` is shallow merged (define complete nav/sidebar per locale)
- Don't override `themeConfig.algolia` at locale level
- v2: `dir: 'rtl'` enables native RTL (CSS logical properties) — no PostCSS plugin
- v2: override renderer strings per locale via the `markdown` key; customize the switch link via `i18nRouting` function
- Language switcher appears automatically in nav

<!--
Source references:
- https://vitepress.dev/guide/i18n
-->
