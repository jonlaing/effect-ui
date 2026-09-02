---
"@stax-ui/core": minor
---

feat(core): `Signal.trace(id)` — pipeable write-tracing for signals

A pipeable pass-through observer that logs every `set` and `update`
call on a signal at Debug level, tagged under the `stax.signal`
subsystem, with the call site captured at the caller's frame.

```ts
const count = yield* Signal.make(0).pipe(Signal.trace("count"));
yield* count.set(1);
// Debug logs:
//   stax.signal  "write"  { id: "count", from: 0, to: 1, callSite: "Error\n    at ..." }
```

Mirrors `Readable.debug` (which covers *reads*) for the *write* side —
the "who called `set` here" question, which was previously answered by
grepping. Each event carries the label, previous value, next value,
and a stack trace source-mapped by browser devtools automatically
(pass `--enable-source-maps` in Node).

Zero cost at the default log level: the pipe reads the current minimum
log level once at construction, and if Debug isn't enabled it returns
the underlying signal unwrapped — no proxied `set`/`update`, no
`new Error()` per write, no branch. The log-level check is captured
at pipe time, which matches how tracing is usually turned on (once, at
startup) and keeps the fast path branchless.

Trades atomic read-modify-write for observability on `update` — the
reducer runs once (so non-pure updates don't double-fire), then the
result is applied via `set`. If you need the atomicity, don't pipe
`trace` on that signal.

A stepping-stone toward the full Signal DevTools story: the same event
shape can eventually feed a `SignalRegistry`-backed devtools panel
without any API change here.
