[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / MatchCase

# Interface: MatchCase\<A, E, R\>

Defined in: [src/dom/Control.ts:183](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Control.ts#L183)

A case for pattern matching with [match](../functions/match.md).

## Type Parameters

### A

`A`

### E

`E` = `never`

### R

`R` = `never`

## Properties

### pattern

> `readonly` **pattern**: `A`

Defined in: [src/dom/Control.ts:185](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Control.ts#L185)

The value to match against

***

### render()

> `readonly` **render**: () => [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

Defined in: [src/dom/Control.ts:187](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Control.ts#L187)

Element to render when matched

#### Returns

[`Element`](../type-aliases/Element.md)\<`E`, `R`\>
