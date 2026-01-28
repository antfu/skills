# Anthony Fu's Skills

A curated collection of [agent skills](https://agentskills.io/home) reflecting [Anthony Fu](https://github.com/antfu)'s preferences, experience, and best practices, along with usage documentation for the tools.

> [!IMPORTANT]
> This is a proof-of-concept project for generating agent skills from source documentation and keeping them in sync.
> I haven't fully tested how well the skills perform in practice, so feedback and contributions are welcome.

## Installation

```bash
pnpx skills add antfu/skills --all
```

Learn more about CLI usage at [skills](https://github.com/vercel-labs/skills).

## Skills

When installing `antfu/skills`, all the following skills will be included (you can also select them in the CLI prompt).

### Hand-maintained Skills

Manually maintained by Anthony Fu with his preferred tools, setup conventions, and best practices.

| Skill | Description |
|-------|-------------|
| [antfu](skills/antfu) | Anthony Fu's preferences and best practices for app/library projects (eslint, pnpm, vitest, vue, etc.) |

### Skills Generated from Official Documentation

Generated from official documentation and fine-tuned by Anthony.

| Skill | Description | Source |
|-------|-------------|--------|
| [vue](skills/vue) | Vue.js core - reactivity, components, composition API | [vuejs/docs](https://github.com/vuejs/docs) |
| [nuxt](skills/nuxt) | Nuxt framework - file-based routing, server routes, modules | [nuxt/nuxt](https://github.com/nuxt/nuxt) |
| [vite](skills/vite) | Vite build tool - config, plugins, SSR, library mode | [vitejs/vite](https://github.com/vitejs/vite) |
| [vitepress](skills/vitepress) | VitePress - static site generator powered by Vite | [vuejs/vitepress](https://github.com/vuejs/vitepress) |
| [vitest](skills/vitest) | Vitest - unit testing framework powered by Vite | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) |
| [unocss](skills/unocss) | UnoCSS - atomic CSS engine, presets, transformers | [unocss/unocss](https://github.com/unocss/unocss) |
| [pnpm](skills/pnpm) | pnpm - fast, disk space efficient package manager | [pnpm/pnpm.io](https://github.com/pnpm/pnpm.io) |
| [tsdown](skills/tsdown) | tsdown - TypeScript library bundler powered by Rolldown | [rolldown/tsdown](https://github.com/rolldown/tsdown) |

### Skills Vendored

Synced from external repositories for convenient installation.

| Skill | Description | Source |
|-------|-------------|--------|
| [slidev](skills/slidev) | Slidev - presentation slides for developers | [slidevjs/slidev](https://github.com/slidevjs/slidev) (Official) |
| [vueuse](skills/vueuse) | VueUse - 200+ Vue composition utilities | [vueuse/skills](https://github.com/vueuse/skills) (Official) |
| [vue-best-practices](skills/vue-best-practices) | Vue 3 + TypeScript best practices for Volar | [hyf0/vue-skills](https://github.com/hyf0/vue-skills) |
| [turborepo](skills/turborepo) | Turborepo - high-performance build system for monorepos | [vercel/turborepo](https://github.com/vercel/turborepo) (Official) |
| [web-design-guidelines](skills/web-design-guidelines) | Web design guidelines for building beautiful interfaces | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |


## Use this Project to Generate Your Own Skills

If you want to generate your own skill sets like this, you can use this project as a template.

1. Fork or clone this repository
2. Install dependencies: `pnpm install`
3. Update `meta.ts` to add your own projects and skills.
4. Run `nr start cleanup` to remove the existing submodules and skills.
5. Run `nr start init` to clone the submodules.
6. Run `nr start sync` to sync the vendored skills.
7. Use your agent to ask "generate skills for <project>" to generate the skills. It's recommended to do it one-by-one as this might consume quite a lot of tokens.

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
