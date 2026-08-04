---
"@effex/dom": patch
"create-effex": patch
---

fix(hydrate): make element requirements provably match `options.layers`

`hydrate`'s element parameter was locked to `Element<A, never, RendererContext | ControlCtx | SuspenseBoundaryCtx>`, so any element that also required a user-provided service (`NavigationContext`, `RouteDataProvider`, etc.) had to be cast — `as never` or `as unknown as Element<HTMLElement>` — even though `options.layers` was providing exactly those services at runtime.

`HydrateOptions` and `hydrate` are now generic over the layer type. The layer's provided services flow through `Layer.Layer.Success<L>` into the element's allowed `R`, so:

- Passing an element that needs a service without providing a layer for it is a type error.
- Providing a layer that only covers some of the element's requirements is a type error.
- `hydrate(App(), root, { layers: Platform.makeClientLayer(router) })` typechecks with no casts when the layer fully covers what `App()` needs.

`NoInfer` on the extracted layer type keeps TypeScript from inferring `L` from the element's requirements — inference flows one way, from `options.layers` into the element, so forgetting a service is a compile-time error rather than a silent runtime failure.

Removed the now-obsolete casts from `create-effex`'s SSG and SSR templates, `apps/docs`, and the hydrate regression test.
