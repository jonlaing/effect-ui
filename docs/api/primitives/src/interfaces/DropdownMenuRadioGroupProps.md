[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / DropdownMenuRadioGroupProps

# Interface: DropdownMenuRadioGroupProps

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:202](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L202)

Props for DropdownMenu.RadioGroup

## Properties

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:204](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L204)

Additional class names

***

### defaultValue?

> `readonly` `optional` **defaultValue**: `string`

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:208](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L208)

Default value (uncontrolled)

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:210](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L210)

Callback when value changes

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### value?

> `readonly` `optional` **value**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:206](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L206)

Controlled value
