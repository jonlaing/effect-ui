---
"@stax-ui/dom": patch
---

fix(dom): `Screen.match` delivers the live value to late `.changes` subscribers

The initial hydration-safe `Screen.match` (0.6 release) emitted the
post-hydration correction as a one-shot delta through `phase.changes`.
Reconcile subscriptions attach via `Effect.forkScoped` (async) — if the
forked fiber landed after `completeHydration` had already fired, the
one-shot was gone and no live value was ever delivered. The DOM stayed
on the SSR fallback branch until the user actually resized across the
breakpoint.

Seed the post-hydration correction from `phase.values` (which prepends
the current phase on subscribe) with `Stream.take(1)`:

- Subscribe before flip → current `true` is dropped by filter, wait for
  future `false`.
- Subscribe after flip → current `false` passes filter immediately.
- No hydration ever → subscribe sees `false` as current, emits
  `mql.matches` once (idempotent no-op — the seed value equals what
  `.get` just returned).

The existing "emits on mql fires" test acknowledges the initial seed
emission. New regression test fires `completeHydration` first, attaches
a subscriber after, and asserts it still receives the live value.
