[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / Child

# Type Alias: Child\<N, E, R\>

> **Child**\<`N`, `E`, `R`\> = `string` \| `number` \| [`Element`](Element.md)\<`N`, `E`, `R`\> \| readonly `Child`\<`N`, `E`, `R`\>[]

Defined in: [packages/core/src/Element.ts:44](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Element.ts#L44)

Valid child types for an element: strings, numbers, elements, reactive values, or arrays thereof.
This is the generic version for use with any renderer.

## Type Parameters

### N

`N` = `unknown`

The node type

### E

`E` = `never`

The error type for child elements

### R

`R` = `never`

The requirements/context type for child elements
