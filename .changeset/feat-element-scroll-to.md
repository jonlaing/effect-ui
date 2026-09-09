---
"@stax-ui/dom": minor
---

feat(dom): `Element.scrollTo` combinator

Piped-through scroll for an Effect resolving to `HTMLElement | Window`.
Both shapes expose `scrollTo(options)` identically, so a single
combinator covers both the "scrollable ancestor" and the
window-scrolled-document case without callers branching on null:

```ts
Router.scrollBehavior((from, to) =>
  Effect.gen(function* () {
    const outlet = yield* OutletCtx;
    yield* Animation.awaitDone(outlet.exit);
    yield* Element.scrollTo(outlet.scrollContainer, {
      top: 0,
      behavior: "instant",
    });
  }),
);
```

Data-first + data-last supported via `dual`. Returns the target for
chaining. Effect-only — no overload for a raw `HTMLElement | Window`;
combinators in this namespace uniformly operate on Effects.

Pairs with `OutletCtx.scrollContainer` (new in `@stax-ui/router`),
which resolves to the same `HTMLElement | Window` shape.
