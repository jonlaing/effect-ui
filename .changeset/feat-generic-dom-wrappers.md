---
"@stax-ui/dom": minor
---

feat(dom): preserve concrete element types through control-flow and Boundary wrappers

Every DOM control-flow wrapper (`when`, `match`, `each`, `matchOption`,
`matchEither`, `redraw`, `animated`) and both `Boundary.error` /
`Boundary.suspense` used to pin their return element type to
`HTMLElement | SVGElement`. Now the element type flows through:

```ts
// Before
each(todos, {
  container: () => $.ul({}),        // ← Element<HTMLUListElement>
  key: (t) => t.id,
  render: (t) => $.li({}, t.text),
});
// inferred: Element<HTMLElement | SVGElement, ...>  — widened

// After
// inferred: Element<HTMLUListElement, ...>  — preserved
```

For `Boundary.error`, the type unifies across both branches, so a
`try`+`catch` that both return `Element<HTMLDivElement>` come back as
`Element<HTMLDivElement>` — no more cast at `mount(App(), root)` sites.

## How it works

Each config interface gains a trailing `N extends DOMElement = DOMElement`
type parameter with a default. Container factories are typed
`() => Element<N, never, never>`, so N is inferred from the container's
concrete return type. Child branches (`onTrue`, `onFalse`, `onSome`, ...)
keep the wider `Element<DOMElement, ...>` type — children can be any DOM
element, only the container's type matters for the wrapper's return.

Boundaries are different: `Boundary.error` and `Boundary.suspense` share
N across all their branches (try, catch, render, fallback), because any
of them can be the actually-rendered element. Inference unifies them at
the call site.

## Back-compat

Additive. The new type parameter has a default, so:

- Existing callers that don't specify a container still get the same
  `Element<DOMElement, ...>` return type — behavior unchanged.
- `EachConfig<Item, Error, Deps>` and other config annotations keep
  resolving; N falls back to `DOMElement`.
- No runtime change. The generated JS is identical to before.

## Why

Every user of `each`, `when`, `Boundary.error`, etc. previously had to
either accept `HTMLElement | SVGElement` at every boundary or drop
`as Element.Element<HTMLDivElement>` casts to narrow it. The casts
weren't hiding bugs — they were papering over an artificial widening
in the wrapper signatures. Removing the widening removes the casts.
