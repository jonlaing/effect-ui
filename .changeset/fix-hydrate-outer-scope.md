---
"@effex/dom": patch
---

fix(hydrate): build `options.layers` in the outer program scope

Previously `hydrate` used `Effect.provide(element, elementLayers)`, which
internally wraps the effect in a fresh scope that closes as soon as the
effect completes. Since element functions return synchronously after
building the DOM, this tore down every scoped resource — Navigation's
popstate listener, `SubscriptionRef` PubSub subscribers, cache entries —
before the user could interact. Browser back/forward, reactive updates,
and anything relying on `Effect.addFinalizer` silently no-op'd.

Fixed by building the merged layers as a `Context` in hydrate's outer
program scope (kept alive by `Effect.never`) before providing.
