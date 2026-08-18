---
"@effex/router": minor
"@effex/dom": minor
---

feat: framework debug logs via Effect.logDebug

Effex now emits structured debug logs at key framework boundaries — navigation, route resolution, data fetches, animation lifecycle, and reconcile handler invocations. Enable them with the standard Effect Logger pattern:

```ts
Effect.runFork(program.pipe(
  Logger.withMinimumLogLevel(LogLevel.Debug),
  Effect.provide(Logger.pretty),
));
```

Every message carries a `subsystem` annotation so consumers can filter by area:

- `effex.nav` — `pushPath`, `replacePath`, popstate handler
- `effex.outlet` — route resolution, guard eval, redirects
- `effex.route-data` — which fetch branch was chosen (provider / SPA fallback), redirect signals
- `effex.animation` — enter/exit begin/end, skip reason, how `transitionend` resolved (`transition` / `animation` / `timeout` / `skip`)
- `effex.reconcile` — every reconcile handler invocation with the triggering value

Zero cost when the level is above Debug (the default): the message-formatting layer never runs. Only low-volume framework events get logged this way — high-volume paths (`Signal.set`, per-slot animation phase) will get structured inspector hooks in a future release (#86 / #87 / #88).

Closes #95.
