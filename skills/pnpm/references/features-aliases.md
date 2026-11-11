---
name: pnpm-aliases
description: Install packages under custom names for versioning, forks, or alternatives
---

# pnpm Aliases

pnpm supports package aliases using the `npm:` protocol. This lets you install packages under different names, use multiple versions of the same package, or substitute packages.

## Basic Syntax

```bash
pnpm add <alias>@npm:<package>@<version>
```

In `package.json`:
```json
{
  "dependencies": {
    "<alias>": "npm:<package>@<version>"
  }
}
```

Selector form: `<alias>@npm:<package>[@<version-or-tag>]`, scoped targets allowed (`pnpm add babel-core@npm:@babel/core@8.0.6`). The alias is the name written to `package.json`; `npm:` here is the package-alias protocol, not a named registry. To replace a package everywhere in the graph, use `overrides`.

## Use Cases

### Multiple Versions of Same Package

Install different versions side by side:

```json
{
  "dependencies": {
    "lodash3": "npm:lodash@3",
    "lodash4": "npm:lodash@4"
  }
}
```

Usage:
```js
import lodash3 from 'lodash3'
import lodash4 from 'lodash4'
```

### Replace Package with Fork

Substitute a package with a fork or alternative:

```json
{
  "dependencies": {
    "original-pkg": "npm:my-fork@^1.0.0"
  }
}
```

All imports of `original-pkg` will resolve to `my-fork`.

### Replace Deprecated Package

```json
{
  "dependencies": {
    "request": "npm:@cypress/request@^3.0.0"
  }
}
```

### Scoped to Unscoped (or vice versa)

```json
{
  "dependencies": {
    "vue": "npm:@anthropic/vue@^3.0.0",
    "@myorg/utils": "npm:lodash@^4.17.21"
  }
}
```

## CLI Usage

### Add with alias

```bash
# Add lodash under alias
pnpm add lodash4@npm:lodash@4

# Add fork as original name
pnpm add request@npm:@cypress/request
```

### Add multiple versions

```bash
pnpm add react17@npm:react@17 react18@npm:react@18
```

## With TypeScript

For type resolution with aliases, you may need to configure TypeScript:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "lodash3": ["node_modules/lodash3"],
      "lodash4": ["node_modules/lodash4"]
    }
  }
}
```

Or use `@types` packages with aliases:

```json
{
  "devDependencies": {
    "@types/lodash3": "npm:@types/lodash@3",
    "@types/lodash4": "npm:@types/lodash@4"
  }
}
```

## Combined with Overrides

Force all transitive dependencies to use an alias:

```yaml
# pnpm-workspace.yaml
overrides:
  "underscore": "npm:lodash@^4.17.21"
```

This replaces all `underscore` imports (including in dependencies) with lodash.

## Git and Local Aliases

Aliases work with any valid pnpm specifier:

```json
{
  "dependencies": {
    "my-fork": "npm:user/repo#commit",
    "local-pkg": "file:../local-package"
  }
}
```

## Registry Aliases (registries `prefix`)

Distinct from package aliases: a registry `prefix` selects *which registry* a package is fetched from. `namedRegistries` is deprecated (still read, only for prefixes `registries` does not declare); declare `prefix` in `registries` instead.

```yaml title="pnpm-workspace.yaml"
registries:
  https://npm.work.example.com/:
    prefix: work
    scopes: ["@corp"]   # optional: also route the scope here
```

```bash
pnpm add work:@corp/lib@^2.0.0   # resolves @corp/lib against the work registry
```

Built-in prefixes: `gh:` (GitHub Packages) and `npmjs:` (public npm, pins a dep to the public registry even when `registry` points at a proxy; `npm:` cannot do that). Both can be overridden. Auth is reused from per-URL `.npmrc` entries. Reserved prefix names (`file`, `link`, `workspace`, `npm`, `jsr`, `git`, `catalog`, `http`, `pkg`, `tool`, ...) fail with `ERR_PNPM_RESERVED_NAMED_REGISTRY_NAME`.

Packages from a prefixed registry get registry-qualified lockfile keys (`foo@work:1.0.0`) so the same name@version from two registries never collapses. Every non-built-in prefix referenced by the lockfile must stay declared (`ERR_PNPM_MISSING_NAMED_REGISTRY`).

## Best Practices

1. **Clear naming**: Use descriptive alias names that indicate purpose
   ```json
   "lodash-legacy": "npm:lodash@3"
   "lodash-modern": "npm:lodash@4"
   ```

2. **Document aliases**: explain why aliases exist

3. **Prefer overrides for global replacement**: to replace a package everywhere, use `overrides` (in `pnpm-workspace.yaml`) instead of aliases

4. **Test thoroughly**: Aliased packages may have subtle differences in behavior

<!--
Source references:
- https://pnpm.io/aliases
- https://pnpm.io/settings#namedregistries
- https://pnpm.io/registries
-->

