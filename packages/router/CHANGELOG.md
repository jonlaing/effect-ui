# @effex/router

## 1.2.10

### Patch Changes

- Updated dependencies [1419b6e]
  - @effex/dom@1.3.3

## 1.2.9

### Patch Changes

- b1241f4: Fix `Route.static` routes losing their loader data on client-side navigation. Two coupled bugs:
  1. `@effex/vite-plugin`'s `stripStaticConfig` transform rewrote client-side `Route.static({ ..., render: (data) => Element })` as `Route.render(() => renderFn(undefined))` — hardcoding `undefined` as the data argument. That predated the `RouteDataProvider` client-fetch path; back then the client genuinely had no way to obtain loader data. Now that `?_data=1` works and populates `routeData.data` via `makeClientLayer`, the transform was still discarding the fetched data on its way to the render fn.
  2. `Route.render`'s wrapper stored `render: (_data) => fn()` — ignoring its own data argument. So even if the transform had passed data through, `Route.render` would still have thrown it away.

  Fixed both:
  - **Route.render** now stores `render: (data) => fn(data)`. The fn's signature loosened to `(data?: D) => Element` so no-arg render functions keep working (JS ignores extra args) and arg-aware ones receive their data.
  - **vite-plugin's transform** now emits `Route.render(renderFn)` directly instead of the double-wrapped `() => renderFn(undefined)` — Route.render handles the pass-through.

  Regression test added to `plugin.test.ts` that fails if `undefined` reappears in the transform output.

## 1.2.8

### Patch Changes

- 932821b: Fix `Outlet`'s SPA fallback (no `RouteDataProvider` in context) to honour `Route.static`. The fallback branch only checked `route._loader` and `route._handlers` — `Route.static` puts its loader inside `_staticConfig.load` and sets neither of those, so `hasHooks` was `false`, the branch was skipped, and `routeData` stayed at its default with `data: undefined`. `route.render(undefined)` then crashed on any static-route render function that touched its `data` argument.

  Now the fallback also runs `_staticConfig?.load` when present. `Route.static` routes work correctly in pure-SPA mode (no `@effex/platform`), and the "provider dropped through unexpectedly" cases stop presenting as opaque `Cannot read properties of undefined` from user code.

## 1.2.7

### Patch Changes

- Updated dependencies [4f1f4fe]
  - @effex/dom@1.3.2

## 1.2.6

### Patch Changes

- Updated dependencies [8b07d3d]
  - @effex/dom@1.3.1

## 1.2.5

### Patch Changes

- Updated dependencies [d95a27a]
  - @effex/dom@1.3.0

## 1.2.4

### Patch Changes

- Updated dependencies [65c74ec]
  - @effex/dom@1.2.2

## 1.2.3

### Patch Changes

- Updated dependencies [2a730e7]
  - @effex/core@1.1.1
  - @effex/dom@1.2.1

## 1.2.2

### Patch Changes

- Updated dependencies [b650fd8]
- Updated dependencies [12654be]
- Updated dependencies [ee8a4d1]
- Updated dependencies [0dd6440]
- Updated dependencies [3c5da0c]
  - @effex/dom@1.2.0

## 1.2.1

### Patch Changes

- Updated dependencies [2e2670e]
  - @effex/dom@1.1.1

## 1.2.0

### Minor Changes

- 9c3fb19: added meta combinator to be able to change title and description of routes

## 1.1.0

### Minor Changes

- 5023cff: fixing type errors and reconfiguring router

### Patch Changes

- Updated dependencies [5023cff]
  - @effex/core@1.1.0
  - @effex/dom@1.1.0

## 1.0.0

### Minor Changes

- 8c68479: Initial public release of Effex - a reactive UI framework built on Effect.

  **@effex/core**
  - Signal: Mutable reactive values with equality-based updates
  - Derived: Computed values that automatically track dependencies
  - Readable: Base interface for reactive values with `get`, `changes`, `values`, and `map`
  - Readable.combine: Combine multiple Readables into a tuple
  - Readable.lift: Lift functions to accept Readable arguments (great for CVA, clsx)

  **@effex/dom**
  - Element factories (`$.div`, `$.button`, etc.) with reactive attributes
  - Control flow: `when`, `match`, `each` with animation support
  - Boundary.suspense for async loading states
  - Template literals (`t`) for reactive strings
  - Portal for rendering outside the component tree
  - CSS-first animations with stagger utilities

  **@effex/router**
  - Type-safe routing with Effect Schema validation
  - Route params as Readables
  - History API navigation
  - Link component

  **@effex/form**
  - Schema-based validation with Effect Schema
  - Field-level state (value, errors, touched, dirty)
  - Configurable validation timing
  - Async validators support

### Patch Changes

- 17d0b29: Major refactor to improve DX and code cleanliness
- Updated dependencies [8c68479]
- Updated dependencies [17d0b29]
  - @effex/core@1.0.0
  - @effex/dom@1.0.0
