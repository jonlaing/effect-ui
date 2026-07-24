---
"@effex/router": patch
---

Fix `Outlet`'s SPA fallback (no `RouteDataProvider` in context) to honour `Route.static`. The fallback branch only checked `route._loader` and `route._handlers` — `Route.static` puts its loader inside `_staticConfig.load` and sets neither of those, so `hasHooks` was `false`, the branch was skipped, and `routeData` stayed at its default with `data: undefined`. `route.render(undefined)` then crashed on any static-route render function that touched its `data` argument.

Now the fallback also runs `_staticConfig?.load` when present. `Route.static` routes work correctly in pure-SPA mode (no `@effex/platform`), and the "provider dropped through unexpectedly" cases stop presenting as opaque `Cannot read properties of undefined` from user code.
