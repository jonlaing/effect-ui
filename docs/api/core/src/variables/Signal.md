[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / Signal

# Variable: Signal

> **Signal**: `object`

Defined in: [packages/core/src/Signal.ts:11](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Signal.ts#L11)

Signal namespace containing factory functions.

## Type Declaration

### make()

> **make**: \<`A`\>(`initial`, `options?`) => `Effect`\<[`Signal`](../interfaces/Signal.md)\<`A`\>, `never`, `Scope`\>

Create a new Signal with an initial value.

#### Type Parameters

##### A

`A`

#### Parameters

##### initial

`A`

The initial value

##### options?

[`SignalOptions`](../interfaces/SignalOptions.md)\<`A`\>

Optional configuration

#### Returns

`Effect`\<[`Signal`](../interfaces/Signal.md)\<`A`\>, `never`, `Scope`\>

### SignalRegistry

> **SignalRegistry**: *typeof* [`SignalRegistry`](../classes/SignalRegistry.md)
