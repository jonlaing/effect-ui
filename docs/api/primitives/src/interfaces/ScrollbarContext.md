[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ScrollbarContext

# Interface: ScrollbarContext

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:61](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L61)

## Properties

### hasOverflow

> `readonly` **hasOverflow**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:69](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L69)

Whether this scrollbar should be visible (content overflows)

***

### isVisible

> `readonly` **isVisible**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:71](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L71)

Whether scrollbar is currently visible based on type

***

### orientation

> `readonly` **orientation**: [`ScrollbarOrientation`](../type-aliases/ScrollbarOrientation.md)

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:63](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L63)

Scrollbar orientation

***

### thumbPosition

> `readonly` **thumbPosition**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`number`\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:67](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L67)

Thumb position as percentage (0-100)

***

### thumbSize

> `readonly` **thumbSize**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`number`\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:65](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L65)

Thumb size as percentage (0-100)

***

### trackRef

> `readonly` **trackRef**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`HTMLDivElement`\>

Defined in: [packages/primitives/src/primitives/ScrollArea/ScrollArea.ts:73](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ScrollArea/ScrollArea.ts#L73)

Reference to the scrollbar track
