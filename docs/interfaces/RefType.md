[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / RefType

# Interface: RefType\<A\>

Defined in: src/Ref.ts:7

A reference to a DOM element that may not exist yet.

## Type Parameters

### A

`A` *extends* `HTMLElement`

The specific HTMLElement type

## Properties

### \_set()

> `readonly` **\_set**: (`element`) => `void`

Defined in: src/Ref.ts:13

Internal setter - do not use directly

#### Parameters

##### element

`A`

#### Returns

`void`

***

### current

> `readonly` **current**: `A` \| `null`

Defined in: src/Ref.ts:9

The current element, or null if not yet set

***

### element

> `readonly` **element**: `Effect`\<`A`\>

Defined in: src/Ref.ts:11

Effect that resolves when the element is available
