[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / SelectContext

# Interface: SelectContext

Defined in: [packages/primitives/src/primitives/Select/Select.ts:18](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L18)

Context shared between Select parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:26](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L26)

Close the select

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [packages/primitives/src/primitives/Select/Select.ts:41](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L41)

Unique ID for the content

***

### disabled

> `readonly` **disabled**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:45](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L45)

Whether the select is disabled

***

### isOpen

> `readonly` **isOpen**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:20](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L20)

Whether the select is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:24](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L24)

Open the select

#### Returns

`Effect`\<`void`\>

***

### placeholder

> `readonly` **placeholder**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:47](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L47)

Placeholder text when no value selected

***

### registerItem()

> `readonly` **registerItem**: (`value`, `textValue`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:32](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L32)

Register an item's display text

#### Parameters

##### value

`string`

##### textValue

`string`

#### Returns

`Effect`\<`void`\>

***

### selectValue()

> `readonly` **selectValue**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:30](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L30)

Select a value

#### Parameters

##### value

`string`

#### Returns

`Effect`\<`void`\>

***

### toggle()

> `readonly` **toggle**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:28](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L28)

Toggle the select open state

#### Returns

`Effect`\<`void`\>

***

### triggerId

> `readonly` **triggerId**: `string`

Defined in: [packages/primitives/src/primitives/Select/Select.ts:43](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L43)

Unique ID for the trigger

***

### triggerRef

> `readonly` **triggerRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLButtonElement`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:39](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L39)

Reference to the trigger element

***

### value

> `readonly` **value**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:22](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L22)

Current selected value

***

### valueLabels

> `readonly` **valueLabels**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`Map`\<`string`, `string`\>\>

Defined in: [packages/primitives/src/primitives/Select/Select.ts:37](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Select/Select.ts#L37)

Map of value to display text
