[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / FieldArray

# Interface: FieldArray\<A\>

Defined in: [src/form/types.ts:41](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L41)

Array field operations for dynamic field lists.

## Type Parameters

### A

`A`

The type of each array item

## Properties

### append()

> `readonly` **append**: (`value`) => `Effect`\<`void`\>

Defined in: [src/form/types.ts:45](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L45)

Add a new item to the end

#### Parameters

##### value

`A`

#### Returns

`Effect`\<`void`\>

***

### insert()

> `readonly` **insert**: (`index`, `value`) => `Effect`\<`void`\>

Defined in: [src/form/types.ts:49](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L49)

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

> `readonly` **items**: [`Readable`](Readable.md)\<readonly [`FieldType`](FieldType.md)\<`A`\>[]\>

Defined in: [src/form/types.ts:43](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L43)

The array of field items

***

### move()

> `readonly` **move**: (`fromIndex`, `toIndex`) => `Effect`\<`void`\>

Defined in: [src/form/types.ts:53](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L53)

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

Defined in: [src/form/types.ts:47](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L47)

Add a new item at the beginning

#### Parameters

##### value

`A`

#### Returns

`Effect`\<`void`\>

***

### remove()

> `readonly` **remove**: (`index`) => `Effect`\<`void`\>

Defined in: [src/form/types.ts:51](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L51)

Remove an item at a specific index

#### Parameters

##### index

`number`

#### Returns

`Effect`\<`void`\>

***

### replace()

> `readonly` **replace**: (`values`) => `Effect`\<`void`\>

Defined in: [src/form/types.ts:57](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L57)

Replace all items

#### Parameters

##### values

readonly `A`[]

#### Returns

`Effect`\<`void`\>

***

### swap()

> `readonly` **swap**: (`indexA`, `indexB`) => `Effect`\<`void`\>

Defined in: [src/form/types.ts:55](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/form/types.ts#L55)

Swap two items

#### Parameters

##### indexA

`number`

##### indexB

`number`

#### Returns

`Effect`\<`void`\>
