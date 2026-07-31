---
"@effex/core": patch
"@effex/dom": patch
---

Fix hydrated `each`/`when`/`match` slots leaving their SSR DOM nodes
orphaned when reactive updates try to remove them.

Reconcile's forked `ControlCtx` calls `create()` to walk to its
`containerElement` (e.g. `$.ul`). Under `HydrationRenderer`, `create()`'s
inner `finalizeNode` pops the container off the traversal stack — so
subsequent `addSlot` renders were walking the container's *parent*
instead of the container itself, failing to find the SSR slot nodes, and
falling back to fresh detached elements. The forked ctx's slot map ended
up referencing those detached nodes; when reactive updates later dropped
a key, the removal guard (`entry.element.parentNode === containerElement`)
was false and the original SSR node stayed in the page while new items
rotated around it.

Adds a `pushHydrationParent` method to the `Renderer` interface (no-op on
non-hydrating renderers) and calls it from the forked `ControlCtx` after
`getContainer` resolves. This re-pushes the container back onto the
walker so slot renders find their SSR children, and `entry.element` ends
up pointing at the real live node. Exit animations and DOM removal
against hydrated `each` slots now work.

Regression tests cover a root-level `each` and an `each` nested inside a
`$.section` wrapper.
