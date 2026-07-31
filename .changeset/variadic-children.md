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

### Component-author aliases

Two purpose-oriented types for wrapper variadic-rest params — pick by the
wrapper's intent:

- **`Children<E, R>`** — variadic children of leaves only. Use when the
  wrapper wants to **interleave** its own owned children with forwarded
  ones in a single primitive call. Callers spread arrays:
  `Section(props, ...myArray)`.
- **`PermissiveChildren<E, R>`** — variadic children of leaves *or* one
  array-as-single-arg. Use for **pure pass-through** wrappers. Callers may
  write `Link(props, [a, b])`, `Link(props, a, b)`, or `Link(props, ...arr)`.

Also exported from `@effex/dom` package root: `ChildInput`, `ChildLeaf`,
`ClassValue`, `ClassItem`.
