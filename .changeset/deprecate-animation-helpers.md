---
"@effex/dom": patch
---

Deprecate five under-used animation helpers with `@deprecated` JSDoc tags. All continue to work — they'll be removed in a future major.

- `staggerEased` — compose your own: `(index, total) => easingFn(index / (total - 1)) * totalDurationMs`
- `delay` — use `Effect.delay(effect, ms)` directly
- `sequence` — use `Effect.all([...], { concurrency: 1 })` directly
- `parallel` — use `Effect.all([...], { concurrency: "unbounded" })` directly
- `calculateStaggerDelay` — was only ever an internal helper; not re-exported by anything downstream

These wrapped effect combinators without adding real value beyond a slightly shorter name; the framework should be a thin layer over Effect rather than shadow its stdlib.
