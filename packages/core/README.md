# @effex/core

Reactive primitives for Effex applications. This package provides the foundational reactivity system: Signals, Readables, async state management, and reactive collections.

> **Note:** `@effex/dom` re-exports everything from this package. If you're using `@effex/dom` or `@effex/platform`, you don't need to install this separately.

## Installation

```bash
pnpm add @effex/core effect
```

## Signals

Signals are reactive values that can be read and updated:

```ts
import { Effect } from "effect";
import { Signal } from "@effex/core";

const count = yield* Signal.make(0);

// Read the current value
const current = yield* count.get;

// Update the value
yield* count.set(5);
yield* count.update((n) => n + 1);
```

## Readable

Readables are the foundation of Effex's reactivity. They represent values that can be observed for changes. Signals are Readables, but you can also create derived Readables using combinators.

### Derived Values

Use `Readable.map` to create derived values that automatically update:

```ts
import { Readable, Signal } from "@effex/core";

const firstName = yield* Signal.make("John");
const lastName = yield* Signal.make("Doe");

// Simple derivation with map
const upperFirst = Readable.map(firstName, (s) => s.toUpperCase());

// Combine multiple readables
const fullName = Readable.zipWith(
  firstName,
  lastName,
  (first, last) => `${first} ${last}`
);

// Or use zipAll for tuples
const both = Readable.zipAll([firstName, lastName]);
// both: Readable<[string, string]>
```

### Normalizing Props

Many functions accept props that can be either static values or reactive `Readable` values. Use `Readable.normalize()` to handle both cases:

```ts
// Reactive<T> means: T | Readable<T>
interface ButtonProps {
  disabled?: Readable.Reactive<boolean>;
  class?: Readable.Reactive<string>;
}

const Button = (props: ButtonProps, children: ChildEffect) => {
  // Normalize props - works whether they're static or reactive
  const disabled = Readable.normalize(props.disabled ?? false);
  const className = Readable.normalize(props.class ?? "");

  // Use .pipe(Readable.map()) for derived attributes
  const ariaDisabled = disabled.pipe(
    Readable.map((d) => (d ? "true" : undefined))
  );

  return $.button(
    { class: className, disabled, "aria-disabled": ariaDisabled },
    children
  );
};
```

## AsyncReadable

For async operations like data fetching, use `AsyncReadable`. It provides reactive state for loading, value, and error:

```ts
import { AsyncReadable } from "@effex/core";

const userData = yield* AsyncReadable.make(() =>
  Effect.gen(function* () {
    const response = yield* fetchUser(userId);
    return response.data;
  })
);

// Reactive state properties
userData.isLoading;  // Readable<boolean>
userData.value;      // Readable<Option<User>>
userData.error;      // Readable<Option<Error>>

// Manually trigger refetch
yield* userData.refetch();

// Reset to initial state
yield* userData.reset();
```

Use with control flow primitives:

```ts
import { when, matchOption } from "@effex/dom";

// Show loading spinner
when(userData.isLoading, {
  onTrue: () => Spinner(),
  onFalse: () => $.span(),
});

// Handle the value (matchOption unwraps Option for you)
matchOption(userData.value, {
  onSome: (user) => UserCard({ user }),  // user is Readable<User>
  onNone: () => $.span("No data"),
});
```

## Mutation

For explicit async operations (like form submissions, API calls), use `Mutation`. Unlike AsyncReadable, mutations are triggered manually:

```ts
import { Mutation } from "@effex/core";

const createUser = yield* Mutation.make((input: CreateUserInput) =>
  Effect.gen(function* () {
    const response = yield* api.createUser(input);
    return response.user;
  })
);

// Reactive state
createUser.isLoading;  // Readable<boolean>
createUser.data;       // Readable<Option<User>>
createUser.error;      // Readable<Option<Error>>

// Execute the mutation
const user = yield* createUser.run({ name: "Alice", email: "alice@example.com" });

// Reset state
yield* createUser.reset();
```

## Custom Equality

By default, Signal uses strict equality (`===`) to determine if a value has changed. Use `Signal.equals` for custom equality:

```ts
interface User {
  id: number;
  name: string;
  lastSeen: Date;
}

// Only trigger updates when the user ID changes
const currentUser = yield* Signal.make<User>(
  { id: 1, name: "Alice", lastSeen: new Date() }
).pipe(Signal.equals((a, b) => a.id === b.id));
```

This is useful for:
- **Objects with irrelevant fields** (timestamps, metadata)
- **Expensive computations** that shouldn't re-run on semantically equal inputs
- **Normalized data** where you want to compare by ID rather than reference

## Reactive Collections

Effex provides reactive versions of Array, Map, and Set. Unlike in React where you must clone collections on every mutation, these allow in-place mutations that automatically trigger reactive updates.

### Signal.Array

A reactive array with in-place mutation methods:

```ts
const todos = yield* Signal.Array.make<Todo>([]);

// In-place mutations (no cloning needed!)
yield* todos.push({ id: 1, text: "Learn Effex", done: false });
yield* todos.unshift(firstItem);
yield* todos.pop();
yield* todos.shift();
yield* todos.splice(1, 2, replacement);
yield* todos.insertAt(0, item);
yield* todos.removeAt(index);
yield* todos.remove(specificItem);  // By reference
yield* todos.move(fromIndex, toIndex);  // Great for drag-and-drop
yield* todos.sort((a, b) => a.id - b.id);
yield* todos.reverse();
yield* todos.clear();

// Transform entire array
yield* todos.update(arr => arr.filter(t => !t.done));
yield* todos.set(newTodos);

// Reactive length
todos.length;  // Readable<number>

// Use with each
each(todos, {
  key: todo => todo.id,
  render: todo => TodoItem(todo),
});
```

### Signal.Map

A reactive Map for key-value stores:

```ts
const users = yield* Signal.Map.make<string, User>();

// Mutations
yield* users.set("u1", { name: "Alice", role: "admin" });
yield* users.delete("u1");
yield* users.clear();

// Reactive reads (for UI binding)
users.get("u1");              // Readable<Option<User>>
users.getOrElse("u1", guest); // Readable<User>
users.has("u1");              // Readable<boolean>

// One-time reads (for imperative code)
const user = yield* users.getEffect("u1");   // Effect<Option<User>>
const exists = yield* users.hasEffect("u1"); // Effect<boolean>

// Reactive derived values
users.size;     // Readable<number>
users.entries;  // Readable<readonly [string, User][]>
users.keys;     // Readable<readonly string[]>
users.values;   // Readable<readonly User[]>
```

### Signal.Set

A reactive Set for unique collections:

```ts
const tags = yield* Signal.Set.make<string>(["draft"]);

// Mutations
yield* tags.add("important");
yield* tags.delete("draft");
yield* tags.toggle("featured");  // Add if missing, remove if present
yield* tags.clear();

// Reactive reads
tags.has("important");  // Readable<boolean>

// Reactive derived values
tags.size;    // Readable<number>
tags.values;  // Readable<readonly string[]>
```

**Why This Matters**: In React, mutating a Map/Set doesn't trigger re-renders because the reference is unchanged. You're forced to clone on every mutation:

```tsx
// React (painful)
setMap(new Map(map).set(key, value));
setSet(new Set(set).add(item));
```

With Effex's reactive collections, mutations are O(1) and automatically trigger updates.

## Transition (State Machines)

`Transition` provides declarative state machines with type-safe transitions and reactive guards:

```ts
import { Transition } from "@effex/core";

const status = yield* Transition.make(
  {
    idle: ["loading"],
    loading: ["success", "error"],
    success: ["idle"],
    error: ["idle", "loading"],
  },
  "idle"
);

// Current state (read-only Readable)
status.current;  // Readable<"idle" | "loading" | "success" | "error">

// Transition to a new state (fails if not allowed)
yield* status.to("loading");  // Effect<void, InvalidTransition>

// Check current state (reactive)
status.is("idle");  // Readable<boolean>

// Check if transition is allowed (reactive)
status.canTransitionTo("success");  // Readable<boolean>
```

### Guarded Transitions

Add reactive guards to transitions that must be satisfied:

```ts
const isOnline = yield* Signal.make(true);

const status = yield* Transition.make(
  {
    idle: [{ to: "loading", when: isOnline }, "error"],  // guarded + unguarded
    loading: ["success", "error"],
    success: ["idle"],
    error: ["idle"],
  },
  "idle"
);

// canTransitionTo respects guards - updates reactively
status.canTransitionTo("loading");  // true only when isOnline is true

// Transition fails if guard is false
yield* status.to("loading");  // InvalidTransition if offline
```

### Guarded Callbacks

Create callbacks that only run when in specific states:

```ts
const submit = status.guard(
  ["idle"],  // only enabled in these states
  (data: FormData) => Effect.gen(function* () {
    yield* status.to("loading");
    return yield* api.submit(data);
  }),
  { onBlocked: "ignore" }  // or "fail" (default)
);

yield* submit(formData);
```

## Lifting Functions

When using utility libraries like [class-variance-authority (CVA)](https://cva.style/docs) or [clsx](https://github.com/lukeed/clsx), use `Readable.lift` to make them reactive-aware:

```ts
import { cva } from "class-variance-authority";
import { Signal, Readable } from "@effex/core";

const buttonStyles = cva("btn font-medium rounded", {
  variants: {
    variant: { primary: "bg-blue-500", secondary: "bg-gray-200" },
    size: { sm: "px-2 py-1", md: "px-4 py-2", lg: "px-6 py-3" },
  },
});

// Lift it to accept Readables
const reactiveButtonStyles = Readable.lift(buttonStyles);

const variant = yield* Signal.make<"primary" | "secondary">("primary");

// className is Readable<string> - updates when variant changes
const className = reactiveButtonStyles({ variant, size: "md" });
```

## API Reference

### Signal

- `Signal.make<T>(initial)` - Create a signal with initial value
- `Signal.equals(fn)` - Pipeable combinator for custom equality
- `signal.get` - Effect that reads the current value
- `signal.set(value)` - Effect that sets the value
- `signal.update(fn)` - Effect that updates the value with a function

### Readable

- `Readable.of(value)` - Create a constant Readable
- `Readable.normalize(value)` - Normalize a static or reactive value to Readable
- `Readable.map(readable, fn)` - Transform a Readable's value
- `Readable.flatMap(readable, fn)` - Chain Readables
- `Readable.zip(a, b)` - Combine two Readables into a tuple
- `Readable.zipWith(a, b, fn)` - Combine two Readables with a function
- `Readable.zipAll(readables)` - Combine multiple Readables into a tuple
- `Readable.filter(readable, predicate)` - Filter values
- `Readable.dedupe(readable)` - Remove consecutive duplicates
- `Readable.lift(fn)` - Lift a function to accept Readables
- `readable.get` - Effect that reads the current value
- `readable.changes` - Stream of value changes
- `readable.values` - Stream of all values (current + changes)

### AsyncReadable

- `AsyncReadable.make(fn)` - Create an async readable
- `asyncReadable.isLoading` - `Readable<boolean>`
- `asyncReadable.value` - `Readable<Option<A>>`
- `asyncReadable.error` - `Readable<Option<E>>`
- `asyncReadable.refetch()` - Manually trigger refetch
- `asyncReadable.reset()` - Reset to initial state

### Mutation

- `Mutation.make(fn)` - Create a mutation
- `mutation.isLoading` - `Readable<boolean>`
- `mutation.data` - `Readable<Option<O>>`
- `mutation.error` - `Readable<Option<E>>`
- `mutation.run(input)` - Execute the mutation
- `mutation.reset()` - Reset to initial state

### Reactive Collections

- `Signal.Array.make<T>(initial?)` - Create a reactive array
- `Signal.Map.make<K, V>(initial?)` - Create a reactive map
- `Signal.Set.make<T>(initial?)` - Create a reactive set

### Transition

- `Transition.make(config, initial)` - Create a state machine
- `transition.current` - `Readable<S>` - Current state
- `transition.to(state)` - `Effect<void, InvalidTransition>` - Transition
- `transition.is(state)` - `Readable<boolean>` - Check state
- `transition.canTransitionTo(state)` - `Readable<boolean>` - Check if allowed
- `transition.guard(states, callback, options?)` - Create guarded callback
