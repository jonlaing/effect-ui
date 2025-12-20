[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / delay

# Function: delay()

> **delay**\<`A`, `E`, `R`\>(`ms`, `effect`): `Effect`\<`A`, `E`, `R`\>

Defined in: [packages/dom/src/Animation/index.ts:103](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Animation/index.ts#L103)

Add a delay before running an effect.

## Type Parameters

### A

`A`

### E

`E`

### R

`R`

## Parameters

### ms

`number`

### effect

`Effect`\<`A`, `E`, `R`\>

## Returns

`Effect`\<`A`, `E`, `R`\>

## Example

```ts
yield* delay(200, runEnterAnimation(element, options))
```
