[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / WhenConfig

# Interface: WhenConfig\<N, E1, R1, E2, R2\>

Defined in: [packages/core/src/Control.ts:10](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L10)

Configuration for the `when` control flow.

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

## Properties

### container()?

> `readonly` `optional` **container**: () => [`Element`](../type-aliases/Element.md)\<`N`, `never`, `never`\>

Defined in: [packages/core/src/Control.ts:20](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L20)

Optional custom container element. If not provided, defaults to a div
with `display: contents`.

#### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `never`, `never`\>

#### Example

```ts
container: () => $.tbody({ class: "data-rows" })
```

***

### onFalse()

> `readonly` **onFalse**: () => [`Element`](../type-aliases/Element.md)\<`N`, `E2`, `R2`\>

Defined in: [packages/core/src/Control.ts:24](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L24)

Element to render when condition is false

#### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `E2`, `R2`\>

***

### onTrue()

> `readonly` **onTrue**: () => [`Element`](../type-aliases/Element.md)\<`N`, `E1`, `R1`\>

Defined in: [packages/core/src/Control.ts:22](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L22)

Element to render when condition is true

#### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `E1`, `R1`\>
