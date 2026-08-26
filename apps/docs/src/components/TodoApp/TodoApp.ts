import { Effect } from "effect";
import { Plus } from "lucide-static";

import { $, each, Signal } from "@stax-ui/dom";

import { Storage } from "./Storage.js";
import { TodoItem, type Todo } from "./TodoItem.js";

const DEFAULT_TODOS: readonly Todo[] = [
  { id: "1", text: "Read the docs", done: true },
  { id: "2", text: "Build something small", done: false },
  { id: "3", text: "Wire up a real service via Effect Context", done: false },
];

/**
 * Todo list demo — hydrates a `Signal<Todo[]>` from `Storage`, wires
 * an input for adding new items, and renders each row via `TodoItem`.
 *
 * The interesting thing is the first line of the body:
 *
 * ```ts
 * const todos = yield* storage.persist("stax-todos", DEFAULT_TODOS);
 * ```
 *
 * ...and it's the whole reactive persistence story. The component
 * doesn't know whether persistence is real (client) or a no-op
 * (SSG); it just asks for a signal. The `Storage` service is
 * declared as a required dependency in the component's type, so
 * mounting without a Layer wouldn't typecheck.
 */
export const TodoApp = () =>
  Effect.gen(function* () {
    const storage = yield* Storage;
    const todos = yield* storage.persist<readonly Todo[]>(
      "stax-todos",
      DEFAULT_TODOS,
    );

    const draft = yield* Signal.make("");

    const submit = () =>
      Effect.gen(function* () {
        const text = (yield* draft.get).trim();
        if (!text) return;
        yield* todos.update((list) => [
          ...list,
          { id: crypto.randomUUID(), text, done: false },
        ]);
        yield* draft.set("");
      });

    return yield* $.div(
      { class: "flex flex-col gap-3 w-full max-w-sm" },
      $.form(
        {
          class: "flex items-center gap-2",
          onSubmit: (e) =>
            Effect.gen(function* () {
              yield* Effect.sync(() => e.preventDefault());
              yield* submit();
            }),
        },
        $.input({
          type: "text",
          placeholder: "What needs doing?",
          class: [
            "flex-1 px-3 py-2 rounded-md bg-base-200 border",
            "text-paragraph focus:outline-none focus:border-primary",
            "transition-colors",
          ],
          value: draft,
          onInput: (e: InputEvent) =>
            draft.set((e.target as HTMLInputElement).value),
        }),
        $.button(
          {
            type: "submit",
            class: [
              "flex items-center justify-center h-9 w-9 rounded-md",
              "bg-primary text-primary-content cursor-pointer",
              "hover:opacity-90 transition-opacity",
            ],
            "aria-label": "Add todo",
          },
          $.span({
            class: "[&_svg]:w-4 [&_svg]:h-4 block",
            innerHTML: Plus,
          }),
        ),
      ),
      $.ul(
        { class: "flex flex-col" },
        each(todos, {
          key: (t) => t.id,
          render: (item) =>
            Effect.gen(function* () {
              const t = yield* item.get;
              return yield* TodoItem({ id: t.id, todos });
            }),
        }),
      ),
    );
  });
