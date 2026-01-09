import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Toolbar } from "@effex/primitives";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

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
          class: "flex items-center gap-1 p-2 bg-base-200 rounded-box",
        },
        [
          Toolbar.ToggleGroup(
            {
              type: "multiple",
              "aria-label": "Text formatting",
              class: "join",
            },
            [
              Toolbar.ToggleItem(
                {
                  value: "bold",
                  class: "btn btn-sm join-item data-[state=on]:btn-primary",
                },
                "Bold",
              ),
              Toolbar.ToggleItem(
                {
                  value: "italic",
                  class: "btn btn-sm join-item data-[state=on]:btn-primary",
                },
                "Italic",
              ),
              Toolbar.ToggleItem(
                {
                  value: "underline",
                  class: "btn btn-sm join-item data-[state=on]:btn-primary",
                },
                "Underline",
              ),
            ],
          ),
          Toolbar.Separator({ class: "divider divider-horizontal mx-1" }),
          Toolbar.ToggleGroup(
            {
              type: "single",
              defaultValue: "left",
              "aria-label": "Text alignment",
              class: "join",
            },
            [
              Toolbar.ToggleItem(
                {
                  value: "left",
                  class: "btn btn-sm join-item data-[state=on]:btn-secondary",
                },
                "Left",
              ),
              Toolbar.ToggleItem(
                {
                  value: "center",
                  class: "btn btn-sm join-item data-[state=on]:btn-secondary",
                },
                "Center",
              ),
              Toolbar.ToggleItem(
                {
                  value: "right",
                  class: "btn btn-sm join-item data-[state=on]:btn-secondary",
                },
                "Right",
              ),
            ],
          ),
          Toolbar.Separator({ class: "divider divider-horizontal mx-1" }),
          Toolbar.Link(
            { href: "https://example.com", class: "btn btn-sm btn-ghost" },
            "Link",
          ),
        ],
      );
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
type Story = StoryObj<ToolbarStoryArgs>;

export const Default: Story = {};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root(
        {
          orientation: args.orientation,
          disabled: args.disabled,
          loop: args.loop,
          "aria-label": "Formatting options",
          class:
            "flex flex-col items-start gap-1 p-2 bg-base-200 rounded-box w-fit",
        },
        [
          Toolbar.ToggleGroup(
            {
              type: "multiple",
              "aria-label": "Text formatting",
              class: "join join-vertical",
            },
            [
              Toolbar.ToggleItem(
                {
                  value: "bold",
                  class: "btn btn-sm join-item data-[state=on]:btn-primary",
                },
                "Bold",
              ),
              Toolbar.ToggleItem(
                {
                  value: "italic",
                  class: "btn btn-sm join-item data-[state=on]:btn-primary",
                },
                "Italic",
              ),
              Toolbar.ToggleItem(
                {
                  value: "underline",
                  class: "btn btn-sm join-item data-[state=on]:btn-primary",
                },
                "Underline",
              ),
            ],
          ),
          Toolbar.Separator({ class: "divider my-1 w-full" }),
          Toolbar.ToggleGroup(
            {
              type: "single",
              defaultValue: "left",
              "aria-label": "Text alignment",
              class: "join join-vertical",
            },
            [
              Toolbar.ToggleItem(
                {
                  value: "left",
                  class: "btn btn-sm join-item data-[state=on]:btn-secondary",
                },
                "Left",
              ),
              Toolbar.ToggleItem(
                {
                  value: "center",
                  class: "btn btn-sm join-item data-[state=on]:btn-secondary",
                },
                "Center",
              ),
              Toolbar.ToggleItem(
                {
                  value: "right",
                  class: "btn btn-sm join-item data-[state=on]:btn-secondary",
                },
                "Right",
              ),
            ],
          ),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithButtons: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root(
        {
          "aria-label": "Editor tools",
          class: "flex items-center gap-1 p-2 bg-base-200 rounded-box",
        },
        [
          Toolbar.Button(
            {
              onPress: () => Effect.log("Undo clicked"),
              class: "btn btn-sm btn-ghost",
            },
            "Undo",
          ),
          Toolbar.Button(
            {
              onPress: () => Effect.log("Redo clicked"),
              class: "btn btn-sm btn-ghost",
            },
            "Redo",
          ),
          Toolbar.Separator({ class: "divider divider-horizontal mx-1" }),
          Toolbar.Button(
            {
              onPress: () => Effect.log("Cut clicked"),
              class: "btn btn-sm btn-ghost",
            },
            "Cut",
          ),
          Toolbar.Button(
            {
              onPress: () => Effect.log("Copy clicked"),
              class: "btn btn-sm btn-ghost",
            },
            "Copy",
          ),
          Toolbar.Button(
            {
              onPress: () => Effect.log("Paste clicked"),
              class: "btn btn-sm btn-ghost",
            },
            "Paste",
          ),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const ToggleGroupSingle: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root(
        {
          "aria-label": "View options",
          class: "flex items-center gap-1 p-2 bg-base-200 rounded-box",
        },
        [
          Toolbar.ToggleGroup(
            {
              type: "single",
              defaultValue: "grid",
              "aria-label": "View mode",
              class: "join",
            },
            [
              Toolbar.ToggleItem(
                {
                  value: "list",
                  class: "btn btn-sm join-item data-[state=on]:btn-accent",
                },
                "List",
              ),
              Toolbar.ToggleItem(
                {
                  value: "grid",
                  class: "btn btn-sm join-item data-[state=on]:btn-accent",
                },
                "Grid",
              ),
              Toolbar.ToggleItem(
                {
                  value: "columns",
                  class: "btn btn-sm join-item data-[state=on]:btn-accent",
                },
                "Columns",
              ),
            ],
          ),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const ToggleGroupMultiple: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root(
        {
          "aria-label": "Text formatting",
          class: "flex items-center gap-1 p-2 bg-base-200 rounded-box",
        },
        [
          Toolbar.ToggleGroup(
            {
              type: "multiple",
              defaultValues: ["bold"],
              "aria-label": "Text styles",
              class: "join",
            },
            [
              Toolbar.ToggleItem(
                {
                  value: "bold",
                  class:
                    "btn btn-sm join-item data-[state=on]:btn-info font-bold",
                },
                "B",
              ),
              Toolbar.ToggleItem(
                {
                  value: "italic",
                  class: "btn btn-sm join-item data-[state=on]:btn-info italic",
                },
                "I",
              ),
              Toolbar.ToggleItem(
                {
                  value: "strikethrough",
                  class:
                    "btn btn-sm join-item data-[state=on]:btn-info line-through",
                },
                "S",
              ),
            ],
          ),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const DisabledItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root(
        {
          "aria-label": "Formatting with disabled",
          class: "flex items-center gap-1 p-2 bg-base-200 rounded-box",
        },
        [
          Toolbar.Button({ class: "btn btn-sm btn-ghost" }, "Enabled"),
          Toolbar.Button(
            { disabled: true, class: "btn btn-sm btn-ghost btn-disabled" },
            "Disabled",
          ),
          Toolbar.Separator({ class: "divider divider-horizontal mx-1" }),
          Toolbar.ToggleItem(
            {
              defaultPressed: false,
              class: "btn btn-sm data-[state=on]:btn-primary",
            },
            "Toggle Enabled",
          ),
          Toolbar.ToggleItem(
            { disabled: true, class: "btn btn-sm btn-disabled" },
            "Toggle Disabled",
          ),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

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
          class:
            "flex items-center gap-1 p-2 bg-base-200 rounded-box opacity-50",
        },
        [
          Toolbar.Button({ class: "btn btn-sm btn-ghost" }, "Button 1"),
          Toolbar.Button({ class: "btn btn-sm btn-ghost" }, "Button 2"),
          Toolbar.Separator({ class: "divider divider-horizontal mx-1" }),
          Toolbar.ToggleItem({ class: "btn btn-sm" }, "Toggle"),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithLinks: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Toolbar.Root(
        {
          "aria-label": "Navigation",
          class: "flex items-center gap-1 p-2 bg-base-200 rounded-box",
        },
        [
          Toolbar.Link(
            { href: "#home", class: "btn btn-sm btn-ghost" },
            "Home",
          ),
          Toolbar.Link(
            { href: "#about", class: "btn btn-sm btn-ghost" },
            "About",
          ),
          Toolbar.Link(
            { href: "#contact", class: "btn btn-sm btn-ghost" },
            "Contact",
          ),
          Toolbar.Separator({ class: "divider divider-horizontal mx-1" }),
          Toolbar.Link(
            {
              href: "#help",
              disabled: true,
              class: "btn btn-sm btn-ghost btn-disabled",
            },
            "Help (Disabled)",
          ),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const CompleteExample: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-4" }, [
        $.h3({ class: "text-lg font-semibold" }, "Text Editor Toolbar"),
        Toolbar.Root(
          {
            "aria-label": "Text editor toolbar",
            class:
              "flex items-center flex-wrap gap-1 p-2 bg-base-200 rounded-box",
          },
          [
            // File operations
            Toolbar.Button({ class: "btn btn-sm btn-ghost" }, "New"),
            Toolbar.Button({ class: "btn btn-sm btn-ghost" }, "Open"),
            Toolbar.Button({ class: "btn btn-sm btn-ghost" }, "Save"),
            Toolbar.Separator({ class: "divider divider-horizontal mx-1" }),

            // Edit operations
            Toolbar.Button({ class: "btn btn-sm btn-ghost" }, "Undo"),
            Toolbar.Button({ class: "btn btn-sm btn-ghost" }, "Redo"),
            Toolbar.Separator({ class: "divider divider-horizontal mx-1" }),

            // Text formatting
            Toolbar.ToggleGroup(
              { type: "multiple", "aria-label": "Text style", class: "join" },
              [
                Toolbar.ToggleItem(
                  {
                    value: "bold",
                    class:
                      "btn btn-sm join-item data-[state=on]:btn-primary font-bold",
                  },
                  "B",
                ),
                Toolbar.ToggleItem(
                  {
                    value: "italic",
                    class:
                      "btn btn-sm join-item data-[state=on]:btn-primary italic",
                  },
                  "I",
                ),
                Toolbar.ToggleItem(
                  {
                    value: "underline",
                    class:
                      "btn btn-sm join-item data-[state=on]:btn-primary underline",
                  },
                  "U",
                ),
              ],
            ),
            Toolbar.Separator({ class: "divider divider-horizontal mx-1" }),

            // Alignment
            Toolbar.ToggleGroup(
              {
                type: "single",
                defaultValue: "left",
                "aria-label": "Alignment",
                class: "join",
              },
              [
                Toolbar.ToggleItem(
                  {
                    value: "left",
                    class: "btn btn-sm join-item data-[state=on]:btn-secondary",
                  },
                  "L",
                ),
                Toolbar.ToggleItem(
                  {
                    value: "center",
                    class: "btn btn-sm join-item data-[state=on]:btn-secondary",
                  },
                  "C",
                ),
                Toolbar.ToggleItem(
                  {
                    value: "right",
                    class: "btn btn-sm join-item data-[state=on]:btn-secondary",
                  },
                  "R",
                ),
                Toolbar.ToggleItem(
                  {
                    value: "justify",
                    class: "btn btn-sm join-item data-[state=on]:btn-secondary",
                  },
                  "J",
                ),
              ],
            ),
            Toolbar.Separator({ class: "divider divider-horizontal mx-1" }),

            // Links
            Toolbar.Link(
              { href: "#help", class: "btn btn-sm btn-ghost" },
              "Help",
            ),
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
