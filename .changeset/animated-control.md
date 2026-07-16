---
"@effex/dom": minor
---

Add `animated` — a mount-once control function for wrapping a single element with enter animations. Solves the hand-authored intro-sequence case that was awkward under `each` / `when` (either had to shoehorn a static list into `each` or fake a boolean signal for `when`).

```ts
const App = () =>
  Effect.gen(function* () {
    const [g0, g1, g2] = yield* Animation.sequence(3);
    return $.h1(
      {},
      collect(
        animated(
          {
            animate: {
              enterFrom: "opacity-0",
              enter: "opacity-100 transition duration-300",
              group: g0,
            },
            intro: true,
          },
          () => $.span({}, $.of("Hello,")),
        ),
        // No visual animation — the span has its own CSS keyframes; the
        // group still sequences when it appears.
        animated(
          { animate: { group: g1 } },
          () => $.span({ class: "wobble" }, $.of("world!")),
        ),
        animated(
          {
            animate: {
              enterFrom: "opacity-0",
              enter: "opacity-100 transition duration-500",
              group: g2,
            },
            intro: true,
          },
          () => $.span({}, $.of("Welcome.")),
        ),
      ),
    );
  });
```

**Enter-only by design.** `animated` mounts its child and never removes it, so exit-animation fields would be dead code. The `animate` config uses the new `EnterOnlyAnimationOptions` type (a `Pick` of `AnimationOptions`) — the compiler prevents you from configuring `exit` / `exitTo` / `onExit`. `group` and `intro` behave the same as they do on `each` / `when` / `match`, including SSR emitting `enterFrom` classes for FOUC prevention when `intro: true`.
