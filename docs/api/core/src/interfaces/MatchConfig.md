[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / MatchConfig

# Interface: MatchConfig\<A, N, E, R, E2, R2\>

Defined in: [packages/core/src/Control.ts:38](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L38)

Configuration for the `match` control flow.

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

## Properties

### cases

> `readonly` **cases**: readonly [`MatchCase`](MatchCase.md)\<`A`, `N`, `E`, `R`\>[]

Defined in: [packages/core/src/Control.ts:52](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L52)

Array of pattern-render pairs

***

### container()?

> `readonly` `optional` **container**: () => [`Element`](../type-aliases/Element.md)\<`N`, `never`, `never`\>

Defined in: [packages/core/src/Control.ts:50](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L50)

Optional custom container element. If not provided, defaults to a div
with `display: contents`.

#### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `never`, `never`\>

***

### fallback()?

> `readonly` `optional` **fallback**: () => [`Element`](../type-aliases/Element.md)\<`N`, `E2`, `R2`\>

Defined in: [packages/core/src/Control.ts:54](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L54)

Optional fallback if no pattern matches

#### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `E2`, `R2`\>
