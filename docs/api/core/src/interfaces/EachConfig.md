[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / EachConfig

# Interface: EachConfig\<A, N, E, R\>

Defined in: [packages/core/src/Control.ts:60](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L60)

Configuration for the `each` control flow.

## Type Parameters

### A

`A`

### N

`N`

### E

`E` = `never`

### R

`R` = `never`

## Properties

### container()?

> `readonly` `optional` **container**: () => [`Element`](../type-aliases/Element.md)\<`N`, `never`, `never`\>

Defined in: [packages/core/src/Control.ts:70](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L70)

Optional custom container element. If not provided, defaults to a div
with `display: contents`.

#### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `never`, `never`\>

#### Example

```ts
container: () => $.ul({ class: "todo-list" })
```

***

### key()

> `readonly` **key**: (`item`) => `string`

Defined in: [packages/core/src/Control.ts:72](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L72)

Function to extract a unique key from each item

#### Parameters

##### item

`A`

#### Returns

`string`

***

### render()

> `readonly` **render**: (`item`) => [`Element`](../type-aliases/Element.md)\<`N`, `E`, `R`\>

Defined in: [packages/core/src/Control.ts:74](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L74)

Function to render each item (receives a Readable for the item)

#### Parameters

##### item

[`Readable`](Readable.md)\<`A`\>

#### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `E`, `R`\>
