[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ToastContext

# Interface: ToastContext

Defined in: [src/primitives/Toast/Toast.ts:52](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L52)

Global toast context provided by Provider.

## Properties

### add()

> `readonly` **add**: (`options`) => `Effect`\<`string`\>

Defined in: [src/primitives/Toast/Toast.ts:56](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L56)

Add a new toast, returns its ID

#### Parameters

##### options

[`ToastOptions`](ToastOptions.md)

#### Returns

`Effect`\<`string`\>

***

### defaultDuration

> `readonly` **defaultDuration**: `number`

Defined in: [src/primitives/Toast/Toast.ts:66](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L66)

Default auto-dismiss duration

***

### dismiss()

> `readonly` **dismiss**: (`id`) => `Effect`\<`void`\>

Defined in: [src/primitives/Toast/Toast.ts:58](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L58)

Dismiss a specific toast by ID

#### Parameters

##### id

`string`

#### Returns

`Effect`\<`void`\>

***

### dismissAll()

> `readonly` **dismissAll**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Toast/Toast.ts:60](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L60)

Dismiss all toasts

#### Returns

`Effect`\<`void`\>

***

### maxVisible

> `readonly` **maxVisible**: `number`

Defined in: [src/primitives/Toast/Toast.ts:64](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L64)

Max visible toasts

***

### position

> `readonly` **position**: [`ToastPosition`](../type-aliases/ToastPosition.md)

Defined in: [src/primitives/Toast/Toast.ts:62](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L62)

Current position

***

### swipeDirection

> `readonly` **swipeDirection**: [`SwipeDirection`](../type-aliases/SwipeDirection.md)

Defined in: [src/primitives/Toast/Toast.ts:70](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L70)

Swipe direction

***

### swipeThreshold

> `readonly` **swipeThreshold**: `number`

Defined in: [src/primitives/Toast/Toast.ts:68](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L68)

Swipe threshold in pixels

***

### toasts

> `readonly` **toasts**: [`Readable`](Readable.md)\<readonly [`ToastData`](ToastData.md)[]\>

Defined in: [src/primitives/Toast/Toast.ts:54](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L54)

All current toasts
