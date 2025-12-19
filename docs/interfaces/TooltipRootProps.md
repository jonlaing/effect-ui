[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / TooltipRootProps

# Interface: TooltipRootProps

Defined in: [src/primitives/Tooltip/Tooltip.ts:33](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L33)

Props for Tooltip.Root

## Properties

### defaultOpen?

> `readonly` `optional` **defaultOpen**: `boolean`

Defined in: [src/primitives/Tooltip/Tooltip.ts:37](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L37)

Default open state for uncontrolled usage

***

### delayDuration?

> `readonly` `optional` **delayDuration**: `number`

Defined in: [src/primitives/Tooltip/Tooltip.ts:39](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L39)

Delay before showing tooltip in ms (default: 700)

***

### onOpenChange()?

> `readonly` `optional` **onOpenChange**: (`open`) => `Effect`\<`void`\>

Defined in: [src/primitives/Tooltip/Tooltip.ts:41](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L41)

Callback when open state changes

#### Parameters

##### open

`boolean`

#### Returns

`Effect`\<`void`\>

***

### open?

> `readonly` `optional` **open**: [`SignalType`](../type-aliases/SignalType.md)\<`boolean`\>

Defined in: [src/primitives/Tooltip/Tooltip.ts:35](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Tooltip/Tooltip.ts#L35)

Controlled open state - if provided, component is controlled
