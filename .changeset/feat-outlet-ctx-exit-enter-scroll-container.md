---
"@stax-ui/router": minor
---

feat(router): `OutletCtx` grows to `{ exit, enter, scrollContainer }`

Per the follow-up flagged in #148 — replaces the single `transition`
group with independent per-nav `exit` and `enter` `AnimationGroup`s,
wired into the outlet's own slot animation via the new
`AnimationConfigCtx.single.enterGroup` / `.exitGroup` group refs (see
the `@stax-ui/dom` changeset), so `Animation.awaitDone(exit)` /
`awaitDone(enter)` gate on the actual lifecycle rather than the
empty-group fast-path. Plus a `scrollContainer` accessor that reuses
`ScrollBehavior`'s walker so custom scroll behaviors don't have to
re-implement it.

```ts
// Scroll waits for the outlet's EXIT to complete
Router.scrollBehavior((from, to) =>
  Effect.gen(function* () {
    const outlet = yield* OutletCtx;
    yield* Animation.awaitDone(outlet.exit);
    yield* Element.scrollTo(outlet.scrollContainer, {
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }),
);

// Page's intro sequence waits for the outlet's ENTER to complete
const HomePage = () => Effect.gen(function* () {
  const outlet = yield* OutletCtx;
  yield* Animation.awaitDone(outlet.enter);
  const groups = yield* Animation.sequence(3);
  // ...
});
```

### Details

- `exit` and `enter` are **independent groups** — they run in parallel
  by default, matching the current outlet behavior. Sequence them
  yourself in code if you want a serial exit → enter timeline.
- **Fresh per nav.** The pair is stored in a `SynchronizedRef` so all
  three callers — scroll subscription, slot renderer, and the ambient
  `AnimationConfigCtx` refs — atomically get the same handles for a
  given key. Current + previous entries are retained, so a late exit
  completion from the outgoing nav still resolves against the group
  it registered with, not the incoming nav's fresh pair.
- **`scrollContainer` is an `Effect<HTMLElement | Window>`** — matches
  `AnimationHook`'s `Effect<HTMLElement>` shape and integrates with
  the `Element` combinators. Resolves at consumption time so it sees
  the post-mount container even if read during the initial render
  pass. When no scrollable HTML ancestor is found on the walk up, it
  falls back to `window` — both shapes expose `scrollTo(options)`
  identically, so callers pipe through `Element.scrollTo` without
  branching. Cached after the first successful walk. SVGs are
  excluded from the walk since they use `viewBox`, not CSS overflow,
  for their internal coordinate space.
- Wiring uses the new `AnimationOptions.enterGroup` / `.exitGroup`
  `AnimationGroupRef` shape (see the `@stax-ui/dom` changeset) — the
  outlet's `AnimationConfigCtx` provision stays stable across the
  outlet's lifetime while the group pair rotates per nav via
  `Ref.get(transitionRef)`.

### Breaking change

`OutletCtxService.transition` is **removed**. Migration is direct:

```diff
- yield* Animation.awaitDone(outlet.transition);
+ yield* Animation.awaitDone(outlet.enter); // for post-enter intros
+ // or outlet.exit for pre-scroll gating
```

If you had a single group that fired after both exit and enter
completed, compose one manually:
`Effect.all([awaitDone(outlet.exit), awaitDone(outlet.enter)])`.

### Also

The `Outlet` type keeps its `Exclude<R, OutletCtx>` — page components
that consume `OutletCtx` still don't force the outlet's caller to
provide it themselves. `findScrollRoot` is exported from
`ScrollBehavior.ts` (shared with `OutletCtx.scrollContainer`).

Closes #148.
