---
"@stax-ui/router": minor
---

fix(router): preserve E and R through combinators; tighten Route.make's D

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
