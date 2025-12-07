**effect-ui**

***

# Effect UI

A reactive UI framework built on [Effect](https://effect.website/). Effect UI provides a declarative way to build web interfaces with fine-grained reactivity, automatic cleanup, and full type safety.

## Installation

```bash
pnpm add effect-ui effect
```

## Basic Usage

```ts
import { Effect } from "effect"
import { Signal, div, button, mount } from "effect-ui"

const Counter = Effect.gen(function* () {
  const count = yield* Signal.make(0)

  return div([
    button({ onClick: () => count.update((n) => n - 1) }, ["-"]),
    count,
    button({ onClick: () => count.update((n) => n + 1) }, ["+"]),
  ])
})

Effect.runPromise(
  Effect.scoped(
    Effect.gen(function* () {
      const app = yield* Counter
      yield* mount(app, document.getElementById("root")!)
      yield* Effect.never
    })
  )
)
```

## Core Concepts

### Signals

Signals are reactive values that can be read and updated:

```ts
const count = yield* Signal.make(0)

// Read the current value
const current = yield* count.get

// Update the value
yield* count.set(5)
yield* count.update((n) => n + 1)
```

### Derived Values

Derived values automatically recompute when their dependencies change:

```ts
const firstName = yield* Signal.make("John")
const lastName = yield* Signal.make("Doe")

const fullName = yield* Derived.sync(
  [firstName, lastName],
  ([first, last]) => `${first} ${last}`
)
```

### Elements

Create DOM elements with reactive attributes and children:

```ts
div({ class: "container", style: { color: "red" } }, [
  h1(["Hello, ", name]),
  p([count, " items"]),
])
```

### Control Flow

Conditionally render elements:

```ts
when(
  isLoggedIn,
  () => div(["Welcome back!"]),
  () => div(["Please log in"])
)

each(
  todos,
  (todo) => todo.id,
  (todo) => li([todo.map((t) => t.text)])
)
```

## API Documentation

See the [docs](./docs) folder for full API documentation.

## License

MIT
