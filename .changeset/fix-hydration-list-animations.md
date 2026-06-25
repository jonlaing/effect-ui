---
"@effex/dom": patch
---

Fix list animations being silently dropped on hydrated pages (SSG + SSR). `HydrationControlCtx` was reading `AnimationConfigCtx` once at Layer construction (at the hydration root, before any `each` had a chance to provide its config) and closing over the resulting `undefined`. Now reads the service lazily inside `addSlot`/`removeSlot`, mirroring the existing `ClientControlCtx` pattern, so each `each` with `animate` sees the config its parent provided.

`@effex/router` will receive an automatic patch via the `updateInternalDependencies` Changesets rule because it depends on `@effex/dom` as a workspace dependency.
