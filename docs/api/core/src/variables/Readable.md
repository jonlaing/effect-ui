[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / Readable

# Variable: Readable

> **Readable**: `object`

Defined in: [packages/core/src/Readable.ts:7](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Readable.ts#L7)

Readable namespace containing factory functions and type utilities.

## Type Declaration

### combine()

> **combine**: \<`T`\>(`readables`) => [`Readable`](../interfaces/Readable.md)\<\{ \[K in string \| number \| symbol\]: T\[K\<K\>\] extends Readable\<A\> ? A : never \}\>

Combine multiple Readables into a single Readable of a tuple.
The combined Readable updates whenever any input changes.

When any dependency changes, ALL current values are re-fetched to ensure
consistency and avoid stale values.

#### Type Parameters

##### T

`T` *extends* readonly [`Readable`](../interfaces/Readable.md)\<`unknown`\>[]

#### Parameters

##### readables

`T`

#### Returns

[`Readable`](../interfaces/Readable.md)\<\{ \[K in string \| number \| symbol\]: T\[K\<K\>\] extends Readable\<A\> ? A : never \}\>

#### Example

```ts
const firstName = yield* Signal.make("John");
const lastName = yield* Signal.make("Doe");

const combined = Readable.combine([firstName, lastName]);
// combined: Readable<[string, string]>

const fullName = combined.map(([first, last]) => `${first} ${last}`);
```

### fromStream()

> **fromStream**: \<`A`\>(`initial`, `stream`) => [`Readable`](../interfaces/Readable.md)\<`A`\>

Create a Readable from an initial value and a stream of updates.

#### Type Parameters

##### A

`A`

#### Parameters

##### initial

`A`

The initial value

##### stream

`Stream`\<`A`\>

Stream of value updates

#### Returns

[`Readable`](../interfaces/Readable.md)\<`A`\>

### isReadable()

> **isReadable**: \<`A`\>(`value`) => `value is Readable<A>`

#### Type Parameters

##### A

`A`

#### Parameters

##### value

`A` | [`Readable`](../interfaces/Readable.md)\<`A`\>

#### Returns

`value is Readable<A>`

### lift()

> **lift**: \<`T`, `R`\>(`fn`) => (`props`) => [`Readable`](../interfaces/Readable.md)\<`R`\>

Lift a function that takes an object as its argument to work with
potentially reactive properties. Properties can be either static values
or Readables, and the result is a Readable that updates when any
reactive property changes.

This is particularly useful for integrating with libraries like
class-variance-authority (CVA) or clsx.

#### Type Parameters

##### T

`T` *extends* `Record`\<`string`, `unknown`\>

##### R

`R`

#### Parameters

##### fn

(`props`) => `R`

#### Returns

> (`props`): [`Readable`](../interfaces/Readable.md)\<`R`\>

##### Parameters

###### props

\{ \[K in string \| number \| symbol\]: T\[K\] \| Readable\<T\[K\]\> \}

##### Returns

[`Readable`](../interfaces/Readable.md)\<`R`\>

#### Example

```ts
import { cva } from "class-variance-authority";

const buttonCva = cva("btn font-medium", {
  variants: {
    variant: { primary: "bg-blue-500", secondary: "bg-gray-200" },
    size: { sm: "px-2 py-1", md: "px-4 py-2" },
  },
});

// Lift the CVA function
const buttonStyles = Readable.lift(buttonCva);

// Now it accepts Readables and returns a Readable<string>
const variant = yield* Signal.make<"primary" | "secondary">("primary");
const className = buttonStyles({ variant, size: "md" });
// className: Readable<string> - updates when variant changes

// Use in an element
yield* $.button({ class: className }, "Click me");
```

### make()

> **make**: \<`A`\>(`get`, `getChanges`) => [`Readable`](../interfaces/Readable.md)\<`A`\>

Create a Readable from a getter effect and a changes stream factory.

#### Type Parameters

##### A

`A`

#### Parameters

##### get

`Effect`\<`A`\>

Effect that returns the current value

##### getChanges

() => `Stream`\<`A`\>

Factory function that returns a stream of changes

#### Returns

[`Readable`](../interfaces/Readable.md)\<`A`\>

### map()

> **map**: \<`A`, `B`\>(`self`, `f`) => [`Readable`](../interfaces/Readable.md)\<`B`\>

Transform a Readable's value using a mapping function.

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### self

[`Readable`](../interfaces/Readable.md)\<`A`\>

The readable to transform

##### f

(`a`) => `B`

The mapping function

#### Returns

[`Readable`](../interfaces/Readable.md)\<`B`\>

### of()

> **of**: \<`A`\>(`value`) => [`Readable`](../interfaces/Readable.md)\<`A`\>

Create a constant Readable that never changes.
Useful for normalizing `T | Readable<T>` props.

#### Type Parameters

##### A

`A`

#### Parameters

##### value

`A` | [`Readable`](../interfaces/Readable.md)\<`A`\>

#### Returns

[`Readable`](../interfaces/Readable.md)\<`A`\>

#### Example

```ts
const disabled = Readable.of(false)
// disabled.get returns false, disabled.changes is empty

// Normalize a prop that can be static or reactive
const normalized: Readable<boolean> =
  typeof props.disabled === "boolean"
    ? Readable.of(props.disabled)
    : props.disabled ?? Readable.of(false)
```
