---
"@stax-ui/core": minor
---

feat(core): keyed / indexed mutators for SignalMap + SignalArray, and Readable.valuesAt

Three additions that fill in real gaps in the reactive primitives.

## `SignalArray.replaceAt` / `SignalArray.modifyAt`

Positional updates by index. Both fail with a typed
`OutOfBoundsError` when the index is outside `[0, length)`, so bugs
(updating a stale index, arithmetic slip) show up in the error
channel instead of silently no-op'ing:

```ts
yield* todos.replaceAt(index, newTodo);
yield* todos.modifyAt(index, (t) => ({ ...t, done: !t.done }));
```

`modifyAt` composes better than `set` when the new value depends on
the old one — the function receives the current element and returns
the next one, no round-trip through `get`. `replaceAt` is a plain
positional set for when you already have the new value in hand.

## `SignalMap.modifyAt`

Same idea for `SignalMap` — apply a function to the value at a key.
Fails with a typed `KeyNotFoundError` when the key isn't present:

```ts
yield* users.modifyAt("u1", (u) => ({ ...u, role: "moderator" }));
```

## `Readable.valuesAt`

Take a `Readable<T>` whose value is an object plus an explicit list of
keys, get back a record of per-key `Readable`s:

```ts
const state = yield* Signal.make({ name: "Ada", age: 36 });
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
