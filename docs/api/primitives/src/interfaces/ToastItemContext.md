[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ToastItemContext

# Interface: ToastItemContext

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:77](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/Toast.ts#L77)

Per-toast context provided by Root.

## Properties

### dismiss()

> `readonly` **dismiss**: () => `Effect`\<`void`\>

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:81](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/Toast.ts#L81)

Dismiss this toast

#### Returns

`Effect`\<`void`\>

***

### pauseTimer()

> `readonly` **pauseTimer**: () => `void`

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:83](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/Toast.ts#L83)

Pause auto-dismiss timer

#### Returns

`void`

***

### resumeTimer()

> `readonly` **resumeTimer**: () => `void`

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:85](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/Toast.ts#L85)

Resume auto-dismiss timer

#### Returns

`void`

***

### toast

> `readonly` **toast**: [`ToastData`](ToastData.md)

Defined in: [packages/primitives/src/primitives/Toast/Toast.ts:79](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Toast/Toast.ts#L79)

This toast's data
