[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / SelectItemContext

# Interface: SelectItemContext

Defined in: [src/primitives/Select/Select.ts:51](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L51)

Context for Select.Item

## Properties

### disabled

> `readonly` **disabled**: `boolean`

Defined in: [src/primitives/Select/Select.ts:57](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L57)

Whether this item is disabled

***

### isSelected

> `readonly` **isSelected**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Select/Select.ts:55](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L55)

Whether this item is selected

***

### itemValue

> `readonly` **itemValue**: `string`

Defined in: [src/primitives/Select/Select.ts:53](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L53)

The value of this item

***

### setTextValue()

> `readonly` **setTextValue**: (`text`) => `Effect`\<`void`\>

Defined in: [src/primitives/Select/Select.ts:59](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L59)

Register display text for this item (called by ItemText with string children)

#### Parameters

##### text

`string`

#### Returns

`Effect`\<`void`\>
