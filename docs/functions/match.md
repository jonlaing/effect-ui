[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / match

# Function: match()

> **match**\<`A`, `E`, `R`, `E2`, `R2`\>(`value`, `cases`, `fallback?`): [`Element`](../type-aliases/Element.md)\<`E` \| `E2`, `R` \| `R2`\>

Defined in: [src/dom/Control.ts:208](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Control.ts#L208)

Pattern match on a reactive value and render the corresponding element.

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

[`Readable`](../interfaces/Readable.md)\<`A`\>

Reactive value to match against

### cases

readonly [`MatchCase`](../interfaces/MatchCase.md)\<`A`, `E`, `R`\>[]

Array of pattern-render pairs

### fallback?

() => [`Element`](../type-aliases/Element.md)\<`E2`, `R2`\>

Optional fallback if no pattern matches

## Returns

[`Element`](../type-aliases/Element.md)\<`E` \| `E2`, `R` \| `R2`\>

## Example

```ts
type Status = "loading" | "success" | "error"
const status = yield* Signal.make<Status>("loading")

match(status, [
  { pattern: "loading", render: () => div(["Loading..."]) },
  { pattern: "success", render: () => div(["Done!"]) },
  { pattern: "error", render: () => div(["Failed"]) },
])
```
