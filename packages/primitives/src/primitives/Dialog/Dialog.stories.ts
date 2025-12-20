import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Dialog } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Dialog.stories.css";

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
        Dialog.Trigger({ class: "dialog-trigger" }, "Open Dialog"),
        Dialog.Portal({}, [
          Dialog.Overlay({}),
          Dialog.Content({}, [
            Dialog.Title({}, args.title!),
            Dialog.Description({}, args.description!),
            $.p("Dialog content goes here."),
            Dialog.Close({ class: "dialog-cancel" }, "Cancel"),
            Dialog.Close({ class: "dialog-save" }, "Save"),
            Dialog.Close({ class: "dialog-close" }, "\u00D7"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "dialog-story-container";

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
      const formGroup1 = yield* $.div({ class: "dialog-form-group" }, [
        $.label({ class: "dialog-label", for: "name" }, "Name"),
        $.input({
          id: "name",
          class: "dialog-input",
          type: "text",
          placeholder: "Enter your name",
        }),
      ]);

      const formGroup2 = yield* $.div({ class: "dialog-form-group" }, [
        $.label({ class: "dialog-label", for: "email" }, "Email"),
        $.input({
          id: "email",
          class: "dialog-input",
          type: "email",
          placeholder: "Enter your email",
        }),
      ]);

      // Create a wrapper for form content that we can insert as raw HTML
      const formContent = document.createElement("div");
      formContent.appendChild(formGroup1);
      formContent.appendChild(formGroup2);

      return yield* Dialog.Root({ defaultOpen: false }, [
        Dialog.Trigger({ class: "dialog-trigger" }, "Edit Profile"),
        Dialog.Portal({}, [
          Dialog.Overlay({}),
          Dialog.Content({}, [
            Dialog.Title({}, "Edit Profile"),
            Dialog.Description(
              {},
              "Make changes to your profile here. Click save when you're done.",
            ),
            Effect.succeed(formContent),
            Dialog.Close({ class: "dialog-cancel" }, "Cancel"),
            Dialog.Close({ class: "dialog-save" }, "Save Changes"),
            Dialog.Close({ class: "dialog-close" }, "\u00D7"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "dialog-story-container";

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
          class: "dialog-trigger",
          onClick: () => isOpen.set(true),
        },
        "Open Externally",
      );

      const statusText = yield* $.p(
        isOpen.map((open) => (open ? "Dialog is open" : "Dialog is closed")),
      );

      const dialog = yield* Dialog.Root(
        {
          open: isOpen,
          onOpenChange: (open) =>
            Effect.log(`Dialog is now ${open ? "open" : "closed"}`),
        },
        [
          Dialog.Trigger({ class: "dialog-trigger" }, "Open Dialog"),
          Dialog.Portal({}, [
            Dialog.Overlay({}),
            Dialog.Content({}, [
              Dialog.Title({}, "Controlled Dialog"),
              Dialog.Description(
                {},
                "This dialog's state is controlled externally via a Signal.",
              ),
              $.p("You can control this dialog from outside using the Signal."),
              Dialog.Close({ class: "dialog-cancel" }, "Close"),
              Dialog.Close({ class: "dialog-close" }, "\u00D7"),
            ]),
          ]),
        ],
      );

      const wrapper = document.createElement("div");
      wrapper.className = "dialog-story-container";

      const controls = document.createElement("div");
      controls.className = "dialog-external-controls";
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

export const LongContent: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const scrollableContent = yield* $.div(
        { style: { maxHeight: "300px", overflowY: "auto" } },
        [
          $.p(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          ),
          $.p(
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
          ),
          $.p(
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
          ),
          $.p(
            "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
          ),
          $.p(
            "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
          ),
        ],
      );

      return yield* Dialog.Root({ defaultOpen: false }, [
        Dialog.Trigger({ class: "dialog-trigger" }, "Open Long Content"),
        Dialog.Portal({}, [
          Dialog.Overlay({}),
          Dialog.Content({}, [
            Dialog.Title({}, "Terms of Service"),
            Dialog.Description(
              {},
              "Please read the following terms carefully.",
            ),
            Effect.succeed(scrollableContent),
            Dialog.Close({ class: "dialog-cancel" }, "Decline"),
            Dialog.Close({ class: "dialog-save" }, "Accept"),
            Dialog.Close({ class: "dialog-close" }, "\u00D7"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "dialog-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const FocusTrapDemo: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const formGroup1 = yield* $.div({ class: "dialog-form-group" }, [
        $.label({ class: "dialog-label", for: "first" }, "First Input"),
        $.input({ id: "first", class: "dialog-input", type: "text" }),
      ]);
      const formGroup2 = yield* $.div({ class: "dialog-form-group" }, [
        $.label({ class: "dialog-label", for: "second" }, "Second Input"),
        $.input({ id: "second", class: "dialog-input", type: "text" }),
      ]);
      const formGroup3 = yield* $.div({ class: "dialog-form-group" }, [
        $.label({ class: "dialog-label", for: "third" }, "Third Input"),
        $.input({ id: "third", class: "dialog-input", type: "text" }),
      ]);

      const formContent = document.createElement("div");
      formContent.appendChild(formGroup1);
      formContent.appendChild(formGroup2);
      formContent.appendChild(formGroup3);

      return yield* Dialog.Root({ defaultOpen: false }, [
        Dialog.Trigger({ class: "dialog-trigger" }, "Open Focus Trap Demo"),
        Dialog.Portal({}, [
          Dialog.Overlay({}),
          Dialog.Content({}, [
            Dialog.Title({}, "Focus Trap Demo"),
            Dialog.Description(
              {},
              "Try pressing Tab - focus stays within the dialog.",
            ),
            Effect.succeed(formContent),
            $.p(
              "Press Tab to cycle through inputs. Press Escape or click Cancel to close.",
            ),
            Dialog.Close({ class: "dialog-cancel" }, "Cancel"),
            Dialog.Close({ class: "dialog-save" }, "Submit"),
            Dialog.Close({ class: "dialog-close" }, "\u00D7"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "dialog-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
