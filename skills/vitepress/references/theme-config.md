---
name: vitepress-theme-configuration
description: Default theme configuration for navigation, sidebar, search, social links, and footer
---

# Theme Configuration

Configure the default theme via `themeConfig` in your VitePress config.

## Navigation

```ts
export default {
  themeConfig: {
    // Site title in nav (overrides config.title)
    siteTitle: 'My Docs',
    siteTitle: false,  // Hide title
    
    // Logo
    logo: '/logo.svg',
    logo: { light: '/light-logo.svg', dark: '/dark-logo.svg', alt: 'Logo' },
    
    // Nav links
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/...' }
    ]
  }
}
```

### Dropdown Menu

```ts
nav: [
  {
    text: 'Dropdown',
    items: [
      { text: 'Item A', link: '/item-a' },
      { text: 'Item B', link: '/item-b' }
    ]
  },
  // With sections
  {
    text: 'Versions',
    items: [
      {
        text: 'v2.x',
        items: [
          { text: 'v2.0', link: '/v2/' },
          { text: 'v2.1', link: '/v2.1/' }
        ]
      }
    ]
  }
]
```

### Active Match

Control when nav item shows as active:

```ts
nav: [
  {
    text: 'Guide',
    link: '/guide/',
    activeMatch: '/guide/'  // Regex pattern
  }
]
```

## Sidebar

### Simple Sidebar

```ts
sidebar: [
  {
    text: 'Guide',
    items: [
      { text: 'Introduction', link: '/guide/' },
      { text: 'Getting Started', link: '/guide/getting-started' }
    ]
  }
]
```

### Multiple Sidebars

Different sidebar per section:

```ts
sidebar: {
  '/guide/': [
    {
      text: 'Guide',
      items: [
        { text: 'Introduction', link: '/guide/' },
        { text: 'Getting Started', link: '/guide/getting-started' }
      ]
    }
  ],
  '/api/': [
    {
      text: 'API Reference',
      items: [
        { text: 'Config', link: '/api/config' },
        { text: 'Methods', link: '/api/methods' }
      ]
    }
  ]
}
```

### Collapsible Groups

```ts
sidebar: [
  {
    text: 'Section A',
    collapsed: false,  // Open by default, can collapse
    items: [...]
  },
  {
    text: 'Section B',
    collapsed: true,   // Collapsed by default
    items: [...]
  }
]
```

### Base Path

Simplify links with common base. `base` works at the root of a sidebar section
and inside nested groups (a nested `base` overrides the parent prefix):

```ts
sidebar: {
  '/guide/': {
    base: '/guide/',
    items: [
      { text: 'Intro', link: 'intro' },        // /guide/intro
      { text: 'Setup', link: 'getting-started' } // /guide/getting-started
    ]
  }
}
```

```ts
sidebar: [
  {
    text: 'Reference',
    base: '/reference/',
    items: [
      { text: 'Site Config', link: 'site-config' }, // /reference/site-config
      {
        text: 'Default Theme',
        base: '/reference/default-theme-', // overrides parent base
        items: [
          { text: 'Nav', link: 'nav' } // /reference/default-theme-nav
        ]
      }
    ]
  }
]
```

## Search

### Local Search

```ts
themeConfig: {
  search: {
    provider: 'local'
  }
}
```

With options:

```ts
search: {
  provider: 'local',
  options: {
    miniSearch: {
      searchOptions: {
        fuzzy: 0.2,
        prefix: true
      }
    }
  }
}
```

### Algolia DocSearch

```ts
search: {
  provider: 'algolia',
  options: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_API_KEY',
    indexName: 'YOUR_INDEX_NAME'
  }
}
```

## Social Links

```ts
socialLinks: [
  { icon: 'github', link: 'https://github.com/...' },
  { icon: 'twitter', link: 'https://twitter.com/...' },
  { icon: 'discord', link: '/community', target: '_self' }, // v2: `target`
  // v2: any iconify collection installed as `collection:name`
  { icon: 'lucide:rss', link: '/feed.rss' },
  // Custom SVG
  {
    icon: { svg: '<svg>...</svg>' },
    link: 'https://...',
    ariaLabel: 'Custom Link'
  }
]
```

## Footer

```ts
footer: {
  message: 'Released under the MIT License.',
  copyright: 'Copyright © 2024 My Project'
}
```

Footer only displays on pages without sidebar.

## Edit Link

```ts
editLink: {
  pattern: 'https://github.com/org/repo/edit/main/docs/:path',
  text: 'Edit this page on GitHub'
}
```

`:path` is replaced with the page's source file path.

## Last Updated

Enable in site config:

```ts
export default {
  lastUpdated: true  // Get timestamp from git
}
```

Customize display:

```ts
themeConfig: {
  lastUpdated: {
    text: 'Updated at',
    formatOptions: {
      dateStyle: 'full',
      timeStyle: 'medium'
    }
  }
}
```

## Outline (Table of Contents)

```ts
outline: {
  level: [2, 3],      // Which heading levels to show
  label: 'On this page'
}
```

Or just the level:

```ts
outline: 'deep'  // Same as [2, 6]
outline: 2       // Only h2
outline: [2, 4]  // h2 through h4
```

## Doc Footer Navigation

```ts
docFooter: {
  prev: 'Previous page',
  next: 'Next page'
}
// Or disable:
docFooter: {
  prev: false,
  next: false
}
```

## External Link Icon

```ts
externalLinkIcon: true  // Show icon on external links
```

## Graded Containers (v2)

```ts
gradedContainers: true // danger red, warning orange, caution yellow
```

Colors custom containers, GitHub-flavored alerts, and badges on a graded
severity scale. Default (`false`) matches GitHub (caution shares danger's red).

## i18n Routing (v2)

`i18nRouting` accepts a boolean, or a function to customize the locale link:

```ts
i18nRouting(data, route, targetLocale) {
  const target = data.site.value.locales[targetLocale]
  const link = target.link || (targetLocale === 'root' ? '/' : `/${targetLocale}/`)
  return `${link}${route.data.relativePath.replace(/\.md$/, '')}${route.hash}`
}
```

## Carbon Ads

```ts
carbonAds: {
  code: 'your-carbon-code',
  placement: 'your-carbon-placement',
  format: 'classic' // v2: 'classic' | 'responsive' | 'cover'
}
```

## Appearance & Accessible Labels

```ts
darkModeSwitchLabel: 'Appearance',
lightModeSwitchTitle: 'Switch to light theme',
darkModeSwitchTitle: 'Switch to dark theme',
sidebarMenuLabel: 'Menu',
returnToTopLabel: 'Return to top',
// v2 navigation landmark labels:
navMenuLabel: 'Main Navigation',   // navbar/mobile menu landmarks
mobileMenuLabel: 'Menu',           // hamburger button aria-label
extraMenuLabel: 'More options'     // `⋯` overflow menu button aria-label
```

## Key Points

- `nav` defines top navigation links
- `sidebar` can be array (single) or object (multiple sidebars)
- Use `collapsed` for collapsible sidebar sections
- Local search works out of the box
- `editLink.pattern` uses `:path` placeholder
- Enable `lastUpdated` in site config, customize in themeConfig
- v2: social links accept `target` and iconify `collection:name` icons; sidebar `base` works in nested groups; `gradedContainers` and `i18nRouting` functions are new

<!--
Source references:
- https://vitepress.dev/reference/default-theme-config
- https://vitepress.dev/reference/default-theme-nav
- https://vitepress.dev/reference/default-theme-sidebar
- https://vitepress.dev/reference/default-theme-search
-->
