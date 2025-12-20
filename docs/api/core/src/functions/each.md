[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / each

# Function: each()

> **each**\<`A`, `N`, `E`, `R`\>(`items`, `keyFn`, `render`): [`Element`](../type-aliases/Element.md)\<`N`, `E`, `R`\>

Defined in: [packages/core/src/Control.ts:222](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Control.ts#L222)

Render a list of items with efficient updates using keys.

## Type Parameters

### A

`A`

### N

`N`

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

(`item`) => [`Element`](../type-aliases/Element.md)\<`N`, `E`, `R`\>

Function to render each item (receives a Readable for the item)

## Returns

[`Element`](../type-aliases/Element.md)\<`N`, `E`, `R`\>

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
