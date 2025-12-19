[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / parallel

# Function: parallel()

> **parallel**\<`A`, `E`, `R`\>(...`effects`): `Effect`\<`A`[], `E`, `R`\>

Defined in: [src/dom/Animation/index.ts:135](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Animation/index.ts#L135)

Run multiple animation effects in parallel.

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
yield* parallel(
  runExitAnimation(element1, options),
  runExitAnimation(element2, options),
  runExitAnimation(element3, options)
)
```
