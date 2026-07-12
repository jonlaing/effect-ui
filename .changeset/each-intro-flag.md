---
"@effex/dom": minor
---

Add an `intro?: boolean` flag on `each` — and symmetrically on `when`, `match`, `matchOption`, `matchEither`, and `redraw` — to opt into re-animating SSR/SSG-rendered content during hydration.

Default behaviour stays as-is: hydration attaches handlers to pre-existing DOM without re-running enter animations — the right choice for content lists (feeds, sidebars, todos) that shouldn't jitter into view on every page load. Setting `intro: true` flips that for decorative sequences where the animation *is* the point:

```ts
each(letters, {
  key: (l) => l.id,
  render: (l) => $.span({}, $.of(Readable.map(l, (v) => v.char))),
  animate: {
    enterFrom: "opacity-0 translate-y-4",
    enter: "opacity-100 translate-y-0 transition duration-300",
    stagger: stagger(40),
  },
  intro: true,
});
```

The same flag makes sense on single-slot controls too — a hero fade-in for a `when`-gated banner, or an animated card for a `match`-selected state:

```ts
when(isReady, {
  onTrue: () => Hero(),
  onFalse: () => Placeholder(),
  animate: { enterFrom: "opacity-0", enter: "opacity-100 transition duration-500" },
  intro: true,
});
```

On the client, `intro` is a no-op — animations already fire normally when there's no pre-existing DOM. It only affects the hydration path.

**FOUC caveat.** Between the SSR paint and hydration applying the `enterFrom` state, there's a brief visual flash of the final state. To eliminate it, hide the container in CSS until hydration completes (e.g. `visibility: hidden` on a class you toggle from your client entry). A first-class FOUC-prevention mechanism is planned for a follow-up.

Respects `prefers-reduced-motion` via `runEnterAnimation`.
