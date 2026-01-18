---
title: Effects
description: Understanding Effect.ts integration in Effex
order: 2
---

# Effects

Effex is built on [Effect.ts](https://effect.website), a powerful library for building type-safe, composable applications. Understanding Effects is key to mastering Effex.

## What is an Effect?

An Effect represents a computation that:

- May succeed with a value of type `A`
- May fail with an error of type `E`
- May require dependencies of type `R`

```typescript
Effect.Effect<A, E, R>
```

## Creating Effects

### Success and Failure

```typescript
import { Effect } from "effect";

// A successful effect
const success = Effect.succeed(42);

// A failed effect
const failure = Effect.fail(new Error("Something went wrong"));

// From a synchronous computation
const sync = Effect.sync(() => {
  console.log("Hello!");
  return 42;
});
```

### Generators

The most common pattern in Effex is using generators:

```typescript
const program = Effect.gen(function* () {
  const a = yield* Effect.succeed(1);
  const b = yield* Effect.succeed(2);
  return a + b;
});
```

## Components as Effects

Every Effex component is an Effect:

```typescript
import { $, Component } from "@effex/platform";

const MyComponent = Component.gen(function* () {
  // yield* other effects here
  return yield* $.div({}, ["Hello, World!"]);
});
```

This means components can:

- Fail with typed errors
- Require dependencies via Context
- Compose with other Effects

## Error Handling

Effects have built-in error handling:

```typescript
const fetchUser = (id: string) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(`/api/users/${id}`),
      catch: () => new NetworkError(),
    });

    if (!response.ok) {
      return yield* Effect.fail(new UserNotFound(id));
    }

    return yield* Effect.promise(() => response.json());
  });

// Handle errors
const safeUser = fetchUser("123").pipe(
  Effect.catchTag("UserNotFound", () => Effect.succeed(defaultUser))
);
```

## Dependency Injection

Effects can declare dependencies using Context:

```typescript
import { Context, Effect, Layer } from "effect";

// Define a service
class Logger extends Context.Tag("Logger")<
  Logger,
  { log: (msg: string) => Effect.Effect<void> }
>() {}

// Use the service
const program = Effect.gen(function* () {
  const logger = yield* Logger;
  yield* logger.log("Hello!");
});

// Provide the implementation
const loggerLive = Layer.succeed(Logger, {
  log: (msg) => Effect.sync(() => console.log(msg)),
});

// Run with dependencies
Effect.runPromise(program.pipe(Effect.provide(loggerLive)));
```

## Running Effects

In Effex, components are run automatically by the framework. But for standalone effects:

```typescript
// Run and get a Promise
const result = await Effect.runPromise(myEffect);

// Run with error handling
Effect.runPromise(myEffect).catch(console.error);

// Run synchronously (if effect is synchronous)
const result = Effect.runSync(myEffect);
```

## Integration with Signals

Effects and Signals work together seamlessly:

```typescript
const Counter = Component.gen(function* () {
  const count = yield* Signal.make(0);

  const increment = () =>
    Effect.gen(function* () {
      yield* Effect.log("Incrementing...");
      yield* count.update((n) => n + 1);
    });

  return yield* $.button({ onClick: increment }, [count]);
});
```

## Learn More

- [Effect.ts Documentation](https://effect.website)
- [Effect.ts GitHub](https://github.com/Effect-TS/effect)
