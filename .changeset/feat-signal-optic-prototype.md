---
"@stax-ui/core": minor
---

feat(core): `Signal.Optic` — one root, lens-projected fine-grained readables (prototype)

Fills a gap `Signal.Struct` doesn't: deeply nested state with lazy,
fine-grained subscriptions at arbitrary paths — without hand-building
nested structs, and without giving up "only components who read this
field re-render" by mapping the whole tree.

```ts
const state = yield* Signal.Optic.make({ a: { b: { c: 0 }, d: 1 }, e: 2 });

const c = yield* Signal.Optic.get(state, "a.b.c"); // Readable<number>
const b = yield* Signal.Optic.get(state, "a.b");   // Readable<{ c: number }>

yield* Signal.Optic.set(state, "a.b.c", 3);
yield* c.get; // 3
yield* b.get; // { c: 3 }

yield* Signal.Optic.set(state, "a.b", { c: 5 });
yield* b.get; // { c: 5 }
yield* c.get; // 5 — ancestor write propagates down
```

- Root handle is a `Readable<T>` of the whole tree — `.get`,
  `.changes`, `.values` all work. **No `.set` on the root** — writes
  flow only through `Signal.Optic.set(state, path, value)` /
  `Signal.Optic.update(state, path, fn)`, so every mutation carries
  a path (future: pair with `Signal.trace` for "which lens wrote
  this?" tracing).
- Type-safe paths via a template-literal `Paths<T>` / `ValueAtPath<T, P>`
  pair; depth-limited (5) to keep the TS server responsive on realistic
  trees.
- **Array-index syntax.** Numeric path segments walk into arrays:
  `Signal.Optic.get(state, "items.0.name")` returns `Readable<string>`.
  Writes preserve array shape via structural-sharing `slice()` — a
  write to `items[1]` keeps `items[0]` and `items[2]` reference-equal,
  so subscribers on other indices don't fire. Tuple element types
  widen to their union (`items[number]`) for path inference.
- Structural sharing on writes: unaffected branches keep reference
  equality, so subscriber-side dedup and downstream memoization work
  without any explicit config.
- Overlap notification: sibling paths (`a.b.c` vs `a.b.d`) don't fire
  each other; ancestor and descendant paths do.
- `Object.is` dedup at the write site — setting a path back to its
  current value is a no-op.

### Prototype status

The string-path API is the primary surface. A composable
`Optic.lens(…)` builder for the "pass an optic across module
boundaries" case is intentionally deferred until we know whether the
concept lands. String paths are enough to prove out the runtime,
notification semantics, and TypeScript ergonomics.
