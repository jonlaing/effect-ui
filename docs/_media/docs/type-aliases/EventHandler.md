[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / EventHandler

# Type Alias: EventHandler()\<E\>

> **EventHandler**\<`E`\> = (`event`) => `Effect.Effect`\<`void`, `never`\> \| `void`

Defined in: [src/dom/Element/types.ts:78](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Element/types.ts#L78)

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
