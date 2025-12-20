[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / staggerFromCenter

# Function: staggerFromCenter()

> **staggerFromCenter**(`delayMs`): [`StaggerFunction`](../type-aliases/StaggerFunction.md)

Defined in: [packages/dom/src/Animation/index.ts:54](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/index.ts#L54)

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
