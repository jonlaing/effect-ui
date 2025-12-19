[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / TooltipContext

# Interface: TooltipContext

Defined in: [src/primitives/Tooltip/Tooltip.ts:15](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L15)

Context shared between Tooltip parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Tooltip/Tooltip.ts:21](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L21)

Close the tooltip

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [src/primitives/Tooltip/Tooltip.ts:25](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L25)

Unique ID for the tooltip content

***

### delayDuration

> `readonly` **delayDuration**: `number`

Defined in: [src/primitives/Tooltip/Tooltip.ts:27](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L27)

Delay before opening (ms)

***

### isOpen

> `readonly` **isOpen**: [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Tooltip/Tooltip.ts:17](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L17)

Whether the tooltip is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Tooltip/Tooltip.ts:19](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L19)

Open the tooltip

#### Returns

`Effect`\<`void`\>

***

### triggerRef

> `readonly` **triggerRef**: [`SignalType`](../type-aliases/SignalType.md)\<`HTMLElement` \| `null`\>

Defined in: [src/primitives/Tooltip/Tooltip.ts:23](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L23)

Reference to the trigger element
