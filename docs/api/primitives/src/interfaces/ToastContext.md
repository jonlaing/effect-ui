[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ToastContext

# Interface: ToastContext

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:53](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toast/Toast.ts#L53)

Global toast context provided by Provider.

## Properties

### add()

> `readonly` **add**: (`options`) => `Effect`\<`string`\>

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:57](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toast/Toast.ts#L57)

Add a new toast, returns its ID

#### Parameters

##### options

[`ToastOptions`](ToastOptions.md)

#### Returns

`Effect`\<`string`\>

***

### defaultDuration

> `readonly` **defaultDuration**: `number`

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:67](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toast/Toast.ts#L67)

Default auto-dismiss duration

***

### dismiss()

> `readonly` **dismiss**: (`id`) => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:59](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toast/Toast.ts#L59)

Dismiss a specific toast by ID

#### Parameters

##### id

`string`

#### Returns

`Effect`\<`void`\>

***

### dismissAll()

> `readonly` **dismissAll**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:61](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toast/Toast.ts#L61)

Dismiss all toasts

#### Returns

`Effect`\<`void`\>

***

### maxVisible

> `readonly` **maxVisible**: `number`

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:65](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toast/Toast.ts#L65)

Max visible toasts

***

### position

> `readonly` **position**: [`ToastPosition`](../type-aliases/ToastPosition.md)

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:63](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toast/Toast.ts#L63)

Current position

***

### swipeDirection

> `readonly` **swipeDirection**: [`SwipeDirection`](../type-aliases/SwipeDirection.md)

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:71](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toast/Toast.ts#L71)

Swipe direction

***

### swipeThreshold

> `readonly` **swipeThreshold**: `number`

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:69](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toast/Toast.ts#L69)

Swipe threshold in pixels

***

### toasts

> `readonly` **toasts**: [`Readable`](../../../core/src/namespaces/Readable/interfaces/Readable.md)\<readonly [`ToastData`](ToastData.md)[]\>

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:55](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Toast/Toast.ts#L55)

All current toasts
