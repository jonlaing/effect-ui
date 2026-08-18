# @effex/core

## 1.2.0

### Minor Changes

- aa1dd5e: feat: framework debug logs via Effect.logDebug

  Effex now emits structured debug logs at key framework boundaries — navigation, route resolution, data fetches, animation lifecycle, and reconcile handler invocations. Enable them with the standard Effect Logger pattern:

  ```ts
  Effect.runFork(
    program.pipe(
      Logger.withMinimumLogLevel(LogLevel.Debug),
      Effect.provide(Logger.pretty),
    ),
  );
  ```

  Every message carries a `subsystem` annotation so consumers can filter by area:
  - `effex.nav` — `pushPath`, `replacePath`, popstate handler
  - `effex.outlet` — route resolution, guard eval, redirects
  - `effex.route-data` — which fetch branch was chosen (provider / SPA fallback), redirect signals
  - `effex.animation` — enter/exit begin/end, skip reason, how `transitionend` resolved (`transition` / `animation` / `timeout` / `skip`)
  - `effex.reconcile` — every `reconcile` sync pass with the triggering value and the resolved current/target slot keys

  New `logDebug` and `logError` helpers exported from `@effex/core` for framework use and any downstream extensions that want to plug into the same filter mechanism:

  ```ts
  import { logDebug, logError } from "@effex/core";

  yield * logDebug("cache miss", "effex.my-extension", { key });
  yield * logError("cache failure", "effex.my-extension", { cause });
  ```

  The `subsystem` argument is typed as `` `effex.${string}` `` — enforces the prefix at the type level. `logDebug` is filtered at the default log level (opt-in visibility for framework internals); `logError` always emits (user sees framework error paths without opting in).

  Also moves the reconcile handler's error wrapping — previously in `@effex/dom`'s `subscribeReconcile`, using `Console.error` — into core's `reconcile` where the semantics belong. Failed handlers on subsequent-value updates now emit an `effex.reconcile` Error log through the Logger system and the subscription fiber survives (subsequent updates still fire). `subscribeReconcile` is now trivially the fork/forEach pattern.

  Zero cost when the level is above Debug (the default): the message-formatting layer never runs. Only low-volume framework events get logged this way — high-volume paths (`Signal.set`, per-slot animation phase) will get structured inspector hooks in a future release (#86 / #87 / #88).

  Closes #95.

- edd707f: feat(core): `Readable.debug(id)` combinator for per-value observation

  Adds a lightweight pass-through combinator that wraps a Readable-producing Effect and emits one Debug log per state read / change under the `effex.readable` subsystem:

  ```ts
  const cart =
    yield * Signal.make({ items: 0, total: 0 }).pipe(Readable.debug("cart"));
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
