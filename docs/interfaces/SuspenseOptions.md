[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / SuspenseOptions

# Interface: SuspenseOptions\<E, R1, EF\>

Defined in: [src/dom/Control.ts:47](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Control.ts#L47)

Options for the Suspense component.

## Type Parameters

### E

`E`

### R1

`R1`

### EF

`EF`

## Properties

### catch()?

> `readonly` `optional` **catch**: (`error`) => [`Element`](../type-aliases/Element.md)\<`never`, `never`\>

Defined in: [src/dom/Control.ts:65](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Control.ts#L65)

Optional error handler. If provided, errors from render are caught
and this function is called to render an error state.
Must have no requirements.

#### Parameters

##### error

`E`

#### Returns

[`Element`](../type-aliases/Element.md)\<`never`, `never`\>

***

### delay?

> `readonly` `optional` **delay**: `DurationInput`

Defined in: [src/dom/Control.ts:73](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Control.ts#L73)

Delay before showing the fallback.
If the render completes before this duration, no fallback is shown.
Accepts Effect Duration strings like "200 millis", "1 second", or a number (milliseconds).
If not provided, fallback is shown immediately.

***

### fallback()

> `readonly` **fallback**: () => [`Element`](../type-aliases/Element.md)\<`EF`, `never`\>

Defined in: [src/dom/Control.ts:58](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Control.ts#L58)

Function to render the loading/fallback state.
Must have no requirements (will be rendered in detached context if delay > 0).

#### Returns

[`Element`](../type-aliases/Element.md)\<`EF`, `never`\>

***

### render()

> `readonly` **render**: () => `Effect`\<`HTMLElement`, `E`, `Scope` \| `R1`\>

Defined in: [src/dom/Control.ts:52](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Control.ts#L52)

Async function that returns the final element.
Can fail with error type E if `catch` is provided.

#### Returns

`Effect`\<`HTMLElement`, `E`, `Scope` \| `R1`\>
