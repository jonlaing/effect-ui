[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / staggerEased

# Function: staggerEased()

> **staggerEased**(`totalDurationMs`, `easingFn`): [`StaggerFunction`](../type-aliases/StaggerFunction.md)

Defined in: [packages/dom/src/Animation/index.ts:80](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Animation/index.ts#L80)

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
