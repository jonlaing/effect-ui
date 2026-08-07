# @effex/dom

## 1.4.8

### Patch Changes

- 30f2c32: fix(animation): wait one paint before hydration enter animations

  On cold first-load (new tab, no cache), the browser can schedule the
  hydration fiber before it finishes parsing/applying stylesheets — either
  `<link>` sheets that are still being fetched or Vite dev's JS-injected
  styles that haven't been evaluated yet.

  When that happened, `runEnterAnimation`'s `forceReflow` captured a
  "before" state with no `transition-property` set, then the class swap
  happened instantly — the transition-triggering moment passed without
  transition-\* in effect, `transitionend` never fired, and the animation
  system logged the "Animation timeout reached" warning after 5 seconds.
  The affected element ended up at its enterTo state with no animation.
  Refresh made the problem go away because stylesheets were already cached
  and applied synchronously.

  `forkSlotEnter` now waits for a single `requestAnimationFrame` on the
  hydration path before starting the enter lifecycle. rAF runs just before
  the browser's next paint, at which point all pending stylesheet parsing
  is complete, so `forceReflow` captures the correct pre-transition state
  and the class swap fires a proper transition.

  The wait is scoped to hydration only; post-hydration animations (route
  changes, list reconciles) don't pay the rAF cost.

- 567a41c: fix(router): Outlet now actually applies its animation configuration

  `OutletConfig.animate` was defined in the type but never read in the
  implementation — the underlying `reconcile` call passed only
  `getTargetKeys` and `renderSlot`, so nothing wired the animation config
  through to the control ctx. Consumers configuring `animate` saw abrupt
  route transitions regardless of what they set.

  `Outlet` now provides `AnimationConfigCtx` (the same tag `when`/`match`/
  `each` use) via `Effect.provideService`, matching the pattern those
  combinators follow. `provideService` uses `provideContext` internally
  rather than `provideSomeLayer`'s `scopedWith` — no scope is created and
  no finalizer race is introduced (see #78 for the finalizer-race pattern
  we're deliberately avoiding).

  Also adds an `intro?: boolean` field to `OutletConfig`, so the initially
  matched route can re-animate on hydration in cases like a decorative
  opening scene. Same shape as `when`/`match`/`each`/`animated`.

  `AnimationConfigCtx` and `ClientControlCtx` are now re-exported from
  `@effex/dom`'s package root (they were exported from
  `@effex/dom/Control/index.ts` but not lifted).

## 1.4.7

### Patch Changes

- 2b57548: fix(hydrate): make element requirements provably match `options.layers`

  `hydrate`'s element parameter was locked to `Element<A, never, RendererContext | ControlCtx | SuspenseBoundaryCtx>`, so any element that also required a user-provided service (`NavigationContext`, `RouteDataProvider`, etc.) had to be cast — `as never` or `as unknown as Element<HTMLElement>` — even though `options.layers` was providing exactly those services at runtime.

  `HydrateOptions` and `hydrate` are now generic over the layer type. The layer's provided services flow through `Layer.Layer.Success<L>` into the element's allowed `R`, so:
  - Passing an element that needs a service without providing a layer for it is a type error.
  - Providing a layer that only covers some of the element's requirements is a type error.
  - `hydrate(App(), root, { layers: Platform.makeClientLayer(router) })` typechecks with no casts when the layer fully covers what `App()` needs.

  `NoInfer` on the extracted layer type keeps TypeScript from inferring `L` from the element's requirements — inference flows one way, from `options.layers` into the element, so forgetting a service is a compile-time error rather than a silent runtime failure.

  Removed the now-obsolete casts from `create-effex`'s SSG and SSR templates, `apps/docs`, and the hydrate regression test.

## 1.4.6

### Patch Changes

- 49af20d: fix(hydrate): build `options.layers` in the outer program scope

  Previously `hydrate` used `Effect.provide(element, elementLayers)`, which
  internally wraps the effect in a fresh scope that closes as soon as the
  effect completes. Since element functions return synchronously after
  building the DOM, this tore down every scoped resource — Navigation's
  popstate listener, `SubscriptionRef` PubSub subscribers, cache entries —
  before the user could interact. Browser back/forward, reactive updates,
  and anything relying on `Effect.addFinalizer` silently no-op'd.

  Fixed by building the merged layers as a `Context` in hydrate's outer
  program scope (kept alive by `Effect.never`) before providing.

## 1.4.5

### Patch Changes

- 8e9426f: Fix intro animations still stalling on client-mode re-mount even after
  the connection wait added in the previous release.

  The previous fix used `Effect.yieldNow()` to defer the enter fiber past
  the outer synchronous render flow. That only reschedules the fiber
  inside Effect's own queue — if no other work is queued, the fiber can
  run again immediately without the browser actually flushing microtasks
  or committing DOM changes. On real client re-mounts, `element.isConnected`
  stayed `false` when the animation fiber checked it, we hit the 3-attempt
  bound, and proceeded against a disconnected element — same failure
  mode as before.

  Replace `Effect.yieldNow` with `queueMicrotask`-based yielding (via
  `Effect.async`), bounded to 32 attempts. `queueMicrotask` is a real
  browser primitive that guarantees the fiber won't resume until the
  current task's synchronous work and other queued microtasks have run
  — which is when the outer render flow finishes inserting the wrapper's
  ancestor chain into the document. 32 microtasks is well under a
  millisecond in modern engines and comfortably covers any realistic
  outer-flow depth.

  Also force a style/layout computation (`element.offsetHeight`) after
  the element is connected. Some engines defer style computation for
  freshly-inserted nodes until it's needed; without this, `forceReflow`
  inside `runEnterAnimation` could record the enterFrom state as the
  initial snapshot for an element that hasn't been styled yet, leaving
  the browser without a valid "before" to interpolate the transition
  from.

## 1.4.4

### Patch Changes

- ec2ad34: Fix enter animations firing against a detached element on nested
  client-mode re-mounts (e.g. router nav-back on pages with animations
  deep inside the route's tree).

  `forkSlotEnter` forks the animation fiber via `Effect.forkIn(slotScope)`
  from inside `addSlot`. Effect's scheduler can hand that fiber control
  on the next microtask, before the outer synchronous render flow has
  finished appending the wrapper's ancestor chain into the document.
  When that happens, `onBeforeEnter` fires against a node whose ancestors
  aren't yet in the DOM — `getComputedStyle` returns empty strings on
  disconnected nodes, and browsers won't compute or transition styles
  against them, so the enter transition never fires and the animation
  stalls to the timeout.

  On first render this didn't surface because hydration walks pre-existing
  DOM: every element was already connected when the fiber ran. It only
  broke on subsequent client-mode mounts, and only when the animated
  block sat inside another wrapper element (its own ancestor had to be
  appended AFTER the fork).

  The animation fiber now yields microtasks until the element is
  connected, up to a small bound. In practice the outer flow completes
  within one or two microtasks; the bound ensures callers that never
  insert their result (e.g. tests that yield an animated element without
  appending it to the document) still make progress instead of hanging.

  Regression test in `Control.test.ts` asserts `element.isConnected` is
  true at `onBeforeEnter` on both the initial mount AND the toggle-back
  of a `when`-nested animated block that lives two wrappers deep.

## 1.4.3

### Patch Changes

- 236f4a0: Short-circuit enter/exit animations when the element has no CSS
  transition or animation that will ever fire an `animationend` /
  `transitionend` event. Previously stalled for the full timeout (default
  5s) — surfacing as a "missing transition property" warning in dev and
  a visible FOUC on re-mount in production.

  The gate in `waitForAnimationEvent` used to check:
  - `animationName !== "none"`
  - `transitionDuration !== "0s"` (exact string comparison)

  That treated three common cases as "animation is running":
  1. `transition-property: none` with a non-zero `transition-duration`
     (e.g., a base class sets duration, an override kills the property).
     No transition fires.
  2. Comma-separated `transition-duration` where every entry is zero
     (`"0s, 0s"`). The `!== "0s"` check evaluates truthy but nothing fires.
  3. Element carrying an infinite CSS animation (e.g., Tailwind's
     `animate-pulse`) at intro time. `animationName` is a real keyframe
     name and `animationDuration` is positive, but `animation-iteration-
count: infinite` means `animationend` never fires.

  New helpers `maxDurationSeconds` (parses comma lists),
  `hasCompletingAnimation` (name + positive duration + finite iterations),
  and `hasTransitionThatWillFire` (property !== "none" + positive
  duration) replace the ad-hoc string checks. Regression tests cover all
  three cases and lock in that finite animations/transitions still wait
  correctly.

  Also fixes a listener leak in the same function: interruption (e.g.,
  navigating away mid-animation) used to only cancel the pending
  `requestAnimationFrame` — if the RAF had already fired and set up
  `animationend`/`transitionend` listeners plus a timeout, the interrupt
  left them dangling on the unmounted element. Cancellation now runs the
  same cleanup path a successful resolution would.

- 6c2c574: Fix `enterFrom` classes being stripped during hydration for controls
  with `intro: true`, causing every intro animation on an SSR-rendered
  page to stall until the 5s timeout.

  `HydrationRenderer.setAttribute` overwrote whatever was on the DOM node
  with the value from the element factory. That's fine for most
  attributes — SSR and hydration emit the same value — but SSR augments
  the `class` attribute for intro-flagged controls: `SSRControlCtx.addSlot`
  appends `enterFrom` classes on top of the developer's `class` value
  (`toggleClass(element, cls, true)`) so the browser paints the pre-
  animation state on first render. When hydration ran, the element
  factory's `setAttribute("class", <developer value>)` erased those extras
  — by the time `onBeforeEnter` fired the class was back to just the
  developer's value, `enterTo` set the property to a value it already had,
  no `transitionend` fired, and the animation stalled for 5s.

  Fix: HydrationRenderer's `setAttribute` for `class` now **merges** the
  developer's classes into what's already there instead of overwriting.
  SSR/hydration render the same tree, so the developer's classes should
  be a subset of what SSR emitted anyway; the only difference is the SSR
  extras we want to preserve. Other attributes still write through as
  before.

  Regression test in `hydrate.test.ts` covers the exact reported shape:
  `animated({ intro: true, animate: { enterFrom: "opacity-0", ... }, ... })`
  inside a `when` toggle, hydrate, snapshot `onBeforeEnter`'s class list,
  then toggle away and back and snapshot again. Both snapshots must
  contain `opacity-0`. Additional cover in `Control.test.ts` locks in the
  pure client-mode re-mount path.

## 1.4.2

### Patch Changes

- c4674a0: Fix `animated` (and any other reconcile-based control flow that falls back
  to the built-in container) breaking hydration for sibling elements that
  follow it.

  Follow-up to the hydration exit-animation fix in the previous release.
  That fix added a `pushHydrationParent` call in `getContainer` on the
  assumption that both `create()` (user-provided container factory) and
  `defaultContainer` (built-in) left the hydration walker net-zero on the
  traversal stack. That's true for `create()` — it runs through
  `createElement`, which pops via `finalizeNode` — but `defaultContainer`
  called `renderer.createNode` directly with no matching pop. The subsequent
  `pushHydrationParent` then stacked a second frame on top of `createNode`'s
  already-pushed one, and `finalizeContainer` only popped one — leaving a
  residual frame on the walker. Any sibling elements rendered after an
  `animated` block then hydrated against the wrong parent and produced
  mismatch warnings.

  Adds a matching `renderer.finalizeNode(container)` inside
  `defaultContainer` so it's symmetric with a user `create()`. No-op on
  non-hydrating renderers.

  Regression test in `hydrate.test.ts` covers `animated({...}, () => ...)`
  followed by a `$.p` sibling — expects zero mismatches after hydration.

## 1.4.1

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

- Updated dependencies [e3e8157]
  - @effex/core@1.1.2

## 1.4.0

### Minor Changes

- 3d7598d: Element factories (`$.div`, `$.span`, ...) now accept variadic children with
  automatic normalization. Backward-compatible — existing `collect(...)` /
  `$.of(...)` calls continue to work.

  **Before**

  ```ts
  $.div(
    { class: "hero" },
    collect($.h1({}, $.of("Hello")), $.p({}, $.of("World"))),
  );
  ```

  **After**

  ```ts
  $.div({ class: "hero" }, $.h1({}, "Hello"), $.p({}, "World"));
  ```

  Each variadic slot is a `ChildInput`:
  - `string` / `number` — wrapped as a text node
  - `null` / `undefined` / `boolean` — skipped (React-style, so `cond && el`
    and `?.` idioms work)
  - `Element` / `Readable` — passed through
  - `ReadonlyArray<ChildLeaf>` — one level of nesting only; single flatten at
    runtime. Nested arrays (`[[a, b], [c, d]]`) are intentionally excluded
    from the type — pre-flatten them with `.flat()` or spread into variadic
    slots. This is what keeps `E`/`R` inference tractable through wrapper
    components.
  - `Effect<ChildNode | ChildNode[]>` — still accepted (existing `collect` /
    `$.of` output)

  The factory's generic signature captures each argument's type independently
  via a variadic tuple, so `E` and `R` are the _union_ of every child's
  channels — mixing children with different errors and service requirements
  now produces the correct combined signature instead of collapsing to the
  first slot's type.

  `@effex/router`'s `Link` now matches the builder-primitive API:
  - `class` accepts the same `ClassValue` type as `$.div` etc. — string,
    `readonly ClassItem[]`, or a `Readable` of either.
  - `children` is variadic and takes any `ChildInput` — pass strings,
    Elements, arrays, or a mix without wrapping in a `$.div`.

  ```ts
  // Before
  Link(
    { href: "/docs", class: "btn" },
    $.div({}, $.i({ innerHTML: iconSvg }), $.span({}, "Docs")),
  );

  // After
  Link(
    { href: "/docs", class: ["btn", "btn-primary"] },
    $.i({ innerHTML: iconSvg }),
    $.span({}, "Docs"),
  );
  ```

  ### Component-author aliases

  Two purpose-oriented types for wrapper variadic-rest params — pick by the
  wrapper's intent:
  - **`Children<E, R>`** — variadic children of leaves only. Use when the
    wrapper wants to **interleave** its own owned children with forwarded
    ones in a single primitive call. Callers spread arrays:
    `Section(props, ...myArray)`.
  - **`PermissiveChildren<E, R>`** — variadic children of leaves _or_ one
    array-as-single-arg. Use for **pure pass-through** wrappers. Callers may
    write `Link(props, [a, b])`, `Link(props, a, b)`, or `Link(props, ...arr)`.

  Also exported from `@effex/dom` package root: `ChildInput`, `ChildLeaf`,
  `ClassValue`, `ClassItem`.

## 1.3.3

### Patch Changes

- 1419b6e: Fix client-mount FOUC for animated elements. On any fresh client-side mount (a new `addSlot` outside the hydration path — e.g. navigating away from a page and back), the element was inserted into the DOM _before_ its `enterFrom` classes were applied. The browser painted the resolved final state for one frame, then `forkSlotEnter`'s forked fiber applied `enterFrom` and ran the transition — producing a "already present, then animation runs" flash.

  SSR-then-hydration didn't have this problem because the SSG'd HTML bakes `enterFrom` classes into the initial paint. Client mounts didn't get the same guarantee.

  Now every client-mode `addSlot` (in `ClientControlCtx`, `createClientLikeControlCtx`'s post-hydration branch, and `createHydrationControlCtx`'s client-fallback branch) calls a new synchronous helper `applyPreInsertEnterFrom` that applies the configured `enterFrom` classes _before_ `insertBefore`. First paint of the element is now in the hidden pre-animation state; `runEnterAnimation` inside `forkSlotEnter` still re-applies them (no-op via `classList.add`), reflows, and swaps to `enter`/`enterTo` as before.

## 1.3.2

### Patch Changes

- 4f1f4fe: Surface reconcile-subscription failures via `console.error`. Every `ControlCtx` (`ClientControlCtx`, both `HydrationControlCtx` factories) implemented `subscribe(readable, handler)` by forking the stream reader into the parent scope. That's the right lifecycle model, but `Effect.forkIn` swallows fiber failures — if the handler ever threw (a route render errored, a data provider died mid-nav, a slot insertion blew up), the fiber died silently and the UI froze with no console output.

  Now every subscription goes through a shared `subscribeReconcile` helper that:
  1. Logs each failing handler run to `console.error` with a full Effect `Cause.pretty` (fiber trace + underlying errors) so devtools and error trackers pick it up.
  2. Catches the failure at the per-value boundary so a single bad update doesn't kill the subscription — subsequent state changes still fire the handler. Navigating away from a broken route and back now recovers.

  Practical impact: `Outlet` navigation errors (route render throws, data-provider rejects, guard errors) now surface immediately at the source instead of appearing as an unresponsive Outlet.

## 1.3.1

### Patch Changes

- 8b07d3d: Warn on invalid HTML nesting during rendering. Certain parent/child pairs (`<p>` in `<p>`, block-level content in `<p>`, nested anchors, interactive content in `<button>`, nested forms) get silently normalized by the browser's HTML parser — the live DOM ends up different from what SSR emitted, and hydration reports a confusing "Expected `<X>` but not found in `<Y>`" mismatch far from the actual cause.

  The renderers (`DOMRenderer`, SSR `StringRenderer`) now check each parent/child pair at `appendChild` time and emit a targeted `console.warn` once per pair per process explaining what the browser will do to the tree. Small runtime cost (a set lookup + string check), catches this class of bug at its source instead of downstream at hydration.

  Covered nestings:
  - `<p>` inside `<p>` and all block-level tags inside `<p>` (`div`, `section`, `ul`, `form`, `h1`-`h6`, `table`, …)
  - `<a>` inside `<a>`
  - Interactive elements inside `<button>` (`a`, `input`, `select`, `textarea`, …)
  - `<form>` inside `<form>`

## 1.3.0

### Minor Changes

- d95a27a: Add `animated` — a mount-once control function for wrapping a single element with enter animations. Solves the hand-authored intro-sequence case that was awkward under `each` / `when` (either had to shoehorn a static list into `each` or fake a boolean signal for `when`).

  ```ts
  const App = () =>
    Effect.gen(function* () {
      const [g0, g1, g2] = yield* Animation.sequence(3);
      return $.h1(
        {},
        collect(
          animated(
            {
              animate: {
                enterFrom: "opacity-0",
                enter: "opacity-100 transition duration-300",
                group: g0,
              },
              intro: true,
            },
            () => $.span({}, $.of("Hello,")),
          ),
          // No visual animation — the span has its own CSS keyframes; the
          // group still sequences when it appears.
          animated({ animate: { group: g1 } }, () =>
            $.span({ class: "wobble" }, $.of("world!")),
          ),
          animated(
            {
              animate: {
                enterFrom: "opacity-0",
                enter: "opacity-100 transition duration-500",
                group: g2,
              },
              intro: true,
            },
            () => $.span({}, $.of("Welcome.")),
          ),
        ),
      );
    });
  ```

  **Enter-only by design.** `animated` mounts its child and never removes it, so exit-animation fields would be dead code. The `animate` config uses the new `EnterOnlyAnimationOptions` type (a `Pick` of `AnimationOptions`) — the compiler prevents you from configuring `exit` / `exitTo` / `onExit`. `group` and `intro` behave the same as they do on `each` / `when` / `match`, including SSR emitting `enterFrom` classes for FOUC prevention when `intro: true`.

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
