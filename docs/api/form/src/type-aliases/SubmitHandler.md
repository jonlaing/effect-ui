[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [form/src](../README.md) / SubmitHandler

# Type Alias: SubmitHandler()\<T, E, R\>

> **SubmitHandler**\<`T`, `E`, `R`\> = (`values`) => `Effect.Effect`\<`void`, `E`, `R`\>

Defined in: [packages/form/src/form/types.ts:112](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L112)

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
