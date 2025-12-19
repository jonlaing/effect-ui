[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / EventHandler

# Type Alias: EventHandler()\<E\>

> **EventHandler**\<`E`\> = (`event`) => `Effect.Effect`\<`void`, `never`\>

Defined in: [src/dom/Element/types.ts:79](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Element/types.ts#L79)

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
