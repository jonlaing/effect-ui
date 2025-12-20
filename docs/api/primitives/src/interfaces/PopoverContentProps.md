[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / PopoverContentProps

# Interface: PopoverContentProps

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:65](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Popover/Popover.ts#L65)

Props for Popover.Content

## Properties

### align?

> `readonly` `optional` **align**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`"center"` \| `"start"` \| `"end"`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:71](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Popover/Popover.ts#L71)

Alignment along the side axis (default: "center")

***

### alignOffset?

> `readonly` `optional` **alignOffset**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`number`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:75](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Popover/Popover.ts#L75)

Shift along the side axis in pixels (default: 0)

***

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:67](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Popover/Popover.ts#L67)

Additional class names

***

### onClickOutside()?

> `readonly` `optional` **onClickOutside**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:77](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Popover/Popover.ts#L77)

Called when clicking outside

#### Returns

`Effect`\<`void`\>

***

### onEscapeKeyDown()?

> `readonly` `optional` **onEscapeKeyDown**: (`event`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:79](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Popover/Popover.ts#L79)

Called when Escape key is pressed

#### Parameters

##### event

`KeyboardEvent`

#### Returns

`Effect`\<`void`\>

***

### side?

> `readonly` `optional` **side**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`"top"` \| `"bottom"` \| `"left"` \| `"right"`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:69](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Popover/Popover.ts#L69)

Positioning side relative to trigger (default: "bottom")

***

### sideOffset?

> `readonly` `optional` **sideOffset**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`number`\>

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:73](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Popover/Popover.ts#L73)

Gap between trigger and content in pixels (default: 4)
