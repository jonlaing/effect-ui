[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / SubmitHandler

# Type Alias: SubmitHandler()\<T, E, R\>

> **SubmitHandler**\<`T`, `E`, `R`\> = (`values`) => `Effect.Effect`\<`void`, `E`, `R`\>

Defined in: [src/form/types.ts:113](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L113)

Submit handler function type.

## Type Parameters

### T

`T`

The validated form data type

### E

`E` = `never`

The error type

### R

`R` = `never`

The requirements

## Parameters

### values

`T`

## Returns

`Effect.Effect`\<`void`, `E`, `R`\>
