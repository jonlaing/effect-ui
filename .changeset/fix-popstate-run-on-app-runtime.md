---
"@effex/router": patch
---

Fix browser back/forward buttons not triggering re-renders under SSG
dev mode (and any client-side navigation scenario that relies on
`popstate`).

The `popstate` handler ran the pathname signal update via
`Effect.runSync`. `Signal.set` internally uses `SubscriptionRef.set`,
which acquires a semaphore permit — Effect flags that as async-capable,
so `Effect.runSync` bails silently. The event handler swallows the
throw (browsers don't reliably surface exceptions from raw event
listeners to `console.error`), so the signal never actually updates,
`Outlet`'s subscribers never see the change, and the page appears
frozen on the previous route while the URL bar shows the new one.

Fix: capture the Runtime at Layer construction time and use
`Runtime.runFork` to schedule the update. `runFork` accepts async work
and runs it on the same Runtime the rest of the app uses, so the
signal update reliably reaches subscribers even when the underlying
`Signal.set` isn't purely synchronous.

Regression tests cover:

- Pathname signal updates on popstate.
- Subscribers to `pathname.changes` (Outlet's shape) receive the
  popstate-driven change.
- The handler doesn't throw or fail silently.
