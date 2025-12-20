[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / each

# Function: each()

> **each**\<`A`, `N`, `E`, `R`\>(`items`, `config`): [`Element`](../type-aliases/Element.md)\<`N`, `E`, `R`\>

Defined in: [packages/core/src/Control.ts:320](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Control.ts#L320)

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

### config

[`EachConfig`](../interfaces/EachConfig.md)\<`A`, `N`, `E`, `R`\>

Configuration object with key, render, and optional container

## Returns

[`Element`](../type-aliases/Element.md)\<`N`, `E`, `R`\>

## Example

```ts
interface Todo { id: string; text: string }
const todos = yield* Signal.make<Todo[]>([])

each(todos, {
  container: () => $.ul({ class: "todo-list" }),
  key: (todo) => todo.id,
  render: (todo) => $.li(todo.map(t => t.text))
})
```
