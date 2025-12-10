[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / each

# Function: each()

> **each**\<`A`, `E`, `R`\>(`items`, `keyFn`, `render`): [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

Defined in: [src/dom/Control.ts:272](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Control.ts#L272)

Render a list of items with efficient updates using keys.

## Type Parameters

### A

`A`

### E

`E` = `never`

### R

`R` = `never`

## Parameters

### items

[`Readable`](../interfaces/Readable.md)\<readonly `A`[]\>

Reactive array of items

### keyFn

(`item`) => `string`

Function to extract a unique key from each item

### render

(`item`) => [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

Function to render each item (receives a Readable for the item)

## Returns

[`Element`](../type-aliases/Element.md)\<`E`, `R`\>

## Example

```ts
interface Todo {
  id: string;
  text: string;
}
const todos = yield * Signal.make<Todo[]>([]);

each(
  todos,
  (todo) => todo.id,
  (todo) => li([todo.map((t) => t.text)]),
);
```
