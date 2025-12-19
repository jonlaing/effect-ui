[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / staggerFromCenter

# Function: staggerFromCenter()

> **staggerFromCenter**(`delayMs`): [`StaggerFunction`](../type-aliases/StaggerFunction.md)

Defined in: [src/dom/Animation/index.ts:54](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Animation/index.ts#L54)

Create a stagger function that animates from the center outward.
Items in the middle animate first, edges animate last.

## Parameters

### delayMs

`number`

## Returns

[`StaggerFunction`](../type-aliases/StaggerFunction.md)

## Example

```ts
each(items, keyFn, render, {
  animate: {
    enter: "scale-in",
    stagger: staggerFromCenter(30)
  }
})
```
