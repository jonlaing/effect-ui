[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ScrollAreaContext

# Interface: ScrollAreaContext

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:22](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L22)

## Properties

### contentSize

> `readonly` **contentSize**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<\{ `height`: `number`; `width`: `number`; \}\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:28](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L28)

Content dimensions

***

### isHovering

> `readonly` **isHovering**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:54](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L54)

Whether mouse is hovering

***

### isScrolling

> `readonly` **isScrolling**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:52](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L52)

Whether currently scrolling

***

### scrollableRef

> `readonly` **scrollableRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLElement`\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:30](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L30)

Reference to the scrollable element

***

### scrollBy()

> `readonly` **scrollBy**: (`delta`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:37](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L37)

Scroll by a delta

#### Parameters

##### delta

###### x?

`number`

###### y?

`number`

#### Returns

`Effect`\<`void`\>

***

### scrollHideDelay

> `readonly` **scrollHideDelay**: `number`

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:50](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L50)

Delay before hiding scrollbar (ms)

***

### scrollPosition

> `readonly` **scrollPosition**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<\{ `x`: `number`; `y`: `number`; \}\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:24](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L24)

Current scroll position

***

### scrollTo()

> `readonly` **scrollTo**: (`position`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:32](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L32)

Scroll to a position

#### Parameters

##### position

###### x?

`number`

###### y?

`number`

#### Returns

`Effect`\<`void`\>

***

### setIsHovering()

> `readonly` **setIsHovering**: (`value`) => `void`

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:58](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L58)

Set hovering state

#### Parameters

##### value

`boolean`

#### Returns

`void`

***

### setIsScrolling()

> `readonly` **setIsScrolling**: (`value`) => `void`

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:56](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L56)

Set scrolling state

#### Parameters

##### value

`boolean`

#### Returns

`void`

***

### type

> `readonly` **type**: [`ScrollAreaType`](../type-aliases/ScrollAreaType.md)

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:48](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L48)

Scrollbar visibility type

***

### updateContentSize()

> `readonly` **updateContentSize**: (`size`) => `void`

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:41](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L41)

Update content size (internal)

#### Parameters

##### size

###### height

`number`

###### width

`number`

#### Returns

`void`

***

### updateScrollPosition()

> `readonly` **updateScrollPosition**: (`pos`) => `void`

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:39](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L39)

Update scroll position (internal)

#### Parameters

##### pos

###### x

`number`

###### y

`number`

#### Returns

`void`

***

### updateViewportSize()

> `readonly` **updateViewportSize**: (`size`) => `void`

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:43](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L43)

Update viewport size (internal)

#### Parameters

##### size

###### height

`number`

###### width

`number`

#### Returns

`void`

***

### viewportSize

> `readonly` **viewportSize**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<\{ `height`: `number`; `width`: `number`; \}\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:26](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L26)

Viewport dimensions
