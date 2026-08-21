# Changelog

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
