[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / Child

# Type Alias: Child\<E, R\>

> **Child**\<`E`, `R`\> = `string` \| `number` \| [`Element`](Element.md)\<`E`, `R`\> \| [`Readable`](../../../core/src/interfaces/Readable.md)\<`string`\> \| [`Readable`](../../../core/src/interfaces/Readable.md)\<`number`\> \| readonly `Child`\<`E`, `R`\>[]

Defined in: [packages/dom/src/Element/types.ts:53](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Element/types.ts#L53)

Valid child types for an element: strings, numbers, elements, reactive values, or arrays thereof.

## Type Parameters

### E

`E` = `never`

The error type for child elements

### R

`R` = `never`

The requirements/context type for child elements

## Example

```ts
// Static text
div(["Hello, world!"])

// Reactive text
const count = yield* Signal.make(0)
div([count])  // Updates automatically when count changes

// Nested elements
div([
  h1(["Title"]),
  p(["Content"])
])
```
