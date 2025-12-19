[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / FormType

# Interface: FormType\<S, E, R\>

Defined in: [src/form/types.ts:123](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L123)

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

> `readonly` **errors**: [`Readable`](Readable.md)\<`Record`\<`string`, readonly `string`[]\>\>

Defined in: [src/form/types.ts:139](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L139)

All form errors by field name

***

### fields

> `readonly` **fields**: [`FormFields`](../type-aliases/FormFields.md)\<`Schema.Schema.Type`\<`S`\>\>

Defined in: [src/form/types.ts:129](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L129)

Individual field accessors

***

### getValues()

> `readonly` **getValues**: () => `Effect`\<`Type`\<`S`\>\>

Defined in: [src/form/types.ts:157](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L157)

Get current form values

#### Returns

`Effect`\<`Type`\<`S`\>\>

***

### isDirty

> `readonly` **isDirty**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/form/types.ts:137](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L137)

Whether any field has changed from initial

***

### isSubmitting

> `readonly` **isSubmitting**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/form/types.ts:133](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L133)

Whether the form is currently submitting

***

### isTouched

> `readonly` **isTouched**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/form/types.ts:135](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L135)

Whether any field has been touched

***

### isValid

> `readonly` **isValid**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/form/types.ts:131](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L131)

Whether the entire form is valid

***

### reset()

> `readonly` **reset**: () => `Effect`\<`void`\>

Defined in: [src/form/types.ts:145](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L145)

Reset all fields to initial values

#### Returns

`Effect`\<`void`\>

***

### setErrors()

> `readonly` **setErrors**: (`errors`) => `Effect`\<`void`\>

Defined in: [src/form/types.ts:147](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L147)

Set errors from server/external validation

#### Parameters

##### errors

`Partial`\<`Record`\<keyof `Schema.Schema.Type`\<`S`\>, readonly `string`[]\>\>

#### Returns

`Effect`\<`void`\>

***

### submit()

> `readonly` **submit**: \<`SE`, `SR`\>(`handler`) => `Effect`\<`void`, `E` \| `SE`, `R` \| `SR`\>

Defined in: [src/form/types.ts:141](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L141)

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

Defined in: [src/form/types.ts:151](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L151)

Validate all fields and return all errors

#### Returns

`Effect`\<`Record`\<keyof `Type`\<`S`\>, readonly `string`[]\>, `E`, `R`\>
