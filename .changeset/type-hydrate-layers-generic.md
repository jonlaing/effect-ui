---
"@effex/dom": patch
"create-effex": patch
---

fix(hydrate): make `R` inferable from `options.layers`

`hydrate`'s element parameter was locked to `Element<A, never, RendererContext | ControlCtx | SuspenseBoundaryCtx>`, which meant any element that also required a user-provided service (`NavigationContext`, `RouteDataProvider`, etc.) had to be cast — `as never` or `as unknown as Element<HTMLElement>` — even though `options.layers` was providing exactly those services at runtime.

`HydrateOptions` and `hydrate` are now generic over `R`. Whatever services `options.layers` provides show up as the element's `R`, so the intended pattern typechecks with no casts:

```ts
hydrate(App(), root, { layers: Platform.makeClientLayer(router) });
```

Removed the now-obsolete casts from `create-effex`'s SSG and SSR templates and from `apps/docs`.
