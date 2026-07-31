---
"@effex/dom": minor
"@effex/router": minor
---

Element factories (`$.div`, `$.span`, ...) now accept variadic children with
automatic normalization. Backward-compatible — existing `collect(...)` /
`$.of(...)` calls continue to work.

**Before**

```ts
$.div(
  { class: "hero" },
  collect(
    $.h1({}, $.of("Hello")),
    $.p({}, $.of("World")),
  ),
)
```

**After**

```ts
$.div(
  { class: "hero" },
  $.h1({}, "Hello"),
  $.p({}, "World"),
)
```

Each variadic slot is a `ChildInput`:

- `string` / `number` — wrapped as a text node
- `null` / `undefined` / `boolean` — skipped (React-style, so `cond && el`
  and `?.` idioms work)
- `Element` / `Readable` — passed through
- `ReadonlyArray<ChildLeaf>` — one level of nesting only; single flatten at
  runtime. Nested arrays (`[[a, b], [c, d]]`) are intentionally excluded
  from the type — pre-flatten them with `.flat()` or spread into variadic
  slots. This is what keeps `E`/`R` inference tractable through wrapper
  components.
- `Effect<ChildNode | ChildNode[]>` — still accepted (existing `collect` /
  `$.of` output)

The factory's generic signature captures each argument's type independently
via a variadic tuple, so `E` and `R` are the *union* of every child's
channels — mixing children with different errors and service requirements
now produces the correct combined signature instead of collapsing to the
first slot's type.

`@effex/router`'s `Link` now matches the builder-primitive API:

- `class` accepts the same `ClassValue` type as `$.div` etc. — string,
  `readonly ClassItem[]`, or a `Readable` of either.
- `children` is variadic and takes any `ChildInput` — pass strings,
  Elements, arrays, or a mix without wrapping in a `$.div`.

```ts
// Before
Link(
  { href: "/docs", class: "btn" },
  $.div(
    {},
    $.i({ innerHTML: iconSvg }),
    $.span({}, "Docs"),
  ),
);

// After
Link(
  { href: "/docs", class: ["btn", "btn-primary"] },
  $.i({ innerHTML: iconSvg }),
  $.span({}, "Docs"),
);
```

`ChildInput`, `ChildLeaf`, `ClassValue`, and `ClassItem` are now re-exported
from `@effex/dom`'s package root for downstream component authors.

Component authors picking between the two:

- `ChildInput<E, R>` — permissive; users can pass leaves or an array as a
  single arg. Use for pass-through wrappers that just forward children.
- `ChildLeaf<E, R>` — leaves only. Use when the wrapper wants to *interleave*
  its own children alongside forwarded ones (`$.section(attrs, ownH2, children)`).
  Callers pass leaves or spread arrays.
