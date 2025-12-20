[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [form/src](../README.md) / FieldArray

# Interface: FieldArray\<A\>

Defined in: [packages/form/src/form/types.ts:40](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L40)

Array field operations for dynamic field lists.

## Type Parameters

### A

`A`

The type of each array item

## Properties

### append()

> `readonly` **append**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:44](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L44)

Add a new item to the end

#### Parameters

##### value

`A`

#### Returns

`Effect`\<`void`\>

***

### insert()

> `readonly` **insert**: (`index`, `value`) => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:48](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L48)

Insert an item at a specific index

#### Parameters

##### index

`number`

##### value

`A`

#### Returns

`Effect`\<`void`\>

***

### items

> `readonly` **items**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<readonly [`FieldType`](FieldType.md)\<`A`\>[]\>

Defined in: [packages/form/src/form/types.ts:42](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L42)

The array of field items

***

### move()

> `readonly` **move**: (`fromIndex`, `toIndex`) => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:52](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L52)

Move an item from one index to another

#### Parameters

##### fromIndex

`number`

##### toIndex

`number`

#### Returns

`Effect`\<`void`\>

***

### prepend()

> `readonly` **prepend**: (`value`) => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:46](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L46)

Add a new item at the beginning

#### Parameters

##### value

`A`

#### Returns

`Effect`\<`void`\>

***

### remove()

> `readonly` **remove**: (`index`) => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:50](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L50)

Remove an item at a specific index

#### Parameters

##### index

`number`

#### Returns

`Effect`\<`void`\>

***

### replace()

> `readonly` **replace**: (`values`) => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:56](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L56)

Replace all items

#### Parameters

##### values

readonly `A`[]

#### Returns

`Effect`\<`void`\>

***

### swap()

> `readonly` **swap**: (`indexA`, `indexB`) => `Effect`\<`void`\>

Defined in: [packages/form/src/form/types.ts:54](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/form/src/form/types.ts#L54)

Swap two items

#### Parameters

##### indexA

`number`

##### indexB

`number`

#### Returns

`Effect`\<`void`\>
