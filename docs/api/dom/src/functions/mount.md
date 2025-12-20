[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / mount

# Function: mount()

> **mount**(`element`, `container`): `Effect`\<`void`, `never`, `Scope`\>

Defined in: [packages/dom/src/Mount.ts:66](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/Mount.ts#L66)

Mount an Element into a DOM container. Automatically cleans up when the scope closes.

The element must have no errors and no unsatisfied requirements (Element<never, never>).
If your component can fail, handle all errors before mounting using ErrorBoundary or Effect.catchAll.
If your component has context requirements, provide them using Effect.provide before mounting.

## Parameters

### element

[`Element`](../type-aliases/Element.md)\<`never`, [`RendererContext`](../../../core/src/classes/RendererContext.md)\>

The Element to mount (must be error-free with all requirements satisfied)

### container

`HTMLElement`

The DOM container to mount into

## Returns

`Effect`\<`void`, `never`, `Scope`\>

## Examples

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

```ts
// Handle errors before mounting
const riskyApp = fetchAndRenderData() // Element<FetchError>

const safeApp = Boundary.error(
  () => riskyApp,
  (error) => div(["Failed to load: ", String(error)])
) // Element<never>

Effect.runPromise(
  Effect.scoped(
    mount(safeApp, document.getElementById("root")!)
  )
)
```

```ts
// Provide context before mounting
const appWithRouter = Link({ href: "/home", children: "Home" }) // Element<never, RouterContext>

Effect.runPromise(
  Effect.scoped(
    mount(
      appWithRouter.pipe(Effect.provide(routerLayer)),
      document.getElementById("root")!
    )
  )
)
```
