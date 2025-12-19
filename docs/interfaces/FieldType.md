[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / FieldType

# Interface: FieldType\<A\>

Defined in: [src/form/types.ts:18](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L18)

A single form field with reactive state.

## Type Parameters

### A

`A`

The type of the field value

## Properties

### dirty

> `readonly` **dirty**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/form/types.ts:26](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L26)

Whether the field value has changed from initial

***

### errors

> `readonly` **errors**: [`Readable`](Readable.md)\<readonly `string`[]\>

Defined in: [src/form/types.ts:22](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L22)

Validation errors for this field

***

### reset()

> `readonly` **reset**: () => `Effect`\<`void`\>

Defined in: [src/form/types.ts:30](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L30)

Reset the field to its initial value

#### Returns

`Effect`\<`void`\>

***

### setErrors()

> `readonly` **setErrors**: (`errors`) => `Effect`\<`void`\>

Defined in: [src/form/types.ts:32](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L32)

Manually set errors for this field

#### Parameters

##### errors

readonly `string`[]

#### Returns

`Effect`\<`void`\>

***

### touch()

> `readonly` **touch**: () => `Effect`\<`void`\>

Defined in: [src/form/types.ts:28](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L28)

Mark the field as touched

#### Returns

`Effect`\<`void`\>

***

### touched

> `readonly` **touched**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/form/types.ts:24](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L24)

Whether the field has been touched (blurred)

***

### validate()

> `readonly` **validate**: () => `Effect`\<readonly `string`[]\>

Defined in: [src/form/types.ts:34](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L34)

Trigger validation for this field

#### Returns

`Effect`\<readonly `string`[]\>

***

### value

> `readonly` **value**: [`SignalType`](../type-aliases/SignalType.md)\<`A`\>

Defined in: [src/form/types.ts:20](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/form/types.ts#L20)

The field's current value (writable)
