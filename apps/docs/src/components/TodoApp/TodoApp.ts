import { Effect } from "effect";
import { Plus } from "lucide-static";

import { $, Animation, each, Readable, Signal } from "@stax-ui/dom";

import { Storage } from "./Storage.js";
import { TodoItem, type Todo } from "./TodoItem.js";

const DEFAULT_TODOS: readonly Todo[] = [
  { id: "1", text: "Read the docs", done: true },
  { id: "2", text: "Build something small", done: false },
  { id: "3", text: "Wire up a real service via Effect Context", done: false },
];

/**
 * Todo list demo — hydrates a `Signal.Array<Todo>` from `Storage`,
 * wires an input for adding new items, and renders each row via
 * `TodoItem`.
 *
 * The interesting thing is the first line of the body:
 *
 * ```ts
 * const todos = yield* storage.persistArray("stax-todos", DEFAULT_TODOS);
 * ```
 *
 * ...and it's the whole reactive persistence story. The component
 * doesn't know whether persistence is real (client) or a no-op
 * (SSG); it just asks for a persisted array. The `Storage` service
 * is declared as a required dependency in the component's type, so
 * mounting without a Layer wouldn't typecheck.
 *
 * Todos are stored as a `Signal.Array`, so mutations use the array-
 * specific methods (`push`, `modifyAt`, `removeAt`) rather than
 * full-list `update((list) => list.map(...))` closures.
 */
export const TodoApp = () =>
  Effect.gen(function* () {
    const storage = yield* Storage;
    const todos = yield* storage.persistArray<Todo>(
      "stax-todos",
      DEFAULT_TODOS,
    );

    const draft = yield* Signal.make("");

    const submit = () =>
      Effect.gen(function* () {
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
        // Index was just discovered from the current list, so the
        // OutOfBoundsError branch is unreachable — `orDie` treats it
        // as a defect if the invariant is ever violated.
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
      each(orderedTodos, {
        key: (t) => t.id,
        container: () => $.ul({ class: "flex flex-col" }),
        render: (item) =>
          TodoItem({
            todo: item,
            onToggle: toggle,
            onRemove: remove,
          }),
        // Three animations, one budget:
        //  * enter: collapse `grid-template-rows: 0fr → 1fr` (the row
        //    grows from zero height) alongside `opacity: 0 → 1`.
        //  * exit: mirror image.
        //  * move: FLIP translate3d — when an item toggles done and
        //    the sort moves it to the bottom, existing items slide to
        //    their new positions instead of teleporting.
        //
        // `!` marks the enterFrom / exitTo values as important so they
        // beat the base classes (`grid-rows-[1fr]`) during the
        // transition; the enter/exit classes carry the transition
        // setup, and the base has none for `transform` / `opacity` /
        // `grid-template-rows`, so the FLIP invert frame lands
        // instantly (writing `style.transform` to the base state
        // wouldn't animate) and the release then transitions under
        // the just-added `transition-transform` rule.
        //
        // All three durations match at 300ms — grid-rows + FLIP
        // compose exactly when their timings match; mismatched
        // timings drift out of phase mid-play.
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
    );
  });
