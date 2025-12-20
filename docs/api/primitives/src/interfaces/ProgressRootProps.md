[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ProgressRootProps

# Interface: ProgressRootProps

Defined in: [packages/primitives/src/primitives/Progress/Progress.ts:41](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Progress/Progress.ts#L41)

## Properties

### class?

> `readonly` `optional` **class**: [`Reactive`](../../../core/src/namespaces/Readable/type-aliases/Reactive.md)\<`string`\>

Defined in: [packages/primitives/src/primitives/Progress/Progress.ts:49](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Progress/Progress.ts#L49)

Additional class names

***

### getValueLabel()?

> `readonly` `optional` **getValueLabel**: (`value`, `max`) => `string`

Defined in: [packages/primitives/src/primitives/Progress/Progress.ts:47](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Progress/Progress.ts#L47)

Custom label for screen readers

#### Parameters

##### value

`number`

##### max

`number`

#### Returns

`string`

***

### max?

> `readonly` `optional` **max**: `number`

Defined in: [packages/primitives/src/primitives/Progress/Progress.ts:45](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Progress/Progress.ts#L45)

Maximum value (default: 100)

***

### value?

> `readonly` `optional` **value**: `number` \| [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`number` \| `null`\> \| `null`

Defined in: [packages/primitives/src/primitives/Progress/Progress.ts:43](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Progress/Progress.ts#L43)

Current progress value (null = indeterminate)
