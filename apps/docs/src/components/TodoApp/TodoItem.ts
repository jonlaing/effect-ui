import { Effect } from "effect";
import { Trash2 } from "lucide-static";

import { $, Readable } from "@stax-ui/dom";

export interface Todo {
  readonly id: string;
  readonly text: string;
  readonly done: boolean;
}

export interface TodoItemProps {
  readonly todo: Readable.Reactive<Todo>;
  readonly onToggle: (id: string) => Effect.Effect<void, never, never>;
  readonly onRemove: (id: string) => Effect.Effect<void, never, never>;
}

export const TodoItem = ({ todo, onToggle, onRemove }: TodoItemProps) =>
  Effect.gen(function* () {
    // `todo` may or may not be a Readable, so we normalize it to be a Readable
    // so we can update the UI accordingly
    const row = Readable.normalize(todo);

    // extract properties from the todo as Readables instead of raw values
    const { text, done } = Readable.valuesAt(row, ["text", "done"]);

    // Id is captured up front — doesn't change over the row's lifetime.
    const id = (yield* row.get).id;

    return yield* $.li(
      { class: "grid grid-rows-[1fr]" },
      $.div(
        { class: "overflow-hidden min-h-0" },
        $.div(
          {
            class: [
              "flex items-center gap-3 py-2 px-3 rounded-md",
              "hover:bg-base-200/60 transition-colors duration-200",
            ],
          },
          $.input({
            type: "checkbox",
            class: "cursor-pointer accent-primary",
            checked: done,
            onChange: () => onToggle(id),
          }),
          $.span(
            {
              class: [
                "flex-1 text-paragraph",
                "data-[done=true]:line-through data-[done=true]:opacity-50",
                "transition-opacity",
              ],
              "data-done": done,
            },
            text,
          ),
          $.button(
            {
              type: "button",
              class: [
                "flex-shrink-0 p-1 rounded",
                "opacity-60 hover:opacity-100 transition-opacity",
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
        ),
      ),
    );
  });
