import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";

import { $, Signal } from "@effex/dom";
import { Dialog } from "@effex/primitives";

import { renderEffectAsync } from "../../storyHelpers";

type DialogStoryArgs = {
  defaultOpen?: boolean;
  title?: string;
  description?: string;
};

const meta: Meta<DialogStoryArgs> = {
  title: "Primitives/Dialog",
  tags: ["autodocs"],
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description: "Whether the dialog starts open",
    },
    title: {
      control: "text",
      description: "Dialog title text",
    },
    description: {
      control: "text",
      description: "Dialog description text",
    },
  },
  args: {
    defaultOpen: false,
    title: "Dialog Title",
    description: "This is the dialog description providing context.",
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* Dialog.Root({ defaultOpen: args.defaultOpen }, [
        Dialog.Trigger({ class: "btn btn-primary" }, "Open Dialog"),
        Dialog.Portal({ class: "modal modal-open" }, [
          Dialog.Overlay({ class: "modal-backdrop bg-black/50" }),
          Dialog.Content({ class: "modal-box" }, [
            Dialog.Title({ class: "font-bold text-lg" }, args.title ?? ""),
            Dialog.Description(
              { class: "py-4 text-base-content/70" },
              args.description ?? "",
            ),
            $.p({ class: "text-sm" }, "Dialog content goes here."),
            $.div({ class: "modal-action" }, [
              Dialog.Close({ class: "btn btn-ghost" }, "Cancel"),
              Dialog.Close({ class: "btn btn-primary" }, "Save"),
            ]),
            Dialog.Close(
              {
                class: "btn btn-sm btn-circle btn-ghost absolute right-2 top-2",
              },
              "\u2715",
            ),
          ]),
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

export default meta;
type Story = StoryObj<DialogStoryArgs>;

export const Default: Story = {};

export const DefaultOpen: Story = {
  args: {
    defaultOpen: true,
  },
};

export const WithForm: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Dialog.Root({ defaultOpen: false }, [
        Dialog.Trigger({ class: "btn btn-secondary" }, "Edit Profile"),
        Dialog.Portal({ class: "modal modal-open" }, [
          Dialog.Overlay({ class: "modal-backdrop bg-black/50" }),
          Dialog.Content({ class: "modal-box" }, [
            Dialog.Title({ class: "font-bold text-lg" }, "Edit Profile"),
            Dialog.Description(
              { class: "text-base-content/70" },
              "Make changes to your profile here. Click save when you're done.",
            ),
            $.div({ class: "form-control w-full mt-4" }, [
              $.label({ class: "label" }, [
                $.span({ class: "label-text" }, "Name"),
              ]),
              $.input({
                type: "text",
                class: "input input-bordered w-full",
                placeholder: "Enter your name",
              }),
            ]),
            $.div({ class: "form-control w-full mt-2" }, [
              $.label({ class: "label" }, [
                $.span({ class: "label-text" }, "Email"),
              ]),
              $.input({
                type: "email",
                class: "input input-bordered w-full",
                placeholder: "Enter your email",
              }),
            ]),
            $.div({ class: "modal-action" }, [
              Dialog.Close({ class: "btn btn-ghost" }, "Cancel"),
              Dialog.Close({ class: "btn btn-primary" }, "Save Changes"),
            ]),
            Dialog.Close(
              {
                class: "btn btn-sm btn-circle btn-ghost absolute right-2 top-2",
              },
              "\u2715",
            ),
          ]),
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

      return yield* $.div({ class: "flex flex-col gap-4" }, [
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
        Dialog.Root(
          {
            open: isOpen,
            onOpenChange: (open) =>
              Effect.log(`Dialog is now ${open ? "open" : "closed"}`),
          },
          [
            Dialog.Trigger({ class: "btn btn-primary" }, "Open Dialog"),
            Dialog.Portal({ class: "modal modal-open" }, [
              Dialog.Overlay({ class: "modal-backdrop bg-black/50" }),
              Dialog.Content({ class: "modal-box" }, [
                Dialog.Title(
                  { class: "font-bold text-lg" },
                  "Controlled Dialog",
                ),
                Dialog.Description(
                  { class: "py-4 text-base-content/70" },
                  "This dialog's state is controlled externally via a Signal.",
                ),
                $.p(
                  { class: "text-sm" },
                  "You can control this dialog from outside using the Signal.",
                ),
                $.div({ class: "modal-action" }, [
                  Dialog.Close({ class: "btn btn-ghost" }, "Close"),
                ]),
                Dialog.Close(
                  {
                    class:
                      "btn btn-sm btn-circle btn-ghost absolute right-2 top-2",
                  },
                  "\u2715",
                ),
              ]),
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

export const LongContent: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Dialog.Root({ defaultOpen: false }, [
        Dialog.Trigger({ class: "btn btn-accent" }, "Open Long Content"),
        Dialog.Portal({ class: "modal modal-open" }, [
          Dialog.Overlay({ class: "modal-backdrop bg-black/50" }),
          Dialog.Content({ class: "modal-box max-h-[80vh]" }, [
            Dialog.Title({ class: "font-bold text-lg" }, "Terms of Service"),
            Dialog.Description(
              { class: "text-base-content/70" },
              "Please read the following terms carefully.",
            ),
            $.div({ class: "max-h-60 overflow-y-auto py-4 text-sm" }, [
              $.p(
                { class: "mb-4" },
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
              ),
              $.p(
                { class: "mb-4" },
                "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
              ),
              $.p(
                { class: "mb-4" },
                "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
              ),
              $.p(
                { class: "mb-4" },
                "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
              ),
              $.p(
                {},
                "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
              ),
            ]),
            $.div({ class: "modal-action" }, [
              Dialog.Close({ class: "btn btn-ghost" }, "Decline"),
              Dialog.Close({ class: "btn btn-primary" }, "Accept"),
            ]),
            Dialog.Close(
              {
                class: "btn btn-sm btn-circle btn-ghost absolute right-2 top-2",
              },
              "\u2715",
            ),
          ]),
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

export const FocusTrapDemo: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Dialog.Root({ defaultOpen: false }, [
        Dialog.Trigger({ class: "btn btn-info" }, "Open Focus Trap Demo"),
        Dialog.Portal({ class: "modal modal-open" }, [
          Dialog.Overlay({ class: "modal-backdrop bg-black/50" }),
          Dialog.Content({ class: "modal-box" }, [
            Dialog.Title({ class: "font-bold text-lg" }, "Focus Trap Demo"),
            Dialog.Description(
              { class: "text-base-content/70" },
              "Try pressing Tab - focus stays within the dialog.",
            ),
            $.div({ class: "form-control w-full mt-4" }, [
              $.label({ class: "label" }, [
                $.span({ class: "label-text" }, "First Input"),
              ]),
              $.input({ type: "text", class: "input input-bordered w-full" }),
            ]),
            $.div({ class: "form-control w-full mt-2" }, [
              $.label({ class: "label" }, [
                $.span({ class: "label-text" }, "Second Input"),
              ]),
              $.input({ type: "text", class: "input input-bordered w-full" }),
            ]),
            $.div({ class: "form-control w-full mt-2" }, [
              $.label({ class: "label" }, [
                $.span({ class: "label-text" }, "Third Input"),
              ]),
              $.input({ type: "text", class: "input input-bordered w-full" }),
            ]),
            $.p(
              { class: "text-sm mt-4 text-base-content/70" },
              "Press Tab to cycle through inputs. Press Escape or click Cancel to close.",
            ),
            $.div({ class: "modal-action" }, [
              Dialog.Close({ class: "btn btn-ghost" }, "Cancel"),
              Dialog.Close({ class: "btn btn-primary" }, "Submit"),
            ]),
            Dialog.Close(
              {
                class: "btn btn-sm btn-circle btn-ghost absolute right-2 top-2",
              },
              "\u2715",
            ),
          ]),
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

export const Sizes: Story = {
  render: () => {
    const element = $.div({ class: "flex gap-2 flex-wrap" }, [
      Effect.gen(function* () {
        return yield* Dialog.Root({}, [
          Dialog.Trigger({ class: "btn btn-sm" }, "Small"),
          Dialog.Portal({ class: "modal modal-open" }, [
            Dialog.Overlay({ class: "modal-backdrop bg-black/50" }),
            Dialog.Content({ class: "modal-box w-80 max-w-sm" }, [
              Dialog.Title({ class: "font-bold text-lg" }, "Small Dialog"),
              $.p({ class: "py-4" }, "This is a smaller dialog."),
              $.div({ class: "modal-action" }, [
                Dialog.Close({ class: "btn btn-sm" }, "Close"),
              ]),
            ]),
          ]),
        ]);
      }),
      Effect.gen(function* () {
        return yield* Dialog.Root({}, [
          Dialog.Trigger({ class: "btn" }, "Medium"),
          Dialog.Portal({ class: "modal modal-open" }, [
            Dialog.Overlay({ class: "modal-backdrop bg-black/50" }),
            Dialog.Content({ class: "modal-box" }, [
              Dialog.Title({ class: "font-bold text-lg" }, "Medium Dialog"),
              $.p({ class: "py-4" }, "This is the default medium size dialog."),
              $.div({ class: "modal-action" }, [
                Dialog.Close({ class: "btn" }, "Close"),
              ]),
            ]),
          ]),
        ]);
      }),
      Effect.gen(function* () {
        return yield* Dialog.Root({}, [
          Dialog.Trigger({ class: "btn btn-lg" }, "Large"),
          Dialog.Portal({ class: "modal modal-open" }, [
            Dialog.Overlay({ class: "modal-backdrop bg-black/50" }),
            Dialog.Content({ class: "modal-box w-11/12 max-w-3xl" }, [
              Dialog.Title({ class: "font-bold text-lg" }, "Large Dialog"),
              $.p(
                { class: "py-4" },
                "This is a larger dialog for more content.",
              ),
              $.div({ class: "modal-action" }, [
                Dialog.Close({ class: "btn btn-lg" }, "Close"),
              ]),
            ]),
          ]),
        ]);
      }),
    ]);

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
      return yield* Dialog.Root({}, [
        Dialog.Trigger({ class: "btn btn-error" }, "Delete Item"),
        Dialog.Portal({ class: "modal modal-open" }, [
          Dialog.Overlay({ class: "modal-backdrop bg-black/50" }),
          Dialog.Content({ class: "modal-box" }, [
            Dialog.Title(
              { class: "font-bold text-lg text-error" },
              "Confirm Deletion",
            ),
            Dialog.Description(
              { class: "py-4" },
              "Are you sure you want to delete this item? This action cannot be undone.",
            ),
            $.div({ class: "modal-action" }, [
              Dialog.Close({ class: "btn btn-ghost" }, "Cancel"),
              Dialog.Close({ class: "btn btn-error" }, "Delete"),
            ]),
          ]),
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
