[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / DropdownMenuSubProps

# Interface: DropdownMenuSubProps

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:141](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L141)

Props for DropdownMenu.Sub

## Properties

### defaultOpen?

> `readonly` `optional` **defaultOpen**: `boolean`

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:145](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L145)

Default open state

***

### onOpenChange()?

> `readonly` `optional` **onOpenChange**: (`open`) => `Effect`\<`void`\>

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:147](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L147)

Callback when open state changes

#### Parameters

##### open

`boolean`

#### Returns

`Effect`\<`void`\>

***

### open?

> `readonly` `optional` **open**: [`SignalType`](../type-aliases/SignalType.md)\<`boolean`\>

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:143](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L143)

Controlled open state
