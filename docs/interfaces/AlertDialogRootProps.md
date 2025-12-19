[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / AlertDialogRootProps

# Interface: AlertDialogRootProps

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:37](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L37)

Props for AlertDialog.Root

## Properties

### defaultOpen?

> `readonly` `optional` **defaultOpen**: `boolean`

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:41](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L41)

Default open state for uncontrolled usage

***

### onOpenChange()?

> `readonly` `optional` **onOpenChange**: (`open`) => `Effect`\<`void`\>

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:43](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L43)

Callback when open state changes

#### Parameters

##### open

`boolean`

#### Returns

`Effect`\<`void`\>

***

### open?

> `readonly` `optional` **open**: [`SignalType`](../type-aliases/SignalType.md)\<`boolean`\>

Defined in: [src/primitives/AlertDialog/AlertDialog.ts:39](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/AlertDialog/AlertDialog.ts#L39)

Controlled open state - if provided, component is controlled
