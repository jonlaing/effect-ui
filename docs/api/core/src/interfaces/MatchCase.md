[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / MatchCase

# Interface: MatchCase\<A, N, E, R\>

Defined in: [packages/core/src/Control.ts:98](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Control.ts#L98)

A case for pattern matching with [match](../functions/match.md).

## Extended by

- [`MatchCase`](../../../dom/src/interfaces/MatchCase.md)

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

### pattern

> `readonly` **pattern**: `A`

Defined in: [packages/core/src/Control.ts:99](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Control.ts#L99)

***

### render()

> `readonly` **render**: () => [`Element`](../type-aliases/Element.md)\<`N`, `E`, `R`\>

Defined in: [packages/core/src/Control.ts:100](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Control.ts#L100)

#### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `E`, `R`\>
