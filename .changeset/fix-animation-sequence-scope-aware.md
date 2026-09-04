---
"@stax-ui/dom": minor
---

fix(dom): `Animation.sequence` / `Animation.parallel` release their parent registration on scope close

Previously, `Animation.sequence(N, { group: parent })` called
`_register(parent)` synchronously and forked a daemon that awaited the
last child's `_done` to fire `_complete(parent)`. If the enclosing
scope tore down before that natural completion — for example a
`when(condition, { onTrue: A, onFalse: B })` swap where each branch
owned its own nested sub-sequence under the same `parent` — the losing
branch's `_register` leaked forever. `parent.pending` never balanced,
so every sibling downstream of `parent` in the sequence hung.

Both `Animation.sequence` and `Animation.parallel` now install a scope
finalizer alongside the natural-completion daemon. Whichever fires
first — the child chain completing OR the enclosing scope closing —
releases `parent`'s virtual registration exactly once (guarded by an
internal `released` flag so the loser is a no-op). A `when` branch
swap now cleanly releases the outgoing branch's registration when its
slot scope closes, so the surviving branch's completion actually
drives `parent._done`.

### API-visible change

Overload set — no runtime break for existing callers, but the nested
form now advertises Scope in its `R` channel:

```ts
Animation.sequence(3);                       // Effect<AnimationGroup[]>
Animation.sequence(3, { group: parent });    // Effect<AnimationGroup[], never, Scope>
```

Element-shaped callers already run under a Scope, so this shows up
only for standalone use.
