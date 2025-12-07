[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / each

# Function: each()

> **each**\<`A`\>(`items`, `keyFn`, `render`): [`Element`](../type-aliases/Element.md)

Defined in: src/Control.ts:270

Render a list of items with efficient updates using keys.

## Type Parameters

### A

`A`

## Parameters

### items

[`Readable`](../interfaces/Readable.md)\<readonly `A`[]\>

Reactive array of items

### keyFn

(`item`) => `string`

Function to extract a unique key from each item

### render

(`item`) => [`Element`](../type-aliases/Element.md)

Function to render each item (receives a Readable for the item)

## Returns

[`Element`](../type-aliases/Element.md)

## Example

```ts
interface Todo { id: string; text: string }
const todos = yield* Signal.make<Todo[]>([])

each(
  todos,
  (todo) => todo.id,
  (todo) => li([todo.map(t => t.text)])
)
```
