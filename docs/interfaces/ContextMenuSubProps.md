[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ContextMenuSubProps

# Interface: ContextMenuSubProps

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:177](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L177)

Props for ContextMenu.Sub

## Properties

### defaultOpen?

> `readonly` `optional` **defaultOpen**: `boolean`

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:181](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L181)

Default open state

***

### onOpenChange()?

> `readonly` `optional` **onOpenChange**: (`open`) => `Effect`\<`void`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:183](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L183)

Callback when open state changes

#### Parameters

##### open

`boolean`

#### Returns

`Effect`\<`void`\>

***

### open?

> `readonly` `optional` **open**: [`SignalType`](../type-aliases/SignalType.md)\<`boolean`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:179](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L179)

Controlled open state
