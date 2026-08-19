---
title: "Debugging"
description: "Strategies for debugging Stax apps, including structured framework logs and Readable debug wrappers."
order: 4
---
# Debugging

Stax emits structured debug logs at key framework boundaries — navigation, route resolution, data fetches, animation lifecycle, and reconcile handler invocations. Enable them by lowering Effect's log level to `Debug`.

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
| `stax.nav` | `pushPath`, `replacePath`, popstate — with `from` and `to` paths |
| `stax.outlet` | Route resolution, guard evaluations, redirects |
| `stax.route-data` | Which fetch branch was taken (provider vs SPA fallback vs static config), redirect signals from the provider |
| `stax.animation` | Enter/exit lifecycle begin/end, whether the animation was skipped, how `transitionend` resolved (`transition` / `animation` / `timeout` / `skip`) |
| `stax.reconcile` | Every reconcile sync pass with the triggering value; error-level entries for failed reconcile handlers |
| `stax.readable` | Emitted by `Readable.debug(id)` — one initial-value line plus a line per subsequent change |

## Filter to one subsystem

Use a custom `Logger` that only prints messages for the subsystem you're chasing:

```typescript
import { HashMap, Logger } from "effect";

const onlyNavLogger = Logger.make((opts) => {
  const subsystem = HashMap.get(opts.annotations, "subsystem");
  if (subsystem._tag !== "Some" || subsystem.value !== "stax.nav") return;
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

## Observe a specific Readable

`Readable.debug(id)` wraps any Readable-producing Effect so its initial value and every subsequent change are logged under `stax.readable`. Useful when you have a running app and just want to answer "what value does this Signal hold right now, and when does it change?"

```typescript
import { Signal, Readable } from "@stax-ui/core";

const cart = yield* Signal.make({ items: 0, total: 0 }).pipe(
  Readable.debug("cart"),
);
```

Pass-through — the returned Readable is unchanged, so debug can be added and removed without any code refactoring. The internal subscription is forked into the enclosing scope and cleaned up automatically.

## Adding your own debug logs

`logDebug` and `logError` are exported from `@stax-ui/core` for your own instrumentation. The `subsystem` argument is typed as `` `stax.${string}` `` so custom framework extensions can slot into the same filter mechanism.

```typescript
import { logDebug, logError } from "@stax-ui/core";

yield* logDebug("cache miss", "stax.my-extension", { key });
yield* logError("cache failure", "stax.my-extension", { cause });
```

`logDebug` is filtered by the runtime log level (opt-in visibility). `logError` always emits so users see failures without needing to configure anything.

App-level logs don't need the `stax.` prefix — use `Effect.logDebug` / `Effect.logError` and `Effect.annotateLogs` directly with whatever subsystem convention you like.
