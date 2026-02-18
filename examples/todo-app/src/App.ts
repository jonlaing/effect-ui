import { Effect } from "effect";

import { $, collect, each, Readable, Signal, when } from "@effex/dom";

import {
  FilterTab,
  Stat,
  TodoItem,
  type Filter,
  type Todo,
} from "./components/index.js";

// -----------------------------------------------------------------------------
// Main App Component
// -----------------------------------------------------------------------------

export const App = () =>
  Effect.gen(function* () {
    // State
    const todos = yield* Signal.Array.make<Todo>([]);
    const inputValue = yield* Signal.make("");
    const filter = yield* Signal.make<Filter>("all");
    let nextId = 1;

    // Derived state
    const filteredTodos = Readable.zipWith(
      todos,
      filter,
      (todoList, currentFilter) => {
        switch (currentFilter) {
          case "active":
            return todoList.filter((t) => !t.completed);
          case "completed":
            return todoList.filter((t) => t.completed);
          default:
            return todoList;
        }
      },
    );

    const totalCount = Readable.map(todos, (t) => t.length);

    const activeCount = Readable.map(
      todos,
      (t) => t.filter((todo) => !todo.completed).length,
    );

    const completedCount = Readable.map(
      todos,
      (t) => t.filter((todo) => todo.completed).length,
    );

    // Actions
    const addTodo = () =>
      Effect.gen(function* () {
        const text = yield* inputValue.get;
        if (text.trim()) {
          yield* todos.push({
            id: nextId++,
            text: text.trim(),
            completed: false,
          });
          yield* inputValue.set("");
        }
      });

    const toggleTodo = (id: number) =>
      todos.update((list) =>
        list.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      );

    const deleteTodo = (id: number) =>
      todos.update((list) => list.filter((todo) => todo.id !== id));

    const clearCompleted = () =>
      todos.update((list) => list.filter((todo) => !todo.completed));

    // UI
    return yield* $.div(
      { class: "container mx-auto max-w-lg p-4" },
      collect(
        // Header
        $.div(
          { class: "text-center mb-8" },
          collect(
            $.h1(
              { class: "text-4xl font-bold text-primary" },
              $.of("Effex Todo"),
            ),
          ),
        ),

        // Card container
        $.div(
          { class: "card bg-base-100 shadow-xl" },
          collect(
            $.div(
              { class: "card-body" },
              collect(
                // Input form
                $.div(
                  { class: "join w-full" },
                  collect(
                    $.input({
                      class: "input input-bordered join-item flex-1",
                      placeholder: "What needs to be done?",
                      value: inputValue,
                      onInput: (e) =>
                        inputValue.set((e.target as HTMLInputElement).value),
                      onKeyDown: (e) => {
                        if (e.key === "Enter") {
                          return addTodo();
                        }
                        return Effect.void;
                      },
                    }),
                    $.button(
                      {
                        class: "btn btn-primary join-item",
                        onClick: addTodo,
                      },
                      $.of("Add"),
                    ),
                  ),
                ),

                // Stats
                $.div(
                  { class: "stats stats-horizontal w-full mt-4 bg-base-200" },
                  collect(
                    Stat({ label: "Total", value: totalCount }),
                    Stat({ label: "Active", value: activeCount }),
                    Stat({ label: "Completed", value: completedCount }),
                  ),
                ),

                // Filter tabs
                $.div(
                  { class: "tabs tabs-boxed justify-center mt-4" },
                  collect(
                    FilterTab({ filter, value: "all", label: "All" }),
                    FilterTab({ filter, value: "active", label: "Active" }),
                    FilterTab({
                      filter,
                      value: "completed",
                      label: "Completed",
                    }),
                  ),
                ),

                // Todo list
                each(filteredTodos, {
                  container: () => $.div({ class: "space-y-2" }),
                  key: (todo) => String(todo.id),
                  render: (todo) =>
                    TodoItem({
                      todo,
                      onToggle: toggleTodo,
                      onDelete: deleteTodo,
                    }),
                  animate: {
                    enterFrom: "todo-item-enter",
                    enter: "todo-item-enter-active",
                    exit: "todo-item-exit",
                    exitTo: "todo-item-exit-active",
                  },
                }),

                when(
                  Readable.map(totalCount, (n) => n === 0),
                  {
                    onTrue: () =>
                      $.div(
                        { class: "text-center text-gray-500" },
                        $.of("No todos yet!"),
                      ),
                    onFalse: () => $.span(),
                  },
                ),

                // Footer
                $.div(
                  {
                    class:
                      "flex justify-between items-center mt-4 text-sm opacity-70",
                  },
                  collect(
                    $.span(
                      {},
                      $.of(
                        Readable.map(
                          activeCount,
                          (n) => `${n} item${n === 1 ? "" : "s"} left`,
                        ),
                      ),
                    ),
                    when(
                      Readable.map(completedCount, (n) => n > 0),
                      {
                        onTrue: () =>
                          $.button(
                            {
                              class: "btn btn-ghost btn-xs",
                              onClick: () => clearCompleted(),
                            },
                            $.of("Clear completed"),
                          ),
                        onFalse: () => $.span(),
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  });
