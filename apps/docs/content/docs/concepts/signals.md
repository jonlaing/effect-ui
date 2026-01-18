---
title: Signals
description: Reactive state management with Signals
order: 1
---

# Signals

Signals are the foundation of reactivity in Effex. A Signal is a container for a value that can change over time, and any UI that depends on it will automatically update.

## Creating Signals

Use `Signal.make` to create a new Signal:

```typescript
import { Signal } from "@effex/core";
import { Effect } from "effect";

const program = Effect.gen(function* () {
  const count = yield* Signal.make(0);
  const name = yield* Signal.make("Alice");
  const user = yield* Signal.make({ id: 1, name: "Bob" });
});
```

Signals require a Scope, so they must be created within an Effect context (like `Component.gen`).

## Reading Values

Use `.get` to read the current value:

```typescript
const count = yield* Signal.make(0);
const current = yield* count.get; // 0
```

## Updating Values

Signals provide two ways to update:

```typescript
// Set to a specific value
yield* count.set(5);

// Update based on current value
yield* count.update((n) => n + 1);
```

## Derived Values

Use `.map` to create derived values that automatically update:

```typescript
const count = yield* Signal.make(0);
const doubled = count.map((n) => n * 2);
const isEven = count.map((n) => n % 2 === 0);

// In your template
$.span({}, [doubled]) // Updates when count changes
```

## Custom Equality

By default, Signals use `===` for equality checks. You can provide a custom equality function:

```typescript
const user = yield* Signal.make(
  { id: 1, name: "Alice" },
  { equals: (a, b) => a.id === b.id }
);

// This won't trigger an update because ids are the same
yield* user.set({ id: 1, name: "Alice Updated" });
```

## Reactive Collections

Effex provides specialized Signals for collections with efficient updates:

### Signal.Array

```typescript
const items = yield* Signal.Array.make([1, 2, 3]);

// In-place mutations
yield* items.push(4);
yield* items.pop();
yield* items.splice(1, 1);

// Access current value
const all = yield* items.get; // [1, 3, 4]
```

### Signal.Map

```typescript
const cache = yield* Signal.Map.make<string, User>();

yield* cache.set("user-1", { id: 1, name: "Alice" });
const user = yield* cache.get("user-1");
yield* cache.delete("user-1");
```

### Signal.Set

```typescript
const selected = yield* Signal.Set.make<string>();

yield* selected.add("item-1");
yield* selected.delete("item-1");
const has = yield* selected.has("item-1");
```

## Best Practices

1. **Keep Signals focused** - One Signal per piece of state
2. **Use derived values** - Prefer `.map` over computed Signals
3. **Avoid deep nesting** - Use flat Signal structures when possible
4. **Consider equality** - Use custom equality for objects to prevent unnecessary updates
