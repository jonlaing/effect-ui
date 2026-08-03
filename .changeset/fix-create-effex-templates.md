---
"create-effex": patch
---

Fix broken client entry templates.

- **SSG template** (`client.ts`): was calling `hydrate(App(), root)` with no
  layers, even though the App uses `Outlet` and `Link` which require
  `NavigationContext`. Hydration bailed as soon as either was resolved.
  Now passes `Platform.makeClientLayer(router)` via `options.layers`.
- **SPA template** (`main.ts`): passed `{ layers: ... }` as a third arg to
  `mount`, which doesn't accept options — the arg was silently dropped
  and the returned `Effect` was never run, so nothing mounted at all. Now
  uses `runApp(mount(...), { layer: ... })`, the documented pattern.
