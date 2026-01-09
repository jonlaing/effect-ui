import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { ContextMenu } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

type ContextMenuStoryArgs = {
  disabled?: boolean;
};

const meta: Meta<ContextMenuStoryArgs> = {
  title: "Primitives/ContextMenu",
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the trigger area is disabled",
    },
  },
  args: {
    disabled: false,
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          {
            disabled: args.disabled,
            class:
              "w-64 h-32 flex items-center justify-center border-2 border-dashed border-base-content/30 rounded-box bg-base-200 text-base-content/70 select-none",
          },
          "Right-click here",
        ),
        ContextMenu.Content(
          { class: "menu bg-base-200 rounded-box shadow-xl w-56 p-2" },
          [
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Edit clicked"),
                class: "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
              },
              "Edit",
            ),
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Duplicate clicked"),
                class: "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
              },
              "Duplicate",
            ),
            ContextMenu.Separator({ class: "divider my-1" }),
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Archive clicked"),
                class: "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
              },
              "Archive",
            ),
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Delete clicked"),
                class:
                  "rounded-btn hover:bg-error hover:text-error-content px-3 py-2 cursor-pointer",
              },
              "Delete",
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

export default meta;
type Story = StoryObj<ContextMenuStoryArgs>;

export const Default: Story = {};

export const WithDisabledItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          {
            class:
              "w-64 h-32 flex items-center justify-center border-2 border-dashed border-base-content/30 rounded-box bg-base-200 text-base-content/70 select-none",
          },
          "Right-click for file options",
        ),
        ContextMenu.Content(
          { class: "menu bg-base-200 rounded-box shadow-xl w-56 p-2" },
          [
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Open"),
                class: "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
              },
              "Open",
            ),
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Open With"),
                class: "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
              },
              "Open With...",
            ),
            ContextMenu.Separator({ class: "divider my-1" }),
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Export"),
                disabled: true,
                class: "rounded-btn px-3 py-2 opacity-50 cursor-not-allowed",
              },
              "Export (Pro)",
            ),
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Share"),
                disabled: true,
                class: "rounded-btn px-3 py-2 opacity-50 cursor-not-allowed",
              },
              "Share (Pro)",
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

export const WithGroups: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          {
            class:
              "w-64 h-32 flex items-center justify-center border-2 border-dashed border-base-content/30 rounded-box bg-base-200 text-base-content/70 select-none",
          },
          "Right-click for edit options",
        ),
        ContextMenu.Content(
          { class: "menu bg-base-200 rounded-box shadow-xl w-56 p-2" },
          [
            ContextMenu.Group({}, [
              ContextMenu.Label(
                {
                  class:
                    "menu-title text-xs uppercase text-base-content/50 px-3 py-1",
                },
                "Clipboard",
              ),
              ContextMenu.Item(
                {
                  onSelect: () => Effect.log("Cut"),
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                },
                "Cut",
              ),
              ContextMenu.Item(
                {
                  onSelect: () => Effect.log("Copy"),
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                },
                "Copy",
              ),
              ContextMenu.Item(
                {
                  onSelect: () => Effect.log("Paste"),
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                },
                "Paste",
              ),
            ]),
            ContextMenu.Separator({ class: "divider my-1" }),
            ContextMenu.Group({}, [
              ContextMenu.Label(
                {
                  class:
                    "menu-title text-xs uppercase text-base-content/50 px-3 py-1",
                },
                "Selection",
              ),
              ContextMenu.Item(
                {
                  onSelect: () => Effect.log("Select All"),
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                },
                "Select All",
              ),
              ContextMenu.Item(
                {
                  onSelect: () => Effect.log("Deselect"),
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                },
                "Deselect",
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

export const WithSubmenus: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          {
            class:
              "w-64 h-32 flex items-center justify-center border-2 border-dashed border-base-content/30 rounded-box bg-base-200 text-base-content/70 select-none",
          },
          "Right-click for file actions",
        ),
        ContextMenu.Content(
          { class: "menu bg-base-200 rounded-box shadow-xl w-56 p-2" },
          [
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Open"),
                class: "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
              },
              "Open",
            ),
            ContextMenu.Separator({ class: "divider my-1" }),
            ContextMenu.Sub({}, [
              ContextMenu.SubTrigger(
                {
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex justify-between items-center",
                },
                "Share",
              ),
              ContextMenu.SubContent(
                { class: "menu bg-base-200 rounded-box shadow-xl w-48 p-2" },
                [
                  ContextMenu.Item(
                    {
                      onSelect: () => Effect.log("Email"),
                      class:
                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                    },
                    "Email",
                  ),
                  ContextMenu.Item(
                    {
                      onSelect: () => Effect.log("Slack"),
                      class:
                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                    },
                    "Slack",
                  ),
                  ContextMenu.Item(
                    {
                      onSelect: () => Effect.log("Copy Link"),
                      class:
                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                    },
                    "Copy Link",
                  ),
                ],
              ),
            ]),
            ContextMenu.Sub({}, [
              ContextMenu.SubTrigger(
                {
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex justify-between items-center",
                },
                "Export",
              ),
              ContextMenu.SubContent(
                { class: "menu bg-base-200 rounded-box shadow-xl w-48 p-2" },
                [
                  ContextMenu.Item(
                    {
                      onSelect: () => Effect.log("PDF"),
                      class:
                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                    },
                    "PDF",
                  ),
                  ContextMenu.Item(
                    {
                      onSelect: () => Effect.log("PNG"),
                      class:
                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                    },
                    "PNG",
                  ),
                  ContextMenu.Item(
                    {
                      onSelect: () => Effect.log("SVG"),
                      class:
                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                    },
                    "SVG",
                  ),
                  ContextMenu.Separator({ class: "divider my-1" }),
                  ContextMenu.Sub({}, [
                    ContextMenu.SubTrigger(
                      {
                        class:
                          "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex justify-between items-center",
                      },
                      "More Formats",
                    ),
                    ContextMenu.SubContent(
                      {
                        class:
                          "menu bg-base-200 rounded-box shadow-xl w-40 p-2",
                      },
                      [
                        ContextMenu.Item(
                          {
                            onSelect: () => Effect.log("JPEG"),
                            class:
                              "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                          },
                          "JPEG",
                        ),
                        ContextMenu.Item(
                          {
                            onSelect: () => Effect.log("WebP"),
                            class:
                              "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                          },
                          "WebP",
                        ),
                        ContextMenu.Item(
                          {
                            onSelect: () => Effect.log("TIFF"),
                            class:
                              "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                          },
                          "TIFF",
                        ),
                      ],
                    ),
                  ]),
                ],
              ),
            ]),
            ContextMenu.Separator({ class: "divider my-1" }),
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Delete"),
                class:
                  "rounded-btn hover:bg-error hover:text-error-content px-3 py-2 cursor-pointer",
              },
              "Delete",
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

export const WithCheckboxItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const showGrid = yield* Signal.make(true);
      const showRulers = yield* Signal.make(false);
      const snapToGrid = yield* Signal.make(true);

      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          {
            class:
              "w-64 h-32 flex items-center justify-center border-2 border-dashed border-base-content/30 rounded-box bg-base-200 text-base-content/70 select-none",
          },
          "Right-click for view options",
        ),
        ContextMenu.Content(
          { class: "menu bg-base-200 rounded-box shadow-xl w-56 p-2" },
          [
            ContextMenu.Label(
              {
                class:
                  "menu-title text-xs uppercase text-base-content/50 px-3 py-1",
              },
              "Display",
            ),
            ContextMenu.CheckboxItem(
              {
                checked: showGrid,
                onCheckedChange: (checked) =>
                  Effect.log(`Show Grid: ${checked}`),
                class:
                  "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
              },
              "Show Grid",
            ),
            ContextMenu.CheckboxItem(
              {
                checked: showRulers,
                onCheckedChange: (checked) =>
                  Effect.log(`Show Rulers: ${checked}`),
                class:
                  "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
              },
              "Show Rulers",
            ),
            ContextMenu.CheckboxItem(
              {
                checked: snapToGrid,
                onCheckedChange: (checked) =>
                  Effect.log(`Snap to Grid: ${checked}`),
                class:
                  "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
              },
              "Snap to Grid",
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

export const WithRadioItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const sortBy = yield* Signal.make("name");

      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          {
            class:
              "w-64 h-32 flex items-center justify-center border-2 border-dashed border-base-content/30 rounded-box bg-base-200 text-base-content/70 select-none",
          },
          "Right-click to sort",
        ),
        ContextMenu.Content(
          { class: "menu bg-base-200 rounded-box shadow-xl w-56 p-2" },
          [
            ContextMenu.RadioGroup(
              {
                value: sortBy,
                onValueChange: (value) => Effect.log(`Sort by: ${value}`),
              },
              [
                ContextMenu.RadioItem(
                  {
                    value: "name",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
                  },
                  "Name",
                ),
                ContextMenu.RadioItem(
                  {
                    value: "date",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
                  },
                  "Date Modified",
                ),
                ContextMenu.RadioItem(
                  {
                    value: "size",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
                  },
                  "Size",
                ),
                ContextMenu.RadioItem(
                  {
                    value: "type",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
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
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const MixedItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const showHidden = yield* Signal.make(false);
      const showExtensions = yield* Signal.make(true);
      const sortBy = yield* Signal.make("name");
      const viewMode = yield* Signal.make("list");

      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          {
            class:
              "w-64 h-32 flex items-center justify-center border-2 border-dashed border-base-content/30 rounded-box bg-base-200 text-base-content/70 select-none",
          },
          "Right-click for view settings",
        ),
        ContextMenu.Content(
          { class: "menu bg-base-200 rounded-box shadow-xl w-56 p-2" },
          [
            ContextMenu.Group({}, [
              ContextMenu.Label(
                {
                  class:
                    "menu-title text-xs uppercase text-base-content/50 px-3 py-1",
                },
                "Options",
              ),
              ContextMenu.CheckboxItem(
                {
                  checked: showHidden,
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
                },
                "Show Hidden Files",
              ),
              ContextMenu.CheckboxItem(
                {
                  checked: showExtensions,
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
                },
                "Show File Extensions",
              ),
            ]),
            ContextMenu.Separator({ class: "divider my-1" }),
            ContextMenu.Group({}, [
              ContextMenu.Label(
                {
                  class:
                    "menu-title text-xs uppercase text-base-content/50 px-3 py-1",
                },
                "Sort By",
              ),
              ContextMenu.RadioGroup({ value: sortBy }, [
                ContextMenu.RadioItem(
                  {
                    value: "name",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
                  },
                  "Name",
                ),
                ContextMenu.RadioItem(
                  {
                    value: "date",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
                  },
                  "Date",
                ),
                ContextMenu.RadioItem(
                  {
                    value: "size",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
                  },
                  "Size",
                ),
              ]),
            ]),
            ContextMenu.Separator({ class: "divider my-1" }),
            ContextMenu.Group({}, [
              ContextMenu.Label(
                {
                  class:
                    "menu-title text-xs uppercase text-base-content/50 px-3 py-1",
                },
                "View As",
              ),
              ContextMenu.RadioGroup({ value: viewMode }, [
                ContextMenu.RadioItem(
                  {
                    value: "list",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
                  },
                  "List",
                ),
                ContextMenu.RadioItem(
                  {
                    value: "grid",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
                  },
                  "Grid",
                ),
                ContextMenu.RadioItem(
                  {
                    value: "columns",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer flex items-center gap-2",
                  },
                  "Columns",
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

export const ImageContextMenu: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          {
            class:
              "w-64 h-48 flex items-center justify-center border-2 border-dashed border-primary/50 rounded-box bg-primary/10 text-primary select-none",
          },
          "Right-click on image",
        ),
        ContextMenu.Content(
          { class: "menu bg-base-200 rounded-box shadow-xl w-56 p-2" },
          [
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("View Image"),
                class: "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
              },
              "View Image",
            ),
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Copy Image"),
                class: "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
              },
              "Copy Image",
            ),
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Save Image As..."),
                class: "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
              },
              "Save Image As...",
            ),
            ContextMenu.Separator({ class: "divider my-1" }),
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Copy Image Address"),
                class: "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
              },
              "Copy Image Address",
            ),
            ContextMenu.Item(
              {
                onSelect: () => Effect.log("Open Image in New Tab"),
                class: "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
              },
              "Open Image in New Tab",
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
