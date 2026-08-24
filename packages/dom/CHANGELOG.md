# Changelog

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
