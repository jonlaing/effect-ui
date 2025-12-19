[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ContextMenuRadioGroupProps

# Interface: ContextMenuRadioGroupProps

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:129](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L129)

Props for ContextMenu.RadioGroup

## Properties

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:131](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L131)

Additional class names

***

### defaultValue?

> `readonly` `optional` **defaultValue**: `string`

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:135](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L135)

Default value (uncontrolled)

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:137](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L137)

Callback when value changes

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### value?

> `readonly` `optional` **value**: [`SignalType`](../type-aliases/SignalType.md)\<`string`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:133](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L133)

Controlled value
