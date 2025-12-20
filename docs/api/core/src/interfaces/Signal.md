[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / Signal

# Interface: Signal\<A\>

Defined in: [packages/core/src/Signal.ts:11](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Signal.ts#L11)

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

Defined in: [packages/core/src/Readable.ts:11](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L11)

Stream of value changes (does not include current value)

#### Inherited from

[`Readable`](Readable.md).[`changes`](Readable.md#changes)

***

### get

> `readonly` **get**: `Effect`\<`A`\>

Defined in: [packages/core/src/Readable.ts:9](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L9)

Get the current value

#### Inherited from

[`Readable`](Readable.md).[`get`](Readable.md#get)

***

### map()

> `readonly` **map**: \<`B`\>(`f`) => [`Readable`](Readable.md)\<`B`\>

Defined in: [packages/core/src/Readable.ts:15](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L15)

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

Defined in: [packages/core/src/Signal.ts:13](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Signal.ts#L13)

Set the signal to a new value

#### Parameters

##### a

`A`

#### Returns

`Effect`\<`void`\>

***

### update()

> `readonly` **update**: (`f`) => `Effect`\<`void`\>

Defined in: [packages/core/src/Signal.ts:15](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Signal.ts#L15)

Update the signal value using a function

#### Parameters

##### f

(`a`) => `A`

#### Returns

`Effect`\<`void`\>

***

### values

> `readonly` **values**: `Stream`\<`A`\>

Defined in: [packages/core/src/Readable.ts:13](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L13)

Stream of all values (current value followed by changes)

#### Inherited from

[`Readable`](Readable.md).[`values`](Readable.md#values)
