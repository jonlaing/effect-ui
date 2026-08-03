# create-effex

## 1.1.2

### Patch Changes

- 49af20d: Fix broken client entry templates.
  - **SSG template** (`client.ts`): was calling `hydrate(App(), root)` with no
    layers, even though the App uses `Outlet` and `Link` which require
    `NavigationContext`. Hydration bailed as soon as either was resolved.
    Now passes `Platform.makeClientLayer(router)` via `options.layers`.
  - **SPA template** (`main.ts`): passed `{ layers: ... }` as a third arg to
    `mount`, which doesn't accept options — the arg was silently dropped
    and the returned `Effect` was never run, so nothing mounted at all. Now
    uses `runApp(mount(...), { layer: ... })`, the documented pattern.

## 1.1.1

### Patch Changes

- d153d3a: Surface SSG support in package documentation: add a Rendering Modes overview and a dedicated Static Site Generation section to the top-level README, give SSG equal billing with SSR in `@effex/platform`'s README (including a full Quick Start, `buildStaticSite` API reference, and `BuildStaticSiteOptions` shape), and document the SSG template, `--ssg` flag, project structure, and build commands in `create-effex`'s README. No code changes.
- a3b696c: Sync `@effex/*` dependency versions in scaffolded templates with the current workspace versions. Previously templates pinned `@effex/dom`, `@effex/router`, `@effex/platform`, and `@effex/vite-plugin` to `^0.0.1`, which (under semver's strict caret behavior for `0.x.x`) resolved to long-obsolete pre-1.0 versions. Generated projects now reference the current major (e.g. `^1.1.0` / `^1.2.0`).

  Adds `scripts/sync-template-versions.mjs` and wires it into the Changesets `version` script so template versions track workspace versions automatically on every release.

- 400948f: Add the missing `index.html` entry file to the `ssg` and `ssr` templates. Only the `spa` template previously had one, which broke the client build step (`vite build`) in scaffolded SSG projects — Vite needs `index.html` as the client entry, and the SSG build path additionally reads `dist/index.html` after the client build to extract hashed asset paths for injection into the generated static pages. Both new files mirror the working `examples/twitter` shape and point their script tag at the existing `/src/client.ts` entry.

## 1.1.0

### Minor Changes

- 5023cff: fixing type errors and reconfiguring router

## 1.0.0

### Patch Changes

- 17d0b29: Major refactor to improve DX and code cleanliness
