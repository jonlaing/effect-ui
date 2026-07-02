---
"@effex/dom": patch
---

Fix inline animation serialization in `addSlot` / `removeSlot`. Previously each enter/exit animation was awaited via `yield*`, which serialized the `reconcile` sync loop — for a list of `[a, b, c]` added at once, item `b`'s animation would only start after item `a`'s finished. Made `stagger` configs effectively double-counted (each addSlot's stagger delay applied *after* the previous animation completed rather than concurrently).

Now enter animations are forked into the slot's scope so multiple slots animate concurrently, and exit animations run in a fiber attached to the parent scope so `removeSlot` returns immediately (letting the reconcile loop continue) while the exit still plays before the DOM node is removed. If a slot is removed mid-enter, closing the slot scope interrupts the enter animation before exit starts. This applies to `ClientControlCtx` and both factories in `HydrationControlCtx`.

`@effex/router` will receive an automatic patch via `updateInternalDependencies` since it depends on `@effex/dom` as a workspace dependency.
