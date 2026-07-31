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
- `ReadonlyArray<ChildInput>` — flattened recursively (so `.map(...)` output
  can be passed directly, no spread needed)
- `Effect<ChildNode | ChildNode[]>` — still accepted (existing `collect` /
  `$.of` output)

The factory's generic signature captures each argument's type independently
via a variadic tuple, so `E` and `R` are the *union* of every child's
channels — mixing children with different errors and service requirements
now produces the correct combined signature instead of collapsing to the
first slot's type.

`@effex/router`'s `Link` component now accepts the same `ClassValue` type
for `class` as the builder primitives — string, `readonly ClassItem[]`, or
`Readable`. The forwarding to `$.a` was already unconditional, so this is
purely a type widening. `ClassValue` and `ClassItem` are now re-exported
from `@effex/dom`'s package root for downstream use.
