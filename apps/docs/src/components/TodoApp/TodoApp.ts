import { Effect } from "effect";
import { Plus } from "lucide-static";

import {
  $,
  Animation,
  each,
  EventHandler,
  Readable,
  Signal,
  SignalArray,
  when,
} from "@stax-ui/dom";

import { Storage } from "./Storage.js";
import { TodoItem, type Todo } from "./TodoItem.js";

const DEFAULT_TODOS: readonly Todo[] = [
  { id: "1", text: "Read the docs", done: true },
  { id: "2", text: "Build something small", done: false },
  { id: "3", text: "Wire up a real service via Effect Context", done: false },
];

export const TodoApp = () =>
  Effect.gen(function* () {
    const storage = yield* Storage;

    const isLoading = storage.isLoading;
    // reactive collection, persisted to localStorage
    const todos: SignalArray<Todo> = yield* storage.persistArray<Todo>(
      "stax-todos",
      DEFAULT_TODOS,
    );

    const draft = yield* Signal.make("");

    const submit: EventHandler<SubmitEvent> = (e) =>
      Effect.gen(function* () {
        yield* Effect.sync(() => e.preventDefault());
        const text = (yield* draft.get).trim();
        if (!text) return;
        yield* todos.push({
          id: crypto.randomUUID(),
          text,
          done: false,
        });
        yield* draft.set("");
      });

    const toggle = (id: string) =>
      Effect.gen(function* () {
        const list = yield* todos.get;
        const index = list.findIndex((t) => t.id === id);
        if (index === -1) return;

        yield* todos
          .modifyAt(index, (t) => ({ ...t, done: !t.done }))
          .pipe(Effect.orDie);
      });

    const remove = (id: string) =>
      Effect.gen(function* () {
        const list = yield* todos.get;
        const index = list.findIndex((t) => t.id === id);
        if (index === -1) return;
        yield* todos.removeAt(index);
      });

    // Done items sink to the bottom of the visible list.
    const orderedTodos = Readable.map(todos, (list) =>
      [...list].sort((a, b) => Number(a.done) - Number(b.done)),
    );

    // This runs only once on mount. State changes from Readables (SignalArray, Signal)
    // will trigger surgical DOM maniuplations rather than full re-renders.
    return yield* $.div(
      { class: "flex flex-col gap-3 w-full max-w-sm" },
      $.form(
        {
          class: "flex items-center gap-2",
          onSubmit: submit,
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
      when(isLoading, {
        onTrue: () =>
          $.div(
            {
              class: ["flex items-center justify-center py-4"],
            },
            $.div(
              {
                class: [
                  "w-4 h-4 border-2 border-t-transparent border-primary rounded-full",
                  "animate-spin",
                ],
              },
              "",
            ),
          ),
        onFalse: () =>
          each(orderedTodos, {
            key: (t) => t.id,
            container: () => $.ul({ class: "flex flex-col" }),
            render: (item) =>
              TodoItem({
                todo: item,
                onToggle: toggle,
                onRemove: remove,
              }),
            // enter, exit and move animations for the list items
            animate: {
              enterFrom: "!grid-rows-[0fr] !opacity-0",
              enter: "transition-all duration-300 ease-out",
              exit: "transition-all duration-300 ease-out",
              exitTo: "!grid-rows-[0fr] !opacity-0",
              move: {
                transform: Animation.moveTranslate3d,
                transition: "transition-all duration-300 ease-out",
              },
            },
          }),
      }),
    );
  });
