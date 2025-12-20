[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / match

# Function: match()

> **match**\<`A`, `E`, `R`, `E2`, `R2`\>(`value`, `cases`, `fallback?`, `options?`): [`Element`](../type-aliases/Element.md)\<`E` \| `E2`, `R` \| `R2`\>

Defined in: [packages/dom/src/Control.ts:187](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Control.ts#L187)

Pattern match on a reactive value and render the corresponding element.
For async data loading, use DeferredSuspense or DeferredSuspenseWithBoundary
inside the render function.

## Type Parameters

### A

`A`

### E

`E` = `never`

### R

`R` = `never`

### E2

`E2` = `never`

### R2

`R2` = `never`

## Parameters

### value

[`Readable`](../../../core/src/interfaces/Readable.md)\<`A`\>

Reactive value to match against

### cases

readonly [`MatchCase`](../interfaces/MatchCase.md)\<`A`, `E`, `R`\>[]

Array of pattern-render pairs

### fallback?

() => [`Element`](../type-aliases/Element.md)\<`E2`, `R2`\>

Optional fallback if no pattern matches

### options?

[`ControlAnimationOptions`](../interfaces/ControlAnimationOptions.md)

Optional animation configuration

## Returns

[`Element`](../type-aliases/Element.md)\<`E` \| `E2`, `R` \| `R2`\>

## Examples

```ts
// Simple matching
type Status = "loading" | "success" | "error"
const status = yield* Signal.make<Status>("loading")

match(status, [
  { pattern: "loading", render: () => div("Loading...") },
  { pattern: "success", render: () => div("Done!") },
  { pattern: "error", render: () => div("Failed") },
])
```

```ts
// With animations
match(status, [
  { pattern: "loading", render: () => Spinner() },
  { pattern: "success", render: () => SuccessMessage() },
  { pattern: "error", render: () => ErrorMessage() },
], undefined, { animate: { enter: "fade-in", exit: "fade-out" } })
```
