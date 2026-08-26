---
title: "Signals & Readables"
description: "The foundation of Stax's reactivity system — mutable Signals and composable Readables."
order: 0
---

# Signals & Readables

Stax's reactivity is built on two primitives: **Signals** (mutable reactive values) and **Readables** (observable values that can be derived, combined, and composed). Every reactive behavior in Stax traces back to these two types.

## Signals

A Signal holds a value that can be read and written. When the value changes, anything observing it updates automatically.

```typescript
import { Effect } from "effect";
import { Signal } from "@stax-ui/dom";

const count = yield* Signal.make(0);

// Read the current value
const current = yield* count.get;

// Set a new value
yield* count.set(5);

// Update based on the current value
yield* count.update((n) => n + 1);
```

Signals are scoped — they're created within an Effect and cleaned up when the scope finalizes. This means no manual teardown or memory leak worries.

### Custom Equality

By default, Signals use strict equality (`===`) to decide if a value has changed. If the new value is the same as the old one, observers aren't notified. You can customize this with `Signal.equals`:

```typescript
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

This is useful when your value contains fields that change frequently but aren't semantically meaningful — like timestamps or metadata.

### From Nullable or Reactive Values

```typescript
// Use an existing signal if provided, or create a new one
const value = yield* Signal.fromNullable(existingSignal, "default");

// Convert any Reactive<T> (static value or Readable) into a Signal
const editable = yield* Signal.fromReactive(props.label, "fallback");
```

## Readables

Readables are the read-only side of reactivity. Every Signal is a Readable, but not every Readable is a Signal. You can derive new Readables from existing ones without creating new mutable state.

### Derived Values

`Readable.map` transforms a Readable's value:

```typescript
import { Readable, Signal } from "@stax-ui/dom";

const firstName = yield* Signal.make("John");
const lastName = yield* Signal.make("Doe");

// Derived from a single source
const upperFirst = Readable.map(firstName, (s) => s.toUpperCase());

// Combine two readables
const fullName = Readable.zipWith(
  firstName,
  lastName,
  (first, last) => `${first} ${last}`,
);

// Combine into a tuple
const both = Readable.zipAll([firstName, lastName]);
// both: Readable<[string, string]>
```

Derived Readables update automatically when their sources change. There's no manual subscription management.

### Destructuring an Object-Shaped Readable

`Readable.valuesAt` takes a `Readable<T>` whose value is an object, plus a list of keys, and returns a record of per-key Readables:

```typescript
const state = yield* Signal.make({ name: "Ada", age: 36, city: "London" });

const { name, age } = Readable.valuesAt(state, ["name", "age"]);
// name: Readable<string>
// age: Readable<number>
```

Each derived Readable emits when its field changes. Handy for passing individual fields into different children as reactive props without exposing the whole object.

Keys are explicit — you decide which fields to expose, and the shape can't drift out of sync if new fields appear on the source object later.

### Constants and Streams

```typescript
// A Readable that never changes
const label = Readable.of("Hello");

// From an initial value and a stream of updates
const time = Readable.fromStream(Date.now(), clockStream);
```

### Normalizing Props

Components often accept props that can be either static values or Readables. The `Reactive<T>` type represents this, and `Readable.normalize` handles both cases:

```typescript
// Reactive<T> means: T | Readable<T>
interface ButtonProps {
  disabled?: Readable.Reactive<boolean>;
  class?: Readable.Reactive<string>;
}

const Button = <E, R>(props: ButtonProps, child: Child<E, R>) => {
  const disabled = Readable.normalize(props.disabled ?? false);
  const className = Readable.normalize(props.class ?? "");

  const ariaDisabled = disabled.pipe(
    Readable.map((d) => (d ? "true" : undefined)),
  );

  return $.button(
    { class: className, disabled, "aria-disabled": ariaDisabled },
    child,
  );
};
```

Whether the caller passes `disabled={true}` or `disabled={someSignal}`, your component handles it the same way.

### Lifting Functions

If you use utility libraries like [class-variance-authority](https://cva.style/docs) or [clsx](https://github.com/lukeed/clsx), `Readable.lift` makes them reactive-aware:

```typescript
import { cva } from "class-variance-authority";
import { Signal, Readable } from "@stax-ui/dom";

const buttonStyles = cva("btn font-medium rounded", {
  variants: {
    variant: { primary: "bg-blue-500", secondary: "bg-gray-200" },
    size: { sm: "px-2 py-1", md: "px-4 py-2", lg: "px-6 py-3" },
  },
});

// Lift it to accept Readables in the options
const reactiveButtonStyles = Readable.lift(buttonStyles);

const variant = yield* Signal.make<"primary" | "secondary">("primary");

// className is Readable<string> — updates when variant changes
const className = reactiveButtonStyles({ variant, size: "md" });
```

### Filtering and Deduplication

```typescript
// Only emit values that pass the predicate
const positiveOnly = Readable.filter(count, (n) => n > 0);

// Skip consecutive duplicates
const deduped = Readable.dedupe(value);

// Dedupe with custom equality
const dedupedById = Readable.dedupeWith(user, (a, b) => a.id === b.id);
```

### Side Effects

`Readable.tap` runs a side effect whenever the value changes, without transforming it:

```typescript
const logged = Readable.tap(count, (n) => console.log("count is now", n));
```

## Ref

For cases where you need a mutable reference that's set later — like a DOM element ref — use `Ref`:

```typescript
import { Ref } from "@stax-ui/dom";

const inputRef = yield* Ref.make<HTMLInputElement>();

// inputRef.current is null until set
// inputRef.value is an Effect that resolves when the ref is populated

// Focus the input (waits until the ref is set)
yield* inputRef.value.pipe(
  Effect.tap((el) => Effect.sync(() => el.focus())),
);
```
