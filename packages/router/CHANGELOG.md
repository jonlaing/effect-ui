# Changelog

## 0.3.4

### Patch Changes

- Updated dependencies [1690c6d]
  - @stax-ui/dom@0.7.0

## 0.3.3

### Patch Changes

- Updated dependencies [904a41b]
  - @stax-ui/core@0.6.0
  - @stax-ui/dom@0.6.0

## 0.3.2

### Patch Changes

- Updated dependencies [8a13e9b]
  - @stax-ui/core@0.5.0
  - @stax-ui/dom@0.5.1

## 0.3.1

### Patch Changes

- Updated dependencies [6750110]
- Updated dependencies [b1f07e5]
  - @stax-ui/dom@0.5.0
  - @stax-ui/core@0.4.0

## 0.3.0

### Minor Changes

- c5fd56a: fix(router): preserve E and R through combinators; tighten Route.make's D

  Three closely-related fixes that eliminate silent `unknown` widening in
  downstream consumers of a router.

  ## `Router.layout` collapsed E and R to `unknown`

  The signature had unbound outer generics that shadowed the wrapper's
  own generics:

  ```ts
  export const layout =
    <E, R>(                                           // ← outer generics
      wrapper: <A extends DOMElement, E, R>(          // ← INNER E, R shadow outer
        children: Element<A, E, R>,
      ) => Element<HTMLElement, E, R>,
    ) =>
    <P, S, D, E2, R2>(router: Router<P, S, D, E2, R2>):
      Router<P, S, D, E | E2, R | R2>                 // ← uses OUTER E, R
  ```

  The wrapper's own `<A, E, R>` shadowed the outer `<E, R>`, so those
  outer generics never got bound to anything specific and fell back to
  `unknown`. Every downstream consumer of the resulting router had E
  and R silently widened to `unknown` — a `mount(App(), root)` call
  where App composes through the router would end up with `Element<...,
unknown, unknown>` and require casts.

  Fix: drop the bogus outer generics, take `LayoutWrapper` directly.
  Layouts are transparent to E/R by contract; the returned router's E
  and R are identical to the input's.

  ## `Route.make` hardcoded `D = unknown`

  Every newly-created route had `D = unknown` regardless of whether it
  had a data loader. When routes are aggregated via `Router.concat`, the
  D union `unknown | Foo | Bar` collapses to `unknown`, cascading into
  Outlet's requirements via `Router<..., D, E, R>` inference.

  Fix: `Route.make` now returns `Route<..., D = never, ...>`. A route
  without a loader has no data — `never` correctly captures that.
  `Route.data`, `Route.get`, `Route.static`, etc. widen D at the site
  they're added.

  ## `MetaArgs.data` typing follows suit

  `MetaArgs.data` was `D`, which — now that `Route.make` produces
  `D = never` — meant callers constructing MetaArgs for no-loader routes
  would have to cast just to write `data: undefined`. Made it
  conditional: `data: [D] extends [never] ? undefined : D`. No-loader
  routes see `data: undefined`; loader-having routes see the concrete
  data type.

  ## Small `LayoutWrapper` widening tidy

  The wrapper's return type was `Element<HTMLElement, E, R>` — pinned
  to `HTMLElement`. Widened to `Element<HTMLElement | SVGElement, E, R>`
  so SVG-wrapping layouts type-check. The wrapper's own outer element
  type isn't preserved — the caller decides what chrome to add.

  ## Test surface

  Route.test.ts had two `route.render(undefined)` calls that relied on
  the old `D = unknown` accepting anything. Updated to
  `route.render(undefined as never)` to match the new stricter typing
  (and added a note explaining the runtime-vs-type contract).

  ## Verified

  Compared inferred App type in router-demo before and after:

  - Before: `Element<HTMLElement | SVGElement, unknown, unknown>`
  - After: `Element<HTMLDivElement, never, Scope | RendererContext | NavigationContext | ControlCtx>`

  The remaining `HTMLDivElement` sharpening was already in flight via
  the DOM wrapper generics PR — this PR handles the router side of the
  same class of problem.

### Patch Changes

- Updated dependencies [36b1d20]
- Updated dependencies [3065684]
- Updated dependencies [2644592]
- Updated dependencies [05f94f9]
  - @stax-ui/dom@0.4.0
  - @stax-ui/core@0.3.0

## 0.2.1

### Patch Changes

- 2b59417: fix(router): exact route beats catch-all when both match the same URL

  `/docs/*` was scoring higher in `routeSpecificity` than `/docs`, so
  for the URL `/docs` the router preferred the catch-all route and
  handed rendering code a match with an empty `*` capture. Callers
  who set up an exact route alongside a sibling catch-all (a common
  docs-shell pattern — `/docs` for the index, `/docs/*` for individual
  pages) got the wrong render.

  Catch-all segments now contribute `-1` to specificity instead of
  `+1`. A static-only route always beats a same-length catch-all one
  when both match; a longer catch-all route still beats a shorter
  one that doesn't match at all.

  Purely additive behavior change — routes that don't have a sibling
  catch-all match the same URLs as before.

- Updated dependencies [db36abb]
- Updated dependencies [5b11e9d]
  - @stax-ui/dom@0.3.0

## 0.2.0

### Minor Changes

- 4bc4315: chore: relicense from MIT to Mozilla Public License 2.0

  Stax is now distributed under [MPL 2.0](../LICENSE). Nothing about how
  you _use_ Stax changes — commercial and proprietary projects can
  continue to depend on it freely, at any license. What changes is what
  happens when someone _modifies_ Stax's own source files: those
  modifications must be released under MPL 2.0. In short:

  - **Depend on Stax** — any license, including proprietary. No change.
  - **Fork or patch Stax itself** — those source files, and any files
    that contain Covered Software, must be released under MPL 2.0.

  MPL 2.0 is file-level copyleft. It does not "infect" downstream apps
  the way GPL / AGPL do; the boundary is at the file, not at the linked
  program. Adobe, Cisco, and Mozilla itself ship products using
  MPL 2.0-licensed components without opening the enclosing code.

  The intent: guarantee that Stax stays open source in perpetuity, and
  that no single party — including the current maintainer — can take
  the framework closed and start charging for it. Combined with the
  project's inbound = outbound contribution model (contributors retain
  copyright and license their work under the project's license), a
  future relicensing to a closed-source arrangement is effectively
  impossible once multiple contributors are involved.

  Every package version published at `0.1.x` was released under MIT and
  remains MIT forever — irrevocable per license terms. This changeset
  covers the switch to MPL 2.0 for `0.2.0` and onward. If you have
  downstream code that depends on the MIT permissive terms for a
  particular reason, you can pin to a `0.1.x` version indefinitely; the
  tags remain on npm.

### Patch Changes

- Updated dependencies [4bc4315]
  - @stax-ui/core@0.2.0
  - @stax-ui/dom@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [7bd0248]
  - @stax-ui/dom@0.1.1

## 0.1.0

Initial release. Renamed from the `@effex/*` scope.
