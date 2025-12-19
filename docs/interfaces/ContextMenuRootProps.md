[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ContextMenuRootProps

# Interface: ContextMenuRootProps

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:37](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L37)

Props for ContextMenu.Root

## Properties

### onOpenChange()?

> `readonly` `optional` **onOpenChange**: (`open`) => `Effect`\<`void`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:41](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L41)

Callback when open state changes

#### Parameters

##### open

`boolean`

#### Returns

`Effect`\<`void`\>

***

### open?

> `readonly` `optional` **open**: [`SignalType`](../type-aliases/SignalType.md)\<`boolean`\>

Defined in: [src/primitives/ContextMenu/ContextMenu.ts:39](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ContextMenu/ContextMenu.ts#L39)

Controlled open state
