[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ComboboxItemContext

# Interface: ComboboxItemContext

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:104](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L104)

Context for Combobox.Item children.

## Properties

### disabled

> `readonly` **disabled**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:112](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L112)

Whether this item is disabled

***

### isHighlighted

> `readonly` **isHighlighted**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:110](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L110)

Whether this item is highlighted

***

### isSelected

> `readonly` **isSelected**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:108](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L108)

Whether this item is selected

***

### itemValue

> `readonly` **itemValue**: `string`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:106](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L106)

The item's value

***

### setTextValue()

> `readonly` **setTextValue**: (`text`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:114](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L114)

Set the text value for this item

#### Parameters

##### text

`string`

#### Returns

`Effect`\<`void`\>
