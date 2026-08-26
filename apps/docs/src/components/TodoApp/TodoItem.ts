import { Effect } from "effect";
import { Trash2 } from "lucide-static";

import { $, Readable, Signal } from "@stax-ui/dom";

export interface Todo {
  readonly id: string;
  readonly text: string;
  readonly done: boolean;
}

/**
 * A single row: checkbox, text, delete button. Doesn't own state —
 * receives the parent's `Signal<Todo[]>` and the row's own id, and
 * mutates by writing an updated list back.
 */
export const TodoItem = (props: {
  readonly id: string;
  readonly todos: Signal.Signal<readonly Todo[]>;
}) =>
  Effect.gen(function* () {
    const toggle = () =>
      props.todos.update((list) =>
        list.map((t) => (t.id === props.id ? { ...t, done: !t.done } : t)),
      );

    const remove = () =>
      props.todos.update((list) => list.filter((t) => t.id !== props.id));

    // Read the row's current data reactively — the parent's list
    // changes, and this Readable emits the new row.
    const row = props.todos.pipe(
      Readable.map((list) => list.find((t) => t.id === props.id)),
    );

    return yield* $.li(
      {
        class: [
          "flex items-center gap-3 py-2 px-3 rounded-md",
          "hover:bg-base-200/60 transition-colors",
        ],
      },
      $.input({
        type: "checkbox",
        class: "cursor-pointer accent-primary",
        checked: row.pipe(Readable.map((r) => r?.done ?? false)),
        onChange: () => toggle(),
      }),
      $.span(
        {
          class: [
            "flex-1 text-paragraph",
            "data-[done=true]:line-through data-[done=true]:opacity-50",
            "transition-opacity",
          ],
          "data-done": row.pipe(
            Readable.map((r) => (r?.done ? "true" : "false")),
          ),
        },
        row.pipe(Readable.map((r) => r?.text ?? "")),
      ),
      $.button(
        {
          type: "button",
          class: [
            "flex-shrink-0 p-1 rounded",
            "opacity-40 hover:opacity-100 transition-opacity",
            "cursor-pointer text-error",
          ],
          "aria-label": "Delete todo",
          onClick: () => remove(),
        },
        $.span({
          class: "[&_svg]:w-4 [&_svg]:h-4 block",
          innerHTML: Trash2,
        }),
      ),
    );
  });
