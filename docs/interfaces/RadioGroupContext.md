[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / RadioGroupContext

# Interface: RadioGroupContext

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:12](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L12)

Context shared between RadioGroup parts.

## Properties

### disabled

> `readonly` **disabled**: `boolean`

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:20](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L20)

Whether the entire group is disabled

***

### loop

> `readonly` **loop**: `boolean`

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:26](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L26)

Whether keyboard navigation loops

***

### name?

> `readonly` `optional` **name**: `string`

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:18](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L18)

Name attribute for form submission

***

### orientation

> `readonly` **orientation**: `"vertical"` \| `"horizontal"`

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:24](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L24)

Orientation (affects keyboard navigation)

***

### required

> `readonly` **required**: `boolean`

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:22](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L22)

Whether selection is required

***

### setValue()

> `readonly` **setValue**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:16](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L16)

Set the selected value

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### value

> `readonly` **value**: [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:14](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L14)

Current selected value
