[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ProgressContext

# Interface: ProgressContext

Defined in: [packages/primitives/src/primitives/Progress/Progress.ts:19](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Progress/Progress.ts#L19)

## Properties

### max

> `readonly` **max**: `number`

Defined in: [packages/primitives/src/primitives/Progress/Progress.ts:23](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Progress/Progress.ts#L23)

Maximum value

***

### percentage

> `readonly` **percentage**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`number`\>

Defined in: [packages/primitives/src/primitives/Progress/Progress.ts:25](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Progress/Progress.ts#L25)

Progress as percentage (0-100)

***

### value

> `readonly` **value**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<`number` \| `null`\>

Defined in: [packages/primitives/src/primitives/Progress/Progress.ts:21](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Progress/Progress.ts#L21)

Current value (null = indeterminate)
