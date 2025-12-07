[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / Readable

# Interface: Readable\<A\>

Defined in: src/Readable.ts:7

A reactive value that can be read and observed for changes.

## Extended by

- [`SignalType`](SignalType.md)
- [`AsyncDerived`](AsyncDerived.md)

## Type Parameters

### A

`A`

The type of the value

## Properties

### changes

> `readonly` **changes**: `Stream`\<`A`\>

Defined in: src/Readable.ts:11

Stream of value changes (does not include current value)

***

### get

> `readonly` **get**: `Effect`\<`A`\>

Defined in: src/Readable.ts:9

Get the current value

***

### map()

> `readonly` **map**: \<`B`\>(`f`) => `Readable`\<`B`\>

Defined in: src/Readable.ts:15

Transform the readable value

#### Type Parameters

##### B

`B`

#### Parameters

##### f

(`a`) => `B`

#### Returns

`Readable`\<`B`\>

***

### values

> `readonly` **values**: `Stream`\<`A`\>

Defined in: src/Readable.ts:13

Stream of all values (current value followed by changes)
