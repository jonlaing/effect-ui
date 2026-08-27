# Changelog

## 0.4.0

### Minor Changes

- 36b1d20: BREAKING: unify `runApp` + `mount` into a single `mount` for SPA startup

  (Marked `minor` — Stax is still pre-1.0, so we're using minor bumps
  for breaking changes. Once we hit `1.0.0` this would be `major`.)

  `runApp` is removed. Its responsibilities — providing `SignalRegistry`,
  merging caller layers, keeping the fiber alive via `Effect.never`, and
  pumping into a Promise — fold into `mount`. The new signature mirrors
  `hydrate`, so the two SPA entry points read as parallel intents rather
  than two different plumbing shapes:

  ```ts
  // SPA
  mount(App(), root, { layers: Navigation.makeLayer(router) });

  // SSR + hydration
  hydrate(App(), root, { layers: Navigation.makeLayer(router) });
  ```

  ## Migration

  Before:

  ```ts
  import { mount, runApp } from "@stax-ui/dom";

  runApp(
    Effect.gen(function* () {
      yield* mount(App(), document.getElementById("root")!);
    }),
  );
  ```

  After:

  ```ts
  import { mount } from "@stax-ui/dom";

  mount(App(), document.getElementById("root")!);
  ```

  With a layer:

  ```ts
  // Before
  runApp(mount(App(), root), { layer: Navigation.makeLayer(router) });

  // After
  mount(App(), root, { layers: Navigation.makeLayer(router) });
  ```

  Note that `options.layer` (singular) becomes `options.layers` (plural),
  matching `hydrate`. Compose multiple layers with `Layer.merge` or
  `Layer.mergeAll` as before.

  ## Why

  Every SPA in-tree did the same `runApp(Effect.gen(function* () { yield*
mount(App(), root) }))` dance — an `Effect.gen` wrapper that did one
  thing. The two-function form pushed a plumbing decision on every user
  of `mount` (they always chose the same one) and made SPA startup read
  differently than SSR hydration for no gained expressive power.

  The returned Promise from `mount` never resolves — this is intentional
  and matches the previous behavior of `runApp`. Mount is a terminal
  operation; it stakes out the fiber that owns the page's reactive
  lifetime.

- 3065684: feat(dom): preserve concrete element types through control-flow and Boundary wrappers

  Every DOM control-flow wrapper (`when`, `match`, `each`, `matchOption`,
  `matchEither`, `redraw`, `animated`) and both `Boundary.error` /
  `Boundary.suspense` used to pin their return element type to
  `HTMLElement | SVGElement`. Now the element type flows through:

  ```ts
  // Before
  each(todos, {
    container: () => $.ul({}), // ← Element<HTMLUListElement>
    key: (t) => t.id,
    render: (t) => $.li({}, t.text),
  });
  // inferred: Element<HTMLElement | SVGElement, ...>  — widened

  // After
  // inferred: Element<HTMLUListElement, ...>  — preserved
  ```

  For `Boundary.error`, the type unifies across both branches, so a
  `try`+`catch` that both return `Element<HTMLDivElement>` come back as
  `Element<HTMLDivElement>` — no more cast at `mount(App(), root)` sites.

  ## How it works

  Each config interface gains a trailing `N extends DOMElement = DOMElement`
  type parameter with a default. Container factories are typed
  `() => Element<N, never, never>`, so N is inferred from the container's
  concrete return type. Child branches (`onTrue`, `onFalse`, `onSome`, ...)
  keep the wider `Element<DOMElement, ...>` type — children can be any DOM
  element, only the container's type matters for the wrapper's return.

  Boundaries are different: `Boundary.error` and `Boundary.suspense` share
  N across all their branches (try, catch, render, fallback), because any
  of them can be the actually-rendered element. Inference unifies them at
  the call site.

  ## Back-compat

  Additive. The new type parameter has a default, so:

  - Existing callers that don't specify a container still get the same
    `Element<DOMElement, ...>` return type — behavior unchanged.
  - `EachConfig<Item, Error, Deps>` and other config annotations keep
    resolving; N falls back to `DOMElement`.
  - No runtime change. The generated JS is identical to before.

  ## Why

  Every user of `each`, `when`, `Boundary.error`, etc. previously had to
  either accept `HTMLElement | SVGElement` at every boundary or drop
  `as Element.Element<HTMLDivElement>` casts to narrow it. The casts
  weren't hiding bugs — they were papering over an artificial widening
  in the wrapper signatures. Removing the widening removes the casts.

### Patch Changes

- 05f94f9: fix(dom): stringify boolean `data-*` / `aria-*` values instead of using HTML boolean-attribute semantics

  `applyAttribute` was treating every boolean value as an HTML
  boolean-attribute — `true` set an empty string, `false` skipped the
  attribute entirely. That's correct for `disabled` / `checked` /
  `hidden` / etc., but wrong for `data-*` and `aria-*`, where consumers
  (CSS selectors, JS reads, ARIA state) expect the literal strings
  `"true"` and `"false"`.

  Fix: static boolean values only follow HTML boolean-attribute
  semantics when the key is in the fixed `BOOLEAN_ATTRIBUTES` set
  (`disabled`, `checked`, `selected`, `required`, `readonly`,
  `multiple`, `hidden`, `open`, `autofocus`, `autoplay`, `controls`,
  `default`, `defer`, `ismap`, `loop`, `muted`, `novalidate`,
  `reversed`). Everything else stringifies via `String(value)`.

  Before:

  ```ts
  $.div({ "data-active": true }); // <div data-active="">
  $.div({ "data-active": false }); // <div>              — attribute missing
  ```

  After:

  ```ts
  $.div({ "data-active": true }); // <div data-active="true">
  $.div({ "data-active": false }); // <div data-active="false">
  ```

  Also lifts the `EventHandler` type to the top-level `@stax-ui/dom`
  export so users writing typed `onClick` / `onSubmit` / etc. handlers
  don't have to reach into subpath modules.

  Callers that were working around the boolean-stringify gap with
  `Readable.map(v => v ? "true" : "false")` can drop the map entirely:

  ```ts
  // Before
  "data-active": Readable.map(active, (a) => (a === file.filename ? "true" : "false"))

  // After
  "data-active": Readable.map(active, (a) => a === file.filename)
  ```

  The `Readable<boolean>` path already stringifies via
  `Core.bindAttribute` — this change makes the static-boolean path
  consistent with that.

- Updated dependencies [2644592]
  - @stax-ui/core@0.3.0

## 0.3.0

### Minor Changes

- db36abb: feat(dom): auto-complete empty animation groups + `Animation.skip`

  Fixes a stall in `Animation.sequence` when a group has no registered
  animations — the previous behavior held the sequence forever waiting
  on `_done` that never fired. The typical trigger: a
  viewport-conditional branch (mobile hides the desktop-only
  `animated()` block, so the group never gets a registration), or a
  reduced-motion / error path that opts out of a step.

  Two new pieces:

  **Auto-complete on gate open.** When a group's gate opens, if no
  animation registers by the next tick, `_done` fires automatically so
  downstream sequence steps can advance. Registrations arriving later —
  reactive controls, late-mounted children — still run their
  animations; they just don't gate downstream, matching the existing
  "late arrivals don't re-open the signal" contract.

  ```ts
  // On mobile, don't render the chips step at all. The sequence
  // still cascades through `chips` to `cta` because `chips` completes
  // automatically with nothing registered.
  const [logo, chips, cta] = yield * Animation.sequence(3);
  return (
    yield *
    $.div(
      {},
      StaxLogo({ group: logo, intro: true }),
      yield * isMobile.get ? $.of("") : ChipRow({ group: chips, intro: true }),
      CtaButton({ group: cta, intro: true }),
    )
  );
  ```

  **Explicit `Animation.skip(group)`.** Forces a group's `_done` to
  fire without waiting on any registered animations to finish — the
  escape hatch for cases where the element IS rendered but the
  sequence should advance anyway (a "skip intro" button,
  `prefers-reduced-motion` fast-path, error branches, custom
  orchestrator logic). Idempotent, safe to call multiple times.
  Doesn't cancel in-flight animation fibers; they run to completion,
  they just no longer gate anything downstream.

  ```ts
  const [logo, chips, cta] = yield * Animation.sequence(3);
  if (yield * isMobile.get) {
    yield * Animation.skip(chips);
  }
  ```

  Purely additive. Existing sequences with real animations behave
  identically — the completion path from `_complete` (registered
  animation finished) is unchanged.

- 5b11e9d: feat(dom): add `Screen` — reactive viewport, media queries, and display metrics

  New primitive for reading viewport-level state as `Readable`s that
  compose with the rest of the reactivity system (`when`, `Readable.map`,
  `animated.group`, etc). Mirrors the shape of the browser's `Screen`
  interface, with two pragmatic tweaks:

  1. `Screen.width` / `Screen.height` return `window.innerWidth` /
     `innerHeight` — the VIEWPORT dimensions, which is what
     responsive-design code actually wants. The physical/logical
     display metrics from `window.screen` live under `Screen.display.*`.

  2. Adds `Screen.match(query)` — a `Readable<boolean>` from any
     `matchMedia` query. Closes the gap between viewport-conditional
     JS branches and the rest of the reactivity system.

  ```ts
  import { Screen } from "@stax-ui/dom";

  // Reactive viewport (window.innerWidth, updates on resize)
  const w = Screen.width;

  // Media-query matching — the main API
  const isMobile = Screen.match("(max-width: 767px)");
  const reducedMotion = Screen.match("(prefers-reduced-motion: reduce)");
  const prefersDark = Screen.match("(prefers-color-scheme: dark)");

  // Physical display metrics under `.display`
  const dpi = Screen.display.width;
  const orientation = Screen.display.orientation;
  ```

  **SSR-safe by construction.** On the server there's no `window`, so
  every reactive value stays at a sensible default (`0` for dimensions,
  `false` for match, `{ type: "landscape-primary", angle: 0 }` for
  orientation). `Screen.match` accepts an `initial:` option to override
  the boolean default per-query — useful when your SSR bias is known
  (portfolio site → mobile-first, ops dashboard → desktop-first). More
  sophisticated request-aware SSR defaults will land later via a
  Layer-based mechanism (tracked in a separate design issue).

  **Scope-clean.** Each Readable's change stream attaches its DOM
  event listener when subscribed and removes it when the enclosing
  scope closes. No lingering listeners, no leaks across route
  navigations.

  **Docs guidance to keep in mind.** For purely visual differences
  (hide at mobile, different padding), CSS `@media` is strictly better
  than `Screen.match` — both branches ship in the HTML for crawlers,
  no flash, no JS. `Screen.match` is for cases where the JS branch is
  fundamentally different code paths: skipping an animation sequence
  branch, deciding whether to mount a heavy component, choosing between
  two computed layouts.

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

### Patch Changes

- Updated dependencies [4bc4315]
  - @stax-ui/core@0.2.0

## 0.1.1

### Patch Changes

- 7bd0248: fix(dom): allow undefined/null/false and nested arrays in class values

  Widens `ClassItem` / `ClassValue` so a component can pass an optional
  `class?: ClassValue` prop straight through to `$.div({ class: [...] })`
  without a `?? ""` dance:

  ```ts
  export const Card = (props: { class?: ClassValue }) =>
    $.div({ class: ["rounded-lg border p-4", props.class] });
  ```

  Previously, the outer array position rejected `ClassValue | undefined`
  because `ClassItem` was only `string | Readable<string>` — no
  `undefined`, no nested arrays. `ClassItem` is now recursive and admits
  clsx-style falsy values:

  ```ts
  export type ClassItem =
    | string
    | undefined
    | null
    | false
    | Readable.Readable<string>
    | readonly ClassItem[];
  ```

  Runtime side: `applyClass` gains a small `flattenClassValue` helper
  that walks the tree once, strips `undefined | null | false | ""`, and
  produces a flat `(string | Readable<string>)[]`. Both the non-reactive
  fast path and the mixed-reactive per-item subscription path operate on
  that flat list, so nested arrays and falsy items behave end-to-end —
  including reactive items that live inside a nested branch.

  Purely additive: every previously-valid `class` value still typechecks
  and behaves the same.

## 0.1.0

Initial release. Renamed from the `@effex/*` scope.
