import { Effect } from "effect";

import {
  $,
  Component,
  each,
  Element,
  mount,
  Reaction,
  Readable,
  runApp,
  Signal,
} from "@effex/dom";
import { Checkbox, Toast, ToastCtx } from "@effex/primitives";

// =============================================================================
// Types
// =============================================================================

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// =============================================================================
// Todo Item Component
// =============================================================================

interface TodoItemProps {
  todo: Readable<Todo>;
  onToggle: (id: string) => Effect.Effect<void>;
  onDelete: (todo: Todo) => Effect.Effect<void>;
}

const TodoItem: Component.Leaf<TodoItemProps> = (props) =>
  Effect.gen(function* () {
    const itemRef = yield* Element.ref<HTMLLIElement>();
    const { todo, onToggle, onDelete } = props;

    const id = todo.map((t) => t.id);
    const text = todo.map((t) => t.text);
    const completed = todo.map((t) => t.completed);

    const textClass = completed.map((c) =>
      c ? "line-through text-base-content/50" : "",
    );

    yield* Reaction.make([itemRef.isConnected], ([isConnected]) =>
      Effect.gen(function* () {
        if (isConnected) {
          return yield* itemRef.pipe(
            Element.getScrollHeight,
            Effect.flatMap((height) =>
              Element.setStyle(itemRef, "max-height", `${height}px`),
            ),
            Effect.ignore,
          );
        }
      }),
    );

    return yield* $.li(
      {
        ref: itemRef,
        class:
          "bg-base-200 rounded-box group hover:bg-base-300 transition-colors duration-300",
      },
      [
        $.label({ class: "flex items-center gap-3 p-3 cursor-pointer" }, [
          // Checkbox
          Checkbox({
            checked: completed,
            onCheckedChange: () => id.get.pipe(Effect.flatMap(onToggle)),
            class: "checkbox checkbox-primary",
          }),

          // Todo text
          $.span({ class: ["flex-1", textClass] }, text),

          // Delete button
          $.button(
            {
              type: "button",
              class:
                "btn btn-ghost btn-sm btn-circle opacity-0 group-hover:opacity-100 transition-opacity",
              onClick: () => todo.get.pipe(Effect.flatMap(onDelete)),
              "aria-label": "Delete todo",
            },
            [
              $.span({ class: "text-error text-lg" }, "\u00D7"), // × symbol
            ],
          ),
        ]),
      ],
    );
  });

// =============================================================================
// Add Todo Form Component
// =============================================================================

interface AddTodoFormProps {
  onAdd: (text: string) => Effect.Effect<void>;
}

const AddTodoForm: Component.Leaf<AddTodoFormProps> = (props) =>
  Effect.gen(function* () {
    const inputValue = yield* Signal.make("");

    const handleSubmit = Effect.gen(function* () {
      const text = yield* inputValue.get;
      const trimmed = text.trim();
      if (trimmed) {
        yield* props.onAdd(trimmed);
        yield* inputValue.set("");
      }
    });

    return yield* $.form(
      {
        class: "flex gap-2",
        onSubmit: (e) =>
          Effect.sync(() => e.preventDefault()).pipe(
            Effect.flatMap(() => handleSubmit),
          ),
      },
      [
        $.input({
          type: "text",
          class: "input input-bordered flex-1",
          placeholder: "What needs to be done?",
          value: inputValue,
          onInput: (e) => inputValue.set((e.target as HTMLInputElement).value),
        }),
        $.button(
          {
            type: "submit",
            class: "btn btn-primary",
          },
          "Add",
        ),
      ],
    );
  });

// =============================================================================
// Stats Component
// =============================================================================

interface StatsProps {
  todos: Readable<readonly Todo[]>;
}

const Stats: Component.Leaf<StatsProps> = (props) =>
  Effect.gen(function* () {
    const total = props.todos.map((t) => t.length);
    const completed = props.todos.map(
      (t) => t.filter((x) => x.completed).length,
    );
    const remaining = Readable.combine([total, completed]).map(
      ([t, c]) => t - c,
    );

    return yield* $.div(
      { class: "stats stats-horizontal bg-base-200 w-full" },
      [
        $.div({ class: "stat" }, [
          $.div({ class: "stat-title" }, "Total"),
          $.div({ class: "stat-value text-primary" }, total.map(String)),
        ]),
        $.div({ class: "stat" }, [
          $.div({ class: "stat-title" }, "Completed"),
          $.div({ class: "stat-value text-success" }, completed.map(String)),
        ]),
        $.div({ class: "stat" }, [
          $.div({ class: "stat-title" }, "Remaining"),
          $.div({ class: "stat-value text-warning" }, remaining.map(String)),
        ]),
      ],
    );
  });

// =============================================================================
// Main App Component
// =============================================================================

const App: Component.Unit<ToastCtx> = () =>
  Effect.gen(function* () {
    const toast = yield* ToastCtx;

    // Initialize with some sample todos
    const todos = yield* Signal.Array.make<Todo>([
      { id: crypto.randomUUID(), text: "Learn Effex", completed: true },
      {
        id: crypto.randomUUID(),
        text: "Build something awesome",
        completed: false,
      },
      { id: crypto.randomUUID(), text: "Share with others", completed: false },
    ]);

    // Handlers
    const addTodo = (text: string) =>
      Effect.gen(function* () {
        yield* todos.push({
          id: crypto.randomUUID(),
          text,
          completed: false,
        });
        yield* toast.add({
          title: "Todo added",
          description: `"${text}" has been added to your list.`,
          type: "success",
          duration: 3000,
        });
      });

    const toggleTodo = (id: string) =>
      Effect.gen(function* () {
        const current = yield* todos.get;
        const todo = current.find((t) => t.id === id);
        if (!todo) return;

        yield* todos.update((arr) =>
          arr.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        );

        if (!todo.completed) {
          yield* toast.add({
            title: "Todo completed",
            description: `"${todo.text}" marked as done.`,
            type: "info",
            duration: 3000,
          });
        }
      });

    const deleteTodo = (todo: Todo) =>
      Effect.gen(function* () {
        yield* todos.remove(todo);
        yield* toast.add({
          title: "Todo deleted",
          description: `"${todo.text}" has been removed.`,
          type: "error",
          duration: 3000,
        });
      });

    const clearCompleted = Effect.gen(function* () {
      const current = yield* todos.get;
      const completedCount = current.filter((t) => t.completed).length;
      yield* todos.update((arr) => arr.filter((t) => !t.completed));
      if (completedCount > 0) {
        yield* toast.add({
          title: "Cleared completed",
          description: `${completedCount} completed todo${completedCount > 1 ? "s" : ""} removed.`,
          type: "default",
          duration: 3000,
        });
      }
    });

    // Render
    return yield* $.div({ class: "min-h-screen bg-base-100 py-8" }, [
      $.div({ class: "container mx-auto max-w-lg px-4" }, [
        // Header
        $.div({ class: "text-center mb-8" }, [
          $.h1({ class: "text-4xl font-bold text-primary mb-2" }, "Todo App"),
          $.p({ class: "text-base-content/70" }, "Built with Effex + DaisyUI"),
        ]),

        // Main card
        $.div({ class: "card bg-base-200 shadow-xl" }, [
          $.div({ class: "card-body gap-6" }, [
            // Add form
            AddTodoForm({ onAdd: addTodo }),

            // Stats
            Stats({ todos }),

            // Todo list with animations
            each(todos, {
              container: () => $.ul({ class: "flex flex-col gap-2" }),
              key: (todo) => todo.id,
              render: (todo) =>
                TodoItem({
                  todo,
                  onToggle: toggleTodo,
                  onDelete: deleteTodo,
                }),
              animate: {
                enter:
                  "animate-in fade-in slide-in-from-top-2 zoom-in-95 animate-uncollapse",
                exit: "animate-out fade-out zoom-out-95",
                exitTo: "animate-collapse",
              },
            }),

            // Clear completed button
            $.div({ class: "flex justify-end" }, [
              $.button(
                {
                  type: "button",
                  class: "btn btn-ghost btn-sm",
                  onClick: () => clearCompleted,
                },
                "Clear completed",
              ),
            ]),
          ]),
        ]),

        // Footer
        $.footer({ class: "text-center mt-8 text-base-content/50 text-sm" }, [
          $.p([
            "Press Enter to add a todo. Hover over items to reveal delete button.",
          ]),
        ]),
      ]),
    ]);
  });

// =============================================================================
// Mount Application
// =============================================================================

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

runApp(
  Effect.gen(function* () {
    yield* mount(
      Toast.Provider({ position: "bottom-right", defaultDuration: 3000 }, [
        App(),
        Toast.Viewport(
          {
            class: "fixed bottom-4 right-4 flex flex-col gap-2 z-50 w-80",
            animate: {
              enter: "animate-in fade-in slide-in-from-right-4",
              exit: "animate-out fade-out slide-out-to-right-4",
            },
          },
          Toast.Root(
            {
              class: [
                "alert shadow-lg flex items-start gap-3 p-4 rounded-lg",
                "data-[type=success]:alert-success",
                "data-[type=error]:alert-error",
                "data-[type=warning]:alert-warning",
                "data-[type=info]:alert-info",
              ],
            },
            [
              $.div({ class: "flex-1" }, [
                Toast.Title({ class: "font-semibold text-sm" }),
                Toast.Description({ class: "text-xs opacity-70" }),
              ]),
              Toast.Close({
                class: "btn btn-ghost btn-xs btn-circle",
              }),
            ],
          ),
        ),
      ]),
      container,
    );
    console.log("Todo app mounted!");
  }),
);
