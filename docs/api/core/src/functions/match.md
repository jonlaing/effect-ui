[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / match

# Function: match()

> **match**\<`A`, `N`, `E`, `R`, `E2`, `R2`\>(`value`, `cases`, `fallback?`): [`Element`](../type-aliases/Element.md)\<`N`, `E` \| `E2`, `R` \| `R2`\>

Defined in: [packages/core/src/Control.ts:122](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Control.ts#L122)

Pattern match on a reactive value and render the corresponding element.

## Type Parameters

### A

`A`

### N

`N`

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

[`Readable`](../interfaces/Readable.md)\<`A`\>

Reactive value to match against

### cases

readonly [`MatchCase`](../interfaces/MatchCase.md)\<`A`, `N`, `E`, `R`\>[]

Array of pattern-render pairs

### fallback?

() => [`Element`](../type-aliases/Element.md)\<`N`, `E2`, `R2`\>

Optional fallback if no pattern matches

## Returns

[`Element`](../type-aliases/Element.md)\<`N`, `E` \| `E2`, `R` \| `R2`\>

## Example

```ts
type Status = "loading" | "success" | "error"
const status = yield* Signal.make<Status>("loading")

match(status, [
  { pattern: "loading", render: () => div("Loading...") },
  { pattern: "success", render: () => div("Done!") },
  { pattern: "error", render: () => div("Failed") },
])
```
