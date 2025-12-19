[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ComboboxRootProps

# Interface: ComboboxRootProps

Defined in: [src/primitives/Combobox/Combobox.ts:118](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L118)

Props for Combobox.Root

## Properties

### defaultInputValue?

> `readonly` `optional` **defaultInputValue**: `string`

Defined in: [src/primitives/Combobox/Combobox.ts:129](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L129)

Default input value (uncontrolled)

***

### defaultOpen?

> `readonly` `optional` **defaultOpen**: `boolean`

Defined in: [src/primitives/Combobox/Combobox.ts:136](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L136)

Default open state (uncontrolled)

***

### defaultValue?

> `readonly` `optional` **defaultValue**: `string`

Defined in: [src/primitives/Combobox/Combobox.ts:122](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L122)

Default selected value (uncontrolled)

***

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/primitives/Combobox/Combobox.ts:141](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L141)

Whether the combobox is disabled

***

### filterFn?

> `readonly` `optional` **filterFn**: [`ComboboxFilterFn`](../type-aliases/ComboboxFilterFn.md) \| `null`

Defined in: [src/primitives/Combobox/Combobox.ts:153](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L153)

Filter function to determine which items to show.
Defaults to case-insensitive substring matching.
Set to `null` to disable filtering (for external/async filtering).

***

### inputValue?

> `readonly` `optional` **inputValue**: [`SignalType`](../type-aliases/SignalType.md)\<`string`\>

Defined in: [src/primitives/Combobox/Combobox.ts:127](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L127)

Controlled input value

***

### isLoading?

> `readonly` `optional` **isLoading**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Combobox/Combobox.ts:146](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L146)

Loading state for async operations

***

### loop?

> `readonly` `optional` **loop**: `boolean`

Defined in: [src/primitives/Combobox/Combobox.ts:143](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L143)

Whether keyboard navigation loops (default: true)

***

### onInputValueChange()?

> `readonly` `optional` **onInputValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:131](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L131)

Callback when input value changes

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### onOpenChange()?

> `readonly` `optional` **onOpenChange**: (`open`) => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:138](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L138)

Callback when open state changes

#### Parameters

##### open

`boolean`

#### Returns

`Effect`\<`void`\>

***

### onValueChange()?

> `readonly` `optional` **onValueChange**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:124](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L124)

Callback when selected value changes

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### open?

> `readonly` `optional` **open**: [`SignalType`](../type-aliases/SignalType.md)\<`boolean`\>

Defined in: [src/primitives/Combobox/Combobox.ts:134](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L134)

Controlled open state

***

### value?

> `readonly` `optional` **value**: [`SignalType`](../type-aliases/SignalType.md)\<`string`\>

Defined in: [src/primitives/Combobox/Combobox.ts:120](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L120)

Controlled selected value
