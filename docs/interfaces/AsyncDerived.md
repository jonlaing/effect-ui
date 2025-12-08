[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / AsyncDerived

# Interface: AsyncDerived\<A, E\>

Defined in: [src/core/Derived/types.ts:53](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Derived/types.ts#L53)

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

Defined in: [src/core/Derived/types.ts:55](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Derived/types.ts#L55)

Effect that resolves to the current value or fails with the current error

***

### changes

> `readonly` **changes**: `Stream`\<[`AsyncState`](AsyncState.md)\<`A`, `E`\>\>

Defined in: [src/core/Readable.ts:11](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Readable.ts#L11)

Stream of value changes (does not include current value)

#### Inherited from

[`Readable`](Readable.md).[`changes`](Readable.md#changes)

***

### get

> `readonly` **get**: `Effect`\<[`AsyncState`](AsyncState.md)\<`A`, `E`\>\>

Defined in: [src/core/Readable.ts:9](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Readable.ts#L9)

Get the current value

#### Inherited from

[`Readable`](Readable.md).[`get`](Readable.md#get)

***

### map()

> `readonly` **map**: \<`B`\>(`f`) => [`Readable`](Readable.md)\<`B`\>

Defined in: [src/core/Readable.ts:15](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Readable.ts#L15)

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

Defined in: [src/core/Readable.ts:13](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Readable.ts#L13)

Stream of all values (current value followed by changes)

#### Inherited from

[`Readable`](Readable.md).[`values`](Readable.md#values)
