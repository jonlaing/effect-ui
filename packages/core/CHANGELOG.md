# Changelog

## 0.5.0

### Minor Changes

- 8a13e9b: feat(core): `Signal.trace(id)` — pipeable write-tracing across every Signal variant

  Every Signal type — plain `Signal`, `Signal.Array`, `Signal.Map`,
  `Signal.Set`, `Signal.Struct` — now has a `.trace(id)` combinator that
  mirrors `Readable.debug` for the write side. Wraps every mutation
  method so each call emits at Debug level, tagged under the
  `stax.signal` subsystem, with the caller's stack trace captured
  synchronously — the answer to "where in the code did this update come
  from?"

  ```ts
  const count = yield * Signal.make(0).pipe(Signal.trace("count"));
  yield * count.set(1);
  // stax.signal  "write"  { id: "count", from: 0, to: 1, callSite: "..." }

  const todos =
    yield * Signal.Array.make<Todo>().pipe(Signal.Array.trace("todos"));
  yield * todos.push({ id: 1, text: "buy milk" });
  // stax.signal  "push"  { id: "todos", args: [{...}], callSite: "..." }

  const users =
    yield * Signal.Map.make<string, User>().pipe(Signal.Map.trace("users"));
  yield * users.set("ada", ada);
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

## 0.4.0

### Minor Changes

- b1f07e5: fix(dom): stop leaking DOM event listeners on component unmount

  `Element.on` and `Element.once` registered a scope finalizer that
  flipped an internal `isActive` flag but never called
  `removeEventListener` — the DOM listener stayed attached to the
  element forever after the enclosing scope closed. Every mount/unmount
  cycle (dialog, route change, list-item update) leaked one native
  listener per binding. Handlers didn't visibly fire because the
  `isActive` gate short-circuited them, but the leak was real and
  compounded.

  The bare `Element.addEventListener` was affected too: it was
  documented as "you must call `removeEventListener`" but the low-level
  `Renderer.addEventListener` didn't return a cleanup handle, so
  manual removal was structurally impossible.

  ## What changed
  - **`Renderer.addEventListener`** now returns `Effect<void, never,
Scope.Scope>` and accepts `AddEventListenerOptions`. Uses
    `Effect.acquireRelease` internally so the DOM listener is properly
    detached when the enclosing scope closes. The `options` param means
    `Element.once` can pass `{ once: true }` for correct native
    auto-remove-on-first-fire semantics.
  - **DOMRenderer / HydrationRenderer** updated to `acquireRelease`.
    `StringRenderer` stays `Effect.void` (SSR still no-ops).
  - **`Element.on` / `Element.once` / `Element.addEventListener`** drop
    their `isActive`-flag pattern. Cleanup is now handled uniformly by
    the scoped renderer contract.

  ## Audit

  Full sweep of `packages/dom/src/Element/core.ts` for similar
  resource-lifecycle bugs. Only the three event-listener call sites
  above were affected. Every other resource in the file (streams
  subscribed by `bindAttribute`, `bindClass`, `bindStyle`, `bindData`,
  `bindTextContent`) uses `Effect.forkIn(scope)` correctly.

  ## Tests

  Five new tests in `Element/events.test.ts` that dispatch events after
  the scope closes and verify the handler doesn't fire. These would
  have failed under the pre-fix code.

  ## Compatibility

  `core` gets a **minor** bump because the `Renderer` interface signature
  changed. Custom `Renderer` implementations (rare — meant for framework
  integrators) need to widen their `addEventListener` return to
  `Effect<void, never, Scope.Scope>` and accept the optional `options`
  param. The DOM package's own three renderers are updated in this PR.

## 0.3.0

### Minor Changes

- 2644592: feat(core): keyed / indexed mutators for SignalMap + SignalArray, and Readable.valuesAt

  Three additions that fill in real gaps in the reactive primitives.

  ## `SignalArray.replaceAt` / `SignalArray.modifyAt`

  Positional updates by index. Both fail with a typed
  `OutOfBoundsError` when the index is outside `[0, length)`, so bugs
  (updating a stale index, arithmetic slip) show up in the error
  channel instead of silently no-op'ing:

  ```ts
  yield * todos.replaceAt(index, newTodo);
  yield * todos.modifyAt(index, (t) => ({ ...t, done: !t.done }));
  ```

  `modifyAt` composes better than `set` when the new value depends on
  the old one — the function receives the current element and returns
  the next one, no round-trip through `get`. `replaceAt` is a plain
  positional set for when you already have the new value in hand.

  ## `SignalMap.modifyAt`

  Same idea for `SignalMap` — apply a function to the value at a key.
  Fails with a typed `KeyNotFoundError` when the key isn't present:

  ```ts
  yield * users.modifyAt("u1", (u) => ({ ...u, role: "moderator" }));
  ```

  ## `Readable.valuesAt`

  Take a `Readable<T>` whose value is an object plus an explicit list of
  keys, get back a record of per-key `Readable`s:

  ```ts
  const state = yield * Signal.make({ name: "Ada", age: 36 });
  const { name, age } = Readable.valuesAt(state, ["name", "age"]);
  // name: Readable<string>
  // age: Readable<number>
  ```

  Synchronous, no failure channel. Keys are explicit — the shape can't
  drift out of sync if new fields appear on the source object. Handy
  for passing individual fields as reactive props into different
  children without exposing the whole object.

  ## Error tags

  The two new error classes use namespaced tags for discoverability:

  - `stax/SignalArray/OutOfBoundsError`
  - `stax/SignalMap/KeyNotFoundError`

  Existing errors in the codebase still use unnamespaced tags. New
  errors should follow the namespaced convention going forward — worth
  a follow-up sweep to bring the older ones (`RedirectError`,
  `NoSuchElementException`, `AttributeNotFound`, `HydrationMismatchError`,
  `NoRenderError`) in line.

## 0.2.0

### Minor Changes

- 4bc4315: chore: relicense from MIT to Mozilla Public License 2.0

  Stax is now distributed under [MPL 2.0](../LICENSE). Nothing about how
  you _use_ Stax changes — commercial and proprietary projects can
  continue to depend on it freely, at any license. What changes is what
  happens when someone _modifies_ Stax's own source files: those
  modifications must be released under MPL 2.0. In short:

  - **Depend on Stax** — any license, including proprietary. No change.
  - **Fork or patch Stax itself** — those source files, and any files
    that contain Covered Software, must be released under MPL 2.0.

  MPL 2.0 is file-level copyleft. It does not "infect" downstream apps
  the way GPL / AGPL do; the boundary is at the file, not at the linked
  program. Adobe, Cisco, and Mozilla itself ship products using
  MPL 2.0-licensed components without opening the enclosing code.

  The intent: guarantee that Stax stays open source in perpetuity, and
  that no single party — including the current maintainer — can take
  the framework closed and start charging for it. Combined with the
  project's inbound = outbound contribution model (contributors retain
  copyright and license their work under the project's license), a
  future relicensing to a closed-source arrangement is effectively
  impossible once multiple contributors are involved.

  Every package version published at `0.1.x` was released under MIT and
  remains MIT forever — irrevocable per license terms. This changeset
  covers the switch to MPL 2.0 for `0.2.0` and onward. If you have
  downstream code that depends on the MIT permissive terms for a
  particular reason, you can pin to a `0.1.x` version indefinitely; the
  tags remain on npm.

## 0.1.0

Initial release. Renamed from the `@effex/*` scope.
