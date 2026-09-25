# Skills Generator

Generate [Agent Skills](https://agentskills.io/home) from project documentation.

PLEASE STRICTLY FOLLOW THE BEST PRACTICES FOR SKILL: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

- Focus on agents capabilities and practical usage patterns.
- Ignore user-facing guides, introductions, get-started, install guides, etc.
- Ignore content that LLM agents already confident about in their training data.
- Make the skill as concise as possible, avoid creating too many references.

## Skill Source Types

There are two types of skill sources. The project lists are defined in `meta.ts`:

### Type 1: Generated Skills (`sources/`)

For OSS projects **without existing skills**. We clone the repo as a submodule and generate skills from their documentation.

- **Projects:** Vue, Nuxt, Vite, UnoCSS
- **Workflow:** Read docs → Understand → Generate skills
- **Source:** `sources/{project}/docs/`

### Type 2: Hand-written Skills

For skills that are written by Anthony Fu with his preferences, experience, tastes and best practices.

You don't need to do anything about them unless being asked.

## Repository Structure

```
.
├── meta.ts                     # Project metadata (repos & URLs)
├── instructions/               # Instructions for generating skills
│   └── {project}.md            # Instructions for generating skills for {project}
│
├── sources/                    # Type 1: OSS repos (generate from docs)
│   └── {project}/
│       └── docs/               # Read documentation from here
│
└── skills/                     # Output directory
    └── {output-name}/
        ├── SKILL.md           # Index of all skills
        ├── GENERATION.md       # Tracking metadata (for generated skills)
        └── references/
            └── *.md            # Individual skill files
```

**Important:** For Type 1 (generated), the `skills/{project}/` name must match `sources/{project}/`.

## Workflows

### For Generated Skills

#### Adding a New Project

1. **Add entry to `meta.ts`** in the `submodules` object:
   ```ts
   export const submodules = {
     // ... existing entries
     'new-project': 'https://github.com/org/repo',
   }
   ```

2. **Run sync script** to clone the submodule:
   ```bash
   nr start init -y
   ```
   This will clone the repository to `sources/{project}/`

3. **Follow the generation guide** below to create the skills

#### General Instructions for Generation

- Focus on agents capabilities and practical usage patterns. For user-facing guides, introductions, get-started, or common knowledge that LLM agents already know, you can skip those content.
- Categorize each references into `core`, `features`, `best-practices`, `advanced`, etc categories, and prefix the reference file name with the category. For each feature field, feel free to create more categories if needed to better organize the content.

#### Creating New Skills

- **Read** source docs from `sources/{project}/docs/`
- **Read** the instructions in `instructions/{project}.md` for specific generation instructions if exists
- **Understand** the documentation thoroughly
- **Create** skill files in `skills/{project}/references/`
- **Create** `SKILL.md` index listing all skills
- **Create** `GENERATION.md` with the source git SHA

#### Updating Generated Skills

1. **Check** git diff since the SHA recorded in `GENERATION.md`:
   ```bash
   cd sources/{project}
   git diff {old-sha}..HEAD -- docs/
   ```
2. **Update** affected skill files based on changes
3. **Update** `SKILL.md` with the new version of the tool/project and skills table.
4. **Update** `GENERATION.md` with new SHA

## File Formats

### `SKILL.md`

Index file listing all skills with brief descriptions. Name should be in `kebab-case`.

The version should be the date of the last sync.

Also record the version of the tool/project when the skills were generated.

```markdown
---
name: {name}
description: {description}
metadata:
  author: Anthony Fu
  version: "2026.1.1"
  source: Generated from {source-url}, scripts located at https://github.com/antfu/skills
---

> The skill is based on {project} v{version}, generated at {date}.

// Some concise summary/context/introduction of the project

## Core References

| Topic | Description | Reference |
|-------|-------------|-----------|
| Markdown Syntax | Slide separators, frontmatter, notes, code blocks | [core-syntax](references/core-syntax.md) |
| Animations | v-click, v-clicks, motion, transitions | [core-animations](references/core-animations.md) |
| Headmatter | Deck-wide configuration options | [core-headmatter](references/core-headmatter.md) |

## Features

### Feature a

| Topic | Description | Reference |
|-------|-------------|-----------|
| Feature A Editor | Description of feature a | [feature-a](references/feature-a-foo.md) |
| Feature A Preview | Description of feature b | [feature-b](references/feature-a-bar.md) |

### Feature b

| Topic | Description | Reference |
|-------|-------------|-----------|
| Feature B | Description of feature b | [feature-b](references/feature-b-bar.md) |

// ...
```

### `GENERATION.md`

Tracking metadata for generated skills:

```markdown
# Generation Info

- **Source:** `sources/{project}`
- **Git SHA:** `abc123def456...`
- **Generated:** 2024-01-15
```

### `references/*.md`

Individual skill files. One concept per file.

At the end of the file, include the reference links to the source documentation.

```markdown
---
name: {name}
description: {description}
---

# {Concept Name}

Brief description of what this skill covers.

## Usage

Code examples and practical patterns.

## Key Points

- Important detail 1
- Important detail 2

<!--
Source references:
- {source-url}
- {source-url}
- {source-url}
-->
```

## Writing Guidelines

When generating skills:

1. **Rewrite for agents** - Don't copy docs verbatim; synthesize for LLM consumption
2. **Be practical** - Focus on usage patterns and code examples
3. **Be concise** - Remove fluff, keep essential information
4. **One concept per file** - Split large topics into separate skill files
5. **Include code** - Always provide working code examples
6. **Explain why** - Not just how to use, but when and why

## Supported Projects

See `meta.ts` for the canonical list of projects and their repository URLs.
