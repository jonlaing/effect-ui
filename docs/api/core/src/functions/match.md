[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / match

# Function: match()

> **match**\<`A`, `N`, `E`, `R`, `E2`, `R2`\>(`value`, `config`): [`Element`](../type-aliases/Element.md)\<`N`, `E` \| `E2`, `R` \| `R2`\>

Defined in: [packages/core/src/Control.ts:219](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L219)

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

### config

[`MatchConfig`](../interfaces/MatchConfig.md)\<`A`, `N`, `E`, `R`, `E2`, `R2`\>

Configuration object with cases, optional fallback, and optional container

## Returns

[`Element`](../type-aliases/Element.md)\<`N`, `E` \| `E2`, `R` \| `R2`\>

## Examples

```ts
type Status = "loading" | "success" | "error"
const status = yield* Signal.make<Status>("loading")

match(status, {
  cases: [
    { pattern: "loading", render: () => $.div("Loading...") },
    { pattern: "success", render: () => $.div("Done!") },
    { pattern: "error", render: () => $.div("Failed") },
  ]
})
```

```ts
// With fallback
match(status, {
  cases: [
    { pattern: "loading", render: () => Spinner() },
  ],
  fallback: () => $.div("Unknown status")
})
```
