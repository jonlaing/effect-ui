---
"@stax-ui/core": minor
---

feat(core): `Signal.trace(id)` — pipeable write-tracing across every Signal variant

Every Signal type — plain `Signal`, `Signal.Array`, `Signal.Map`,
`Signal.Set`, `Signal.Struct` — now has a `.trace(id)` combinator that
mirrors `Readable.debug` for the write side. Wraps every mutation
method so each call emits at Debug level, tagged under the
`stax.signal` subsystem, with the caller's stack trace captured
synchronously — the answer to "where in the code did this update come
from?"

```ts
const count = yield* Signal.make(0).pipe(Signal.trace("count"));
yield* count.set(1);
// stax.signal  "write"  { id: "count", from: 0, to: 1, callSite: "..." }

const todos = yield* Signal.Array.make<Todo>().pipe(Signal.Array.trace("todos"));
yield* todos.push({ id: 1, text: "buy milk" });
// stax.signal  "push"  { id: "todos", args: [{...}], callSite: "..." }

const users = yield* Signal.Map.make<string, User>().pipe(Signal.Map.trace("users"));
yield* users.set("ada", ada);
// stax.signal  "set"  { id: "users", args: ["ada", {...}], callSite: "..." }
```

Each `<Kind>.trace(id)` covers every mutation on its collection:

- `Signal.trace` — `set`, `update` (logs `from`/`to`)
- `Signal.Array.trace` — `set`, `update`, `push`, `pop`, `unshift`,
  `shift`, `splice`, `insertAt`, `removeAt`, `replaceAt`, `modifyAt`,
  `remove`, `move`, `swap`, `sort`, `reverse`, `clear`
- `Signal.Map.trace` — `set`, `delete`, `clear`, `replace`, `update`,
  `modifyAt`
- `Signal.Set.trace` — `add`, `delete`, `toggle`, `clear`, `replace`,
  `update`
- `Signal.Struct.trace` — struct-level `update` and `replace` (field
  signals like `struct.name` can be traced individually with
  `Signal.trace`)

Zero cost at the default log level: each pipe reads the current
minimum log level once at construction, and if Debug isn't enabled it
returns the underlying signal unwrapped — no proxied methods, no
`new Error()` per write, no branch. The log-level check is captured
at pipe time, which matches how tracing is usually turned on (once, at
startup) and keeps the fast path branchless.

Collection tracing logs method name + args rather than snapshotting
the whole collection on every write — a full copy of a large map or
array would be expensive and rarely what you want. Pair with
`Readable.debug` if you also want a "value changed" line.

`Signal.trace`'s `update` runs its reducer once (so non-pure updates
don't double-fire); the result is applied via `set`. If you need the
atomic read-modify-write semantics, don't pipe `trace` on that signal.

A stepping-stone toward the full Signal DevTools story: the same event
shape can eventually feed a `SignalRegistry`-backed devtools panel
without any API change here.
