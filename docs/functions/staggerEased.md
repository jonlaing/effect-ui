[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / staggerEased

# Function: staggerEased()

> **staggerEased**(`totalDurationMs`, `easingFn`): [`StaggerFunction`](../type-aliases/StaggerFunction.md)

Defined in: [src/dom/Animation/index.ts:82](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Animation/index.ts#L82)

Create a stagger function with easing applied to the delay curve.
Useful for creating more natural-feeling staggered animations.

## Parameters

### totalDurationMs

`number`

Total duration for all staggers to complete

### easingFn

(`t`) => `number`

Easing function (0-1 input, 0-1 output)

## Returns

[`StaggerFunction`](../type-aliases/StaggerFunction.md)

## Example

```ts
// Ease-out: items near the end have smaller delays between them
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

each(items, keyFn, render, {
  animate: {
    enter: "slide-in",
    stagger: staggerEased(500, easeOut)
  }
})
```
