[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / SignalType

# Interface: SignalType\<A\>

Defined in: src/Signal.ts:15

A mutable reactive value that extends Readable with write capabilities.

## Extends

- [`Readable`](Readable.md)\<`A`\>

## Type Parameters

### A

`A`

The type of the value

## Properties

### changes

> `readonly` **changes**: `Stream`\<`A`\>

Defined in: src/Readable.ts:11

Stream of value changes (does not include current value)

#### Inherited from

[`Readable`](Readable.md).[`changes`](Readable.md#changes)

***

### get

> `readonly` **get**: `Effect`\<`A`\>

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

### set()

> `readonly` **set**: (`a`) => `Effect`\<`void`\>

Defined in: src/Signal.ts:17

Set the signal to a new value

#### Parameters

##### a

`A`

#### Returns

`Effect`\<`void`\>

***

### update()

> `readonly` **update**: (`f`) => `Effect`\<`void`\>

Defined in: src/Signal.ts:19

Update the signal value using a function

#### Parameters

##### f

(`a`) => `A`

#### Returns

`Effect`\<`void`\>

***

### values

> `readonly` **values**: `Stream`\<`A`\>

Defined in: src/Readable.ts:13

Stream of all values (current value followed by changes)

#### Inherited from

[`Readable`](Readable.md).[`values`](Readable.md#values)
