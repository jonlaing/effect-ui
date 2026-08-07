---
"@effex/router": patch
"@effex/dom": patch
---

fix(router): Outlet now actually applies its animation configuration

`OutletConfig.animate` was defined in the type but never read in the
implementation — the underlying `reconcile` call passed only
`getTargetKeys` and `renderSlot`, so nothing wired the animation config
through to the control ctx. Consumers configuring `animate` saw abrupt
route transitions regardless of what they set.

`Outlet` now provides `AnimationConfigCtx` (the same tag `when`/`match`/
`each` use) via `Effect.provideService`, matching the pattern those
combinators follow. `provideService` uses `provideContext` internally
rather than `provideSomeLayer`'s `scopedWith` — no scope is created and
no finalizer race is introduced (see #78 for the finalizer-race pattern
we're deliberately avoiding).

Also adds an `intro?: boolean` field to `OutletConfig`, so the initially
matched route can re-animate on hydration in cases like a decorative
opening scene. Same shape as `when`/`match`/`each`/`animated`.

`AnimationConfigCtx` and `ClientControlCtx` are now re-exported from
`@effex/dom`'s package root (they were exported from
`@effex/dom/Control/index.ts` but not lifted).
