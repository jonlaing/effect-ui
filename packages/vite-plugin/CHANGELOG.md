# @effex/vite-plugin

## 1.1.2

### Patch Changes

- a5aa552: Fix `stripDeadImports` misclassifying `$` imports as dead. The dead-import
  detector used `\b<name>\b` boundaries to test whether a specifier appears
  in the code; `\b` is a `\w`↔`\W` boundary, and `$` is a `\w` character
  that at a real call site sits between `\W` neighbours (whitespace on the
  left, `.` on the right) — so `\b$\b` never matched a genuine `$.tag(...)`
  use, and any `import { $ }` with no other used specifier was stripped
  from client builds. The bug was hidden while `collect` shared the import
  line, because the "all specifiers dead" check short-circuited on any one
  visibly-used name.

  Replaces the boundary check with identifier-aware lookarounds:

  ```
  (?<![A-Za-z0-9_$])<name>(?![A-Za-z0-9_$])
  ```

  Adds regression fixtures covering `$`-only imports, `$` alongside a used
  specifier, and a genuinely-dead `$`-only import.

## 1.1.1

### Patch Changes

- b1241f4: Fix `Route.static` routes losing their loader data on client-side navigation. Two coupled bugs:
  1. `@effex/vite-plugin`'s `stripStaticConfig` transform rewrote client-side `Route.static({ ..., render: (data) => Element })` as `Route.render(() => renderFn(undefined))` — hardcoding `undefined` as the data argument. That predated the `RouteDataProvider` client-fetch path; back then the client genuinely had no way to obtain loader data. Now that `?_data=1` works and populates `routeData.data` via `makeClientLayer`, the transform was still discarding the fetched data on its way to the render fn.
  2. `Route.render`'s wrapper stored `render: (_data) => fn()` — ignoring its own data argument. So even if the transform had passed data through, `Route.render` would still have thrown it away.

  Fixed both:
  - **Route.render** now stores `render: (data) => fn(data)`. The fn's signature loosened to `(data?: D) => Element` so no-arg render functions keep working (JS ignores extra args) and arg-aware ones receive their data.
  - **vite-plugin's transform** now emits `Route.render(renderFn)` directly instead of the double-wrapped `() => renderFn(undefined)` — Route.render handles the pass-through.

  Regression test added to `plugin.test.ts` that fails if `undefined` reappears in the transform output.

## 1.1.0

### Minor Changes

- 5023cff: fixing type errors and reconfiguring router

### Patch Changes

- Updated dependencies [5023cff]
  - @effex/platform@1.1.0

## 1.0.0

### Patch Changes

- 17d0b29: Major refactor to improve DX and code cleanliness
