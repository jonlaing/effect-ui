[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / RefType

# Interface: RefType\<A\>

Defined in: [src/dom/Ref.ts:7](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Ref.ts#L7)

A reference to a DOM element that may not exist yet.

## Type Parameters

### A

`A` *extends* `HTMLElement`

The specific HTMLElement type

## Properties

### \_set()

> `readonly` **\_set**: (`element`) => `void`

Defined in: [src/dom/Ref.ts:13](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Ref.ts#L13)

Internal setter - do not use directly

#### Parameters

##### element

`A`

#### Returns

`void`

***

### current

> `readonly` **current**: `A` \| `null`

Defined in: [src/dom/Ref.ts:9](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Ref.ts#L9)

The current element, or null if not yet set

***

### element

> `readonly` **element**: `Effect`\<`A`\>

Defined in: [src/dom/Ref.ts:11](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Ref.ts#L11)

Effect that resolves when the element is available
