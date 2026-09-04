---
"@stax-ui/core": minor
"@stax-ui/dom": minor
---

feat(dom): `Screen.match` is now hydration-safe by construction

Using `Screen.match` on an SSR'd page could produce hydration mismatches:
the server rendered the "SSR-safe" default (`initial ?? false`), but on
the client `matchMedia` reads the real viewport immediately, so the
first client render could render a different subtree than the SSR HTML
already contained. `when`, `each`, and any other reactive control flow
consuming a `Screen.match` result would then trip a hydration
mismatch.

`Screen.match` now gates on the renderer's hydration phase:

- **SSR** (`StringRenderer`): `.get` returns `initial` — no `matchMedia`
  access, no observation of `hydrationPhase`.
- **Client hydration** (`HydrationRenderer`): `.get` returns `initial`
  while the initial walk is in progress. Once `hydrate()` finishes and
  fires `completeHydration`, the `.changes` stream emits the live
  `matchMedia` value once, and reconcile swaps the DOM off the SSR
  fallback in a follow-up pass.
- **Fresh client** (`DOMRenderer`, no SSR): the phase is `false` from
  the outset, so `.get` returns `matchMedia().matches` immediately and
  only `matchMedia` `change` events drive updates.

`Screen.match`'s type is now
`Effect<Readable<boolean>, never, RendererContext>` — call it with
`yield*` (matching `Signal.make`'s shape). This is what lets it pull
the current renderer's phase from context.

### Renderer interface change (`@stax-ui/core`)

`Renderer.isHydrating: Effect<boolean>` is replaced with:

- `Renderer.hydrationPhase: Readable<boolean>` — observably `true` while
  hydration is in progress, `false` otherwise
- `Renderer.completeHydration: Effect<void>` — flips the phase to
  `false` and emits the transition to subscribers; no-op on the DOM
  and SSR renderers

`hydrate()` awaits the initial `Effect.provide(element, context)`, then
`yield*`s `renderer.completeHydration` before the `Effect.never` that
keeps the scope alive.

Only the internal DOMRenderer test consumed the removed `isHydrating`
field — external Renderer implementations (if any) will need to swap
the field.
