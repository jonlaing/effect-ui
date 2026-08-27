# Changelog

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
