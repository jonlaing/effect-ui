---
"@effex/dom": patch
---

Fix `animated` (and any other reconcile-based control flow that falls back
to the built-in container) breaking hydration for sibling elements that
follow it.

Follow-up to the hydration exit-animation fix in the previous release.
That fix added a `pushHydrationParent` call in `getContainer` on the
assumption that both `create()` (user-provided container factory) and
`defaultContainer` (built-in) left the hydration walker net-zero on the
traversal stack. That's true for `create()` — it runs through
`createElement`, which pops via `finalizeNode` — but `defaultContainer`
called `renderer.createNode` directly with no matching pop. The subsequent
`pushHydrationParent` then stacked a second frame on top of `createNode`'s
already-pushed one, and `finalizeContainer` only popped one — leaving a
residual frame on the walker. Any sibling elements rendered after an
`animated` block then hydrated against the wrong parent and produced
mismatch warnings.

Adds a matching `renderer.finalizeNode(container)` inside
`defaultContainer` so it's symmetric with a user `create()`. No-op on
non-hydrating renderers.

Regression test in `hydrate.test.ts` covers `animated({...}, () => ...)`
followed by a `$.p` sibling — expects zero mismatches after hydration.
