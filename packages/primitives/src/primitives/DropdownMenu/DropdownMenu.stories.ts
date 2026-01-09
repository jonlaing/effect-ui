import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { DropdownMenu } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

type DropdownMenuStoryArgs = {
  disabled?: boolean;
};

const meta: Meta<DropdownMenuStoryArgs> = {
  title: "Primitives/DropdownMenu",
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the trigger is disabled",
    },
  },
  args: {
    disabled: false,
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger(
          { disabled: args.disabled, class: "btn btn-primary" },
          "Actions",
        ),
        DropdownMenu.Content(
          { class: "menu bg-base-200 rounded-box w-52 p-2 shadow-lg" },
          [
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("Edit clicked"),
                class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
              },
              "Edit",
            ),
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("Duplicate clicked"),
                class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
              },
              "Duplicate",
            ),
            DropdownMenu.Separator({ class: "divider my-1" }),
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("Archive clicked"),
                class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
              },
              "Archive",
            ),
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("Delete clicked"),
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer text-error",
              },
              "Delete",
            ),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export default meta;
type Story = StoryObj<DropdownMenuStoryArgs>;

export const Default: Story = {};

export const WithDisabledItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({ class: "btn btn-secondary" }, "File"),
        DropdownMenu.Content(
          { class: "menu bg-base-200 rounded-box w-52 p-2 shadow-lg" },
          [
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("New"),
                class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
              },
              "New",
            ),
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("Open"),
                class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
              },
              "Open",
            ),
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("Save"),
                class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
              },
              "Save",
            ),
            DropdownMenu.Separator({ class: "divider my-1" }),
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("Export"),
                disabled: true,
                class: "rounded-btn p-2 opacity-50 cursor-not-allowed",
              },
              "Export (Pro)",
            ),
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("Print"),
                disabled: true,
                class: "rounded-btn p-2 opacity-50 cursor-not-allowed",
              },
              "Print (Pro)",
            ),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithGroups: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({ class: "btn btn-accent" }, "Edit"),
        DropdownMenu.Content(
          { class: "menu bg-base-200 rounded-box w-52 p-2 shadow-lg" },
          [
            DropdownMenu.Group({}, [
              DropdownMenu.Label({ class: "menu-title" }, "Clipboard"),
              DropdownMenu.Item(
                {
                  onSelect: () => Effect.log("Cut"),
                  class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                },
                "Cut",
              ),
              DropdownMenu.Item(
                {
                  onSelect: () => Effect.log("Copy"),
                  class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                },
                "Copy",
              ),
              DropdownMenu.Item(
                {
                  onSelect: () => Effect.log("Paste"),
                  class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                },
                "Paste",
              ),
            ]),
            DropdownMenu.Separator({ class: "divider my-1" }),
            DropdownMenu.Group({}, [
              DropdownMenu.Label({ class: "menu-title" }, "Selection"),
              DropdownMenu.Item(
                {
                  onSelect: () => Effect.log("Select All"),
                  class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                },
                "Select All",
              ),
              DropdownMenu.Item(
                {
                  onSelect: () => Effect.log("Deselect"),
                  class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                },
                "Deselect",
              ),
            ]),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const AllPositions: Story = {
  render: () => {
    const positions = [
      {
        side: "bottom" as const,
        align: "start" as const,
        label: "Bottom Start",
      },
      {
        side: "bottom" as const,
        align: "center" as const,
        label: "Bottom Center",
      },
      { side: "bottom" as const, align: "end" as const, label: "Bottom End" },
      { side: "top" as const, align: "start" as const, label: "Top Start" },
      { side: "right" as const, align: "start" as const, label: "Right Start" },
      { side: "left" as const, align: "start" as const, label: "Left Start" },
    ];

    const element = Effect.gen(function* () {
      const menus = yield* Effect.all(
        positions.map(({ side, align, label }) =>
          DropdownMenu.Root({}, [
            DropdownMenu.Trigger({ class: "btn btn-sm btn-outline" }, label),
            DropdownMenu.Content(
              {
                side,
                align,
                class: "menu bg-base-200 rounded-box w-40 p-2 shadow-lg",
              },
              [
                DropdownMenu.Item(
                  { class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer" },
                  "Option 1",
                ),
                DropdownMenu.Item(
                  { class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer" },
                  "Option 2",
                ),
                DropdownMenu.Item(
                  { class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer" },
                  "Option 3",
                ),
              ],
            ),
          ]),
        ),
      );

      const wrapper = document.createElement("div");
      wrapper.className = "grid grid-cols-3 gap-4";
      menus.forEach((menu) => wrapper.appendChild(menu));
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "p-8";

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

      return yield* $.div({ class: "flex flex-col items-center gap-4" }, [
        $.div(
          { class: "badge badge-neutral" },
          isOpen.map((open) => `Menu is: ${open ? "open" : "closed"}`),
        ),
        $.div({ class: "flex gap-2" }, [
          $.button(
            {
              class: "btn btn-sm btn-outline",
              onClick: () => isOpen.set(true),
            },
            "Open Menu",
          ),
          $.button(
            {
              class: "btn btn-sm btn-outline",
              onClick: () => isOpen.set(false),
            },
            "Close Menu",
          ),
        ]),
        DropdownMenu.Root(
          {
            open: isOpen,
            onOpenChange: (open) => Effect.log(`Menu open changed to: ${open}`),
          },
          [
            DropdownMenu.Trigger(
              { class: "btn btn-primary" },
              "Controlled Menu",
            ),
            DropdownMenu.Content(
              { class: "menu bg-base-200 rounded-box w-48 p-2 shadow-lg" },
              [
                DropdownMenu.Item(
                  {
                    onSelect: () => Effect.log("Action 1"),
                    class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                  },
                  "Action 1",
                ),
                DropdownMenu.Item(
                  {
                    onSelect: () => Effect.log("Action 2"),
                    class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                  },
                  "Action 2",
                ),
                DropdownMenu.Item(
                  {
                    onSelect: () => Effect.log("Action 3"),
                    class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                  },
                  "Action 3",
                ),
              ],
            ),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithSubmenus: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({ class: "btn btn-info" }, "File"),
        DropdownMenu.Content(
          { class: "menu bg-base-200 rounded-box w-48 p-2 shadow-lg" },
          [
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("New"),
                class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
              },
              "New",
            ),
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("Open"),
                class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
              },
              "Open",
            ),
            DropdownMenu.Separator({ class: "divider my-1" }),
            DropdownMenu.Sub({}, [
              DropdownMenu.SubTrigger(
                {
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer flex justify-between",
                },
                "Share",
              ),
              DropdownMenu.SubContent(
                { class: "menu bg-base-200 rounded-box w-40 p-2 shadow-lg" },
                [
                  DropdownMenu.Item(
                    {
                      onSelect: () => Effect.log("Email"),
                      class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                    },
                    "Email",
                  ),
                  DropdownMenu.Item(
                    {
                      onSelect: () => Effect.log("Slack"),
                      class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                    },
                    "Slack",
                  ),
                  DropdownMenu.Item(
                    {
                      onSelect: () => Effect.log("Copy Link"),
                      class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                    },
                    "Copy Link",
                  ),
                ],
              ),
            ]),
            DropdownMenu.Sub({}, [
              DropdownMenu.SubTrigger(
                {
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer flex justify-between",
                },
                "Export",
              ),
              DropdownMenu.SubContent(
                { class: "menu bg-base-200 rounded-box w-40 p-2 shadow-lg" },
                [
                  DropdownMenu.Item(
                    {
                      onSelect: () => Effect.log("PDF"),
                      class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                    },
                    "PDF",
                  ),
                  DropdownMenu.Item(
                    {
                      onSelect: () => Effect.log("PNG"),
                      class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                    },
                    "PNG",
                  ),
                  DropdownMenu.Item(
                    {
                      onSelect: () => Effect.log("SVG"),
                      class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                    },
                    "SVG",
                  ),
                ],
              ),
            ]),
            DropdownMenu.Separator({ class: "divider my-1" }),
            DropdownMenu.Item(
              {
                onSelect: () => Effect.log("Print"),
                class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
              },
              "Print",
            ),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithCheckboxItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const showGrid = yield* Signal.make(true);
      const showRulers = yield* Signal.make(false);
      const snapToGrid = yield* Signal.make(true);

      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({ class: "btn btn-success" }, "View Options"),
        DropdownMenu.Content(
          { class: "menu bg-base-200 rounded-box w-52 p-2 shadow-lg" },
          [
            DropdownMenu.Label({ class: "menu-title" }, "Display"),
            DropdownMenu.CheckboxItem(
              {
                checked: showGrid,
                onCheckedChange: (checked) =>
                  Effect.log(`Show Grid: ${checked}`),
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer flex items-center gap-2",
              },
              "Show Grid",
            ),
            DropdownMenu.CheckboxItem(
              {
                checked: showRulers,
                onCheckedChange: (checked) =>
                  Effect.log(`Show Rulers: ${checked}`),
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer flex items-center gap-2",
              },
              "Show Rulers",
            ),
            DropdownMenu.CheckboxItem(
              {
                checked: snapToGrid,
                onCheckedChange: (checked) =>
                  Effect.log(`Snap to Grid: ${checked}`),
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer flex items-center gap-2",
              },
              "Snap to Grid",
            ),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithRadioItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const sortBy = yield* Signal.make("name");

      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({ class: "btn btn-warning" }, "Sort By"),
        DropdownMenu.Content(
          { class: "menu bg-base-200 rounded-box w-48 p-2 shadow-lg" },
          [
            DropdownMenu.RadioGroup(
              {
                value: sortBy,
                onValueChange: (value) => Effect.log(`Sort by: ${value}`),
              },
              [
                DropdownMenu.RadioItem(
                  {
                    value: "name",
                    class:
                      "rounded-btn hover:bg-base-300 p-2 cursor-pointer flex items-center gap-2",
                  },
                  "Name",
                ),
                DropdownMenu.RadioItem(
                  {
                    value: "date",
                    class:
                      "rounded-btn hover:bg-base-300 p-2 cursor-pointer flex items-center gap-2",
                  },
                  "Date Modified",
                ),
                DropdownMenu.RadioItem(
                  {
                    value: "size",
                    class:
                      "rounded-btn hover:bg-base-300 p-2 cursor-pointer flex items-center gap-2",
                  },
                  "Size",
                ),
                DropdownMenu.RadioItem(
                  {
                    value: "type",
                    class:
                      "rounded-btn hover:bg-base-300 p-2 cursor-pointer flex items-center gap-2",
                  },
                  "Type",
                ),
              ],
            ),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
