[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Readable

# Interface: Readable\<A\>

Defined in: [src/core/Readable.ts:7](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/core/Readable.ts#L7)

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

Defined in: [src/core/Readable.ts:11](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/core/Readable.ts#L11)

Stream of value changes (does not include current value)

***

### get

> `readonly` **get**: `Effect`\<`A`\>

Defined in: [src/core/Readable.ts:9](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/core/Readable.ts#L9)

Get the current value

***

### map()

> `readonly` **map**: \<`B`\>(`f`) => `Readable`\<`B`\>

Defined in: [src/core/Readable.ts:15](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/core/Readable.ts#L15)

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

Defined in: [src/core/Readable.ts:13](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/core/Readable.ts#L13)

Stream of all values (current value followed by changes)
