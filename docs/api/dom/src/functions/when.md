[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / when

# Function: when()

> **when**\<`E1`, `R1`, `E2`, `R2`\>(`condition`, `config`): [`Element`](../type-aliases/Element.md)\<`E1` \| `E2`, `R1` \| `R2`\>

Defined in: [packages/dom/src/Control.ts:145](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Control.ts#L145)

Conditionally render one of two elements based on a reactive boolean.

## Type Parameters

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

[`Readable`](../../../core/src/interfaces/Readable.md)\<`boolean`\>

Reactive boolean value

### config

[`WhenConfig`](../interfaces/WhenConfig.md)\<`E1`, `R1`, `E2`, `R2`\>

Configuration object with onTrue, onFalse, optional container and animate

## Returns

[`Element`](../type-aliases/Element.md)\<`E1` \| `E2`, `R1` \| `R2`\>

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

```ts
// With animations
when(isVisible, {
  onTrue: () => Modal(),
  onFalse: () => $.div(),
  animate: { enter: "fade-in", exit: "fade-out" }
})
```
