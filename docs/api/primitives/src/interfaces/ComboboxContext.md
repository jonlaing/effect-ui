[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ComboboxContext

# Interface: ComboboxContext

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:39](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L39)

Context shared between Combobox parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:45](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L45)

Close the listbox

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:83](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L83)

Unique ID for the content element

***

### disabled

> `readonly` **disabled**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:96](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L96)

Whether the combobox is disabled

***

### getItemId()

> `readonly` **getItemId**: (`value`) => `string`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:87](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L87)

Get the ID for an item by its value

#### Parameters

##### value

`string`

#### Returns

`string`

***

### highlightedValue

> `readonly` **highlightedValue**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`string` \| `null`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:56](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L56)

The currently highlighted item value (keyboard navigation)

***

### highlightFirst()

> `readonly` **highlightFirst**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:64](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L64)

Highlight the first item

#### Returns

`Effect`\<`void`\>

***

### highlightLast()

> `readonly` **highlightLast**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:66](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L66)

Highlight the last item

#### Returns

`Effect`\<`void`\>

***

### highlightNext()

> `readonly` **highlightNext**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:60](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L60)

Highlight the next item

#### Returns

`Effect`\<`void`\>

***

### highlightPrev()

> `readonly` **highlightPrev**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:62](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L62)

Highlight the previous item

#### Returns

`Effect`\<`void`\>

***

### highlightValue()

> `readonly` **highlightValue**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:58](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L58)

Highlight a specific value

#### Parameters

##### value

`string` | `null`

#### Returns

`Effect`\<`void`\>

***

### inputId

> `readonly` **inputId**: `string`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:85](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L85)

Unique ID for the input element

***

### inputRef

> `readonly` **inputRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLInputElement`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:90](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L90)

Reference to the input element

***

### inputValue

> `readonly` **inputValue**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:48](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L48)

The current input value (what user types)

***

### isLoading

> `readonly` **isLoading**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:93](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L93)

Whether async loading is in progress

***

### isOpen

> `readonly` **isOpen**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:41](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L41)

Whether the listbox is currently open

***

### items

> `readonly` **items**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`Map`\<`string`, \{ `disabled`: `boolean`; `textValue`: `string`; \}\>\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:77](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L77)

Map of registered items

***

### loop

> `readonly` **loop**: `boolean`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:98](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L98)

Whether keyboard navigation loops

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:43](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L43)

Open the listbox

#### Returns

`Effect`\<`void`\>

***

### registerItem()

> `readonly` **registerItem**: (`value`, `textValue`, `disabled`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:69](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L69)

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

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:53](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L53)

Select a value

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### shouldShowItem()

> `readonly` **shouldShowItem**: (`value`) => [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:80](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L80)

Check if an item should be shown based on filter

#### Parameters

##### value

`string`

#### Returns

[`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

***

### unregisterItem()

> `readonly` **unregisterItem**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:75](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L75)

Unregister an item

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### value

> `readonly` **value**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:51](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Combobox/Combobox.ts#L51)

The selected value (committed selection)
