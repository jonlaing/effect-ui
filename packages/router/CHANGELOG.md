# @effex/router

## 1.3.6

### Patch Changes

- 6651e7e: Fix browser back/forward buttons not triggering re-renders under SSG
  dev mode (and any client-side navigation scenario that relies on
  `popstate`).

  The `popstate` handler ran the pathname signal update via
  `Effect.runSync`. `Signal.set` internally uses `SubscriptionRef.set`,
  which acquires a semaphore permit — Effect flags that as async-capable,
  so `Effect.runSync` bails silently. The event handler swallows the
  throw (browsers don't reliably surface exceptions from raw event
  listeners to `console.error`), so the signal never actually updates,
  `Outlet`'s subscribers never see the change, and the page appears
  frozen on the previous route while the URL bar shows the new one.

  Fix: capture the Runtime at Layer construction time and use
  `Runtime.runFork` to schedule the update. `runFork` accepts async work
  and runs it on the same Runtime the rest of the app uses, so the
  signal update reliably reaches subscribers even when the underlying
  `Signal.set` isn't purely synchronous.

  Regression tests cover:
  - Pathname signal updates on popstate.
  - Subscribers to `pathname.changes` (Outlet's shape) receive the
    popstate-driven change.
  - The handler doesn't throw or fail silently.

## 1.3.5

### Patch Changes

- Updated dependencies [8e9426f]
  - @effex/dom@1.4.5

## 1.3.4

### Patch Changes

- Updated dependencies [ec2ad34]
  - @effex/dom@1.4.4

## 1.3.3

### Patch Changes

- Updated dependencies [236f4a0]
- Updated dependencies [6c2c574]
  - @effex/dom@1.4.3

## 1.3.2

### Patch Changes

- Updated dependencies [c4674a0]
  - @effex/dom@1.4.2

## 1.3.1

### Patch Changes

- Updated dependencies [e3e8157]
  - @effex/core@1.1.2
  - @effex/dom@1.4.1

## 1.3.0

### Minor Changes

- 3d7598d: Element factories (`$.div`, `$.span`, ...) now accept variadic children with
  automatic normalization. Backward-compatible — existing `collect(...)` /
  `$.of(...)` calls continue to work.

  **Before**

  ```ts
  $.div(
    { class: "hero" },
    collect($.h1({}, $.of("Hello")), $.p({}, $.of("World"))),
  );
  ```

  **After**

  ```ts
  $.div({ class: "hero" }, $.h1({}, "Hello"), $.p({}, "World"));
  ```

  Each variadic slot is a `ChildInput`:
  - `string` / `number` — wrapped as a text node
  - `null` / `undefined` / `boolean` — skipped (React-style, so `cond && el`
    and `?.` idioms work)
  - `Element` / `Readable` — passed through
  - `ReadonlyArray<ChildLeaf>` — one level of nesting only; single flatten at
    runtime. Nested arrays (`[[a, b], [c, d]]`) are intentionally excluded
    from the type — pre-flatten them with `.flat()` or spread into variadic
    slots. This is what keeps `E`/`R` inference tractable through wrapper
    components.
  - `Effect<ChildNode | ChildNode[]>` — still accepted (existing `collect` /
    `$.of` output)

  The factory's generic signature captures each argument's type independently
  via a variadic tuple, so `E` and `R` are the _union_ of every child's
  channels — mixing children with different errors and service requirements
  now produces the correct combined signature instead of collapsing to the
  first slot's type.

  `@effex/router`'s `Link` now matches the builder-primitive API:
  - `class` accepts the same `ClassValue` type as `$.div` etc. — string,
    `readonly ClassItem[]`, or a `Readable` of either.
  - `children` is variadic and takes any `ChildInput` — pass strings,
    Elements, arrays, or a mix without wrapping in a `$.div`.

  ```ts
  // Before
  Link(
    { href: "/docs", class: "btn" },
    $.div({}, $.i({ innerHTML: iconSvg }), $.span({}, "Docs")),
  );

  // After
  Link(
    { href: "/docs", class: ["btn", "btn-primary"] },
    $.i({ innerHTML: iconSvg }),
    $.span({}, "Docs"),
  );
  ```

  ### Component-author aliases

  Two purpose-oriented types for wrapper variadic-rest params — pick by the
  wrapper's intent:
  - **`Children<E, R>`** — variadic children of leaves only. Use when the
    wrapper wants to **interleave** its own owned children with forwarded
    ones in a single primitive call. Callers spread arrays:
    `Section(props, ...myArray)`.
  - **`PermissiveChildren<E, R>`** — variadic children of leaves _or_ one
    array-as-single-arg. Use for **pure pass-through** wrappers. Callers may
    write `Link(props, [a, b])`, `Link(props, a, b)`, or `Link(props, ...arr)`.

  Also exported from `@effex/dom` package root: `ChildInput`, `ChildLeaf`,
  `ClassValue`, `ClassItem`.

### Patch Changes

- Updated dependencies [3d7598d]
  - @effex/dom@1.4.0

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
