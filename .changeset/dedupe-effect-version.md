---
---

Deduplicate `effect` dependency via a workspace-level pnpm override pinned to `3.19.19`. Previously `@effect/platform`'s peer resolved to `3.19.13` and `@effect/vitest`'s peer resolved to `3.19.19`, causing `pnpm` to install both copies. At test time the `@effect/vitest` Runtime (3.19.19) ended up executing Effects produced by code that had imported the 3.19.13 copy through `@effect/platform`, printing hundreds of "Executing an Effect versioned X with a Runtime of version Y — you may want to dedupe" warnings. Both peer ranges (`^3.0.0`) already accept 3.19.19, so a single override is sufficient.
