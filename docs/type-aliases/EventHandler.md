[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / EventHandler

# Type Alias: EventHandler()\<E\>

> **EventHandler**\<`E`\> = (`event`) => `Effect.Effect`\<`void`, `never`\> \| `void`

Defined in: src/Element/types.ts:58

Handler for DOM events that can optionally return an Effect.

## Type Parameters

### E

`E` *extends* `Event`

The specific Event type

## Parameters

### event

`E`

## Returns

`Effect.Effect`\<`void`, `never`\> \| `void`

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
