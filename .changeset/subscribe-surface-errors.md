---
"@effex/dom": patch
---

Surface reconcile-subscription failures via `console.error`. Every `ControlCtx` (`ClientControlCtx`, both `HydrationControlCtx` factories) implemented `subscribe(readable, handler)` by forking the stream reader into the parent scope. That's the right lifecycle model, but `Effect.forkIn` swallows fiber failures — if the handler ever threw (a route render errored, a data provider died mid-nav, a slot insertion blew up), the fiber died silently and the UI froze with no console output.

Now every subscription goes through a shared `subscribeReconcile` helper that:

1. Logs each failing handler run to `console.error` with a full Effect `Cause.pretty` (fiber trace + underlying errors) so devtools and error trackers pick it up.
2. Catches the failure at the per-value boundary so a single bad update doesn't kill the subscription — subsequent state changes still fire the handler. Navigating away from a broken route and back now recovers.

Practical impact: `Outlet` navigation errors (route render throws, data-provider rejects, guard errors) now surface immediately at the source instead of appearing as an unresponsive Outlet.
