[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / runApp

# Function: runApp()

> **runApp**\<`E`, `R`\>(`program`, `options?`): `Promise`\<`void`\>

Defined in: [packages/dom/src/Mount.ts:140](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Mount.ts#L140)

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
