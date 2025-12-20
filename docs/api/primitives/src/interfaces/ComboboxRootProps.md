[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ComboboxRootProps

# Interface: ComboboxRootProps

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:120](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L120)

Props for Combobox.Root

## Properties

### defaultInputValue?

> `readonly` `optional` **defaultInputValue**: `string`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:131](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L131)

Default input value (uncontrolled)

***

### defaultOpen?

> `readonly` `optional` **defaultOpen**: `boolean`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:138](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L138)

Default open state (uncontrolled)

***

### defaultValue?

> `readonly` `optional` **defaultValue**: `string`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:124](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L124)

Default selected value (uncontrolled)

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:143](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L143)

Whether the combobox is disabled

***

### filterFn?

> `readonly` `optional` **filterFn**: [`ComboboxFilterFn`](../type-aliases/ComboboxFilterFn.md) \| `null`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:155](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L155)

Filter function to determine which items to show.
Defaults to case-insensitive substring matching.
Set to `null` to disable filtering (for external/async filtering).

***

### inputValue?

> `readonly` `optional` **inputValue**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:129](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L129)

Controlled input value

***

### isLoading?

> `readonly` `optional` **isLoading**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:148](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L148)

Loading state for async operations

***

### loop?

> `readonly` `optional` **loop**: `boolean`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:145](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L145)

Whether keyboard navigation loops (default: true)

***

### onInputValueChange()?

> `readonly` `optional` **onInputValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:133](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L133)

Callback when input value changes

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### onOpenChange()?

> `readonly` `optional` **onOpenChange**: (`open`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:140](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L140)

Callback when open state changes

#### Parameters

##### open

`boolean`

#### Returns

`Effect`\<`void`\>

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:126](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L126)

Callback when selected value changes

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### open?

> `readonly` `optional` **open**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:136](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L136)

Controlled open state

***

### value?

> `readonly` `optional` **value**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:122](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L122)

Controlled selected value
