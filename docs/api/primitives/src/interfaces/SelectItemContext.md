[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / SelectItemContext

# Interface: SelectItemContext

Defined in: [packages/primitives/src/primitives/Select/Select.ts:53](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L53)

Context for Select.Item

## Properties

### disabled

> `readonly` **disabled**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:59](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L59)

Whether this item is disabled

***

### isSelected

> `readonly` **isSelected**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:57](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L57)

Whether this item is selected

***

### itemValue

> `readonly` **itemValue**: `string`

Defined in: [packages/primitives/src/primitives/Select/Select.ts:55](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L55)

The value of this item

***

### setTextValue()

> `readonly` **setTextValue**: (`text`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:61](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L61)

Register display text for this item (called by ItemText with string children)

#### Parameters

##### text

`string`

#### Returns

`Effect`\<`void`\>
