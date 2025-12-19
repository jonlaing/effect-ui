[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / CollapsibleRootProps

# Interface: CollapsibleRootProps

Defined in: [src/primitives/Collapsible/Collapsible.ts:31](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L31)

Props for Collapsible.Root

## Properties

### defaultOpen?

> `readonly` `optional` **defaultOpen**: `boolean`

Defined in: [src/primitives/Collapsible/Collapsible.ts:35](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L35)

Default open state for uncontrolled usage

***

### disabled?

> `readonly` `optional` **disabled**: `boolean` \| [`Readable`](Readable.md)\<`boolean`\>

Defined in: [src/primitives/Collapsible/Collapsible.ts:37](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L37)

Whether the collapsible is disabled

***

### onOpenChange()?

> `readonly` `optional` **onOpenChange**: (`open`) => `Effect`\<`void`\>

Defined in: [src/primitives/Collapsible/Collapsible.ts:39](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L39)

Callback when open state changes

#### Parameters

##### open

`boolean`

#### Returns

`Effect`\<`void`\>

***

### open?

> `readonly` `optional` **open**: [`SignalType`](../type-aliases/SignalType.md)\<`boolean`\>

Defined in: [src/primitives/Collapsible/Collapsible.ts:33](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Collapsible/Collapsible.ts#L33)

Controlled open state - if provided, component is controlled
