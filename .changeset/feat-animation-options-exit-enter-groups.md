---
"@stax-ui/dom": minor
---

feat(dom): `AnimationOptions` gains `enterGroup` + `exitGroup` + `AnimationGroupRef`

Existing `group` still applies to both enter and exit — new `enterGroup`
and `exitGroup` narrow it per side. All three fields share one type,
`AnimationGroupRef`:

```ts
type AnimationGroupRef =
  | AnimationGroup
  | Effect<AnimationGroup | undefined>;
```

- A plain `AnimationGroup` — resolved once at animation-fire time.
  Typical when the caller creates the group (`Animation.sequence(3)`)
  and hands it in directly.
- An `Effect<AnimationGroup | undefined>` — resolved fresh at
  animation-fire time. This is what lets a stable
  `AnimationConfigCtx` point at a group that rotates over time (e.g.
  the router's per-nav `OutletCtx.enter`, read through a `Ref`)
  without freezing at Ctx-provision time. `undefined` means "no
  group active for this fire" and falls through to the next override
  in the `enterGroup ?? group` chain.

Resolution order at animation-fire time is `enterGroup ?? group` for
enter, `exitGroup ?? group` for exit.

Also fixes a latent oversight: exit animations previously called
`runExitAnimation` without `_register`/`_complete`-ing on the group,
so `Animation.awaitDone(exitGroup)` would resolve via the
empty-group fast-path even while the exit was still running. Exit
animations now register and complete on their resolved group the same
way enter animations do — `awaitDone` gates on the actual exit
lifecycle.
