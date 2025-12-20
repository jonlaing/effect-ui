[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / WhenConfig

# Interface: WhenConfig\<E1, R1, E2, R2\>

Defined in: [packages/dom/src/Control.ts:39](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Control.ts#L39)

Configuration for the `when` control flow (DOM-specific with animation support).

## Type Parameters

### E1

`E1` = `never`

### R1

`R1` = `never`

### E2

`E2` = `never`

### R2

`R2` = `never`

## Properties

### animate?

> `readonly` `optional` **animate**: [`AnimationOptions`](AnimationOptions.md)

Defined in: [packages/dom/src/Control.ts:55](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Control.ts#L55)

Optional animation configuration

***

### container()?

> `readonly` `optional` **container**: () => [`Element`](../type-aliases/Element.md)\<`never`, `never`\>

Defined in: [packages/dom/src/Control.ts:49](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Control.ts#L49)

Optional custom container element. If not provided, defaults to a div
with `display: contents`.

#### Returns

[`Element`](../type-aliases/Element.md)\<`never`, `never`\>

#### Example

```ts
container: () => $.tbody({ class: "data-rows" })
```

***

### onFalse()

> `readonly` **onFalse**: () => [`Element`](../type-aliases/Element.md)\<`E2`, `R2`\>

Defined in: [packages/dom/src/Control.ts:53](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Control.ts#L53)

Element to render when condition is false

#### Returns

[`Element`](../type-aliases/Element.md)\<`E2`, `R2`\>

***

### onTrue()

> `readonly` **onTrue**: () => [`Element`](../type-aliases/Element.md)\<`E1`, `R1`\>

Defined in: [packages/dom/src/Control.ts:51](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Control.ts#L51)

Element to render when condition is true

#### Returns

[`Element`](../type-aliases/Element.md)\<`E1`, `R1`\>
