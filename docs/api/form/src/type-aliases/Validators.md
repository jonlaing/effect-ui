[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [form/src](../README.md) / Validators

# Type Alias: Validators\<T, E, R\>

> **Validators**\<`T`, `E`, `R`\> = `{ readonly [K in keyof T]?: AsyncValidator<T[K], E, R> }`

Defined in: [packages/form/src/form/types.ts:71](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L71)

Validators configuration for a form.
Maps field names to async validator functions.

## Type Parameters

### T

`T`

### E

`E` = `never`

### R

`R` = `never`
