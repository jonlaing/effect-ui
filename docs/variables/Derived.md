[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / Derived

# Variable: Derived

> `const` **Derived**: `object`

Defined in: src/Derived.ts:247

Derived module namespace for creating computed reactive values.

## Type Declaration

### async()

> **async**: \<`T`, `A`, `E`\>(`deps`, `compute`, `options?`) => `Effect`\<[`AsyncDerived`](../interfaces/AsyncDerived.md)\<`A`, `E`\>, `never`, `Scope`\>

Create an asynchronous derived value that recomputes when dependencies change.

#### Type Parameters

##### T

`T` *extends* readonly [`Readable`](../interfaces/Readable.md)\<`unknown`\>[]

##### A

`A`

##### E

`E` = `never`

#### Parameters

##### deps

`T`

Array of Readable dependencies

##### compute

(`values`) => `Effect`\<`A`, `E`\>

Effect-returning function to compute the derived value

##### options?

[`AsyncDerivedOptions`](../interfaces/AsyncDerivedOptions.md)\<`A`\>

Optional configuration including concurrency strategy

#### Returns

`Effect`\<[`AsyncDerived`](../interfaces/AsyncDerived.md)\<`A`, `E`\>, `never`, `Scope`\>

### sync()

> **sync**: \<`T`, `B`\>(`deps`, `compute`, `options?`) => `Effect`\<[`Readable`](../interfaces/Readable.md)\<`B`\>, `never`, `Scope`\>

Create a synchronous derived value that recomputes when dependencies change.

#### Type Parameters

##### T

`T` *extends* readonly [`Readable`](../interfaces/Readable.md)\<`unknown`\>[]

##### B

`B`

#### Parameters

##### deps

`T`

Array of Readable dependencies

##### compute

(`values`) => `B`

Function to compute the derived value from dependency values

##### options?

[`DerivedOptions`](../interfaces/DerivedOptions.md)\<`B`\>

Optional configuration

#### Returns

`Effect`\<[`Readable`](../interfaces/Readable.md)\<`B`\>, `never`, `Scope`\>
