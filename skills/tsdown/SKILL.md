---
name: tsdown
description: tsdown is a fast and elegant TypeScript library bundler powered by Rolldown and Oxc
metadata:
  author: Anthony Fu
  version: "2026.1.28"
  source: Generated from https://github.com/rolldown/tsdown, scripts located at https://github.com/antfu/skills
---

tsdown is a next-generation TypeScript library bundler built on Rolldown and Oxc. It provides blazing-fast builds, automatic `.d.ts` generation, and seamless migration from tsup. Supports Rolldown/Rollup/Unplugin plugins and features smart dependency handling.

> This documentation is based on **tsdown v0.20.1**.

**Anthony's Preferences:**
- Build pure-ESM packages, avoid CJS
- Always enable `dts` option for type declarations
- Enable `exports` option for auto-generated package exports

## Core

| Topic | Description | Reference |
|-------|-------------|-----------|
| Configuration | Config file setup, defineConfig, multiple configs | [core-config](references/core-config.md) |
| CLI | Command-line interface and options | [core-cli](references/core-cli.md) |
| Entry Points | Entry files, aliases, glob patterns | [core-entry](references/core-entry.md) |

## Build Options

| Topic | Description | Reference |
|-------|-------------|-----------|
| Output | Format (ESM/CJS/IIFE/UMD), directory, target, platform | [options-output](references/options-output.md) |
| Declaration Files | .d.ts generation, isolatedDeclarations, sourcemaps | [options-dts](references/options-dts.md) |
| Dependencies | External, noExternal, dependency bundling | [options-dependencies](references/options-dependencies.md) |
| Package Exports | Auto-generating exports, main, module fields | [options-package-exports](references/options-package-exports.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| Optimization | Tree shaking, minification, sourcemaps | [features-optimization](references/features-optimization.md) |
| Shims | CJS/ESM compatibility shims | [features-shims](references/features-shims.md) |
| Unbundle Mode | Bundleless transpile-only builds | [features-unbundle](references/features-unbundle.md) |
| Watch Mode | Auto-rebuild on file changes | [features-watch](references/features-watch.md) |

## Advanced

| Topic | Description | Reference |
|-------|-------------|-----------|
| Plugins | Rolldown, Unplugin, Rollup, Vite plugins | [advanced-plugins](references/advanced-plugins.md) |
| Hooks | Build lifecycle hooks | [advanced-hooks](references/advanced-hooks.md) |
| Programmatic API | Using tsdown from code | [advanced-programmatic](references/advanced-programmatic.md) |
| Rolldown Options | Customizing inputOptions and outputOptions | [advanced-rolldown-options](references/advanced-rolldown-options.md) |

## Recipes

| Topic | Description | Reference |
|-------|-------------|-----------|
| Framework Support | Vue and React library bundling | [recipes-frameworks](references/recipes-frameworks.md) |
| Migration | Migrating from tsup | [recipes-migration](references/recipes-migration.md) |
