[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / SuspenseOptions

# Interface: SuspenseOptions\<N, E, R1, EF\>

Defined in: [packages/core/src/Boundary.ts:8](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Boundary.ts#L8)

Options for the suspense boundary.

## Type Parameters

### N

`N`

### E

`E`

### R1

`R1`

### EF

`EF`

## Properties

### catch()?

> `readonly` `optional` **catch**: (`error`) => [`Element`](../type-aliases/Element.md)\<`N`, `never`, `never`\>

Defined in: [packages/core/src/Boundary.ts:26](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Boundary.ts#L26)

Optional error handler. If provided, errors from render are caught
and this function is called to render an error state.
Must have no requirements.

#### Parameters

##### error

`E`

#### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `never`, `never`\>

***

### delay?

> `readonly` `optional` **delay**: `DurationInput`

Defined in: [packages/core/src/Boundary.ts:34](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Boundary.ts#L34)

Delay before showing the fallback.
If the render completes before this duration, no fallback is shown.
Accepts Effect Duration strings like "200 millis", "1 second", or a number (milliseconds).
If not provided, fallback is shown immediately.

***

### fallback()

> `readonly` **fallback**: () => [`Element`](../type-aliases/Element.md)\<`N`, `EF`, `never`\>

Defined in: [packages/core/src/Boundary.ts:19](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Boundary.ts#L19)

Function to render the loading/fallback state.
Must have no requirements (will be rendered in detached context if delay > 0).

#### Returns

[`Element`](../type-aliases/Element.md)\<`N`, `EF`, `never`\>

***

### render()

> `readonly` **render**: () => `Effect`\<`N`, `E`, `Scope` \| `R1`\>

Defined in: [packages/core/src/Boundary.ts:13](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Boundary.ts#L13)

Async function that returns the final element.
Can fail with error type E if `catch` is provided.

#### Returns

`Effect`\<`N`, `E`, `Scope` \| `R1`\>
