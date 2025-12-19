[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / DropdownMenuCheckboxItemProps

# Interface: DropdownMenuCheckboxItemProps

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:175](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L175)

Props for DropdownMenu.CheckboxItem

## Properties

### checked?

> `readonly` `optional` **checked**: [`SignalType`](../type-aliases/SignalType.md)\<`boolean`\>

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:181](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L181)

Controlled checked state

***

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:177](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L177)

Additional class names

***

### defaultChecked?

> `readonly` `optional` **defaultChecked**: `boolean`

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:183](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L183)

Default checked state (uncontrolled)

***

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:179](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L179)

Whether this item is disabled

***

### onCheckedChange()?

> `readonly` `optional` **onCheckedChange**: (`checked`) => `Effect`\<`void`\>

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:185](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L185)

Callback when checked state changes

#### Parameters

##### checked

`boolean`

#### Returns

`Effect`\<`void`\>
