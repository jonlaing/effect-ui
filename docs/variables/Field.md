[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Field

# Variable: Field

> `const` **Field**: `object`

Defined in: [src/form/Field.ts:228](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/Field.ts#L228)

Field module namespace for creating form fields.

## Type Declaration

### make()

> **make**: \<`A`\>(`options`) => `Effect`\<[`FieldType`](../interfaces/FieldType.md)\<`A`\>, `never`, `Scope`\> = `makeField`

Create a form field with reactive state.

#### Type Parameters

##### A

`A`

#### Parameters

##### options

`FieldOptions`\<`A`\>

Field configuration

#### Returns

`Effect`\<[`FieldType`](../interfaces/FieldType.md)\<`A`\>, `never`, `Scope`\>

### makeArray()

> **makeArray**: \<`A`\>(`options`) => `Effect`\<[`FieldArray`](../interfaces/FieldArray.md)\<`A`\>, `never`, `Scope`\> = `makeFieldArray`

Create a field array for dynamic lists.

#### Type Parameters

##### A

`A`

#### Parameters

##### options

`FieldArrayOptions`\<`A`\>

Field array configuration

#### Returns

`Effect`\<[`FieldArray`](../interfaces/FieldArray.md)\<`A`\>, `never`, `Scope`\>
