[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / when

# Function: when()

> **when**\<`N`, `E1`, `R1`, `E2`, `R2`\>(`condition`, `config`): [`Element`](../type-aliases/Element.md)\<`N`, `E1` \| `E2`, `R1` \| `R2`\>

Defined in: [packages/core/src/Control.ts:115](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L115)

Conditionally render one of two elements based on a reactive boolean.

## Type Parameters

### N

`N`

### E1

`E1` = `never`

### R1

`R1` = `never`

### E2

`E2` = `never`

### R2

`R2` = `never`

## Parameters

### condition

[`Readable`](../interfaces/Readable.md)\<`boolean`\>

Reactive boolean value

### config

[`WhenConfig`](../interfaces/WhenConfig.md)\<`N`, `E1`, `R1`, `E2`, `R2`\>

Configuration object with onTrue, onFalse, and optional container

## Returns

[`Element`](../type-aliases/Element.md)\<`N`, `E1` \| `E2`, `R1` \| `R2`\>

## Examples

```ts
const isLoggedIn = yield* Signal.make(false)

when(isLoggedIn, {
  onTrue: () => $.div("Welcome back!"),
  onFalse: () => $.div("Please log in")
})
```

```ts
// With custom container for valid HTML in tables
when(hasData, {
  container: () => $.tbody({ class: "data-rows" }),
  onTrue: () => $.tr($.td("Data row")),
  onFalse: () => $.tr($.td("No data"))
})
```
