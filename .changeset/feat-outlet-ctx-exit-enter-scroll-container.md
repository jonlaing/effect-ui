---
"@stax-ui/router": minor
---

feat(router): `OutletCtx` grows to `{ exit, enter, scrollContainer }`

Per the follow-up flagged in #148 — replaces the single `transition`
group with independent per-nav `exit` and `enter` `AnimationGroup`s,
wired into the outlet's own slot animation via the new
`AnimationConfigCtx.single.enterGroup` / `.exitGroup` factories, so
`Animation.awaitDone(exit)` / `awaitDone(enter)` gate on the actual
lifecycle rather than the empty-group fast-path. Plus a
`scrollContainer` getter that reuses `ScrollBehavior`'s walker so
custom scroll behaviors don't have to re-implement it.

```ts
// Scroll waits for the outlet's EXIT to complete
Router.scrollBehavior((from, to) =>
  Effect.gen(function* () {
    const outlet = yield* OutletCtx;
    yield* Animation.awaitDone(outlet.exit);
    const target = outlet.scrollContainer();
    target
      ? target.scrollTo({ top: 0, left: 0, behavior: "instant" })
      : window.scrollTo({ top: 0, left: 0, behavior: "instant" });
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
- **Fresh per nav.** A shared per-key cache (current + previous) means
  the scroll subscription, the slot renderer, and the outlet's own
  slot animation all resolve to the same group handles for a given
  nav, regardless of which subscriber's fiber runs first. Late
  completions from the outgoing nav still resolve against the group
  they registered with.
- **`scrollContainer` is a function** (`() => Element | null`) because
  the outlet's container element isn't populated during the initial
  reconcile — resolving lazily at scroll-behavior time gives the
  walker a real element to walk from. Cached after the first
  successful walk.
- Wiring uses the new `AnimationOptions.enterGroup` / `.exitGroup`
  factory shape (see the `@stax-ui/dom` changeset) — the outlet's
  `AnimationConfigCtx` provision stays stable across the outlet's
  lifetime while the group pair rotates per nav.

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
