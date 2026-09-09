---
"@stax-ui/dom": minor
---

feat(dom): `Animation.awaitDone(group)` — public wait-for-completion primitive

Wrapper around the internal `Deferred.await(g._done)` so downstream
code can coordinate off a group's completion without dipping into
underscore-prefixed internals. Resolves once every registered
animation on the group has completed (or the empty-group fast-path
has fired), and returns immediately if `_done` has already fired.

Prime use cases:

- A page component sequencing its own intro off a parent transition:

  ```ts
  const HomePage = () => Effect.gen(function* () {
    const outlet = yield* OutletCtx;
    const [entrance] = yield* Animation.sequence(1, {
      group: outlet.transition,
    });
    // ...
  });
  ```

- A custom `Router.scrollBehavior` fn that defers the scroll until the
  outlet's transition finishes:

  ```ts
  Router.scrollBehavior((from, to) =>
    Effect.gen(function* () {
      const outlet = yield* OutletCtx;
      yield* Animation.awaitDone(outlet.transition);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }),
  );
  ```
