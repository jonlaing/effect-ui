[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / SignalType

# Type Alias: SignalType

> **SignalType** = `object`

Defined in: src/Signal.ts:15

Signal module namespace containing factory functions.

## Properties

### make()

> **make**: \<`A`\>(`initial`, `options?`) => `Effect`\<`Signal`\<`A`\>, `never`, `Scope`\>

Defined in: src/Signal.ts:100

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

Defined in: src/Signal.ts:101
