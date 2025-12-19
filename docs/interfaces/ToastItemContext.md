[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / ToastItemContext

# Interface: ToastItemContext

Defined in: [src/primitives/Toast/Toast.ts:76](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L76)

Per-toast context provided by Root.

## Properties

### dismiss()

> `readonly` **dismiss**: () => `Effect`\<`void`\>

Defined in: [src/primitives/Toast/Toast.ts:80](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L80)

Dismiss this toast

#### Returns

`Effect`\<`void`\>

***

### pauseTimer()

> `readonly` **pauseTimer**: () => `void`

Defined in: [src/primitives/Toast/Toast.ts:82](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L82)

Pause auto-dismiss timer

#### Returns

`void`

***

### resumeTimer()

> `readonly` **resumeTimer**: () => `void`

Defined in: [src/primitives/Toast/Toast.ts:84](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L84)

Resume auto-dismiss timer

#### Returns

`void`

***

### toast

> `readonly` **toast**: [`ToastData`](ToastData.md)

Defined in: [src/primitives/Toast/Toast.ts:78](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Toast/Toast.ts#L78)

This toast's data
