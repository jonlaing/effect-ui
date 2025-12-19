[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ScrollbarContext

# Interface: ScrollbarContext

Defined in: [src/primitives/ScrollArea/ScrollArea.ts:61](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ScrollArea/ScrollArea.ts#L61)

## Properties

### hasOverflow

> `readonly` **hasOverflow**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/ScrollArea/ScrollArea.ts:69](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ScrollArea/ScrollArea.ts#L69)

Whether this scrollbar should be visible (content overflows)

***

### isVisible

> `readonly` **isVisible**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/ScrollArea/ScrollArea.ts:71](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ScrollArea/ScrollArea.ts#L71)

Whether scrollbar is currently visible based on type

***

### orientation

> `readonly` **orientation**: [`ScrollbarOrientation`](../type-aliases/ScrollbarOrientation.md)

Defined in: [src/primitives/ScrollArea/ScrollArea.ts:63](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ScrollArea/ScrollArea.ts#L63)

Scrollbar orientation

***

### thumbPosition

> `readonly` **thumbPosition**: [`Readable`](Readable.md)\<`number`\>

Defined in: [src/primitives/ScrollArea/ScrollArea.ts:67](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ScrollArea/ScrollArea.ts#L67)

Thumb position as percentage (0-100)

***

### thumbSize

> `readonly` **thumbSize**: [`Readable`](Readable.md)\<`number`\>

Defined in: [src/primitives/ScrollArea/ScrollArea.ts:65](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ScrollArea/ScrollArea.ts#L65)

Thumb size as percentage (0-100)

***

### trackRef

> `readonly` **trackRef**: [`RefType`](../type-aliases/RefType.md)\<`HTMLDivElement`\>

Defined in: [src/primitives/ScrollArea/ScrollArea.ts:73](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/ScrollArea/ScrollArea.ts#L73)

Reference to the scrollbar track
