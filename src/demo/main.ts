import { Console, Effect } from "effect";
import {
  Signal,
  SignalRegistry,
  Derived,
  component,
  div,
  h1,
  p,
  button,
  span,
  input,
  ul,
  li,
  mount,
  when,
  each,
} from "../index.js";
import "./style.css";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const Counter = component("Counter", () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);
    const doubled = yield* Derived.sync([count], ([n]) => n * 2);

    return yield* div({ class: "card" }, [
      p(count.map((c) => `Count: ${c}`)),
      p(doubled.map((d) => `Doubled: ${d}`)),
      div({ class: "button-group" }, [
        button(
          {
            onClick: () =>
              count
                .update((n) => n - 1)
                .pipe(Effect.tap(() => Console.log("hello"))),
          },
          ["-"],
        ),
        button({ onClick: () => count.update((n) => n + 1) }, ["+"]),
      ]),
    ]);
  }),
);

const TodoApp = component("TodoApp", () =>
  Effect.gen(function* () {
    const todos = yield* Signal.make<Todo[]>([
      { id: 1, text: "Learn Effect.ts", completed: true },
      { id: 2, text: "Build Effect UI", completed: false },
      { id: 3, text: "Write tests", completed: false },
    ]);
    const newTodoText = yield* Signal.make("");
    let nextId = 4;

    const stats = yield* Derived.sync([todos], ([items]) => ({
      total: items.length,
      completed: items.filter((t) => t.completed).length,
      remaining: items.filter((t) => !t.completed).length,
    }));

    const addTodo = () =>
      Effect.gen(function* () {
        const text = yield* newTodoText.get;
        if (text.trim()) {
          yield* todos.update((items) => [
            ...items,
            { id: nextId++, text: text.trim(), completed: false },
          ]);
          yield* newTodoText.set("");
        }
      });

    const toggleTodo = (id: number) =>
      todos.update((items) =>
        items.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );

    const removeTodo = (id: number) =>
      todos.update((items) => items.filter((t) => t.id !== id));

    return yield* div({ class: "todo-app" }, [
      h1("Todo List"),
      div({ class: "todo-input" }, [
        input({
          type: "text",
          placeholder: "What needs to be done?",
          value: newTodoText,
          onInput: (e) => newTodoText.set((e.target as HTMLInputElement).value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              return addTodo();
            }
          },
        }),
        button({ onClick: () => addTodo() }, ["Add"]),
      ]),
      ul({ class: "todo-list" }, [
        each(
          todos,
          (todo) => String(todo.id),
          (todoReadable) =>
            Effect.gen(function* () {
              const todo = yield* todoReadable.get;
              return yield* li(
                {
                  class: todoReadable.map((t) =>
                    t.completed ? "todo-item completed" : "todo-item",
                  ),
                },
                [
                  span(
                    {
                      onClick: () => toggleTodo(todo.id),
                      class: "todo-text",
                    },
                    [todoReadable.map((t) => t.text)],
                  ),
                  button(
                    {
                      onClick: () => removeTodo(todo.id),
                      class: "delete-btn",
                    },
                    ["×"],
                  ),
                ],
              );
            }),
        ),
      ]),
      div({ class: "todo-stats" }, [
        span(stats.map((s) => `Total: ${s.total}`)),
        span(stats.map((s) => ` | Completed: ${s.completed}`)),
        span(stats.map((s) => ` | Remaining: ${s.remaining}`)),
      ]),
      when(
        stats.map((s) => s.remaining === 0 && s.total > 0),
        () => p({ class: "success-message" }, ["All done! 🎉"]),
        () => span(),
      ),
    ]);
  }),
);

const App = component("App", () =>
  Effect.gen(function* () {
    return yield* div({ class: "app" }, [
      h1("Effect UI Demo"),
      p("A reactive UI framework built on Effect.ts primitives."),
      Counter({}),
      TodoApp({}),
    ]);
  }),
);

console.log("[effect-ui] Starting app...");

const appElement = document.getElementById("app");
console.log("[effect-ui] App element:", appElement);

const program = Effect.gen(function* () {
  console.log("[effect-ui] Effect.gen started");

  console.log("[effect-ui] Creating App component...");
  const appEffect = App({});
  console.log("[effect-ui] App component created, mounting...");

  yield* mount(appEffect, appElement!);
  console.log("[effect-ui] Mount complete");

  // Keep the scope alive forever (until page unload)
  yield* Effect.never;
});

console.log("[effect-ui] Running program...");

Effect.scoped(program)
  .pipe(
    Effect.provide(SignalRegistry.Live),
    Effect.tapError((e) =>
      Effect.sync(() => console.error("[effect-ui] Error:", e)),
    ),
    Effect.runPromise,
  )
  .then(
    () => console.log("[effect-ui] Program completed successfully"),
    (err) => console.error("[effect-ui] Program failed:", err),
  );
