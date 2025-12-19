[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / VirtualEachOptions

# Interface: VirtualEachOptions\<A, E, R\>

Defined in: [src/dom/VirtualList/types.ts:50](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/VirtualList/types.ts#L50)

Options for virtualEach.

## Type Parameters

### A

`A`

### E

`E` = `never`

### R

`R` = `never`

## Properties

### animate?

> `readonly` `optional` **animate**: [`ListAnimationOptions`](ListAnimationOptions.md)

Defined in: [src/dom/VirtualList/types.ts:103](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/VirtualList/types.ts#L103)

Animation options for items entering/exiting the viewport.

***

### estimatedHeight?

> `readonly` `optional` **estimatedHeight**: `number`

Defined in: [src/dom/VirtualList/types.ts:78](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/VirtualList/types.ts#L78)

Estimated height for variable-height items.
The list will measure actual heights and adjust positioning.
Either itemHeight or estimatedHeight must be provided.

***

### height?

> `readonly` `optional` **height**: `string` \| `number`

Defined in: [src/dom/VirtualList/types.ts:85](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/VirtualList/types.ts#L85)

Height of the scrollable viewport.
Can be a number (pixels) or CSS string like "100%" or "400px".
Default: "100%" (fills parent container)

***

### itemHeight?

> `readonly` `optional` **itemHeight**: `number`

Defined in: [src/dom/VirtualList/types.ts:71](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/VirtualList/types.ts#L71)

Fixed height for all items in pixels.
Use this for best performance when all items have the same height.
Either itemHeight or estimatedHeight must be provided.

***

### key()

> `readonly` **key**: (`item`) => `string`

Defined in: [src/dom/VirtualList/types.ts:55](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/VirtualList/types.ts#L55)

Function to extract a unique key from each item.
Used for efficient updates and item identity.

#### Parameters

##### item

`A`

#### Returns

`string`

***

### onVisibleRangeChange()?

> `readonly` `optional` **onVisibleRangeChange**: (`range`) => `void` \| `Effect`\<`void`, `never`, `never`\>

Defined in: [src/dom/VirtualList/types.ts:108](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/VirtualList/types.ts#L108)

Callback when the visible range changes.

#### Parameters

##### range

[`VisibleRange`](VisibleRange.md)

#### Returns

`void` \| `Effect`\<`void`, `never`, `never`\>

***

### overscan?

> `readonly` `optional` **overscan**: `number`

Defined in: [src/dom/VirtualList/types.ts:92](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/VirtualList/types.ts#L92)

Number of items to render above/below the visible area.
Higher values reduce flicker during fast scrolling but use more memory.
Default: 3

***

### ref?

> `readonly` `optional` **ref**: [`VirtualListRefType`](VirtualListRefType.md)

Defined in: [src/dom/VirtualList/types.ts:98](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/VirtualList/types.ts#L98)

Optional ref to access scroll control methods.
Create with VirtualListRef.make()

***

### render()

> `readonly` **render**: (`item`, `index`) => [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

Defined in: [src/dom/VirtualList/types.ts:61](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/VirtualList/types.ts#L61)

Render function for each item.
Receives a Readable for the item data and its index.

#### Parameters

##### item

[`Readable`](Readable.md)\<`A`\>

##### index

[`Readable`](Readable.md)\<`number`\>

#### Returns

[`Element`](../type-aliases/Element.md)\<`E`, `R`\>
