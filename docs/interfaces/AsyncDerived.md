[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / AsyncDerived

# Interface: AsyncDerived\<A, E\>

Defined in: src/Derived.ts:123

An asynchronous derived value that tracks loading and error states.

## Extends

- [`Readable`](Readable.md)\<[`AsyncState`](AsyncState.md)\<`A`, `E`\>\>

## Type Parameters

### A

`A`

The type of the successful value

### E

`E` = `never`

The type of the error

## Properties

### await

> `readonly` **await**: `Effect`\<`A`, `E`\>

Defined in: src/Derived.ts:125

Effect that resolves to the current value or fails with the current error

***

### changes

> `readonly` **changes**: `Stream`\<[`AsyncState`](AsyncState.md)\<`A`, `E`\>\>

Defined in: src/Readable.ts:11

Stream of value changes (does not include current value)

#### Inherited from

[`Readable`](Readable.md).[`changes`](Readable.md#changes)

***

### get

> `readonly` **get**: `Effect`\<[`AsyncState`](AsyncState.md)\<`A`, `E`\>\>

Defined in: src/Readable.ts:9

Get the current value

#### Inherited from

[`Readable`](Readable.md).[`get`](Readable.md#get)

***

### map()

> `readonly` **map**: \<`B`\>(`f`) => [`Readable`](Readable.md)\<`B`\>

Defined in: src/Readable.ts:15

Transform the readable value

#### Type Parameters

##### B

`B`

#### Parameters

##### f

(`a`) => `B`

#### Returns

[`Readable`](Readable.md)\<`B`\>

#### Inherited from

[`Readable`](Readable.md).[`map`](Readable.md#map)

***

### values

> `readonly` **values**: `Stream`\<[`AsyncState`](AsyncState.md)\<`A`, `E`\>\>

Defined in: src/Readable.ts:13

Stream of all values (current value followed by changes)

#### Inherited from

[`Readable`](Readable.md).[`values`](Readable.md#values)
