# Anthony Fu's Skills

A curated collection of [Agent Skills](https://agentskills.io/home) reflecting [Anthony Fu](https://github.com/antfu)'s preferences, experience, and best practices, along with usage documentation for the tools.

> [!IMPORTANT]
> This is a proof-of-concept project for generating agent skills from source documentation and keeping them in sync.
> I haven't fully tested how well the skills perform in practice, so feedback and contributions are greatly welcome.

## Installation

```bash
pnpx skills add antfu/skills --skill='*'
```

or to install all of them globally:

```bash
pnpx skills add antfu/skills --skill='*' -g
```

Learn more about the CLI usage at [skills](https://github.com/vercel-labs/skills).

## Skills

This collection is aim to be a one-stop collection of you are mainly working on Vite/Nuxt. It includes skills from different sources with different scopes.

### Hand-maintained Skills

> Opinionated

Manually maintained by Anthony Fu with his preferred tools, setup conventions, and best practices.

| Skill | Description |
|-------|-------------|
| [antfu](skills/antfu) | Anthony Fu's preferences and best practices for app/library projects (eslint, pnpm, vitest, vue, etc.) |

### Skills Generated from Official Documentation

> Unopinionated but with tilted focus (e.g. TypeScript, ESM, Composition API, and other modern stacks)

Generated from official documentation and fine-tuned by Anthony.

| Skill | Description | Source |
|-------|-------------|--------|
| [vue](skills/vue) | Vue.js core - reactivity, components, composition API | [vuejs/docs](https://github.com/vuejs/docs) |
| [nuxt](skills/nuxt) | Nuxt framework - file-based routing, server routes, modules | [nuxt/nuxt](https://github.com/nuxt/nuxt) |
| [pinia](skills/pinia) | Pinia - intuitive, type-safe state management for Vue | [vuejs/pinia](https://github.com/vuejs/pinia) |
| [vite](skills/vite) | Vite build tool - config, plugins, SSR, library mode | [vitejs/vite](https://github.com/vitejs/vite) |
| [vitepress](skills/vitepress) | VitePress - static site generator powered by Vite | [vuejs/vitepress](https://github.com/vuejs/vitepress) |
| [vitest](skills/vitest) | Vitest - unit testing framework powered by Vite | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) |
| [unocss](skills/unocss) | UnoCSS - atomic CSS engine, presets, transformers | [unocss/unocss](https://github.com/unocss/unocss) |
| [pnpm](skills/pnpm) | pnpm - fast, disk space efficient package manager | [pnpm/pnpm.io](https://github.com/pnpm/pnpm.io) |

### Vendored Skills

Synced from external repositories that maintain their own skills.

| Skill | Description | Source |
|-------|-------------|--------|
| [slidev](skills/slidev) (Official) | Slidev - presentation slides for developers | [slidevjs/slidev](https://github.com/slidevjs/slidev) |
| [tsdown](skills/tsdown) (Official) | tsdown - TypeScript library bundler powered by Rolldown | [rolldown/tsdown](https://github.com/rolldown/tsdown) |
| [turborepo](skills/turborepo) (Official) | Turborepo - high-performance build system for monorepos | [vercel/turborepo](https://github.com/vercel/turborepo) |
| [vueuse-functions](skills/vueuse-functions) (Official) | VueUse - 200+ Vue composition utilities | [vueuse/skills](https://github.com/vueuse/skills) |
| [vue-best-practices](skills/vue-best-practices) | Vue 3 + TypeScript best practices | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [vue-router-best-practices](skills/vue-router-best-practices) | Vue Router best practices | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [vue-testing-best-practices](skills/vue-testing-best-practices) | Vue testing best practices | [vuejs-ai/skills](https://github.com/vuejs-ai/skills) |
| [web-design-guidelines](skills/web-design-guidelines) | Web design guidelines for building beautiful interfaces | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |

## FAQ

### What Makes This Collection Different?

This collection is opinionated, but the key difference is that it uses git submodules to directly reference source documentation. This provides more reliable context and allows the skills to stay up-to-date with upstream changes over time. If you primarily work with Vue/Vite/Nuxt, this aims to be a comprehensive one-stop collection.

The project is also designed to be flexible - you can use it as a template to generate your own skills collection.

### Skills vs llms.txt vs AGENTS.md

To me, the value of skills lies in being **shareable** and **on-demand**.

Being shareable makes prompts easier to manage and reuse across projects. Being on-demand means skills can be pulled in as needed, scaling far beyond what any agent's context window could fit at once.

You might hear people say "AGENTS.md outperforms skills". I think that's true — AGENTS.md loads everything upfront, so agents always respect it, whereas skills can have false negatives where agents don't pull them in when you'd expect. That said, I see this more as a gap in tooling and integration that will improve over time. Skills are really just a standardized format for agents to consume—plain markdown files at the end of the day. Think of them as a knowledge base for agents. If you want certain skills to always apply, you can reference them directly in your AGENTS.md.

## Generate Your Own Skills

Fork this project to create your own customized skill collection.

1. Fork or clone this repository
2. Install dependencies: `pnpm install`
3. Update `meta.ts` with your own projects and skill sources
4. Run `pnpm start cleanup` to remove existing submodules and skills
5. Run `pnpm start init` to clone the submodules
6. Run `pnpm start sync` to sync vendored skills
7. Ask your agent to `Generate skills for \<project\>` (recommended one at a time to manage token usage)

See [AGENTS.md](AGENTS.md) for detailed generation guidelines.

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

Skills and the scripts in this repository are [MIT](LICENSE.md) licensed.

Vendored skills from external repositories retain their original licenses - see each skill directory for details.
