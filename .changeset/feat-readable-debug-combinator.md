---
"@effex/core": minor
---

feat(core): `Readable.debug(id)` combinator for per-value observation

Adds a lightweight pass-through combinator that wraps a Readable-producing Effect and emits one Debug log per state read / change under the `effex.readable` subsystem:

```ts
const cart = yield* Signal.make({ items: 0, total: 0 }).pipe(
  Readable.debug("cart"),
);
// [DEBUG] [effex.readable] initial value  { id: "cart", value: { items: 0, total: 0 } }
// [DEBUG] [effex.readable] value changed  { id: "cart", value: { items: 1, total: 999 } }
// ...
```

Behavior:
- Reads the initial value via `readable.get` and emits an "initial value" Debug log with `{ id, value }`.
- Forks a subscriber on `readable.changes` into the enclosing scope. Each emission produces a "value changed" Debug log with `{ id, value }`.
- Returns the original Readable unchanged — a transparent observer, drop-in and drop-out with no other code changes.
- Zero cost at the default log level (the formatter never runs).

The type shape (`R extends Readable<A>`) preserves the concrete subtype, so `Signal.make(0).pipe(Readable.debug("x"))` still yields a `Signal<number>` — `.set` / `.update` continue to work through the pipe.

A lightweight stepping-stone toward the Signal DevTools story (#86) — gets users the observability they most commonly want without committing to a UI panel design.
