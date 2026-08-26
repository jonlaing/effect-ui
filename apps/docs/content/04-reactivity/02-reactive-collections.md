---
title: "Reactive Collections"
description: "In-place mutable arrays, maps, sets, and structs that automatically trigger reactive updates."
order: 2
---

# Reactive Collections

In React, updating a Map or Set requires cloning the entire collection on every mutation because the framework detects changes by reference. Stax takes a different approach: reactive collections allow in-place mutations that automatically notify observers.

```tsx
// React (clone on every mutation)
setMap(new Map(map).set(key, value));
setSet(new Set(set).add(item));

// Stax (mutate in place, O(1))
yield* users.set(key, value);
yield* tags.add(item);
```

## Signal.Array

A reactive array with familiar mutation methods:

```typescript
const todos = yield* Signal.Array.make<Todo>([]);

// In-place mutations — no cloning
yield* todos.push({ id: 1, text: "Learn Stax", done: false });
yield* todos.unshift(firstItem);
yield* todos.pop();
yield* todos.shift();
yield* todos.splice(1, 2, replacement);
yield* todos.insertAt(0, item);
yield* todos.removeAt(index);
yield* todos.remove(specificItem);  // By reference
yield* todos.clear();

// Positional updates — fail with `OutOfBoundsError` if the index
// is outside `[0, length)`. Use `modifyAt` when the new value
// depends on the old one; `replaceAt` when you already have it.
yield* todos.replaceAt(index, newTodo);
yield* todos.modifyAt(index, (t) => ({ ...t, done: !t.done }));

// Reordering
yield* todos.move(fromIndex, toIndex);  // Great for drag-and-drop
yield* todos.swap(indexA, indexB);
yield* todos.sort((a, b) => a.id - b.id);
yield* todos.reverse();

// Bulk operations
yield* todos.update((arr) => arr.filter((t) => !t.done));
yield* todos.set(newTodos);

// Reactive length
todos.length;  // Readable<number>
```

### Rendering Lists

Signal.Array works directly with `each` for keyed list rendering:

```typescript
each(todos, {
  key: (todo) => todo.id,
  render: (todo) => TodoItem(todo),
});
```

When you `push`, `removeAt`, or `move` items, only the affected DOM nodes are created, removed, or repositioned. The rest of the list is untouched.

## Signal.Map

A reactive key-value store:

```typescript
const users = yield* Signal.Map.make<string, User>();

// Mutations
yield* users.set("u1", { name: "Alice", role: "admin" });
yield* users.delete("u1");
yield* users.clear();
yield* users.replace(newMap);
yield* users.update((m) => new Map([...m, ["u2", bob]]));

// Keyed update — fails with `KeyNotFoundError` if the key isn't
// in the map. Prefer over `set` when the new value depends on
// the old one.
yield* users.modifyAt("u1", (u) => ({ ...u, role: "moderator" }));
```

### Reading Values

Signal.Map provides two kinds of reads: **reactive** (for binding to UI) and **one-time** (for imperative code).

```typescript
// Reactive reads — update the UI when the value changes
users.at("u1");              // Readable<Option<User>>
users.atOrElse("u1", guest); // Readable<User>
users.has("u1");             // Readable<boolean>

// One-time reads — for use in Effects
const user = yield* users.atEffect("u1");   // Effect<Option<User>>
const exists = yield* users.hasEffect("u1"); // Effect<boolean>

// Reactive derived values
users.size;         // Readable<number>
users.entries;      // Readable<readonly [string, User][]>
users.keys;         // Readable<readonly string[]>
users.valuesArray;  // Readable<readonly User[]>
```

## Signal.Set

A reactive collection of unique values:

```typescript
const tags = yield* Signal.Set.make<string>(["draft"]);

// Mutations
yield* tags.add("important");
yield* tags.delete("draft");
yield* tags.toggle("featured");  // Add if missing, remove if present
yield* tags.clear();
yield* tags.replace(newSet);
yield* tags.update((s) => new Set([...s, "extra"]));

// Reactive reads
tags.has("important");  // Readable<boolean>

// One-time read
const exists = yield* tags.hasEffect("important");  // Effect<boolean>

// Reactive derived values
tags.size;         // Readable<number>
tags.valuesArray;  // Readable<readonly string[]>
```

The `toggle` method is particularly useful for UI state like selected items, active filters, or feature flags.

## Signal.Struct

A reactive object where each field is its own Signal. This gives you granular reactivity — updating one field doesn't notify observers of other fields.

```typescript
const address = yield* Signal.Struct.make({
  street: "123 Main St",
  city: "Austin",
  zip: "78701",
});

// Each field is a Signal — granular reads and writes
yield* address.street.set("456 Oak Ave");
yield* address.city.update((c) => c.toUpperCase());

// Read the whole struct as a single Readable
const value = yield* address.get;
// { street: "456 Oak Ave", city: "AUSTIN", zip: "78701" }

// Batch update multiple fields
yield* address.update({ street: "789 Pine Rd", city: "Houston" });

// Replace the entire struct
yield* address.replace({
  street: "100 New St",
  city: "San Antonio",
  zip: "78201",
});

// List of field keys
address.keys;  // readonly ["street", "city", "zip"]
```

### When to Use Struct vs. Individual Signals

Use `Signal.Struct` when you have a group of related fields that are often read or updated together (like a form). Use individual Signals when the values are independent.

```typescript
// Related fields — use Struct
const formData = yield* Signal.Struct.make({
  name: "",
  email: "",
  role: "user",
});

// Independent values — use individual Signals
const isOpen = yield* Signal.make(false);
const count = yield* Signal.make(0);
```
