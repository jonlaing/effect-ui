[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ScrollArea

# Variable: ScrollArea

> `const` **ScrollArea**: `object`

Defined in: [src/primitives/ScrollArea/ScrollArea.ts:700](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ScrollArea/ScrollArea.ts#L700)

Headless ScrollArea primitive for building custom scrollable areas.

Features:
- Custom scrollbar styling
- Native scroll behavior
- Multiple visibility modes (auto, always, scroll, hover)
- Works with virtualEach for virtualized lists
- Keyboard accessible

## Type Declaration

### Corner

> **Corner**: [`Component`](../type-aliases/Component.md)\<`"ScrollAreaCorner"`, [`ScrollAreaCornerProps`](../interfaces/ScrollAreaCornerProps.md), `never`, `Scope`\>

### Root()

> **Root**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)

#### Parameters

##### props

[`ScrollAreaRootProps`](../interfaces/ScrollAreaRootProps.md)

##### children

[`Child`](../type-aliases/Child.md)\<`never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md)\> | readonly [`Child`](../type-aliases/Child.md)\<`never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)

### Scrollbar()

> **Scrollbar**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)\<`never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md)\>

#### Parameters

##### props

[`ScrollAreaScrollbarProps`](../interfaces/ScrollAreaScrollbarProps.md)

##### children

[`Child`](../type-aliases/Child.md)\<`never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md) \| [`ScrollbarCtx`](../classes/ScrollbarCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)\<`never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md)\>

### Thumb

> **Thumb**: [`Component`](../type-aliases/Component.md)\<`"ScrollAreaThumb"`, [`ScrollAreaThumbProps`](../interfaces/ScrollAreaThumbProps.md), `never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md) \| [`ScrollbarCtx`](../classes/ScrollbarCtx.md)\>

### Viewport

> **Viewport**: [`Component`](../type-aliases/Component.md)\<`"ScrollAreaViewport"`, [`ScrollAreaViewportProps`](../interfaces/ScrollAreaViewportProps.md), `never`, [`ScrollAreaCtx`](../classes/ScrollAreaCtx.md)\>

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
