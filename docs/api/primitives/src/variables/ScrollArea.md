[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ScrollArea

# Variable: ScrollArea

> `const` **ScrollArea**: `object`

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:700](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L700)

Headless ScrollArea primitive for building custom scrollable areas.

Features:
- Custom scrollbar styling
- Native scroll behavior
- Multiple visibility modes (auto, always, scroll, hover)
- Works with virtualEach for virtualized lists
- Keyboard accessible

## Type Declaration

### Corner

> **Corner**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ScrollAreaCorner"`, [`ScrollAreaCornerProps`](../interfaces/ScrollAreaCornerProps.md), `never`, `Scope`\>

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

#### Parameters

##### props

[`ScrollAreaRootProps`](../interfaces/ScrollAreaRootProps.md)

##### children

[`Child`](../../../dom/src/type-aliases/Child.md)\<`never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md)\> | readonly [`Child`](../../../dom/src/type-aliases/Child.md)\<`never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

### Scrollbar()

> **Scrollbar**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md)\>

#### Parameters

##### props

[`ScrollAreaScrollbarProps`](../interfaces/ScrollAreaScrollbarProps.md)

##### children

[`Child`](../../../dom/src/type-aliases/Child.md)\<`never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md) \| [`ScrollbarCtx`](../classes/ScrollbarCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md)\>

### Thumb

> **Thumb**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ScrollAreaThumb"`, [`ScrollAreaThumbProps`](../interfaces/ScrollAreaThumbProps.md), `never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md) \| [`ScrollbarCtx`](../classes/ScrollbarCtx.md)\>

### Viewport

> **Viewport**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ScrollAreaViewport"`, [`ScrollAreaViewportProps`](../interfaces/ScrollAreaViewportProps.md), `never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md)\>

## Example

```ts
ScrollArea.Root({ type: "hover" }, [
  ScrollArea.Viewport({}, [
    $.div({ style: { height: "2000px" } }, "Long content..."),
  ]),
  ScrollArea.Scrollbar({ orientation: "vertical" }, [
    ScrollArea.Thumb({}),
  ]),
])
```
