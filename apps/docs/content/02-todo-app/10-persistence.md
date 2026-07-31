---
title: "Chapter 10: Persistence"
description: "Save todos to localStorage using a proper Effect-based persistence layer"
order: 10
---

# Chapter 10: Persistence

Our todo app works great, but todos disappear on refresh. Let's fix that with a proper persistence layer that follows Effect patterns.

## Defining the Storage Layer

First, let's create a typed storage service. Create `src/services/TodoStorage.ts`:

```typescript
import { Context, Effect } from "effect";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Error types
class StorageReadError {
  readonly _tag = "StorageReadError";
  constructor(readonly cause: unknown) {}
}

class StorageWriteError {
  readonly _tag = "StorageWriteError";
  constructor(readonly cause: unknown) {}
}

type StorageError = StorageReadError | StorageWriteError;

// Define the service interface
class TodoStorage extends Context.Tag("TodoStorage")<
  TodoStorage,
  {
    load: Effect.Effect<Todo[], StorageReadError, never>;
    save: (todos: Todo[]) => Effect.Effect<void, StorageWriteError, never>;
  }
>() {}

export { TodoStorage, StorageReadError, StorageWriteError, type StorageError };
```

Now the implementation using localStorage:

```typescript
// LocalStorage implementation
const STORAGE_KEY = "effex-todos";

const TodoStorageLive = {
  load: Effect.try({
    try: () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    },
    catch: (error) => new StorageReadError(error),
  }),

  save: (todos: Todo[]) =>
    Effect.try({
      try: () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      },
      catch: (error) => new StorageWriteError(error),
    }),
};

export { TodoStorageLive };
```

Notice:
- `load` returns `Effect<Todo[], StorageReadError, never>`
- `save` returns `Effect<void, StorageWriteError, never>`
- Errors are typed and trackable!

## Using the Storage Layer

Now update `src/main.ts` to use our storage service:

```typescript
import "./styles.css";
import { Context, Effect, Layer, Option } from "effect";

import {
  $,
  each,
  matchOption,
  Readable,
  Signal,
  when
} from "@effex/dom";

import { TodoItem } from "./components/TodoItem";
import { TodoStorage, TodoStorageLive } from "./services/TodoStorage";

// ... Todo interface, Filter type ...

const App = () =>
  Effect.gen(function* () {
    // 1. Load saved todos from storage
    const storage = yield* TodoStorage;
    // use Option<string> instead of string | null for better type safety
    const error = yield* Signal.make<Option<string>>(Option.none());

    // Load initial todos with error handling
    // Note: this doesn't need to be in a "hook" because Effect.gen runs once
    const initialTodos = yield* storage.load.pipe(
      // You can handle specific errors by tag
      Effect.catchTag('StorageReadError', (err) =>
        Effect.gen(function* () {
          console.error("Failed to load todos:", err);
          yield* error.set(Option.some("Failed to load todos from storage."));
          return [] as Todo[];
        }),
      ),
      Effect.catchAll((err) =>
        Effect.gen(function* () {
          console.error("Failed to load todos:", err);
          yield* error.set(Option.some("Unexpected error loading todos."));
          return [] as Todo[];
        }),
      ),
    );

    // 2. Create Signal.Array from loaded data
    const todos = yield* Signal.Array.make<Todo>(initialTodos);

    // 3. Set up auto-save reaction
    yield* Readable.tap(todos, (currentTodos) =>
      storage.save(currentTodos).pipe(
        Effect.tap(() => error.set(Option.none())), // Clear previous errors on success
        Effect.catchTag('StorageWriteError', (err) => {
          console.error("Failed to save todos:", err);
          return error.set(Option.some("Failed to save todos to storage."));
        }),
        Effect.catchAll((err) => {
          console.error("Failed to save todos:", err);
          return error.set(Option.some("Unexpected error saving todos."));
        }),
      )
    );

    // Rest of the app stays the same...
    const newTodoText = yield* Signal.make("");
    const filter = yield* Signal.make<Filter>("all");

    return yield* $.div({ class: "todo-app" },
      // ... header, todo list, footer ...

      // Display error messages if any
      matchOption(error, {
        onSome: (err) =>
          $.div({ class: "error-message" }, err),
        onNone: () => $.div()
      }),

      // ... rest of the app (footer, etc.) ...
    );
  });
```

## The Three-Step Pattern

Let's break down what's happening:

### 1. Load from Storage

```typescript
const storage = yield* TodoStorage;
const initialTodos = yield* storage.load.pipe(
  Effect.catchAll(() => Effect.succeed([]))
);
```

We yield the `TodoStorage` service from context, then load todos. If loading fails, we gracefully fall back to an empty array.

### 2. Initialize Signal.Array

```typescript
const todos = yield* Signal.Array.make<Todo>(initialTodos);
```

`Signal.Array` is optimized for array operations—it provides `push`, `remove`, `filter`, and other methods that update the array efficiently.

### 3. React to Changes

```typescript
yield* Readable.tap(todos, (currentTodos) =>
  storage.save(currentTodos).pipe(
    Effect.catchAll((err) => Effect.sync(() => {
      console.error("Failed to save todos:", err);
    }))
  )
);
```

`Readable.tap` runs whenever `todos` changes. We save to storage and handle any errors gracefully—a failed save shouldn't crash the app.

## Providing the Service

Finally, provide the storage implementation when mounting:

```typescript
const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

// Create the storage layer
const StorageLayer = Layer.succeed(TodoStorage, TodoStorageLive);

runApp(
  mount(
    App().pipe(Effect.provide(StorageLayer)),
    container
  );
);
```

## Using Signal.Array Methods

With `Signal.Array`, you can simplify your handlers:

```typescript
// Before (with regular Signal)
const addTodo = () =>
  Effect.gen(function* () {
    const text = yield* newTodoText.get;
    if (text.trim()) {
      yield* todos.update(items => [...items, { id: Date.now(), text: text.trim(), completed: false }]);
      yield* newTodoText.set("");
    }
  });

// After (with Signal.Array)
const addTodo = () =>
  Effect.gen(function* () {
    const text = yield* newTodoText.get;
    if (text.trim()) {
      yield* todos.push({ id: Date.now(), text: text.trim(), completed: false });
      yield* newTodoText.set("");
    }
  });

// Delete becomes simpler too
const deleteTodo = (id: number) =>
  todos.filter(t => t.id !== id);

// Toggle
const toggleTodo = (id: number) =>
  todos.modify(
    t => t.id === id,
    t => ({ ...t, completed: !t.completed })
  );
```

## Why This Approach?

**Type-safe errors**: Storage operations can fail. With Effect, we know exactly how they can fail and handle it explicitly.

**Testable**: Swap `TodoStorageLive` for a mock implementation in tests:

```typescript
const TodoStorageTest = {
  load: Effect.succeed([{ id: 1, text: "Test todo", completed: false }]),
  save: () => Effect.void,
};
```

**Separation of concerns**: The component doesn't know about localStorage—it just uses a `TodoStorage` service. You could swap in IndexedDB, a server API, or anything else.

**Automatic persistence**: `Readable.tap` handles saving automatically. No need to remember to call save after every change.

## Try It Out

1. Add some todos
2. Complete a few
3. Refresh the page
4. Your todos persist!

Check the browser's DevTools → Application → Local Storage to see the saved data.

## Congratulations!

You've built a complete todo application with Effex! You learned:

- **Elements** with the `$` factory
- **Signals** for reactive state
- **Signal.Array** for optimized array operations
- **Components** as plain functions returning Effects
- **each** for rendering lists
- **Derived state** with `Readable.map` and `Readable.zipWith`
- **Conditional rendering** with `when`
- **Event handling** for user interactions
- **`Readable.tap`** for side effects
- **Context** for dependency injection
- **Typed errors** with Effect

## What's Next?

- **[Full-Stack Tutorial](/docs/tutorials/social-app)** - Build a social media site with loaders, actions, and server integration
- **[Concepts](/docs/concepts)** - Deep dive into specific topics
- **[Primitives](/docs/primitives)** - Pre-built accessible UI components
- **[API Reference](/docs/api)** - Complete API documentation

Happy building!
