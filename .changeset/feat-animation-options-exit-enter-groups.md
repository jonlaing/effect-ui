---
"@stax-ui/dom": minor
---

feat(dom): `AnimationOptions` gains `enterGroup` + `exitGroup` (per-side group overrides)

Existing `group` still applies to both enter and exit — new `enterGroup`
and `exitGroup` narrow it per side. Both accept either an
`AnimationGroup` or a `() => AnimationGroup | undefined` factory; the
factory shape is what lets a stable `AnimationConfigCtx` provision
point at a group that rotates over time (e.g. the router's per-nav
`OutletCtx.enter` / `OutletCtx.exit`) instead of freezing whichever
group happened to be in scope at Ctx-provision time.

Resolution order at animation-fire time is `enterGroup ?? group` for
enter, `exitGroup ?? group` for exit.

Also fixes a latent oversight: exit animations previously called
`runExitAnimation` without `_register`/`_complete`-ing on the group,
so `Animation.awaitDone(exitGroup)` would resolve via the
empty-group fast-path even while the exit was still running. Exit
animations now register and complete on their resolved group the same
way enter animations do — `awaitDone` gates on the actual exit
lifecycle.
