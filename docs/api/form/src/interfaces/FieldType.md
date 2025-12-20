[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [form/src](../README.md) / FieldType

# Interface: FieldType\<A\>

Defined in: [packages/form/src/form/types.ts:17](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L17)

A single form field with reactive state.

## Type Parameters

### A

`A`

The type of the field value

## Properties

### dirty

> `readonly` **dirty**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/form/src/form/types.ts:25](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L25)

Whether the field value has changed from initial

***

### errors

> `readonly` **errors**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<readonly `string`[]\>

Defined in: [packages/form/src/form/types.ts:21](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L21)

Validation errors for this field

***

### reset()

> `readonly` **reset**: () => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:29](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L29)

Reset the field to its initial value

#### Returns

`Effect`\<`void`\>

***

### setErrors()

> `readonly` **setErrors**: (`errors`) => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:31](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L31)

Manually set errors for this field

#### Parameters

##### errors

readonly `string`[]

#### Returns

`Effect`\<`void`\>

***

### touch()

> `readonly` **touch**: () => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:27](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L27)

Mark the field as touched

#### Returns

`Effect`\<`void`\>

***

### touched

> `readonly` **touched**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/form/src/form/types.ts:23](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L23)

Whether the field has been touched (blurred)

***

### validate()

> `readonly` **validate**: () => `Effect`\<readonly `string`[]\>

Defined in: [packages/form/src/form/types.ts:33](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L33)

Trigger validation for this field

#### Returns

`Effect`\<readonly `string`[]\>

***

### value

> `readonly` **value**: [`Signal`](../../../core/src/namespaces/Signal/interfaces/Signal.md)\<`A`\>

Defined in: [packages/form/src/form/types.ts:19](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L19)

The field's current value (writable)
