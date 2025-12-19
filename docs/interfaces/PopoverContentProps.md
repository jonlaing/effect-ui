[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / PopoverContentProps

# Interface: PopoverContentProps

Defined in: [src/primitives/Popover/Popover.ts:63](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L63)

Props for Popover.Content

## Properties

### align?

> `readonly` `optional` **align**: `"start"` \| `"center"` \| `"end"`

Defined in: [src/primitives/Popover/Popover.ts:69](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L69)

Alignment along the side axis (default: "center")

***

### alignOffset?

> `readonly` `optional` **alignOffset**: `number`

Defined in: [src/primitives/Popover/Popover.ts:73](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L73)

Shift along the side axis in pixels (default: 0)

***

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/Popover/Popover.ts:65](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L65)

Additional class names

***

### onClickOutside()?

> `readonly` `optional` **onClickOutside**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Popover/Popover.ts:75](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L75)

Called when clicking outside

#### Returns

`Effect`\<`void`\>

***

### onEscapeKeyDown()?

> `readonly` `optional` **onEscapeKeyDown**: (`event`) => `Effect`\<`void`\>

Defined in: [src/primitives/Popover/Popover.ts:77](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L77)

Called when Escape key is pressed

#### Parameters

##### event

`KeyboardEvent`

#### Returns

`Effect`\<`void`\>

***

### side?

> `readonly` `optional` **side**: `"left"` \| `"right"` \| `"top"` \| `"bottom"`

Defined in: [src/primitives/Popover/Popover.ts:67](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L67)

Positioning side relative to trigger (default: "bottom")

***

### sideOffset?

> `readonly` `optional` **sideOffset**: `number`

Defined in: [src/primitives/Popover/Popover.ts:71](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Popover/Popover.ts#L71)

Gap between trigger and content in pixels (default: 4)
