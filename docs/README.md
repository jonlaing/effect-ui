**@jonlaing/effect-ui**

***

# Effect UI

A reactive UI framework built on [Effect](https://effect.website/). Effect UI provides a declarative way to build web interfaces with fine-grained reactivity, automatic cleanup, and full type safety.

## Installation

```bash
pnpm add @jonlaing/effect-ui effect
```

## Basic Usage

### Simple Components

For components that just render static or prop-based content, return the element directly:

```ts
import { $, component } from "@jonlaing/effect-ui"

const Greeting = component("Greeting", (props: { name: string }) =>
  $.div({ class: "greeting" }, [
    $.h1(`Hello, ${props.name}!`),
    $.p("Welcome to Effect UI"),
  ])
)
```

### Stateful Components

Use `Effect.gen` when your component needs to create signals, derived values, or access context:

```ts
import { Effect } from "effect"
import { $, Signal, component } from "@jonlaing/effect-ui"

const Counter = component("Counter", () =>
  Effect.gen(function* () {
    // Need Effect.gen to create signals
    const count = yield* Signal.make(0)

    return yield* $.div([
      $.button({ onClick: () => count.update((n) => n - 1) }, "-"),
      $.span(count),
      $.button({ onClick: () => count.update((n) => n + 1) }, "+"),
    ])
  })
)
```

### Mounting

```ts
import { Effect } from "effect"
import { SignalRegistry, mount } from "@jonlaing/effect-ui"

Effect.runPromise(
  Effect.scoped(
    Effect.gen(function* () {
      yield* mount(Counter(), document.getElementById("root")!)
      yield* Effect.never // Keep scope alive
    })
  ).pipe(Effect.provide(SignalRegistry.Live))
)
```

The `$` namespace contains all HTML element factories (`$.div`, `$.span`, `$.button`, etc.). You can also import elements individually if you prefer:

```ts
import { div, span, button } from "@jonlaing/effect-ui"
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

### Custom Equality

By default, Signal and Derived use strict equality (`===`) to determine if a value has changed. You can provide a custom `equals` function to control when updates propagate:

```ts
interface User {
  id: number
  name: string
  lastSeen: Date
}

// Only trigger updates when the user ID changes, ignoring lastSeen timestamps
const currentUser = yield* Signal.make<User>(
  { id: 1, name: "Alice", lastSeen: new Date() },
  { equals: (a, b) => a.id === b.id }
)

// For derived values too
const userDisplay = yield* Derived.sync(
  [currentUser],
  ([user]) => ({ id: user.id, displayName: user.name.toUpperCase() }),
  { equals: (a, b) => a.id === b.id && a.displayName === b.displayName }
)
```

**How this differs from React:**

React's `useMemo` and `useEffect` use a dependency array with shallow comparison, and there's no built-in way to customize equality. You'd need external libraries or manual `useRef` tracking. In Effect UI, equality is a first-class option on every reactive primitive, giving you fine-grained control over when the UI re-renders.

This is particularly useful for:
- **Objects with irrelevant fields** (timestamps, metadata)
- **Expensive computations** that shouldn't re-run on semantically equal inputs
- **Normalized data** where you want to compare by ID rather than reference

### Template Strings

The `t` tagged template literal creates reactive strings that update when any interpolated Signal changes:

```ts
import { t } from "@jonlaing/effect-ui"

const name = yield* Signal.make("World")
const count = yield* Signal.make(0)

// Creates a Readable<string> that updates automatically
const message = t`Hello, ${name}! Count: ${count}`

// Use directly as element children
yield* $.div(message)
yield* $.p(t`You have ${count} items`)
```

This is cleaner than array concatenation for text with multiple reactive values:

```ts
// With t`` template
$.p(t`${count} items remaining (${completed} done)`)

// vs array concatenation
$.p([count, " items remaining (", completed, " done)"])
```

### Elements

Create DOM elements with reactive attributes and children. Elements are Effects that must be yielded:

```ts
yield* $.div({ class: "container", style: { color: "red" } }, [
  $.h1(["Hello, ", name]),
  $.p(t`${count} items`),
])
```

Single children don't need to be wrapped in arrays:

```ts
yield* $.h1("Hello World")
yield* $.button({ onClick: handleClick }, "Click me")
```

### Control Flow

Conditionally render elements:

```ts
when(
  isLoggedIn,
  () => $.div("Welcome back!"),
  () => $.div("Please log in")
)

each(
  todos,
  (todo) => todo.id,
  (todo) => $.li(todo.map((t) => t.text))
)
```

### Router

Effect UI includes a typed router with Effect Schema validation for route params.

```ts
import { Context, Effect, Layer, Schema } from "effect"
import { Route, Router, Link, makeRouterLayer, type RouterInfer } from "@jonlaing/effect-ui"

// Define routes with typed params
const routes = {
  home: Route.make("/"),
  user: Route.make("/users/:id", {
    params: Schema.Struct({ id: Schema.String })
  }),
}

// Infer the router type and create a typed context
type AppRouter = RouterInfer<typeof routes>
class AppRouterContext extends Context.Tag("AppRouterContext")<
  AppRouterContext,
  AppRouter
>() {}

// Components can yield the typed router from context
const App = component("App", () =>
  Effect.gen(function* () {
    const router = yield* AppRouterContext

    // router.currentRoute is typed as "home" | "user" | null
    // router.routes.user.params is typed as Readable<{ id: string } | null>

    return yield* $.div([
      $.nav([
        Link({ href: "/" }, "Home"),
        Link({ href: "/users/123" }, "User 123"),
      ]),
      $.div(router.pathname.map((p) => `Current: ${p}`)),
    ])
  })
)

// Set up and run
const program = Effect.gen(function* () {
  const router = yield* Router.make(routes)

  // Provide both contexts:
  // - RouterContext (for Link components)
  // - AppRouterContext (for typed access in your components)
  const routerLayer = Layer.merge(
    makeRouterLayer(router),
    Layer.succeed(AppRouterContext, router),
  )

  yield* mount(App({}).pipe(Effect.provide(routerLayer)), document.body)
  yield* Effect.never
})
```

The `Link` component uses `RouterContext` internally for navigation. Create your own typed context with `RouterInfer` when you need access to `currentRoute` or typed route params.

## Why No JSX?

Effect UI uses function calls instead of JSX. This is a deliberate design choice:

```ts
// Effect UI
$.div({ class: "container" }, [
  $.h1("Hello"),
  $.p(["Count: ", count]),
  Counter(),  // No props needed
])

// vs JSX
<div class="container">
  <h1>Hello</h1>
  <p>Count: {count}</p>
  <Counter />
</div>
```

**Why we chose this approach:**

1. **Error type preservation**: Elements have type `Element<E>` where `E` is the error channel. JSX would erase this to `JSX.Element`, losing type-safe error propagation through component trees.

2. **No build configuration**: Works out of the box with any TypeScript setup. No jsx runtime, tsconfig tweaks, or bundler plugins needed.

3. **Explicit Effects**: Every element is an Effect that must be yielded. JSX would obscure this, making it unclear what's happening under the hood.

4. **Consistent syntax**: Components and elements use the same call syntax. No mental switching between `<Component />` and `Component()`.

The function-based API is already quite clean for UI structure, and deeply nested markup is often a sign to extract components anyway.

## API Documentation

See the [docs](_media/docs) folder for full API documentation.

## License

MIT
