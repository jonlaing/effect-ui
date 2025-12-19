[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / RadioGroupRootProps

# Interface: RadioGroupRootProps

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:32](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L32)

Props for RadioGroup.Root

## Properties

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:50](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L50)

Additional class names

***

### defaultValue?

> `readonly` `optional` **defaultValue**: `string`

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:36](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L36)

Default value for uncontrolled usage

***

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:42](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L42)

Whether the entire group is disabled

***

### loop?

> `readonly` `optional` **loop**: `boolean`

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:48](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L48)

Whether keyboard navigation loops (default: true)

***

### name?

> `readonly` `optional` **name**: `string`

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:40](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L40)

Name attribute for form submission

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:38](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L38)

Callback when value changes

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### orientation?

> `readonly` `optional` **orientation**: `"vertical"` \| `"horizontal"`

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:46](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L46)

Orientation (default: "vertical")

***

### required?

> `readonly` `optional` **required**: `boolean`

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:44](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L44)

Whether selection is required

***

### value?

> `readonly` `optional` **value**: [`SignalType`](../type-aliases/SignalType.md)\<`string`\>

Defined in: [src/primitives/RadioGroup/RadioGroup.ts:34](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/RadioGroup/RadioGroup.ts#L34)

Controlled value - if provided, component is controlled
