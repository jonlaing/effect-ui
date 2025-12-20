[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / virtualEach

# Function: virtualEach()

> **virtualEach**\<`A`, `E`, `R`\>(`items`, `options`): [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

Defined in: [packages/dom/src/VirtualList/VirtualList.ts:103](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/VirtualList/VirtualList.ts#L103)

Render a virtualized list of items, only rendering items visible in the viewport.
Ideal for large lists (1000+ items) where rendering all items would be too slow.

## Type Parameters

### A

`A`

### E

`E` = `never`

### R

`R` = `never`

## Parameters

### items

[`Readable`](../../../core/src/interfaces/Readable.md)\<readonly `A`[]\>

Reactive array of items

### options

[`VirtualEachOptions`](../interfaces/VirtualEachOptions.md)\<`A`, `E`, `R`\>

Configuration including key function, render function, and height

## Returns

[`Element`](../type-aliases/Element.md)\<`E`, `R`\>

## Examples

```ts
// Basic usage with fixed height items
virtualEach(todos, {
  key: (todo) => todo.id,
  itemHeight: 48,
  height: 400,
  render: (todo) => $.li(todo.map(t => t.text)),
})
```

```ts
// With ref for scroll control
const listRef = yield* VirtualListRef.make()

yield* virtualEach(items, {
  key: (item) => item.id,
  itemHeight: 60,
  ref: listRef,
  render: (item, index) => ListItem({ item, index }),
})

// Scroll to item 100
yield* listRef.ready.pipe(
  Effect.flatMap((control) => control.scrollTo(100))
)
```
