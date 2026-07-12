---
"@effex/core": patch
"@effex/dom": patch
---

Wire up `stagger` for `each`'s enter animations. `stagger` was declared on `ListAnimationOptions` and exported via helpers (`stagger`, `staggerFromCenter`) but nothing in the runtime consumed it, so `each({ animate: { stagger: stagger(40) } })` produced no visible staggering. The API had been advertising the feature without implementing it.

Now `reconcile` captures a `staggerStartAt` timestamp when a batch begins and threads it plus `totalItems` through to each slot's animation. `forkSlotEnter` computes the target fire time as `startAt + stagger(index, total)` and delays only the residual after reconcile overhead — so item N always fires at the same wall-clock moment regardless of how long reconcile takes to iterate to slot N. Without the shared reference, per-slot delays would compound and each item would drift further behind its expected position.

Applies to `each` (client, client-fallback-during-hydration, hydration-root, and intro re-animation paths). `when` / `match` / etc. don't take a stagger option — they render single elements.
