[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / SignalOptions

# Interface: SignalOptions\<A\>

Defined in: [src/core/Signal.ts:26](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Signal.ts#L26)

Options for creating a Signal.

## Type Parameters

### A

`A`

The type of the value

## Properties

### equals()?

> `readonly` `optional` **equals**: (`a`, `b`) => `boolean`

Defined in: [src/core/Signal.ts:28](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/core/Signal.ts#L28)

Custom equality function to determine if the value has changed

#### Parameters

##### a

`A`

##### b

`A`

#### Returns

`boolean`
