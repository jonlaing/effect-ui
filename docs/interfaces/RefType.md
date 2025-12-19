[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / RefType

# Interface: RefType\<A\>

Defined in: [src/core/Ref.ts:8](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Ref.ts#L8)

A mutable reference that may not have a value yet.
Similar to React's useRef but with Effect integration.

## Type Parameters

### A

`A`

The type of value held by the ref

## Properties

### current

> **current**: `A` \| `null`

Defined in: [src/core/Ref.ts:10](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Ref.ts#L10)

The current value, or null if not yet set

***

### set()

> `readonly` **set**: (`value`) => `void`

Defined in: [src/core/Ref.ts:14](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Ref.ts#L14)

Set the value (also completes the deferred)

#### Parameters

##### value

`A`

#### Returns

`void`

***

### value

> `readonly` **value**: `Effect`\<`A`\>

Defined in: [src/core/Ref.ts:12](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/core/Ref.ts#L12)

Effect that resolves when the value is available
