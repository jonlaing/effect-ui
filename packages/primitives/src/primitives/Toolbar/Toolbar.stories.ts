import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Toolbar } from "@effex/primitives";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Toolbar.stories.css";

type ToolbarStoryArgs = {
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  loop?: boolean;
};

const meta: Meta<ToolbarStoryArgs> = {
  title: "Primitives/Toolbar",
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Toolbar orientation",
    },
    disabled: {
      control: "boolean",
      description: "Whether the toolbar is disabled",
    },
    loop: {
      control: "boolean",
      description: "Whether keyboard navigation loops",
    },
  },
  args: {
    orientation: "horizontal",
    disabled: false,
    loop: true,
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root(
        {
          orientation: args.orientation,
          disabled: args.disabled,
          loop: args.loop,
          "aria-label": "Formatting options",
        },
        [
          Toolbar.ToggleGroup(
            { type: "multiple", "aria-label": "Text formatting" },
            [
              Toolbar.ToggleItem({ value: "bold" }, "Bold"),
              Toolbar.ToggleItem({ value: "italic" }, "Italic"),
              Toolbar.ToggleItem({ value: "underline" }, "Underline"),
            ],
          ),
          Toolbar.Separator({}),
          Toolbar.ToggleGroup(
            {
              type: "single",
              defaultValue: "left",
              "aria-label": "Text alignment",
            },
            [
              Toolbar.ToggleItem({ value: "left" }, "Left"),
              Toolbar.ToggleItem({ value: "center" }, "Center"),
              Toolbar.ToggleItem({ value: "right" }, "Right"),
            ],
          ),
          Toolbar.Separator({}),
          Toolbar.Link({ href: "https://example.com" }, "Link"),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "toolbar-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export default meta;
type Story = StoryObj<ToolbarStoryArgs>;

export const Default: Story = {};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
};

export const WithButtons: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root({ "aria-label": "Editor tools" }, [
        Toolbar.Button(
          {
            onPress: () => Effect.log("Undo clicked"),
          },
          "Undo",
        ),
        Toolbar.Button(
          {
            onPress: () => Effect.log("Redo clicked"),
          },
          "Redo",
        ),
        Toolbar.Separator({}),
        Toolbar.Button(
          {
            onPress: () => Effect.log("Cut clicked"),
          },
          "Cut",
        ),
        Toolbar.Button(
          {
            onPress: () => Effect.log("Copy clicked"),
          },
          "Copy",
        ),
        Toolbar.Button(
          {
            onPress: () => Effect.log("Paste clicked"),
          },
          "Paste",
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "toolbar-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const ToggleGroupSingle: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root({ "aria-label": "View options" }, [
        Toolbar.ToggleGroup(
          { type: "single", defaultValue: "grid", "aria-label": "View mode" },
          [
            Toolbar.ToggleItem({ value: "list" }, "List"),
            Toolbar.ToggleItem({ value: "grid" }, "Grid"),
            Toolbar.ToggleItem({ value: "columns" }, "Columns"),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "toolbar-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const ToggleGroupMultiple: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root({ "aria-label": "Text formatting" }, [
        Toolbar.ToggleGroup(
          {
            type: "multiple",
            defaultValues: ["bold"],
            "aria-label": "Text styles",
          },
          [
            Toolbar.ToggleItem({ value: "bold" }, "Bold"),
            Toolbar.ToggleItem({ value: "italic" }, "Italic"),
            Toolbar.ToggleItem({ value: "strikethrough" }, "Strikethrough"),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "toolbar-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const DisabledItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root({ "aria-label": "Formatting with disabled" }, [
        Toolbar.Button({}, "Enabled"),
        Toolbar.Button({ disabled: true }, "Disabled"),
        Toolbar.Separator({}),
        Toolbar.ToggleItem({ defaultPressed: false }, "Toggle Enabled"),
        Toolbar.ToggleItem({ disabled: true }, "Toggle Disabled"),
      ]);
    });

    const container = document.createElement("div");
    container.className = "toolbar-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const DisabledToolbar: Story = {
  args: {
    disabled: true,
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root(
        {
          disabled: args.disabled,
          "aria-label": "Disabled toolbar",
        },
        [
          Toolbar.Button({}, "Button 1"),
          Toolbar.Button({}, "Button 2"),
          Toolbar.Separator({}),
          Toolbar.ToggleItem({}, "Toggle"),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "toolbar-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithLinks: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root({ "aria-label": "Navigation" }, [
        Toolbar.Link({ href: "#home" }, "Home"),
        Toolbar.Link({ href: "#about" }, "About"),
        Toolbar.Link({ href: "#contact" }, "Contact"),
        Toolbar.Separator({}),
        Toolbar.Link({ href: "#help", disabled: true }, "Help (Disabled)"),
      ]);
    });

    const container = document.createElement("div");
    container.className = "toolbar-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const CompleteExample: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "complete-example" }, [
        $.h3("Text Editor Toolbar"),
        Toolbar.Root({ "aria-label": "Text editor toolbar" }, [
          // File operations
          Toolbar.Button({}, "New"),
          Toolbar.Button({}, "Open"),
          Toolbar.Button({}, "Save"),
          Toolbar.Separator({}),

          // Edit operations
          Toolbar.Button({}, "Undo"),
          Toolbar.Button({}, "Redo"),
          Toolbar.Separator({}),

          // Text formatting
          Toolbar.ToggleGroup(
            { type: "multiple", "aria-label": "Text style" },
            [
              Toolbar.ToggleItem({ value: "bold" }, "B"),
              Toolbar.ToggleItem({ value: "italic" }, "I"),
              Toolbar.ToggleItem({ value: "underline" }, "U"),
            ],
          ),
          Toolbar.Separator({}),

          // Alignment
          Toolbar.ToggleGroup(
            { type: "single", defaultValue: "left", "aria-label": "Alignment" },
            [
              Toolbar.ToggleItem({ value: "left" }, "L"),
              Toolbar.ToggleItem({ value: "center" }, "C"),
              Toolbar.ToggleItem({ value: "right" }, "R"),
              Toolbar.ToggleItem({ value: "justify" }, "J"),
            ],
          ),
          Toolbar.Separator({}),

          // Links
          Toolbar.Link({ href: "#help" }, "Help"),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "toolbar-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
