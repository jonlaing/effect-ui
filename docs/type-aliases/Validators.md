[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Validators

# Type Alias: Validators\<T, E, R\>

> **Validators**\<`T`, `E`, `R`\> = `{ readonly [K in keyof T]?: AsyncValidator<T[K], E, R> }`

Defined in: [src/form/types.ts:72](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L72)

Validators configuration for a form.
Maps field names to async validator functions.

## Type Parameters

### T

`T`

### E

`E` = `never`

### R

`R` = `never`
