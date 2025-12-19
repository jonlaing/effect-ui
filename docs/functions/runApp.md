[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / runApp

# Function: runApp()

> **runApp**\<`E`, `R`\>(`program`, `options?`): `Promise`\<`void`\>

Defined in: [src/dom/Mount.ts:130](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Mount.ts#L130)

Run an Effect UI application. This is the main entry point for Effect UI apps.

Handles all the boilerplate:
- Scopes the effect for proper resource cleanup
- Provides the SignalRegistry
- Keeps the app alive until page unload
- Optionally provides additional layers (like router context)

## Type Parameters

### E

`E`

### R

`R`

## Parameters

### program

`Effect`\<`void`, `E`, `Scope` \| `R`\>

An effect that sets up and mounts the app

### options?

Optional configuration

#### layer?

`Layer`\<`R`, `never`, `never`\>

Additional layer to provide (e.g., router context)

## Returns

`Promise`\<`void`\>

## Examples

```ts
// Simple app without routing
runApp(
  Effect.gen(function* () {
    yield* mount(App(), document.getElementById("root")!)
  })
)
```

```ts
// App with router
runApp(
  Effect.gen(function* () {
    const router = yield* Router.make(routes)
    yield* mount(
      App().pipe(Effect.provide(makeRouterLayer(router))),
      document.getElementById("root")!
    )
  })
)
```

```ts
// App with custom layer
const appLayer = Layer.merge(
  makeRouterLayer(router),
  Layer.succeed(MyContext, myService)
)

runApp(
  Effect.gen(function* () {
    yield* mount(App().pipe(Effect.provide(appLayer)), root)
  })
)
```
