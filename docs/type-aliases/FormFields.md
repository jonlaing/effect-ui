[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / FormFields

# Type Alias: FormFields\<T\>

> **FormFields**\<`T`\> = `{ readonly [K in keyof T]: T[K] extends readonly (infer Item)[] ? FieldArray<Item> : FieldType<T[K]> }`

Defined in: [src/form/types.ts:101](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L101)

Extracts field types from a schema type.
Maps each property to a Field of that type.

## Type Parameters

### T

`T`
