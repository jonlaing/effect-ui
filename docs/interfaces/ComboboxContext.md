[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ComboboxContext

# Interface: ComboboxContext

Defined in: [src/primitives/Combobox/Combobox.ts:37](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L37)

Context shared between Combobox parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:43](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L43)

Close the listbox

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [src/primitives/Combobox/Combobox.ts:81](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L81)

Unique ID for the content element

***

### disabled

> `readonly` **disabled**: `boolean`

Defined in: [src/primitives/Combobox/Combobox.ts:94](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L94)

Whether the combobox is disabled

***

### getItemId()

> `readonly` **getItemId**: (`value`) => `string`

Defined in: [src/primitives/Combobox/Combobox.ts:85](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L85)

Get the ID for an item by its value

#### Parameters

##### value

`string`

#### Returns

`string`

***

### highlightedValue

> `readonly` **highlightedValue**: [`SignalType`](../type-aliases/SignalType.md)\<`string` \| `null`\>

Defined in: [src/primitives/Combobox/Combobox.ts:54](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L54)

The currently highlighted item value (keyboard navigation)

***

### highlightFirst()

> `readonly` **highlightFirst**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:62](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L62)

Highlight the first item

#### Returns

`Effect`\<`void`\>

***

### highlightLast()

> `readonly` **highlightLast**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:64](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L64)

Highlight the last item

#### Returns

`Effect`\<`void`\>

***

### highlightNext()

> `readonly` **highlightNext**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:58](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L58)

Highlight the next item

#### Returns

`Effect`\<`void`\>

***

### highlightPrev()

> `readonly` **highlightPrev**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:60](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L60)

Highlight the previous item

#### Returns

`Effect`\<`void`\>

***

### highlightValue()

> `readonly` **highlightValue**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:56](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L56)

Highlight a specific value

#### Parameters

##### value

`string` | `null`

#### Returns

`Effect`\<`void`\>

***

### inputId

> `readonly` **inputId**: `string`

Defined in: [src/primitives/Combobox/Combobox.ts:83](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L83)

Unique ID for the input element

***

### inputRef

> `readonly` **inputRef**: [`RefType`](../type-aliases/RefType.md)\<`HTMLInputElement`\>

Defined in: [src/primitives/Combobox/Combobox.ts:88](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L88)

Reference to the input element

***

### inputValue

> `readonly` **inputValue**: [`SignalType`](../type-aliases/SignalType.md)\<`string`\>

Defined in: [src/primitives/Combobox/Combobox.ts:46](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L46)

The current input value (what user types)

***

### isLoading

> `readonly` **isLoading**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Combobox/Combobox.ts:91](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L91)

Whether async loading is in progress

***

### isOpen

> `readonly` **isOpen**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Combobox/Combobox.ts:39](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L39)

Whether the listbox is currently open

***

### items

> `readonly` **items**: [`SignalType`](../type-aliases/SignalType.md)\<`Map`\<`string`, \{ `disabled`: `boolean`; `textValue`: `string`; \}\>\>

Defined in: [src/primitives/Combobox/Combobox.ts:75](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L75)

Map of registered items

***

### loop

> `readonly` **loop**: `boolean`

Defined in: [src/primitives/Combobox/Combobox.ts:96](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L96)

Whether keyboard navigation loops

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:41](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L41)

Open the listbox

#### Returns

`Effect`\<`void`\>

***

### registerItem()

> `readonly` **registerItem**: (`value`, `textValue`, `disabled`) => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:67](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L67)

Register an item

#### Parameters

##### value

`string`

##### textValue

`string`

##### disabled

`boolean`

#### Returns

`Effect`\<`void`\>

***

### selectValue()

> `readonly` **selectValue**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:51](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L51)

Select a value

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### shouldShowItem()

> `readonly` **shouldShowItem**: (`value`) => [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Combobox/Combobox.ts:78](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L78)

Check if an item should be shown based on filter

#### Parameters

##### value

`string`

#### Returns

[`Readable`](Readable.md)\<`boolean`\>

***

### unregisterItem()

> `readonly` **unregisterItem**: (`value`) => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:73](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L73)

Unregister an item

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### value

> `readonly` **value**: [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/Combobox/Combobox.ts:49](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L49)

The selected value (committed selection)
