[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / combine

# Function: combine()

> **combine**\<`T`\>(`readables`): [`Readable`](../interfaces/Readable.md)\<\{ \[K in string \| number \| symbol\]: T\[K\<K\>\] extends Readable\<A\> ? A : never \}\>

Defined in: [packages/core/src/Readable.ts:174](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Readable.ts#L174)

Combine multiple Readables into a single Readable of a tuple.
The combined Readable updates whenever any input changes.

When any dependency changes, ALL current values are re-fetched to ensure
consistency and avoid stale values.

## Type Parameters

### T

`T` *extends* readonly [`Readable`](../interfaces/Readable.md)\<`unknown`\>[]

## Parameters

### readables

`T`

## Returns

[`Readable`](../interfaces/Readable.md)\<\{ \[K in string \| number \| symbol\]: T\[K\<K\>\] extends Readable\<A\> ? A : never \}\>

## Example

```ts
const firstName = yield* Signal.make("John");
const lastName = yield* Signal.make("Doe");

const combined = Readable.combine([firstName, lastName]);
// combined: Readable<[string, string]>

const fullName = combined.map(([first, last]) => `${first} ${last}`);
```
