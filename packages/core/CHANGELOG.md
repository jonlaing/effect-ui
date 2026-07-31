# @effex/core

## 1.1.2

### Patch Changes

- e3e8157: Fix hydrated `each`/`when`/`match` slots leaving their SSR DOM nodes
  orphaned when reactive updates try to remove them.

  Reconcile's forked `ControlCtx` calls `create()` to walk to its
  `containerElement` (e.g. `$.ul`). Under `HydrationRenderer`, `create()`'s
  inner `finalizeNode` pops the container off the traversal stack — so
  subsequent `addSlot` renders were walking the container's _parent_
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

## 1.1.1

### Patch Changes

- 2a730e7: Wire up `stagger` for `each`'s enter animations. `stagger` was declared on `ListAnimationOptions` and exported via helpers (`stagger`, `staggerFromCenter`) but nothing in the runtime consumed it, so `each({ animate: { stagger: stagger(40) } })` produced no visible staggering. The API had been advertising the feature without implementing it.

  Now `reconcile` captures a `staggerStartAt` timestamp when a batch begins and threads it plus `totalItems` through to each slot's animation. `forkSlotEnter` computes the target fire time as `startAt + stagger(index, total)` and delays only the residual after reconcile overhead — so item N always fires at the same wall-clock moment regardless of how long reconcile takes to iterate to slot N. Without the shared reference, per-slot delays would compound and each item would drift further behind its expected position.

  Applies to `each` (client, client-fallback-during-hydration, hydration-root, and intro re-animation paths). `when` / `match` / etc. don't take a stagger option — they render single elements.

## 1.1.0

### Minor Changes

- 5023cff: fixing type errors and reconfiguring router

## 1.0.0

### Minor Changes

- 8c68479: Initial public release of Effex - a reactive UI framework built on Effect.

  **@effex/core**
  - Signal: Mutable reactive values with equality-based updates
  - Derived: Computed values that automatically track dependencies
  - Readable: Base interface for reactive values with `get`, `changes`, `values`, and `map`
  - Readable.combine: Combine multiple Readables into a tuple
  - Readable.lift: Lift functions to accept Readable arguments (great for CVA, clsx)

  **@effex/dom**
  - Element factories (`$.div`, `$.button`, etc.) with reactive attributes
  - Control flow: `when`, `match`, `each` with animation support
  - Boundary.suspense for async loading states
  - Template literals (`t`) for reactive strings
  - Portal for rendering outside the component tree
  - CSS-first animations with stagger utilities

  **@effex/router**
  - Type-safe routing with Effect Schema validation
  - Route params as Readables
  - History API navigation
  - Link component

  **@effex/form**
  - Schema-based validation with Effect Schema
  - Field-level state (value, errors, touched, dirty)
  - Configurable validation timing
  - Async validators support

### Patch Changes

- 17d0b29: Major refactor to improve DX and code cleanliness
