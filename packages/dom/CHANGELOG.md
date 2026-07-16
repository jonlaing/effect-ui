# @effex/dom

## 1.2.2

### Patch Changes

- 65c74ec: Fix the FOUC on `intro: true`. When a control (`each`, `when`, `match`, ...) opts into re-animating SSR/SSG-rendered content on hydration, the SSR renderer now emits the `enterFrom` classes on each rendered slot's element. That way the browser paints the pre-animation state (e.g. `opacity-0`) before hydration runs, and the enter animation transitions from there to the final state — instead of showing a flash of the final state, then jumping back to the pre-animation state, then animating in.

  Only applies when `intro: true` is set. Ordinary (non-intro) SSR output continues to render the final state directly, since those controls don't re-animate on hydration.

## 1.2.1

### Patch Changes

- 2a730e7: Wire up `stagger` for `each`'s enter animations. `stagger` was declared on `ListAnimationOptions` and exported via helpers (`stagger`, `staggerFromCenter`) but nothing in the runtime consumed it, so `each({ animate: { stagger: stagger(40) } })` produced no visible staggering. The API had been advertising the feature without implementing it.

  Now `reconcile` captures a `staggerStartAt` timestamp when a batch begins and threads it plus `totalItems` through to each slot's animation. `forkSlotEnter` computes the target fire time as `startAt + stagger(index, total)` and delays only the residual after reconcile overhead — so item N always fires at the same wall-clock moment regardless of how long reconcile takes to iterate to slot N. Without the shared reference, per-slot delays would compound and each item would drift further behind its expected position.

  Applies to `each` (client, client-fallback-during-hydration, hydration-root, and intro re-animation paths). `when` / `match` / etc. don't take a stagger option — they render single elements.

- Updated dependencies [2a730e7]
  - @effex/core@1.1.1

## 1.2.0

### Minor Changes

- b650fd8: Add animation groups — declarative sequencing across multiple animated blocks. Solves the "chained word-by-word intro" case where each word is its own `each` and word N should only start after word N-1 finishes.

  ```ts
  import { $, Animation, collect, each, stagger } from "@effex/dom";

  const App = () =>
    Effect.gen(function* () {
      const [greeting, name, tagline] = yield* Animation.sequence(3);
      return $.div(
        {},
        collect(
          each(greetingLetters, {
            key: (l) => l.id,
            render: (l) => $.span({}, $.of(l.char)),
            animate: {
              enter: "letter-in",
              stagger: stagger(40),
              group: greeting,
            },
          }),
          each(nameLetters, {
            key: (l) => l.id,
            render: (l) => $.span({}, $.of(l.char)),
            animate: { enter: "letter-in", stagger: stagger(40), group: name },
          }),
          each(taglineLetters, {
            key: (l) => l.id,
            render: (l) => $.span({}, $.of(l.char)),
            animate: {
              enter: "letter-in",
              stagger: stagger(40),
              group: tagline,
            },
          }),
        ),
      );
    });
  ```

  New API:
  - `Animation.group()` — creates a group with a gate (unresolved) and a completion signal.
  - `Animation.sequence(count)` — returns `count` groups wired end-to-end: group 0's gate is open immediately, group N's gate opens when group N-1's registered animations all complete.
  - `Animation.parallel(count)` — returns `count` groups with all gates open (useful nested inside `sequence` for concurrent segments in a follow-up release).
  - `animate.group: AnimationGroup` — new option on any animated control (`each`, `when`, `match`, ...). The animation registers with the group synchronously, awaits the gate before starting, and signals completion when finished.

  Groups finalize when their pending count returns to zero for the first time after having been non-zero. Late registrations that arrive after finalization run immediately (gate is already open) — intended semantics for one-shot intros where post-sequence additions behave like ordinary animations.

- ee8a4d1: Add an `intro?: boolean` flag on `each` — and symmetrically on `when`, `match`, `matchOption`, `matchEither`, and `redraw` — to opt into re-animating SSR/SSG-rendered content during hydration.

  Default behaviour stays as-is: hydration attaches handlers to pre-existing DOM without re-running enter animations — the right choice for content lists (feeds, sidebars, todos) that shouldn't jitter into view on every page load. Setting `intro: true` flips that for decorative sequences where the animation _is_ the point:

  ```ts
  each(letters, {
    key: (l) => l.id,
    render: (l) => $.span({}, $.of(Readable.map(l, (v) => v.char))),
    animate: {
      enterFrom: "opacity-0 translate-y-4",
      enter: "opacity-100 translate-y-0 transition duration-300",
      stagger: stagger(40),
    },
    intro: true,
  });
  ```

  The same flag makes sense on single-slot controls too — a hero fade-in for a `when`-gated banner, or an animated card for a `match`-selected state:

  ```ts
  when(isReady, {
    onTrue: () => Hero(),
    onFalse: () => Placeholder(),
    animate: {
      enterFrom: "opacity-0",
      enter: "opacity-100 transition duration-500",
    },
    intro: true,
  });
  ```

  On the client, `intro` is a no-op — animations already fire normally when there's no pre-existing DOM. It only affects the hydration path.

  **FOUC caveat.** Between the SSR paint and hydration applying the `enterFrom` state, there's a brief visual flash of the final state. To eliminate it, hide the container in CSS until hydration completes (e.g. `visibility: hidden` on a class you toggle from your client entry). A first-class FOUC-prevention mechanism is planned for a follow-up.

  Respects `prefers-reduced-motion` via `runEnterAnimation`.

### Patch Changes

- 12654be: Deprecate five under-used animation helpers with `@deprecated` JSDoc tags. All continue to work — they'll be removed in a future major.
  - `staggerEased` — compose your own: `(index, total) => easingFn(index / (total - 1)) * totalDurationMs`
  - `delay` — use `Effect.delay(effect, ms)` directly
  - `sequence` — use `Effect.all([...], { concurrency: 1 })` directly
  - `parallel` — use `Effect.all([...], { concurrency: "unbounded" })` directly
  - `calculateStaggerDelay` — was only ever an internal helper; not re-exported by anything downstream

  These wrapped effect combinators without adding real value beyond a slightly shorter name; the framework should be a thin layer over Effect rather than shadow its stdlib.

- 0dd6440: Fix inline animation serialization in `addSlot` / `removeSlot`. Previously each enter/exit animation was awaited via `yield*`, which serialized the `reconcile` sync loop — for a list of `[a, b, c]` added at once, item `b`'s animation would only start after item `a`'s finished. Made `stagger` configs effectively double-counted (each addSlot's stagger delay applied _after_ the previous animation completed rather than concurrently).

  Now enter animations are forked into the slot's scope so multiple slots animate concurrently, and exit animations run in a fiber attached to the parent scope so `removeSlot` returns immediately (letting the reconcile loop continue) while the exit still plays before the DOM node is removed. If a slot is removed mid-enter, closing the slot scope interrupts the enter animation before exit starts. This applies to `ClientControlCtx` and both factories in `HydrationControlCtx`.

  `@effex/router` will receive an automatic patch via `updateInternalDependencies` since it depends on `@effex/dom` as a workspace dependency.

- 3c5da0c: Fix the `renderToString` return-type inference so provided dependencies (`RendererContext`, `ControlCtx`, `SuspenseBoundaryCtx`, `Scope`) are properly subtracted from the output `R`. Previously the signature used `Deps | R`, which TypeScript can't do set-subtraction from, so those tags leaked into the returned Effect's requirements — callers whose element required `Scope` (from `Signal.make`) or the other provided tags saw them appear in `Effect.runPromise` arguments even though `renderToString` itself provides them internally. Switched to `Exclude<R, Deps>`; the runtime behaviour is unchanged.

## 1.1.1

### Patch Changes

- 2e2670e: Fix list animations being silently dropped on hydrated pages (SSG + SSR). `HydrationControlCtx` was reading `AnimationConfigCtx` once at Layer construction (at the hydration root, before any `each` had a chance to provide its config) and closing over the resulting `undefined`. Now reads the service lazily inside `addSlot`/`removeSlot`, mirroring the existing `ClientControlCtx` pattern, so each `each` with `animate` sees the config its parent provided.

  `@effex/router` will receive an automatic patch via the `updateInternalDependencies` Changesets rule because it depends on `@effex/dom` as a workspace dependency.

## 1.1.0

### Minor Changes

- 5023cff: fixing type errors and reconfiguring router

### Patch Changes

- Updated dependencies [5023cff]
  - @effex/core@1.1.0

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
- Updated dependencies [8c68479]
- Updated dependencies [17d0b29]
  - @effex/core@1.0.0
