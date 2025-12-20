[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / MatchCase

# Interface: MatchCase\<A, E, R\>

Defined in: [packages/dom/src/Control.ts:27](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Control.ts#L27)

A case for pattern matching with [match](../../../core/src/functions/match.md).

## Extends

- [`MatchCase`](../../../core/src/interfaces/MatchCase.md)\<`A`, `HTMLElement`, `E`, `R`\>

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

Defined in: [packages/core/src/Control.ts:99](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Control.ts#L99)

#### Inherited from

[`MatchCase`](../../../core/src/interfaces/MatchCase.md).[`pattern`](../../../core/src/interfaces/MatchCase.md#pattern)

***

### render()

> `readonly` **render**: () => [`Element`](../../../core/src/type-aliases/Element.md)\<`HTMLElement`, `E`, `R`\>

Defined in: [packages/core/src/Control.ts:100](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Control.ts#L100)

#### Returns

[`Element`](../../../core/src/type-aliases/Element.md)\<`HTMLElement`, `E`, `R`\>

#### Inherited from

[`MatchCase`](../../../core/src/interfaces/MatchCase.md).[`render`](../../../core/src/interfaces/MatchCase.md#render)
