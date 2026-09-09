---
"@stax-ui/router": minor
---

feat(router): `OutletCtx` — per-outlet coordination context

Every route render is now provided with an `OutletCtx` service exposing
the current nav's transition `AnimationGroup`. Route components can
read it via `yield* OutletCtx` and sequence their own intro animations
off the outer transition rather than racing with it:

```ts
const HomePage = () => Effect.gen(function* () {
  const outlet = yield* OutletCtx;
  const groups = yield* Animation.sequence(3, { group: outlet.transition });
  // groups[0]'s gate opens after the outlet transition's gate opens —
  // no more "first item of the intro fires simultaneously with the
  // outlet's own enter and looks like the beginning got dropped."
});
```

The transition group is **fresh per slot render** — a page component
that mounts on a fresh nav gets a group scoped to its own mount cycle,
so downstream sequencing behaves predictably across multiple
navigations rather than being gated by a stale `_done` from a previous
one. Backed by `Animation.sequence(1)`, so the empty-group fast-path
resolves quickly when nothing registers — pages that don't opt into
the coordination see no downside.

A custom `Router.scrollBehavior` fn can consume `OutletCtx` the same
way and use `Animation.awaitDone(outlet.transition)` to defer the
scroll until the transition finishes:

```ts
Router.scrollBehavior((from, to) =>
  Effect.gen(function* () {
    const outlet = yield* OutletCtx;
    yield* Animation.awaitDone(outlet.transition);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }),
);
```

### Type change

`Outlet`'s return type now `Exclude<R, OutletCtx>` from the routes'
requirement channel — the outlet provides `OutletCtx` internally, so
callers of `Outlet` don't need to provide it themselves even when
their routes consume it. No API break; existing users see no change.

### Not in this pass

Auto-deferring the built-in `"top"` `scrollBehavior` to the outlet's
transition needs the outlet's own enter/exit to register with the
`OutletCtx.transition` group, which requires plumbing per-nav config
into `AnimationConfigCtx` (currently read at `addSlot` time from the
outer outlet scope, not per-slot). Custom scroll behaviors using the
pattern above cover the use case in the meantime.
