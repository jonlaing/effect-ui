[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / FormFields

# Type Alias: FormFields\<T\>

> **FormFields**\<`T`\> = `{ readonly [K in keyof T]: T[K] extends readonly (infer Item)[] ? FieldArray<Item> : FieldType<T[K]> }`

Defined in: [src/form/types.ts:101](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L101)

Extracts field types from a schema type.
Maps each property to a Field of that type.

## Type Parameters

### T

`T`
