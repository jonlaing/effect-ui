[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / TooltipContext

# Interface: TooltipContext

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:16](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L16)

Context shared between Tooltip parts.

## Properties

### close()

> `readonly` **close**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:22](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L22)

Close the tooltip

#### Returns

`Effect`\<`void`\>

***

### contentId

> `readonly` **contentId**: `string`

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:26](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L26)

Unique ID for the tooltip content

***

### delayDuration

> `readonly` **delayDuration**: `number`

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:28](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L28)

Delay before opening (ms)

***

### isOpen

> `readonly` **isOpen**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`boolean`\>

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:18](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L18)

Whether the tooltip is currently open

***

### open()

> `readonly` **open**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:20](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L20)

Open the tooltip

#### Returns

`Effect`\<`void`\>

***

### triggerRef

> `readonly` **triggerRef**: [`Signal`](../../../core/src/interfaces/Signal.md)\<`HTMLElement` \| `null`\>

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:24](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L24)

Reference to the trigger element
