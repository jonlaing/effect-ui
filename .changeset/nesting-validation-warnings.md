---
"@effex/dom": patch
---

Warn on invalid HTML nesting during rendering. Certain parent/child pairs (`<p>` in `<p>`, block-level content in `<p>`, nested anchors, interactive content in `<button>`, nested forms) get silently normalized by the browser's HTML parser — the live DOM ends up different from what SSR emitted, and hydration reports a confusing "Expected `<X>` but not found in `<Y>`" mismatch far from the actual cause.

The renderers (`DOMRenderer`, SSR `StringRenderer`) now check each parent/child pair at `appendChild` time and emit a targeted `console.warn` once per pair per process explaining what the browser will do to the tree. Small runtime cost (a set lookup + string check), catches this class of bug at its source instead of downstream at hydration.

Covered nestings:

- `<p>` inside `<p>` and all block-level tags inside `<p>` (`div`, `section`, `ul`, `form`, `h1`-`h6`, `table`, …)
- `<a>` inside `<a>`
- Interactive elements inside `<button>` (`a`, `input`, `select`, `textarea`, …)
- `<form>` inside `<form>`
