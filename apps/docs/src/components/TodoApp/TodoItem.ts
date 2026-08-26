import { Effect } from "effect";
import { Trash2 } from "lucide-static";

import { $, Readable } from "@stax-ui/dom";

export interface Todo {
  readonly id: string;
  readonly text: string;
  readonly done: boolean;
}

export const TodoItem = (props: {
  readonly todo: Readable.Reactive<Todo>;
  readonly onToggle: (id: string) => Effect.Effect<void, never, never>;
  readonly onRemove: (id: string) => Effect.Effect<void, never, never>;
}) =>
  Effect.gen(function* () {
    const { todo, onToggle, onRemove } = props;

    const row = Readable.normalize(todo);
    const id = (yield* row.get).id;

    return yield* $.li(
      {
        class: [
          "flex items-center gap-3 py-2 px-3 rounded-md",
          "hover:bg-base-200/60 transition-all",
        ],
      },
      $.input({
        type: "checkbox",
        class: "cursor-pointer accent-primary",
        checked: Readable.map(row, (r) => r?.done ?? false),
        onChange: () => onToggle(id),
      }),
      $.span(
        {
          class: [
            "flex-1 text-paragraph",
            "data-[done=true]:line-through data-[done=true]:opacity-50",
            "transition-opacity",
          ],
          "data-done": Readable.map(row, (r) => (r?.done ? "true" : "false")),
        },
        Readable.map(row, (r) => r?.text ?? ""),
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
          onClick: () => onRemove(id),
        },
        $.span({
          class: "[&_svg]:w-4 [&_svg]:h-4 block",
          innerHTML: Trash2,
        }),
      ),
    );
  });
