---
"@stax-ui/dom": patch
---

fix(dom): stringify boolean `data-*` / `aria-*` values instead of using HTML boolean-attribute semantics

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
$.div({ "data-active": true })      // <div data-active="">
$.div({ "data-active": false })     // <div>              — attribute missing
```

After:
```ts
$.div({ "data-active": true })      // <div data-active="true">
$.div({ "data-active": false })     // <div data-active="false">
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
