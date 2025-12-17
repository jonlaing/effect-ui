import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { AlertDialog } from "../primitives/AlertDialog";
import { $ } from "@dom/Element/Element";
import { Signal } from "@core/Signal";
import { renderEffectAsync } from "./helpers";

import "./alertdialog.css";

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
        AlertDialog.Trigger({ class: "alertdialog-trigger" }, "Open Alert"),
        AlertDialog.Portal({}, [
          AlertDialog.Overlay({}),
          AlertDialog.Content({}, [
            AlertDialog.Title({}, args.title!),
            AlertDialog.Description({}, args.description!),
            $.div({ class: "alertdialog-buttons" }, [
              AlertDialog.Cancel({ class: "alertdialog-cancel" }, "Cancel"),
              AlertDialog.Action({ class: "alertdialog-action" }, "Continue"),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "alertdialog-story-container";

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
        AlertDialog.Trigger(
          { class: "alertdialog-trigger alertdialog-trigger--danger" },
          "Delete Account",
        ),
        AlertDialog.Portal({}, [
          AlertDialog.Overlay({}),
          AlertDialog.Content({}, [
            AlertDialog.Title({}, "Delete Account"),
            AlertDialog.Description(
              {},
              "Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.",
            ),
            $.div({ class: "alertdialog-buttons" }, [
              AlertDialog.Cancel({ class: "alertdialog-cancel" }, "Cancel"),
              AlertDialog.Action(
                {
                  class: "alertdialog-action alertdialog-action--danger",
                  onClick: () =>
                    Effect.sync(() => {
                      console.log("Account deleted!");
                    }),
                },
                "Yes, delete account",
              ),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "alertdialog-story-container";

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
        AlertDialog.Trigger(
          { class: "alertdialog-trigger" },
          "Discard Changes",
        ),
        AlertDialog.Portal({}, [
          AlertDialog.Overlay({}),
          AlertDialog.Content({}, [
            AlertDialog.Title({}, "Unsaved Changes"),
            AlertDialog.Description(
              {},
              "You have unsaved changes. Do you want to save them before leaving?",
            ),
            $.div({ class: "alertdialog-buttons alertdialog-buttons--three" }, [
              AlertDialog.Cancel({ class: "alertdialog-cancel" }, "Cancel"),
              AlertDialog.Action(
                {
                  class: "alertdialog-action alertdialog-action--secondary",
                  onClick: () =>
                    Effect.sync(() => {
                      console.log("Changes discarded");
                    }),
                },
                "Don't Save",
              ),
              AlertDialog.Action(
                {
                  class: "alertdialog-action",
                  onClick: () =>
                    Effect.sync(() => {
                      console.log("Changes saved");
                    }),
                },
                "Save",
              ),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "alertdialog-story-container";

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

      const externalOpenButton = yield* $.button(
        {
          class: "alertdialog-trigger",
          onClick: () => isOpen.set(true),
        },
        "Open Externally",
      );

      const statusText = yield* $.p(
        isOpen.map((open) =>
          open ? "Alert dialog is open" : "Alert dialog is closed",
        ),
      );

      const dialog = yield* AlertDialog.Root(
        {
          open: isOpen,
          onOpenChange: (open) =>
            Effect.log(`Alert dialog is now ${open ? "open" : "closed"}`),
        },
        [
          AlertDialog.Trigger({ class: "alertdialog-trigger" }, "Open Alert"),
          AlertDialog.Portal({}, [
            AlertDialog.Overlay({}),
            AlertDialog.Content({}, [
              AlertDialog.Title({}, "Controlled Alert Dialog"),
              AlertDialog.Description(
                {},
                "This alert dialog's state is controlled externally via a Signal.",
              ),
              $.div({ class: "alertdialog-buttons" }, [
                AlertDialog.Cancel({ class: "alertdialog-cancel" }, "Cancel"),
                AlertDialog.Action({ class: "alertdialog-action" }, "Continue"),
              ]),
            ]),
          ]),
        ],
      );

      const wrapper = document.createElement("div");
      wrapper.className = "alertdialog-story-container";

      const controls = document.createElement("div");
      controls.className = "alertdialog-external-controls";
      controls.appendChild(externalOpenButton);

      wrapper.appendChild(controls);
      wrapper.appendChild(statusText);
      wrapper.appendChild(dialog);

      return wrapper;
    });

    const container = document.createElement("div");

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
        AlertDialog.Trigger(
          { class: "alertdialog-trigger" },
          "Critical Action",
        ),
        AlertDialog.Portal({}, [
          AlertDialog.Overlay({}),
          AlertDialog.Content({ closeOnEscape: false }, [
            AlertDialog.Title({}, "Critical Action Required"),
            AlertDialog.Description(
              {},
              "This dialog cannot be dismissed with Escape. You must explicitly cancel or confirm.",
            ),
            $.div({ class: "alertdialog-buttons" }, [
              AlertDialog.Cancel({ class: "alertdialog-cancel" }, "Cancel"),
              AlertDialog.Action(
                { class: "alertdialog-action" },
                "I Understand",
              ),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "alertdialog-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
