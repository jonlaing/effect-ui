[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [form/src](../README.md) / Field

# Variable: Field

> `const` **Field**: `object`

Defined in: [packages/form/src/form/Field.ts:230](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/Field.ts#L230)

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
