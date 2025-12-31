# @effex/core

Reactive primitives for Effex applications. This package provides the foundational reactivity system: Signals, Derived values, and reactive collections.

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

## Derived Values

Derived values automatically recompute when their dependencies change:

```ts
import { Derived } from "@effex/core";

const firstName = yield* Signal.make("John");
const lastName = yield* Signal.make("Doe");

const fullName = yield* Derived.sync(
  [firstName, lastName],
  ([first, last]) => `${first} ${last}`,
);
```

## Custom Equality

By default, Signal and Derived use strict equality (`===`) to determine if a value has changed. You can provide a custom `equals` function to control when updates propagate:

```ts
interface User {
  id: number;
  name: string;
  lastSeen: Date;
}

// Only trigger updates when the user ID changes, ignoring lastSeen timestamps
const currentUser = yield* Signal.make<User>(
  { id: 1, name: "Alice", lastSeen: new Date() },
  { equals: (a, b) => a.id === b.id },
);

// For derived values too
const userDisplay = yield* Derived.sync(
  [currentUser],
  ([user]) => ({ id: user.id, displayName: user.name.toUpperCase() }),
  { equals: (a, b) => a.id === b.id && a.displayName === b.displayName },
);
```

This is particularly useful for:

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

// Transform entire array (like filter/map)
yield* todos.update(arr => arr.filter(t => !t.done));
yield* todos.set(newTodos);

// Reactive length
todos.length  // Readable<number>

// Use with Control.each
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

// Reads
const user = yield* users.get("u1");
const exists = yield* users.has("u1");

// Replace or transform entire map
yield* users.replace(new Map([["u2", bob]]));
yield* users.update(m => new Map([...m].filter(([_, u]) => u.role === "admin")));

// Reactive derived values
users.size     // Readable<number>
users.entries  // Readable<readonly [string, User][]>
users.keys     // Readable<readonly string[]>
users.values   // Readable<readonly User[]>

// For use with Readable.combine
users.readable // Readable<ReadonlyMap<string, User>>
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

// Reads
const hasTag = yield* tags.has("important");

// Replace or transform
yield* tags.replace(["new", "tags"]);
yield* tags.update(s => new Set([...s].filter(t => t !== "archived")));

// Reactive derived values
tags.size    // Readable<number>
tags.values  // Readable<readonly string[]>

// For use with Readable.combine
tags.readable // Readable<ReadonlySet<string>>
```

**Why This Matters**: In React, mutating a Map/Set doesn't trigger re-renders because the reference is unchanged. You're forced to clone on every mutation:

```tsx
// React (painful)
setMap(new Map(map).set(key, value));
setSet(new Set(set).add(item));
```

With Effex's reactive collections, mutations are O(1) and automatically trigger updates.

## Reactive Props

Many components accept props that can be either static values or reactive `Readable` values. This is expressed using the `Readable.Reactive<T>` type:

```ts
import { Readable } from "@effex/core";

// Reactive<T> means: T | Readable<T>
interface ButtonProps {
  disabled?: Readable.Reactive<boolean>;
  class?: Readable.Reactive<string>;
}
```

When implementing a component with reactive props, use `Readable.of()` to normalize the prop to a `Readable<T>`:

```ts
const Button = component("Button", (props: ButtonProps, children) =>
  Effect.gen(function* () {
    // Normalize props - works whether they're static or reactive
    const disabled = Readable.of(props.disabled ?? false);
    const className = Readable.of(props.class ?? "");

    // Use .map() for derived attributes
    const ariaDisabled = disabled.map((d) => (d ? "true" : undefined));
    const tabIndex = disabled.map((d) => (d ? -1 : 0));

    return yield* $.button(
      {
        class: className,
        disabled: disabled,
        "aria-disabled": ariaDisabled,
        tabIndex: tabIndex,
      },
      children ?? [],
    );
  }),
);
```

This pattern lets consumers pass either static or reactive values:

```ts
// Static value - button is always disabled
Button({ disabled: true }, "Click me");

// Reactive value - button disabled state follows signal
const isLoading = yield* Signal.make(false);
Button({ disabled: isLoading }, "Submit");
```

## Lifting Functions

When using utility libraries like [class-variance-authority (CVA)](https://cva.style/docs) or [clsx](https://github.com/lukeed/clsx), use `Readable.lift` to make them reactive-aware. The lifted function accepts either static values or `Readable` values for any property, and returns a `Readable` that updates when any reactive input changes.

```ts
import { cva } from "class-variance-authority";
import { Signal, Readable } from "@effex/core";

// Define your CVA function as usual
const buttonStyles = cva("btn font-medium rounded", {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-200 text-gray-800",
    },
    size: {
      sm: "px-2 py-1 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

// Lift it to accept Readables
const reactiveButtonStyles = Readable.lift(buttonStyles);

// Now use it with reactive or static values
const variant = yield* Signal.make<"primary" | "secondary">("primary");

// className is Readable<string> - updates when variant changes
const className = reactiveButtonStyles({ variant, size: "md" });
```

This works with any function that takes an object as its argument:

```ts
import { clsx } from "clsx";

const reactiveClsx = Readable.lift(clsx);

// Mix static and reactive values
const isActive = yield* Signal.make(false);
const className = reactiveClsx({ btn: true, "btn-active": isActive });
```

## Template Strings

The `t` tagged template literal creates reactive strings that update when any interpolated Signal changes:

```ts
import { t } from "@effex/core";

const name = yield* Signal.make("World");
const count = yield* Signal.make(0);

// Creates a Readable<string> that updates automatically
const message = t`Hello, ${name}! Count: ${count}`;

// Use directly as element children
yield* $.div(message);
yield* $.p(t`You have ${count} items`);
```

This is cleaner than array concatenation for text with multiple reactive values:

```ts
// With t`` template
$.p(t`${count} items remaining (${completed} done)`);

// vs array concatenation
$.p([count, " items remaining (", completed, " done)"]);
```

## API Reference

### Signal

- `Signal.make<T>(initial, options?)` - Create a signal with initial value
- `signal.get` - Effect that reads the current value
- `signal.set(value)` - Effect that sets the value
- `signal.update(fn)` - Effect that updates the value with a function
- `signal.map(fn)` - Create a derived Readable

### Derived

- `Derived.sync(deps, fn, options?)` - Create a synchronous derived value
- `Derived.async(deps, fn, options?)` - Create an async derived value

### Readable

- `Readable.of(value)` - Normalize a value or Readable to a Readable
- `Readable.lift(fn)` - Lift a function to accept Readables
- `readable.map(fn)` - Transform a Readable
- `readable.get` - Effect that reads the current value

### Reactive Collections

- `Signal.Array.make<T>(initial?)` - Create a reactive array
- `Signal.Map.make<K, V>(initial?)` - Create a reactive map
- `Signal.Set.make<T>(initial?)` - Create a reactive set
