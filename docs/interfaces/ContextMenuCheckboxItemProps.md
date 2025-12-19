[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ContextMenuCheckboxItemProps

# Interface: ContextMenuCheckboxItemProps

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:103](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L103)

Props for ContextMenu.CheckboxItem

## Properties

### checked?

> `readonly` `optional` **checked**: [`SignalType`](../type-aliases/SignalType.md)\<`boolean`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:109](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L109)

Controlled checked state

***

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:105](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L105)

Additional class names

***

### defaultChecked?

> `readonly` `optional` **defaultChecked**: `boolean`

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:111](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L111)

Default checked state (uncontrolled)

***

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:107](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L107)

Whether this item is disabled

***

### onCheckedChange()?

> `readonly` `optional` **onCheckedChange**: (`checked`) => `Effect`\<`void`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:113](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L113)

Callback when checked state changes

#### Parameters

##### checked

`boolean`

#### Returns

`Effect`\<`void`\>
