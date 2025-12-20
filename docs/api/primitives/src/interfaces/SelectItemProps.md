[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / SelectItemProps

# Interface: SelectItemProps

Defined in: [packages/primitives/src/primitives/Select/Select.ts:121](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Select/Select.ts#L121)

Props for Select.Item

## Properties

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:130](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Select/Select.ts#L130)

Additional class names

***

### disabled?

> `readonly` `optional` **disabled**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:132](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Select/Select.ts#L132)

Whether this item is disabled

***

### textValue?

> `readonly` `optional` **textValue**: `string`

Defined in: [packages/primitives/src/primitives/Select/Select.ts:128](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Select/Select.ts#L128)

Optional display text for this item. Only needed when ItemText has complex children.
For simple string children in ItemText, the label is registered automatically.

***

### value

> `readonly` **value**: `string`

Defined in: [packages/primitives/src/primitives/Select/Select.ts:123](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Select/Select.ts#L123)

The value for this item
