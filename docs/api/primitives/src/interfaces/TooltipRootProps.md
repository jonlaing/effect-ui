[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / TooltipRootProps

# Interface: TooltipRootProps

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:34](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L34)

Props for Tooltip.Root

## Properties

### defaultOpen?

> `readonly` `optional` **defaultOpen**: `boolean`

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:38](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L38)

Default open state for uncontrolled usage

***

### delayDuration?

> `readonly` `optional` **delayDuration**: `number`

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:40](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L40)

Delay before showing tooltip in ms (default: 700)

***

### onOpenChange()?

> `readonly` `optional` **onOpenChange**: (`open`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:42](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L42)

Callback when open state changes

#### Parameters

##### open

`boolean`

#### Returns

`Effect`\<`void`\>

***

### open?

> `readonly` `optional` **open**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:36](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L36)

Controlled open state - if provided, component is controlled
