[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ToastData

# Interface: ToastData

Defined in: [src/primitives/Toast/helpers.ts:35](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L35)

Toast data stored in the provider.

## Properties

### action?

> `readonly` `optional` **action**: `object`

Defined in: [src/primitives/Toast/helpers.ts:41](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L41)

#### label

> `readonly` **label**: `string`

#### onClick()

> `readonly` **onClick**: () => `Effect`\<`void`\>

##### Returns

`Effect`\<`void`\>

***

### description?

> `readonly` `optional` **description**: `string`

Defined in: [src/primitives/Toast/helpers.ts:38](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L38)

***

### duration?

> `readonly` `optional` **duration**: `number`

Defined in: [src/primitives/Toast/helpers.ts:40](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L40)

***

### id

> `readonly` **id**: `string`

Defined in: [src/primitives/Toast/helpers.ts:36](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L36)

***

### onDismiss()?

> `readonly` `optional` **onDismiss**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Toast/helpers.ts:45](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L45)

#### Returns

`Effect`\<`void`\>

***

### title?

> `readonly` `optional` **title**: `string`

Defined in: [src/primitives/Toast/helpers.ts:37](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L37)

***

### type

> `readonly` **type**: [`ToastType`](../type-aliases/ToastType.md)

Defined in: [src/primitives/Toast/helpers.ts:39](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L39)
