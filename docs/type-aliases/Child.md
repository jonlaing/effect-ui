[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / Child

# Type Alias: Child

> **Child** = `string` \| `number` \| [`Element`](Element.md) \| [`Readable`](../interfaces/Readable.md)\<`string`\> \| [`Readable`](../interfaces/Readable.md)\<`number`\> \| readonly `Child`[]

Defined in: src/Element/types.ts:33

Valid child types for an element: strings, numbers, elements, reactive values, or arrays thereof.

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
