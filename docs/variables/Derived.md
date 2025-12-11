[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Derived

# Variable: Derived

> `const` **Derived**: `object`

Defined in: [src/core/Derived/Derived.ts:155](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/core/Derived/Derived.ts#L155)

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

#### Example

```ts
const userId = yield* Signal.make(1)
const userData = yield* Derived.async([userId], ([id]) =>
  Effect.gen(function* () {
    const response = yield* fetchUser(id)
    return response.data
  })
)
// userData.get returns AsyncState with isLoading, value, and error
```

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

#### Example

```ts
const count = yield* Signal.make(5)
const doubled = yield* Derived.sync([count], ([n]) => n * 2)
// doubled.get returns 10
```
