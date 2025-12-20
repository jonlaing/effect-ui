[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / EventHandler

# Type Alias: EventHandler()\<E\>

> **EventHandler**\<`E`\> = (`event`) => `Effect.Effect`\<`void`, `never`\>

Defined in: [packages/dom/src/Element/types.ts:78](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Element/types.ts#L78)

Handler for DOM events that can optionally return an Effect.

## Type Parameters

### E

`E` *extends* `Event`

The specific Event type

## Parameters

### event

`E`

## Returns

`Effect.Effect`\<`void`, `never`\>

## Example

```ts
// Synchronous handler
button({
  onClick: (e) => console.log("clicked", e.target)
}, ["Click"])

// Effect-based handler
button({
  onClick: (e) => Effect.log(`Clicked at ${e.clientX}, ${e.clientY}`)
}, ["Click"])
```
