[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ComboboxItemContext

# Interface: ComboboxItemContext

Defined in: [src/primitives/Combobox/Combobox.ts:102](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L102)

Context for Combobox.Item children.

## Properties

### disabled

> `readonly` **disabled**: `boolean`

Defined in: [src/primitives/Combobox/Combobox.ts:110](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L110)

Whether this item is disabled

***

### isHighlighted

> `readonly` **isHighlighted**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Combobox/Combobox.ts:108](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L108)

Whether this item is highlighted

***

### isSelected

> `readonly` **isSelected**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Combobox/Combobox.ts:106](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L106)

Whether this item is selected

***

### itemValue

> `readonly` **itemValue**: `string`

Defined in: [src/primitives/Combobox/Combobox.ts:104](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L104)

The item's value

***

### setTextValue()

> `readonly` **setTextValue**: (`text`) => `Effect`\<`void`\>

Defined in: [src/primitives/Combobox/Combobox.ts:112](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L112)

Set the text value for this item

#### Parameters

##### text

`string`

#### Returns

`Effect`\<`void`\>
