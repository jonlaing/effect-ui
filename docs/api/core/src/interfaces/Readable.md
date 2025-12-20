[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / Readable

# Interface: Readable\<A\>

Defined in: [packages/core/src/Readable.ts:7](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Readable.ts#L7)

A reactive value that can be read and observed for changes.

## Extended by

- [`Signal`](Signal.md)
- [`Signal`](../namespaces/Signal/interfaces/Signal.md)
- [`AsyncDerived`](AsyncDerived.md)

## Type Parameters

### A

`A`

The type of the value

## Properties

### changes

> `readonly` **changes**: `Stream`\<`A`\>

Defined in: [packages/core/src/Readable.ts:11](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Readable.ts#L11)

Stream of value changes (does not include current value)

***

### get

> `readonly` **get**: `Effect`\<`A`\>

Defined in: [packages/core/src/Readable.ts:9](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Readable.ts#L9)

Get the current value

***

### map()

> `readonly` **map**: \<`B`\>(`f`) => `Readable`\<`B`\>

Defined in: [packages/core/src/Readable.ts:15](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Readable.ts#L15)

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

Defined in: [packages/core/src/Readable.ts:13](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Readable.ts#L13)

Stream of all values (current value followed by changes)
