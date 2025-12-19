[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / SignalType

# Type Alias: SignalType

> **SignalType** = `object`

Defined in: [src/core/Signal.ts:11](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Signal.ts#L11)

Signal module namespace containing factory functions.

## Properties

### make()

> **make**: \<`A`\>(`initial`, `options?`) => `Effect`\<`Signal`\<`A`\>, `never`, `Scope`\>

Defined in: [src/core/Signal.ts:94](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Signal.ts#L94)

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

`Effect`\<`Signal`\<`A`\>, `never`, `Scope`\>

***

### SignalRegistry

> **SignalRegistry**: *typeof* [`SignalRegistry`](../classes/SignalRegistry.md)

Defined in: [src/core/Signal.ts:95](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Signal.ts#L95)
