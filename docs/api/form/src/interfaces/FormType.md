[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [form/src](../README.md) / FormType

# Interface: FormType\<S, E, R\>

Defined in: [packages/form/src/form/types.ts:122](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L122)

The main Form interface.

## Type Parameters

### S

`S` *extends* `Schema.Schema.AnyNoContext`

The schema type

### E

`E` = `never`

The error type from validators

### R

`R` = `never`

The requirements from validators

## Properties

### errors

> `readonly` **errors**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`Record`\<`string`, readonly `string`[]\>\>

Defined in: [packages/form/src/form/types.ts:138](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L138)

All form errors by field name

***

### fields

> `readonly` **fields**: [`FormFields`](../type-aliases/FormFields.md)\<`Schema.Schema.Type`\<`S`\>\>

Defined in: [packages/form/src/form/types.ts:128](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L128)

Individual field accessors

***

### getValues()

> `readonly` **getValues**: () => `Effect`\<`Type`\<`S`\>\>

Defined in: [packages/form/src/form/types.ts:156](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L156)

Get current form values

#### Returns

`Effect`\<`Type`\<`S`\>\>

***

### isDirty

> `readonly` **isDirty**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/form/src/form/types.ts:136](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L136)

Whether any field has changed from initial

***

### isSubmitting

> `readonly` **isSubmitting**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/form/src/form/types.ts:132](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L132)

Whether the form is currently submitting

***

### isTouched

> `readonly` **isTouched**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/form/src/form/types.ts:134](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L134)

Whether any field has been touched

***

### isValid

> `readonly` **isValid**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/form/src/form/types.ts:130](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L130)

Whether the entire form is valid

***

### reset()

> `readonly` **reset**: () => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:144](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L144)

Reset all fields to initial values

#### Returns

`Effect`\<`void`\>

***

### setErrors()

> `readonly` **setErrors**: (`errors`) => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:146](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L146)

Set errors from server/external validation

#### Parameters

##### errors

`Partial`\<`Record`\<keyof `Schema.Schema.Type`\<`S`\>, readonly `string`[]\>\>

#### Returns

`Effect`\<`void`\>

***

### submit()

> `readonly` **submit**: \<`SE`, `SR`\>(`handler`) => `Effect`\<`void`, `E` \| `SE`, `R` \| `SR`\>

Defined in: [packages/form/src/form/types.ts:140](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L140)

Submit the form with a handler

#### Type Parameters

##### SE

`SE`

##### SR

`SR`

#### Parameters

##### handler

[`SubmitHandler`](../type-aliases/SubmitHandler.md)\<`Type`\<`S`\>, `SE`, `SR`\>

#### Returns

`Effect`\<`void`, `E` \| `SE`, `R` \| `SR`\>

***

### validate()

> `readonly` **validate**: () => `Effect`\<`Record`\<keyof `Type`\<`S`\>, readonly `string`[]\>, `E`, `R`\>

Defined in: [packages/form/src/form/types.ts:150](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/form/src/form/types.ts#L150)

Validate all fields and return all errors

#### Returns

`Effect`\<`Record`\<keyof `Type`\<`S`\>, readonly `string`[]\>, `E`, `R`\>
