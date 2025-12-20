[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / sequence

# Function: sequence()

> **sequence**\<`A`, `E`, `R`\>(...`effects`): `Effect`\<`A`[], `E`, `R`\>

Defined in: [packages/dom/src/Animation/index.ts:119](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/index.ts#L119)

Run multiple animation effects in sequence.

## Type Parameters

### A

`A`

### E

`E`

### R

`R`

## Parameters

### effects

...`Effect`\<`A`, `E`, `R`\>[]

## Returns

`Effect`\<`A`[], `E`, `R`\>

## Example

```ts
yield* sequence(
  runExitAnimation(oldElement, options),
  runEnterAnimation(newElement, options)
)
```
