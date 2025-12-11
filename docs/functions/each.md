[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / each

# Function: each()

> **each**\<`A`, `E`, `R`\>(`items`, `keyFn`, `render`, `options?`): [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

Defined in: [src/dom/Control.ts:659](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Control.ts#L659)

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

### options?

[`ListControlAnimationOptions`](../interfaces/ListControlAnimationOptions.md)

Optional animation configuration

## Returns

[`Element`](../type-aliases/Element.md)\<`E`, `R`\>

## Examples

```ts
interface Todo { id: string; text: string }
const todos = yield* Signal.make<Todo[]>([])

each(
  todos,
  (todo) => todo.id,
  (todo) => li([todo.map(t => t.text)])
)
```

```ts
// With staggered animations
each(
  items,
  (item) => item.id,
  (item) => ListItem(item),
  {
    animate: {
      enter: "slide-in",
      exit: "slide-out",
      stagger: 50  // 50ms between items
    }
  }
)
```
