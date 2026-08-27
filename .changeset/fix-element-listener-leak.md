---
"@stax-ui/core": minor
"@stax-ui/dom": patch
---

fix(dom): stop leaking DOM event listeners on component unmount

`Element.on` and `Element.once` registered a scope finalizer that
flipped an internal `isActive` flag but never called
`removeEventListener` — the DOM listener stayed attached to the
element forever after the enclosing scope closed. Every mount/unmount
cycle (dialog, route change, list-item update) leaked one native
listener per binding. Handlers didn't visibly fire because the
`isActive` gate short-circuited them, but the leak was real and
compounded.

The bare `Element.addEventListener` was affected too: it was
documented as "you must call `removeEventListener`" but the low-level
`Renderer.addEventListener` didn't return a cleanup handle, so
manual removal was structurally impossible.

## What changed

- **`Renderer.addEventListener`** now returns `Effect<void, never,
  Scope.Scope>` and accepts `AddEventListenerOptions`. Uses
  `Effect.acquireRelease` internally so the DOM listener is properly
  detached when the enclosing scope closes. The `options` param means
  `Element.once` can pass `{ once: true }` for correct native
  auto-remove-on-first-fire semantics.
- **DOMRenderer / HydrationRenderer** updated to `acquireRelease`.
  `StringRenderer` stays `Effect.void` (SSR still no-ops).
- **`Element.on` / `Element.once` / `Element.addEventListener`** drop
  their `isActive`-flag pattern. Cleanup is now handled uniformly by
  the scoped renderer contract.

## Audit

Full sweep of `packages/dom/src/Element/core.ts` for similar
resource-lifecycle bugs. Only the three event-listener call sites
above were affected. Every other resource in the file (streams
subscribed by `bindAttribute`, `bindClass`, `bindStyle`, `bindData`,
`bindTextContent`) uses `Effect.forkIn(scope)` correctly.

## Tests

Five new tests in `Element/events.test.ts` that dispatch events after
the scope closes and verify the handler doesn't fire. These would
have failed under the pre-fix code.

## Compatibility

`core` gets a **minor** bump because the `Renderer` interface signature
changed. Custom `Renderer` implementations (rare — meant for framework
integrators) need to widen their `addEventListener` return to
`Effect<void, never, Scope.Scope>` and accept the optional `options`
param. The DOM package's own three renderers are updated in this PR.
