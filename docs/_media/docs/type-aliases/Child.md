[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Child

# Type Alias: Child\<E, R\>

> **Child**\<`E`, `R`\> = `string` \| `number` \| [`Element`](Element.md)\<`E`, `R`\> \| [`Readable`](../interfaces/Readable.md)\<`string`\> \| [`Readable`](../interfaces/Readable.md)\<`number`\> \| readonly `Child`\<`E`, `R`\>[]

Defined in: [src/dom/Element/types.ts:53](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Element/types.ts#L53)

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
