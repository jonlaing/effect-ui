import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";

import { $, Signal } from "@effex/dom";
import { AlertDialog } from "@effex/primitives";

import { renderEffectAsync } from "../../storyHelpers";

type AlertDialogStoryArgs = {
  defaultOpen?: boolean;
  title?: string;
  description?: string;
};

const meta: Meta<AlertDialogStoryArgs> = {
  title: "Primitives/AlertDialog",
  tags: ["autodocs"],
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description: "Whether the dialog starts open",
    },
    title: {
      control: "text",
      description: "Alert dialog title text",
    },
    description: {
      control: "text",
      description: "Alert dialog description text",
    },
  },
  args: {
    defaultOpen: false,
    title: "Are you sure?",
    description: "This action cannot be undone.",
  },
};

export default meta;
type Story = StoryObj<AlertDialogStoryArgs>;

export const Default: Story = {
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* AlertDialog.Root({ defaultOpen: args.defaultOpen }, [
        AlertDialog.Trigger({ class: "btn btn-primary" }, "Open Alert"),
        AlertDialog.Portal({}, [
          AlertDialog.Overlay({ class: "fixed inset-0 bg-black/50" }),
          AlertDialog.Content(
            {
              class:
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 rounded-box p-6 w-full max-w-md shadow-2xl",
            },
            [
              AlertDialog.Title({ class: "font-bold text-lg" }, args.title!),
              AlertDialog.Description(
                { class: "py-4 text-base-content/70" },
                args.description!,
              ),
              $.div({ class: "flex justify-end gap-2" }, [
                AlertDialog.Cancel({ class: "btn btn-ghost" }, "Cancel"),
                AlertDialog.Action({ class: "btn btn-primary" }, "Continue"),
              ]),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const DestructiveAction: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* AlertDialog.Root({ defaultOpen: false }, [
        AlertDialog.Trigger({ class: "btn btn-error" }, "Delete Account"),
        AlertDialog.Portal({}, [
          AlertDialog.Overlay({ class: "fixed inset-0 bg-black/50" }),
          AlertDialog.Content(
            {
              class:
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 rounded-box p-6 w-full max-w-md shadow-2xl",
            },
            [
              AlertDialog.Title(
                { class: "font-bold text-lg text-error" },
                "Delete Account",
              ),
              AlertDialog.Description(
                { class: "py-4 text-base-content/70" },
                "Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.",
              ),
              $.div({ class: "flex justify-end gap-2" }, [
                AlertDialog.Cancel({ class: "btn btn-ghost" }, "Cancel"),
                AlertDialog.Action(
                  {
                    class: "btn btn-error",
                    onClick: () =>
                      Effect.sync(() => {
                        console.log("Account deleted!");
                      }),
                  },
                  "Yes, delete account",
                ),
              ]),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const SaveChanges: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* AlertDialog.Root({ defaultOpen: false }, [
        AlertDialog.Trigger({ class: "btn btn-warning" }, "Discard Changes"),
        AlertDialog.Portal({}, [
          AlertDialog.Overlay({ class: "fixed inset-0 bg-black/50" }),
          AlertDialog.Content(
            {
              class:
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 rounded-box p-6 w-full max-w-md shadow-2xl",
            },
            [
              AlertDialog.Title(
                { class: "font-bold text-lg" },
                "Unsaved Changes",
              ),
              AlertDialog.Description(
                { class: "py-4 text-base-content/70" },
                "You have unsaved changes. Do you want to save them before leaving?",
              ),
              $.div({ class: "flex justify-end gap-2" }, [
                AlertDialog.Cancel({ class: "btn btn-ghost" }, "Cancel"),
                AlertDialog.Action(
                  {
                    class: "btn btn-outline",
                    onClick: () =>
                      Effect.sync(() => {
                        console.log("Changes discarded");
                      }),
                  },
                  "Don't Save",
                ),
                AlertDialog.Action(
                  {
                    class: "btn btn-primary",
                    onClick: () =>
                      Effect.sync(() => {
                        console.log("Changes saved");
                      }),
                  },
                  "Save",
                ),
              ]),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const isOpen = yield* Signal.make(false);

      return yield* $.div({ class: "flex flex-col gap-4 items-start" }, [
        $.div({ class: "flex gap-2 items-center" }, [
          $.button(
            {
              class: "btn btn-outline btn-sm",
              onClick: () => isOpen.set(true),
            },
            "Open Externally",
          ),
          $.div(
            { class: "badge badge-neutral" },
            isOpen.map((open) =>
              open ? "Dialog is open" : "Dialog is closed",
            ),
          ),
        ]),
        AlertDialog.Root(
          {
            open: isOpen,
            onOpenChange: (open) =>
              Effect.log(`Alert dialog is now ${open ? "open" : "closed"}`),
          },
          [
            AlertDialog.Trigger({ class: "btn btn-primary" }, "Open Alert"),
            AlertDialog.Portal({}, [
              AlertDialog.Overlay({ class: "fixed inset-0 bg-black/50" }),
              AlertDialog.Content(
                {
                  class:
                    "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 rounded-box p-6 w-full max-w-md shadow-2xl",
                },
                [
                  AlertDialog.Title(
                    { class: "font-bold text-lg" },
                    "Controlled Alert Dialog",
                  ),
                  AlertDialog.Description(
                    { class: "py-4 text-base-content/70" },
                    "This alert dialog's state is controlled externally via a Signal.",
                  ),
                  $.div({ class: "flex justify-end gap-2" }, [
                    AlertDialog.Cancel({ class: "btn btn-ghost" }, "Cancel"),
                    AlertDialog.Action(
                      { class: "btn btn-primary" },
                      "Continue",
                    ),
                  ]),
                ],
              ),
            ]),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const NoEscapeClose: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* AlertDialog.Root({ defaultOpen: false }, [
        AlertDialog.Trigger({ class: "btn btn-accent" }, "Critical Action"),
        AlertDialog.Portal({}, [
          AlertDialog.Overlay({ class: "fixed inset-0 bg-black/50" }),
          AlertDialog.Content(
            {
              closeOnEscape: false,
              class:
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 rounded-box p-6 w-full max-w-md shadow-2xl",
            },
            [
              AlertDialog.Title(
                { class: "font-bold text-lg" },
                "Critical Action Required",
              ),
              AlertDialog.Description(
                { class: "py-4 text-base-content/70" },
                "This dialog cannot be dismissed with Escape. You must explicitly cancel or confirm.",
              ),
              $.div({ class: "flex justify-end gap-2" }, [
                AlertDialog.Cancel({ class: "btn btn-ghost" }, "Cancel"),
                AlertDialog.Action(
                  { class: "btn btn-primary" },
                  "I Understand",
                ),
              ]),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Confirmation: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* AlertDialog.Root({}, [
        AlertDialog.Trigger({ class: "btn btn-error" }, "Delete Item"),
        AlertDialog.Portal({}, [
          AlertDialog.Overlay({ class: "fixed inset-0 bg-black/50" }),
          AlertDialog.Content(
            {
              class:
                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 rounded-box p-6 w-full max-w-md shadow-2xl",
            },
            [
              AlertDialog.Title(
                { class: "font-bold text-lg text-error" },
                "Confirm Deletion",
              ),
              AlertDialog.Description(
                { class: "py-4 text-base-content/70" },
                "Are you sure you want to delete this item? This action cannot be undone.",
              ),
              $.div({ class: "flex justify-end gap-2" }, [
                AlertDialog.Cancel({ class: "btn btn-ghost" }, "Cancel"),
                AlertDialog.Action({ class: "btn btn-error" }, "Delete"),
              ]),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
