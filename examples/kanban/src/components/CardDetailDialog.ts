import { Effect, Schema } from "effect";

import { $, collect, Portal, Readable, redraw, when } from "@effex/dom";
import { Field, Form } from "@effex/form";

import { KanbanService } from "../services/KanbanService.js";
import type { Priority } from "../types.js";

const CardEditForm = Form.make({
  title: Field.make(Schema.String.pipe(Schema.minLength(1)), {
    validateOn: "blur",
  }),
  description: Field.make(Schema.String),
  priority: Field.make(Schema.NullOr(Schema.Literal("low", "medium", "high"))),
});

export const CardDetailDialog = () =>
  Effect.gen(function* () {
    const kanban = yield* KanbanService;
    const isOpen = Readable.map(kanban.selectedCard, (c) => c !== null);

    const handleClose = () => kanban.selectedCard.set(null);

    const handleDelete = () =>
      Effect.gen(function* () {
        const c = yield* kanban.selectedCard.get;
        if (c) {
          const id = yield* c.id.get;
          yield* kanban.deleteCard(id);
        }
        yield* kanban.selectedCard.set(null);
      });

    const handleSubmit = (ctx: {
      decoded: {
        title: string;
        description: string;
        priority: Priority | null;
      };
    }) =>
      Effect.gen(function* () {
        const card = yield* kanban.selectedCard.get;

        if (!card) return;

        yield* card.title.set(ctx.decoded.title);
        yield* card.description.set(ctx.decoded.description);
        yield* card.priority.set(ctx.decoded.priority);
        yield* kanban.selectedCard.set(null);
      });

    return yield* Portal(() =>
      $.div(
        {
          class: [
            "modal",
            Readable.map(isOpen, (open) => (open ? "modal-open" : "")),
          ],
          onClick: (e) => {
            if (e.target === e.currentTarget) return handleClose();
            return Effect.void;
          },
        },
        redraw(kanban.selectedCard, {
          render: (card) =>
            Effect.gen(function* () {
              if (!card) return yield* $.div();

              return yield* CardEditForm.provide(
                {
                  defaults: {
                    title: yield* card.title.get,
                    description: yield* card.description.get,
                    priority: yield* card.priority.get,
                  },
                  onSubmit: handleSubmit,
                },
                $.form(
                  { class: "modal-box" },
                  collect(
                    // Title field
                    Effect.gen(function* () {
                      const titleField = yield* CardEditForm.fields.title;
                      const hasError = Readable.map(
                        titleField.errors,
                        (e) => e.length > 0,
                      );

                      return yield* $.div(
                        { class: "form-control mb-4" },
                        collect(
                          $.label(
                            { class: "label" },
                            $.span({ class: "label-text" }, $.of("Title")),
                          ),
                          $.input({
                            class: Readable.map(hasError, (err) =>
                              err
                                ? "input input-bordered input-error w-full"
                                : "input input-bordered w-full",
                            ),
                            value: titleField.value,
                            onInput: (e) =>
                              titleField.set(
                                (e.target as HTMLInputElement).value,
                              ),
                            onBlur: () => titleField.blur(),
                          }),
                          when(hasError, {
                            onTrue: () =>
                              $.span(
                                { class: "label-text-alt text-error mt-1" },
                                $.of("Title is required"),
                              ),
                            onFalse: () => $.span({}, $.of("")),
                          }),
                        ),
                      );
                    }),

                    // Description field
                    Effect.gen(function* () {
                      const descField = yield* CardEditForm.fields.description;

                      return yield* $.div(
                        { class: "form-control mb-4" },
                        collect(
                          $.label(
                            { class: "label" },
                            $.span(
                              { class: "label-text" },
                              $.of("Description"),
                            ),
                          ),
                          $.textarea({
                            class: "textarea textarea-bordered w-full h-24",
                            placeholder: "Add a description...",
                            value: descField.value,
                            onInput: (e) =>
                              descField.set(
                                (e.target as HTMLTextAreaElement).value,
                              ),
                          }),
                        ),
                      );
                    }),

                    // Priority field
                    Effect.gen(function* () {
                      const priorityField = yield* CardEditForm.fields.priority;

                      return yield* $.div(
                        { class: "form-control mb-4" },
                        collect(
                          $.label(
                            { class: "label" },
                            $.span({ class: "label-text" }, $.of("Priority")),
                          ),
                          $.select(
                            {
                              class: "select select-bordered w-full",
                              value: Readable.map(
                                priorityField.value,
                                (v) => v ?? "",
                              ),
                              onChange: (e) => {
                                const val = (e.target as HTMLSelectElement)
                                  .value;
                                return priorityField.set(
                                  val === "" ? null : (val as Priority),
                                );
                              },
                            },
                            collect(
                              $.option({ value: "" }, $.of("None")),
                              $.option({ value: "low" }, $.of("Low")),
                              $.option({ value: "medium" }, $.of("Medium")),
                              $.option({ value: "high" }, $.of("High")),
                            ),
                          ),
                        ),
                      );
                    }),

                    // Actions
                    $.div(
                      { class: "modal-action justify-between" },
                      collect(
                        $.button(
                          {
                            type: "button",
                            class: "btn btn-error btn-outline",
                            onClick: () => handleDelete(),
                          },
                          $.of("Delete"),
                        ),
                        $.div(
                          { class: "flex gap-2" },
                          collect(
                            $.button(
                              {
                                type: "button",
                                class: "btn btn-ghost",
                                onClick: () => handleClose(),
                              },
                              $.of("Cancel"),
                            ),
                            $.button(
                              { type: "submit", class: "btn btn-primary" },
                              $.of("Save"),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }),
        }),
      ),
    );
  });
