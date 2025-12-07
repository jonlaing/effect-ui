[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / mount

# Function: mount()

> **mount**(`element`, `container`): `Effect`\<`void`, `never`, `Scope`\>

Defined in: src/Mount.ts:23

Mount an Element into a DOM container. Automatically cleans up when the scope closes.

## Parameters

### element

[`Element`](../type-aliases/Element.md)

The Element to mount

### container

`HTMLElement`

The DOM container to mount into

## Returns

`Effect`\<`void`, `never`, `Scope`\>

## Example

```ts
const app = div([
  h1(["Hello, Effect UI!"])
])

// Mount the app and run it
Effect.runPromise(
  Effect.scoped(
    mount(app, document.getElementById("root")!)
  )
)
```
