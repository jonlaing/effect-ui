[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ContextMenuItemProps

# Interface: ContextMenuItemProps

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:67](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L67)

Props for ContextMenu.Item

## Properties

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:69](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L69)

Additional class names

***

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:71](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L71)

Whether this item is disabled

***

### onSelect()?

> `readonly` `optional` **onSelect**: () => `Effect`\<`void`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:73](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L73)

Callback when item is selected

#### Returns

`Effect`\<`void`\>
