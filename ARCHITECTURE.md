# Effex Architecture

This document describes the internal architecture of Effex, a reactive UI framework built on Effect.ts.

## Overview

Effex is organized into two main modules:

```
packages/
├── core/          # @effex/core - Reactive primitives (framework-agnostic)
│   └── src/
│       ├── Readable   # Base reactive interface
│       ├── Signal     # Read/write reactive state
│       ├── Derived    # Computed values
│       ├── Reaction   # Side effects on value changes
│       └── Ref        # Element references
│
├── dom/           # @effex/dom - DOM rendering
│   └── src/
│       ├── Element    # DOM element creation
│       ├── Control    # Control flow (when, match, each)
│       ├── Component  # Named components
│       ├── Mount      # Mounting to DOM
│       └── Template   # Tagged template literals
│
├── router/        # @effex/router - Routing
├── form/          # @effex/form - Form handling
└── primitives/    # @effex/primitives - Headless UI components
```

## Core Module

### Readable

The foundational reactive interface. All reactive values implement `Readable<A>`:

```ts
interface Readable<A> {
  get: Effect.Effect<A>; // Current value
  changes: Stream.Stream<A>; // Future changes (not including current)
  values: Stream.Stream<A>; // Current + all future values
  map: <B>(f: (a: A) => B) => Readable<B>;
}
```

Key insight: `changes` vs `values` distinction allows subscribers to choose whether they want the current value immediately or just future updates.

### Signal

Extends `Readable` with write capabilities:

```ts
interface Signal<A> extends Readable<A> {
  set: (value: A) => Effect.Effect<void>;
  update: (f: (a: A) => A) => Effect.Effect<void>;
}
```

Implementation uses a `SubscriptionRef` from Effect for thread-safe updates and broadcasting.

**SignalRegistry**: A context service that tracks all signals for debugging/devtools. Components access it via Effect's context system.

### Derived

Computed values that automatically update when dependencies change.

**Derived.sync**: Synchronous computation

- Combines dependency streams using `Stream.zipLatestWith`
- Filters out unchanged values using equality check
- Returns a `Readable<B>`

**Derived.async**: Asynchronous computation with loading/error states

- Returns `AsyncDerived<A, E>` which is `Readable<AsyncState<A, E>>`
- `AsyncState` tracks: `isLoading`, `value: Option<A>`, `error: Option<E>`
- Supports strategies: `"abort"` (cancel previous), `"queue"`, `"debounce"`

### Reaction

Side effects that run when reactive values change:

```ts
Reaction.make([dep1, dep2], ([val1, val2]) =>
  Effect.log(`Values: ${val1}, ${val2}`),
);
```

Uses `Stream.runForEach` internally, forked into the current scope.

## DOM Module

### Element

Elements are defined as:

```ts
type Element<E = never> = Effect.Effect<HTMLElement, E, Scope.Scope>;
```

This means:

- Creating an element is an Effect (can use reactive subscriptions)
- Can fail with error type `E`
- Requires a `Scope` for lifecycle management (cleanup subscriptions)

**Element factories** (`div`, `span`, etc.) support multiple call signatures:

```ts
div(); // Empty
div([children]); // Children only
div({ attrs }); // Attributes only
div({ attrs }, [children]); // Both
div(singleChild); // Single child shorthand
```

**Attribute handling**:

- `className`: Static string or `Readable<string>`
- `style`: Record of static/reactive values
- `on*`: Event handlers that can return `Effect<void>` or `void`
- Other attributes: Static or `Readable`, with boolean special-casing

**Reactive children**: When a `Readable<string | number>` is a child, a text node is created and updated via subscription.

### Control Flow

**when(condition, onTrue, onFalse)**

- Creates a container with `display: contents`
- Subscribes to condition changes
- Swaps child element when condition changes
- Initial render is synchronous, updates are forked

**match(value, cases, fallback?)**

- Pattern matching on reactive values
- Uses `===` for pattern matching (works for primitives and object identity)
- Similar swap mechanism to `when`

**each(items, keyFn, render)**

- Keyed list rendering for efficient updates
- Maintains `Map<key, { element, readable }>` for reconciliation
- When items change:
  1. Remove elements whose keys are gone
  2. Update existing items' internal readable
  3. Reorder DOM if needed
  4. Create new elements for new keys
- Each item gets its own `Readable<A>` that updates in place

### Error Boundaries

**ErrorBoundary(tryRender, catchRender)**

- Wraps render in `Effect.either`
- On `Left`, renders error fallback
- Returns `Element<E2>` (error from catch render)

**Suspense(asyncRender, fallbackRender)**

- Renders fallback immediately
- Forks async render
- Swaps when async completes

**SuspenseWithBoundary** combines both patterns.

### Mount

```ts
mount(element: Element<never>, container: HTMLElement)
```

Key design decision: `Element<never>` means all errors must be handled before mounting. This forces error handling at the application boundary.

Registers a finalizer to remove the element when scope closes.

### Component

Simple named wrapper for render functions:

```ts
interface Component<Name, Props, E> {
  _tag: Name;
  (props: Props): Element<E>;
}
```

The `_tag` enables debugging and potential future devtools integration.

## Scope and Lifecycle

Effex relies heavily on Effect's `Scope` for lifecycle management:

1. **Element creation** runs in a scope
2. **Reactive subscriptions** are forked into that scope
3. **When scope closes**, all subscriptions are interrupted
4. **Mount** keeps scope alive; unmount closes it

This means cleanup is automatic - no manual `useEffect` cleanup functions.

## Data Flow

```
Signal.set/update
       │
       ▼
SubscriptionRef broadcasts to Stream
       │
       ▼
Derived recomputes (if deps changed)
       │
       ▼
Element subscriptions receive update
       │
       ▼
DOM mutation (sync, in Stream.runForEach)
```

All updates flow through Effect's Stream, which ensures proper ordering and backpressure.

## Path Aliases

Internal imports use path aliases for cleaner code:

- `@effex/core` → `packages/core/src`
- `@effex/dom` → `packages/dom/src`

Configured in `tsconfig.json` and `vitest.config.ts`.

## Design Principles

1. **Effect-first**: Everything is an Effect. Side effects are explicit.
2. **Type-safe errors**: Error channel propagates through Element types.
3. **Automatic cleanup**: Scope-based lifecycle, no manual cleanup.
4. **Synchronous initial render**: First render is sync, updates are streamed.
5. **Minimal API surface**: Small set of primitives that compose well.

## Why No JSX?

We intentionally use function calls (`div()`, `span()`, etc.) instead of JSX syntax. This was evaluated and rejected for several reasons:

1. **Error type erasure**: TypeScript's `JSX.Element` is a single concrete type, not generic. Our `Element<E>` carries error information through the type system. JSX would force us to either:
   - Lose error types (`Element<unknown>`)
   - Use awkward workarounds (function calls for components, JSX only for intrinsics)

2. **Build complexity**: JSX requires configuring a custom jsx-runtime, tsconfig `jsx` and `jsxImportSource` options, and ensuring bundlers handle the transform correctly.

3. **Mixed syntax**: Even with JSX, components that can fail would need to be called as `{Component({})}` to preserve error types, resulting in inconsistent syntax.

4. **Explicit is better**: Elements are Effects that must be yielded. The function call syntax makes this explicit, while JSX would hide the Effect nature of element creation.

The function-based DSL is clean enough for UI work:

```ts
div({ className: "card" }, [
  h1(title),
  p(description),
  Button({ onClick: handleClick }, "Submit"),
]);
```

