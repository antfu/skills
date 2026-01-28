---
name: vite
description: Vite is a next-generation frontend build tool that provides a fast dev server with HMR and optimized production builds
metadata:
  author: Anthony Fu
  version: "2026.1.28"
  source: Generated from https://github.com/vitejs/vite, scripts located at https://github.com/antfu/skills
---

Vite is a modern build tool for frontend development featuring instant server start with native ES modules, lightning-fast HMR, and optimized production builds using Rolldown/Rollup. It supports TypeScript, JSX, CSS pre-processors out of the box and has a rich plugin ecosystem.

## Core

| Topic | Description | Reference |
|-------|-------------|-----------|
| Configuration | Config file setup, defineConfig, conditional and async configs | [core-config](references/core-config.md) |
| CLI Commands | Dev server, build, preview commands and options | [core-cli](references/core-cli.md) |
| Core Features | TypeScript, JSX, CSS, HTML processing, JSON handling | [core-features](references/core-features.md) |
| Using Plugins | Adding, configuring, and ordering plugins | [core-plugins](references/core-plugins.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| CSS Handling | CSS modules, pre-processors, PostCSS, Lightning CSS | [features-css](references/features-css.md) |
| Static Assets | Asset imports, public directory, URL handling | [features-assets](references/features-assets.md) |
| Glob Import | import.meta.glob, dynamic imports, batch loading | [features-glob-import](references/features-glob-import.md) |
| Environment Variables | .env files, modes, import.meta.env constants | [features-env](references/features-env.md) |
| HMR API | Hot Module Replacement client API | [features-hmr](references/features-hmr.md) |
| Web Workers | Worker imports and configuration | [features-workers](references/features-workers.md) |
| Dependency Pre-Bundling | optimizeDeps, caching, monorepo setup | [features-dep-bundling](references/features-dep-bundling.md) |

## Build

| Topic | Description | Reference |
|-------|-------------|-----------|
| Production Build | Build options, browser targets, multi-page apps | [build-production](references/build-production.md) |
| Library Mode | Building libraries with proper package exports | [build-library](references/build-library.md) |
| SSR | Server-side rendering setup and configuration | [build-ssr](references/build-ssr.md) |

## Advanced

| Topic | Description | Reference |
|-------|-------------|-----------|
| JavaScript API | createServer, build, preview programmatic APIs | [advanced-api](references/advanced-api.md) |
| Plugin API | Creating Vite plugins, hooks, virtual modules | [advanced-plugin-api](references/advanced-plugin-api.md) |
| Performance | Optimization tips for dev server and builds | [advanced-performance](references/advanced-performance.md) |
| Backend Integration | Integrating Vite with traditional backends | [advanced-backend](references/advanced-backend.md) |
