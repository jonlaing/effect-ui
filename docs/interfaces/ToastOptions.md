[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ToastOptions

# Interface: ToastOptions

Defined in: [src/primitives/Toast/helpers.ts:51](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L51)

Options for creating a new toast (id is auto-generated, type defaults to "default").

## Properties

### action?

> `readonly` `optional` **action**: `object`

Defined in: [src/primitives/Toast/helpers.ts:56](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L56)

#### label

> `readonly` **label**: `string`

#### onClick()

> `readonly` **onClick**: () => `Effect`\<`void`\>

##### Returns

`Effect`\<`void`\>

***

### description?

> `readonly` `optional` **description**: `string`

Defined in: [src/primitives/Toast/helpers.ts:53](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L53)

***

### duration?

> `readonly` `optional` **duration**: `number`

Defined in: [src/primitives/Toast/helpers.ts:55](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L55)

***

### onDismiss()?

> `readonly` `optional` **onDismiss**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Toast/helpers.ts:60](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L60)

#### Returns

`Effect`\<`void`\>

***

### title?

> `readonly` `optional` **title**: `string`

Defined in: [src/primitives/Toast/helpers.ts:52](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L52)

***

### type?

> `readonly` `optional` **type**: [`ToastType`](../type-aliases/ToastType.md)

Defined in: [src/primitives/Toast/helpers.ts:54](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/helpers.ts#L54)
