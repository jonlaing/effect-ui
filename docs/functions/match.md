[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / match

# Function: match()

> **match**\<`A`\>(`value`, `cases`, `fallback?`): [`Element`](../type-aliases/Element.md)

Defined in: src/Control.ts:206

Pattern match on a reactive value and render the corresponding element.

## Type Parameters

### A

`A`

## Parameters

### value

[`Readable`](../interfaces/Readable.md)\<`A`\>

Reactive value to match against

### cases

readonly [`MatchCase`](../interfaces/MatchCase.md)\<`A`\>[]

Array of pattern-render pairs

### fallback?

() => [`Element`](../type-aliases/Element.md)

Optional fallback if no pattern matches

## Returns

[`Element`](../type-aliases/Element.md)

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
