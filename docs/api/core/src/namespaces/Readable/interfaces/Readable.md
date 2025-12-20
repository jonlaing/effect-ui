[**effex-monorepo**](../../../../../README.md)

***

[effex-monorepo](../../../../../modules.md) / [core/src](../../../README.md) / [Readable](../README.md) / Readable

# Interface: Readable\<A\>

Defined in: [packages/core/src/Readable.ts:26](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L26)

A reactive value that can be read and observed for changes.

## Type Parameters

### A

`A`

The type of the value

## Properties

### changes

> `readonly` **changes**: `Stream`\<`A`\>

Defined in: [packages/core/src/Readable.ts:30](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L30)

Stream of value changes (does not include current value)

***

### get

> `readonly` **get**: `Effect`\<`A`\>

Defined in: [packages/core/src/Readable.ts:28](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L28)

Get the current value

***

### map()

> `readonly` **map**: \<`B`\>(`f`) => `Readable`\<`B`\>

Defined in: [packages/core/src/Readable.ts:34](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L34)

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

Defined in: [packages/core/src/Readable.ts:32](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L32)

Stream of all values (current value followed by changes)
