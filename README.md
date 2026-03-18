# Anthony Fu's Skills 🛠️

> A curated collection of [Agent Skills](https://agentskills.io/home) for modern web development with Vue, Vite, and Nuxt.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Skills](https://img.shields.io/badge/skills-18+-green.svg)](skills/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange.svg)](https://pnpm.io/)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Available Skills](#available-skills)
- [Usage Examples](#usage-examples)
- [Generate Your Own Skills](#generate-your-own-skills)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Anthony Fu's Skills** is a proof-of-concept collection demonstrating how to generate and maintain agent skills from source documentation. This collection reflects [Anthony Fu](https://github.com/antfu)'s preferences, experience, and best practices for modern web development.

### What Are Agent Skills?

Agent Skills are structured knowledge bases that AI agents can pull on-demand to understand tools, frameworks, and best practices. Think of them as a standardized format for teaching agents about your tech stack.

### Why This Collection?

- ✅ **Opinionated**: Curated by Anthony Fu with modern best practices
- ✅ **Up-to-date**: Uses git submodules to sync with source documentation
- ✅ **Comprehensive**: One-stop collection for Vue/Vite/Nuxt development
- ✅ **Shareable**: Easy to install and reuse across projects
- ✅ **On-demand**: Load only what you need, when you need it

---

## 🚀 Quick Start

### Install All Skills Globally

```bash
pnpx skills add antfu/skills --skill='*' -g
```

### Install Specific Skills

```bash
# Install Vue and Vite skills
pnpx skills add antfu/skills --skill='vue,vite'

# Install only Anthony's preferences
pnpx skills add antfu/skills --skill='antfu'
```

### Use in Your Project

```bash
# Install for current project
pnpx skills add antfu/skills --skill='*'

# Your AI agent can now access these skills
```

---

## 📦 Installation

### Prerequisites

- **Node.js 18+**
- **pnpm** (recommended) or npm
- **AI Agent** that supports Agent Skills (e.g., Claude, Cursor, Windsurf)

### Global Installation

Install all skills globally to use across all projects:

```bash
pnpx skills add antfu/skills --skill='*' -g
```

### Project-Specific Installation

Install skills for a specific project:

```bash
cd your-project
pnpx skills add antfu/skills --skill='vue,nuxt,vite'
```

### Verify Installation

```bash
pnpx skills list
```

You should see the installed skills listed.

---

## 📚 Available Skills

### 🎨 Hand-Maintained Skills

> Opinionated preferences and best practices

| Skill | Description | Use Case |
|-------|-------------|----------|
| [antfu](skills/antfu) | Anthony Fu's preferences for app/library projects | ESLint, pnpm, Vitest, Vue setup |

**Install:**
```bash
pnpx skills add antfu/skills --skill='antfu'
```

---

### 📖 Generated from Official Documentation

> Unopinionated but focused on modern stacks (TypeScript, ESM, Composition API)

| Skill | Description | Source |
|-------|-------------|--------|
| [vue](skills/vue) | Vue.js core - reactivity, components, Composition API | [vuejs/docs](https://github.com/vuejs/docs) |
| [nuxt](skills/nuxt) | Nuxt framework - file-based routing, server routes, modules | [nuxt/nuxt](https://github.com/nuxt/nuxt) |
| [pinia](skills/pinia) | Pinia - type-safe state management for Vue | [vuejs/pinia](https://github.com/vuejs/pinia) |
| [vite](skills/vite) | Vite build tool - config, plugins, SSR, library mode | [vitejs/vite](https://github.com/vitejs/vite) |
| [vitepress](skills/vitepress) | VitePress - static site generator powered by Vite | [vuejs/vitepress](https://github.com/vuejs/vitepress) |
| [vitest](skills/vitest) | Vitest - unit testing framework powered by Vite | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) |
| [unocss](skills/unocss) | UnoCSS - atomic CSS engine, presets, transformers | [unocss/unocss](https://github.com/unocss/unocss) |
| [pnpm](skills/pnpm) | pnpm - fast, disk space efficient package manager | [pnpm/pnpm.io](https://github.com/pnpm/pnpm.io) |

**Install Vue Stack:**
```bash
pnpx skills add antfu/skills --skill='vue,nuxt,pinia,vite'
```

**Install Testing Stack:**
```bash
pnpx skills add antfu/skills --skill='vitest'
```

---

### 🔗 Vendored Skills

> Synced from external repositories

| Skill | Description | Source |
|-------|-------------|--------|
| [slidev](skills/slidev) | Slidev - presentation slides for developers | [slidevjs/slidev](https://github.com/slidevjs/slidev) |
| [tsdown](skills/tsdown) | tsdown - TypeScript library bundler | [rolldown/tsdown](https://github.com/rolldown/tsdown) |
| [turborepo](skills/turborepo) | Turborepo - monorepo build system | [vercel/turborepo](https://github.com/vercel/turborepo) |
| [vueuse-functions](skills/vueuse-functions) | VueUse - 200+ Vue composition utilities | [vueuse/skills](https://github.com/vueuse/skills) |
| [vue-best-practices](skills/vue-best-practices) | Vue 3 + TypeScript best practices | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [vue-router-best-practices](skills/vue-router-best-practices) | Vue Router best practices | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [vue-testing-best-practices](skills/vue-testing-best-practices) | Vue testing best practices | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [web-design-guidelines](skills/web-design-guidelines) | Web design guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |

**Install Best Practices:**
```bash
pnpx skills add antfu/skills --skill='vue-best-practices,vue-router-best-practices'
```

---

## 💡 Usage Examples

### Example 1: Vue + Vite Project

```bash
# Install Vue and Vite skills
pnpx skills add antfu/skills --skill='vue,vite,antfu'

# Ask your AI agent:
# "Create a new Vue component using Composition API"
# "Set up Vite config for library mode"
# "Configure ESLint following Anthony Fu's preferences"
```

### Example 2: Nuxt Application

```bash
# Install Nuxt stack
pnpx skills add antfu/skills --skill='nuxt,pinia,unocss'

# Ask your AI agent:
# "Create a Nuxt page with server-side data fetching"
# "Set up Pinia store with TypeScript"
# "Configure UnoCSS with custom shortcuts"
```

### Example 3: Testing Setup

```bash
# Install testing skills
pnpx skills add antfu/skills --skill='vitest,vue-testing-best-practices'

# Ask your AI agent:
# "Write unit tests for this Vue component"
# "Set up Vitest with coverage reporting"
# "Create integration tests following best practices"
```

### Example 4: Monorepo Setup

```bash
# Install monorepo skills
pnpx skills add antfu/skills --skill='pnpm,turborepo'

# Ask your AI agent:
# "Set up a pnpm workspace"
# "Configure Turborepo for this monorepo"
# "Create shared packages structure"
```

---

## 🛠️ Generate Your Own Skills

Want to create your own skill collection? Fork this project!

### Step-by-Step Guide

#### 1. Fork or Clone

```bash
git clone https://github.com/antfu/skills.git my-skills
cd my-skills
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Customize Configuration

Edit `meta.ts` with your own projects and skill sources:

```typescript
export const meta = {
  name: 'my-skills',
  skills: [
    {
      name: 'my-framework',
      source: 'https://github.com/my-org/my-framework',
      // ...
    }
  ]
}
```

#### 4. Clean Existing Skills

```bash
pnpm start cleanup
```

#### 5. Initialize Submodules

```bash
pnpm start init
```

#### 6. Sync Vendored Skills

```bash
pnpm start sync
```

#### 7. Generate Skills

Ask your AI agent:

```
Generate skills for <project>
```

**Tip:** Generate one skill at a time to manage token usage.

### Detailed Generation Guidelines

See [AGENTS.md](AGENTS.md) for comprehensive generation guidelines.

---

## ❓ FAQ

### What Makes This Collection Different?

**Key Differences:**

1. **Git Submodules**: Direct references to source documentation for reliability
2. **Auto-Sync**: Skills stay up-to-date with upstream changes
3. **Opinionated**: Curated by Anthony Fu with modern best practices
4. **Comprehensive**: One-stop collection for Vue/Vite/Nuxt
5. **Template-Ready**: Easy to fork and customize

### Skills vs llms.txt vs AGENTS.md

**Skills:**
- ✅ Shareable across projects
- ✅ On-demand loading
- ✅ Scales beyond context window
- ⚠️ Can have false negatives (agent doesn't pull when needed)

**AGENTS.md:**
- ✅ Always loaded, always respected
- ✅ No false negatives
- ⚠️ Limited by context window

**Best Practice:** Use skills as a knowledge base, reference critical ones in AGENTS.md.

### How Do I Know Which Skills to Install?

**For Vue Projects:**
```bash
pnpx skills add antfu/skills --skill='vue,vite,antfu'
```

**For Nuxt Projects:**
```bash
pnpx skills add antfu/skills --skill='nuxt,pinia,unocss'
```

**For Library Development:**
```bash
pnpx skills add antfu/skills --skill='vite,vitest,tsdown'
```

**For Everything:**
```bash
pnpx skills add antfu/skills --skill='*' -g
```

### Can I Use This with Any AI Agent?

Yes! Skills work with any AI agent that supports the Agent Skills format:

- ✅ Claude (Anthropic)
- ✅ Cursor
- ✅ Windsurf
- ✅ Any agent using the skills CLI

### How Often Are Skills Updated?

Skills are synced with source documentation via git submodules. To update:

```bash
cd my-skills
git submodule update --remote
pnpm start sync
```

---

## 🤝 Contributing

Contributions are welcome! This is a proof-of-concept project, and feedback is greatly appreciated.

### How to Contribute

1. **Report Issues**: Found a problem? [Open an issue](https://github.com/antfu/skills/issues)
2. **Suggest Skills**: Have a skill to add? Open a discussion
3. **Improve Documentation**: Submit a PR with improvements
4. **Share Feedback**: How well do skills work for you?

### Contribution Areas

- 🐛 Bug fixes
- 📝 Documentation improvements
- 🎨 New skills
- 🔧 Generation scripts
- 📊 Usage examples

---

## 📄 License

**Skills and scripts**: [MIT](LICENSE.md) licensed

**Vendored skills**: Retain their original licenses (see each skill directory)

---

## 🙏 Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg' alt='Sponsors' />
  </a>
</p>

---

## 📚 Learn More

- **Agent Skills**: [agentskills.io](https://agentskills.io/home)
- **Skills CLI**: [vercel-labs/skills](https://github.com/vercel-labs/skills)
- **Anthony Fu**: [antfu.me](https://antfu.me)

---

**Made with ❤️ by [Anthony Fu](https://github.com/antfu)**

*Empowering AI agents with modern web development knowledge.*
