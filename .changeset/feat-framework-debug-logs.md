---
"@effex/router": minor
"@effex/dom": minor
"@effex/core": minor
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
- `effex.reconcile` — every `reconcile` sync pass with the triggering value and the resolved current/target slot keys

New `logDebug` and `logError` helpers exported from `@effex/core` for framework use and any downstream extensions that want to plug into the same filter mechanism:

```ts
import { logDebug, logError } from "@effex/core";

yield* logDebug("cache miss", "effex.my-extension", { key });
yield* logError("cache failure", "effex.my-extension", { cause });
```

The `subsystem` argument is typed as `` `effex.${string}` `` — enforces the prefix at the type level. `logDebug` is filtered at the default log level (opt-in visibility for framework internals); `logError` always emits (user sees framework error paths without opting in).

Also moves the reconcile handler's error wrapping — previously in `@effex/dom`'s `subscribeReconcile`, using `Console.error` — into core's `reconcile` where the semantics belong. Failed handlers on subsequent-value updates now emit an `effex.reconcile` Error log through the Logger system and the subscription fiber survives (subsequent updates still fire). `subscribeReconcile` is now trivially the fork/forEach pattern.

Zero cost when the level is above Debug (the default): the message-formatting layer never runs. Only low-volume framework events get logged this way — high-volume paths (`Signal.set`, per-slot animation phase) will get structured inspector hooks in a future release (#86 / #87 / #88).

Closes #95.
