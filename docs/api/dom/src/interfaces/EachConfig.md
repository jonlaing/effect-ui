[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / EachConfig

# Interface: EachConfig\<A, E, R\>

Defined in: [packages/dom/src/Control.ts:78](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Control.ts#L78)

Configuration for the `each` control flow (DOM-specific with animation support).

## Type Parameters

### A

`A`

### E

`E` = `never`

### R

`R` = `never`

## Properties

### animate?

> `readonly` `optional` **animate**: [`ListAnimationOptions`](ListAnimationOptions.md)

Defined in: [packages/dom/src/Control.ts:94](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Control.ts#L94)

Optional animation configuration

***

### container()?

> `readonly` `optional` **container**: () => [`Element`](../type-aliases/Element.md)\<`never`, `never`\>

Defined in: [packages/dom/src/Control.ts:88](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Control.ts#L88)

Optional custom container element. If not provided, defaults to a div
with `display: contents`.

#### Returns

[`Element`](../type-aliases/Element.md)\<`never`, `never`\>

#### Example

```ts
container: () => $.ul({ class: "todo-list" })
```

***

### key()

> `readonly` **key**: (`item`) => `string`

Defined in: [packages/dom/src/Control.ts:90](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Control.ts#L90)

Function to extract a unique key from each item

#### Parameters

##### item

`A`

#### Returns

`string`

***

### render()

> `readonly` **render**: (`item`) => [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

Defined in: [packages/dom/src/Control.ts:92](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Control.ts#L92)

Function to render each item (receives a Readable for the item)

#### Parameters

##### item

[`Readable`](../../../core/src/interfaces/Readable.md)\<`A`\>

#### Returns

[`Element`](../type-aliases/Element.md)\<`E`, `R`\>
