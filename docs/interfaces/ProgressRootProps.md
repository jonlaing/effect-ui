[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ProgressRootProps

# Interface: ProgressRootProps

Defined in: [src/primitives/Progress/Progress.ts:41](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Progress/Progress.ts#L41)

## Properties

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/primitives/Progress/Progress.ts:49](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Progress/Progress.ts#L49)

Additional class names

***

### getValueLabel()?

> `readonly` `optional` **getValueLabel**: (`value`, `max`) => `string`

Defined in: [src/primitives/Progress/Progress.ts:47](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Progress/Progress.ts#L47)

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

Defined in: [src/primitives/Progress/Progress.ts:45](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Progress/Progress.ts#L45)

Maximum value (default: 100)

***

### value?

> `readonly` `optional` **value**: `number` \| [`Readable`](Readable.md)\<`number` \| `null`\> \| `null`

Defined in: [src/primitives/Progress/Progress.ts:43](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Progress/Progress.ts#L43)

Current progress value (null = indeterminate)
