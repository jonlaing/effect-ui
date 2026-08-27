---
"@stax-ui/dom": minor
---

feat(dom): add `Keyboard` module for declarative keyboard bindings

Phase 1 of the a11y-primitives push. Ships a scoped, cross-platform
keyboard-binding API that handles the load-bearing details users get
wrong when writing ad-hoc: cleanup, cross-platform modifier
mapping, and the "shortcut vs. typing in a text field" collision.

```ts
import { Effect } from "effect";
import { Keyboard } from "@stax-ui/dom";

// Global — bound to `document`
yield* Keyboard.on("mod+k", () =>
  Effect.sync(() => paletteOpen.set(true)),
);

// Element-local via ElementRef — auto (re)attaches on
// mount/unmount, no manual bookkeeping.
yield* Keyboard.on("Escape", () => Effect.sync(() => close()), {
  target: containerRef,
});

// Multiple bindings, one handler
yield* Keyboard.on(["ArrowDown", "j"], moveDown, {
  target: containerRef,
});
```

## What's in the module

- **`Keyboard.on(binding, handler, options?)`** — Effect-scoped
  binding. Auto-cleanup on scope close.

- **Handler type is `(KeyboardEvent) => Effect<void, never, never>`.**
  Deliberately does NOT accept plain `() => void` — plain-function
  handlers are exactly where uncaught exceptions and un-typed side
  effects sneak in. Wrap DOM writes in `Effect.sync` (small cost,
  big norm-shift toward error-typed code).

- **Binding syntax.** `[modifier+]*key`. Modifiers: `mod`
  (platform-normalized — `meta` on macOS, `ctrl` elsewhere), `meta`,
  `ctrl`, `alt`, `shift`. Keys follow `KeyboardEvent.key` values,
  case-insensitive.

  One documented alias: `"Space"` (any casing) → `" "`. The literal
  `" "` also works because it's the canonical `KeyboardEvent.key`
  value — the alias exists only because `" "` is invisible in
  source and code-review-hostile.

- **`parseBinding(string)`** — exported for callers building
  bindings dynamically. Returns `Effect<ParsedBinding,
  KeyboardBindingError>`. `Keyboard.on` uses this internally with
  `Effect.orDie` so its E channel stays `never` — a bad binding
  string is a programmer bug, not a runtime failure a caller should
  handle. Dynamic-binding consumers can call `parseBinding` first
  and catch the typed error.

- **Targets:** `"document"` (default), any `HTMLElement`, or an
  `ElementRef`. Ref targets subscribe to `isConnected` so the
  listener follows the element's mount lifecycle without manual
  bookkeeping.

- **`preventDefault`** as `boolean | (KeyboardEvent) => boolean`.
  Omit for a smart default that skips preventDefault when the event
  target is an editable element (text `<input>`, `<textarea>`,
  contenteditable) — so global bindings like `"j"` for feed nav
  don't block typing in a search box.

- **`stopPropagation`** off by default so a parent Keyboard binding
  for the same key still fires; opt in when a child scope should
  consume the event.

- Named predicates exported alongside: `outsideInputs` (the
  default), `withModifier`, and the underlying `isEditableTarget`
  helper.

## Not shipped in this PR

- `Keyboard.format` for rendering bindings as `⌘K` / `Ctrl+K` in
  UI. A display-side concern separate from binding; will land in a
  follow-up when we have a real widget consumer for it.
- Multi-key sequences and chords.
- Global shortcut registry / cheatsheet.

## Unlocks

`Escape.on`, `RovingTabIndex`, and eventually the headless-widget
`Dialog` all compose on top of this.
