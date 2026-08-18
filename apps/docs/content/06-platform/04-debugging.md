# Debugging

Effex emits structured debug logs at key framework boundaries — navigation, route resolution, data fetches, animation lifecycle, and reconcile handler invocations. Enable them by lowering Effect's log level to `Debug`.

## Turn on framework logs

Wherever you run your app, wrap the top-level Effect with `Logger.withMinimumLogLevel(LogLevel.Debug)`. Add a Logger layer if you want pretty output.

```typescript
import { Effect, Logger, LogLevel } from "effect";

Effect.runFork(
  program.pipe(
    Logger.withMinimumLogLevel(LogLevel.Debug),
    Effect.provide(Logger.pretty),
  ),
);
```

Every framework log carries a `subsystem` annotation so you can filter by area.

## Subsystems

| Annotation | What it covers |
|---|---|
| `effex.nav` | `pushPath`, `replacePath`, popstate — with `from` and `to` paths |
| `effex.outlet` | Route resolution, guard evaluations, redirects |
| `effex.route-data` | Which fetch branch was taken (provider vs SPA fallback vs static config), redirect signals from the provider |
| `effex.animation` | Enter/exit lifecycle begin/end, whether the animation was skipped, how `transitionend` resolved (`transition` / `animation` / `timeout` / `skip`) |
| `effex.reconcile` | Every reconcile handler invocation with the value that triggered it |

## Filter to one subsystem

Use a custom `Logger` that only prints messages for the subsystem you're chasing:

```typescript
import { HashMap, Logger } from "effect";

const onlyNavLogger = Logger.make((opts) => {
  const subsystem = HashMap.get(opts.annotations, "subsystem");
  if (subsystem._tag !== "Some" || subsystem.value !== "effex.nav") return;
  console.log(`[${opts.logLevel.label}]`, opts.message);
});

Effect.runFork(
  program.pipe(
    Logger.withMinimumLogLevel(LogLevel.Debug),
    Effect.provide(Logger.replace(Logger.defaultLogger, onlyNavLogger)),
  ),
);
```

## Cost when disabled

Zero rendering work — messages are only built into strings by the formatter, and when the level is above `Debug`, the formatter never runs. Message arguments (the objects passed to `Effect.logDebug`) are constructed regardless — that's why the framework only logs at low-volume framework boundaries. High-volume paths like `Signal.set` do NOT emit debug logs; those will get structured inspector hooks in a future release.
