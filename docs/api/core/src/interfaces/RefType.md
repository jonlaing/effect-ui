[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / RefType

# Interface: RefType\<A\>

Defined in: [packages/core/src/Ref.ts:8](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Ref.ts#L8)

A mutable reference that may not have a value yet.
Similar to React's useRef but with Effect integration.

## Type Parameters

### A

`A`

The type of value held by the ref

## Properties

### current

> **current**: `A` \| `null`

Defined in: [packages/core/src/Ref.ts:10](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Ref.ts#L10)

The current value, or null if not yet set

***

### set()

> `readonly` **set**: (`value`) => `void`

Defined in: [packages/core/src/Ref.ts:14](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Ref.ts#L14)

Set the value (also completes the deferred)

#### Parameters

##### value

`A`

#### Returns

`void`

***

### value

> `readonly` **value**: `Effect`\<`A`\>

Defined in: [packages/core/src/Ref.ts:12](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/core/src/Ref.ts#L12)

Effect that resolves when the value is available
