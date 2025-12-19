[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / SelectItemProps

# Interface: SelectItemProps

Defined in: [src/primitives/Select/Select.ts:119](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L119)

Props for Select.Item

## Properties

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/Select/Select.ts:128](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L128)

Additional class names

***

### disabled?

> `readonly` `optional` **disabled**: `boolean`

Defined in: [src/primitives/Select/Select.ts:130](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L130)

Whether this item is disabled

***

### textValue?

> `readonly` `optional` **textValue**: `string`

Defined in: [src/primitives/Select/Select.ts:126](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L126)

Optional display text for this item. Only needed when ItemText has complex children.
For simple string children in ItemText, the label is registered automatically.

***

### value

> `readonly` **value**: `string`

Defined in: [src/primitives/Select/Select.ts:121](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L121)

The value for this item
