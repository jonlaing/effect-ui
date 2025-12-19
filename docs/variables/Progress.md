[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Progress

# Variable: Progress

> `const` **Progress**: `object`

Defined in: [src/primitives/Progress/Progress.ts:183](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Progress/Progress.ts#L183)

Headless Progress primitive for building progress bars.

Features:
- Determinate and indeterminate states
- Full ARIA accessibility support
- Custom value labels for screen readers
- Reactive value updates

## Type Declaration

### Indicator

> **Indicator**: [`Component`](../type-aliases/Component.md)\<`"ProgressIndicator"`, [`ProgressIndicatorProps`](../interfaces/ProgressIndicatorProps.md), `never`, [`ProgressCtx`](../classes/ProgressCtx.md)\>

### Root()

> **Root**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)

#### Parameters

##### props

[`ProgressRootProps`](../interfaces/ProgressRootProps.md)

##### children

[`Child`](../type-aliases/Child.md)\<`never`, [`ProgressCtx`](../classes/ProgressCtx.md)\> | readonly [`Child`](../type-aliases/Child.md)\<`never`, [`ProgressCtx`](../classes/ProgressCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)

## Example

```ts
// Determinate progress
Progress.Root({ value: 60, max: 100 }, [
  Progress.Indicator({})
])

// Indeterminate (loading)
Progress.Root({ value: null }, [
  Progress.Indicator({})
])

// With reactive value
const progress = yield* Signal.make(0)
Progress.Root({ value: progress }, [
  Progress.Indicator({})
])
```
