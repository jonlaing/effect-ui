import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { DropdownMenu } from "../primitives/DropdownMenu";
import { Signal } from "@core/Signal";
import { renderEffectAsync } from "./helpers";

import "./dropdownmenu.css";

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
        DropdownMenu.Trigger({ disabled: args.disabled }, "Actions"),
        DropdownMenu.Content({}, [
          DropdownMenu.Item(
            { onSelect: () => Effect.log("Edit clicked") },
            "Edit",
          ),
          DropdownMenu.Item(
            { onSelect: () => Effect.log("Duplicate clicked") },
            "Duplicate",
          ),
          DropdownMenu.Separator({}),
          DropdownMenu.Item(
            { onSelect: () => Effect.log("Archive clicked") },
            "Archive",
          ),
          DropdownMenu.Item(
            { onSelect: () => Effect.log("Delete clicked") },
            "Delete",
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "menu-story-container";

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
        DropdownMenu.Trigger({}, "File"),
        DropdownMenu.Content({}, [
          DropdownMenu.Item({ onSelect: () => Effect.log("New") }, "New"),
          DropdownMenu.Item({ onSelect: () => Effect.log("Open") }, "Open"),
          DropdownMenu.Item({ onSelect: () => Effect.log("Save") }, "Save"),
          DropdownMenu.Separator({}),
          DropdownMenu.Item(
            { onSelect: () => Effect.log("Export"), disabled: true },
            "Export (Pro)",
          ),
          DropdownMenu.Item(
            { onSelect: () => Effect.log("Print"), disabled: true },
            "Print (Pro)",
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "menu-story-container";

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
        DropdownMenu.Trigger({}, "Edit"),
        DropdownMenu.Content({}, [
          DropdownMenu.Group({}, [
            DropdownMenu.Label({}, "Clipboard"),
            DropdownMenu.Item({ onSelect: () => Effect.log("Cut") }, "Cut"),
            DropdownMenu.Item({ onSelect: () => Effect.log("Copy") }, "Copy"),
            DropdownMenu.Item({ onSelect: () => Effect.log("Paste") }, "Paste"),
          ]),
          DropdownMenu.Separator({}),
          DropdownMenu.Group({}, [
            DropdownMenu.Label({}, "Selection"),
            DropdownMenu.Item(
              { onSelect: () => Effect.log("Select All") },
              "Select All",
            ),
            DropdownMenu.Item(
              { onSelect: () => Effect.log("Deselect") },
              "Deselect",
            ),
          ]),
          DropdownMenu.Separator({}),
          DropdownMenu.Group({}, [
            DropdownMenu.Label({}, "History"),
            DropdownMenu.Item({ onSelect: () => Effect.log("Undo") }, "Undo"),
            DropdownMenu.Item({ onSelect: () => Effect.log("Redo") }, "Redo"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "menu-story-container";

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
            DropdownMenu.Trigger({}, label),
            DropdownMenu.Content({ side, align }, [
              DropdownMenu.Item({}, "Option 1"),
              DropdownMenu.Item({}, "Option 2"),
              DropdownMenu.Item({}, "Option 3"),
            ]),
          ]),
        ),
      );

      const wrapper = document.createElement("div");
      wrapper.className = "menu-positions-grid";
      menus.forEach((menu) => wrapper.appendChild(menu));
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "menu-story-container";

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

      const statusText = document.createElement("p");
      statusText.style.fontSize = "14px";
      statusText.style.color = "#6b7280";
      statusText.style.marginBottom = "16px";

      yield* Effect.sync(() => {
        const updateStatus = () => {
          Effect.runSync(
            Effect.gen(function* () {
              const open = yield* isOpen.get;
              statusText.textContent = `Menu is: ${open ? "open" : "closed"}`;
            }),
          );
        };
        updateStatus();
        setInterval(updateStatus, 100);
      });

      const openButton = document.createElement("button");
      openButton.textContent = "Open Menu Externally";
      openButton.style.marginRight = "8px";
      openButton.style.padding = "8px 16px";
      openButton.onclick = () => Effect.runSync(isOpen.set(true));

      const closeButton = document.createElement("button");
      closeButton.textContent = "Close Menu Externally";
      closeButton.style.padding = "8px 16px";
      closeButton.onclick = () => Effect.runSync(isOpen.set(false));

      const menu = yield* DropdownMenu.Root(
        {
          open: isOpen,
          onOpenChange: (open) => Effect.log(`Menu open changed to: ${open}`),
        },
        [
          DropdownMenu.Trigger({}, "Controlled Menu"),
          DropdownMenu.Content({}, [
            DropdownMenu.Item(
              { onSelect: () => Effect.log("Action 1") },
              "Action 1",
            ),
            DropdownMenu.Item(
              { onSelect: () => Effect.log("Action 2") },
              "Action 2",
            ),
            DropdownMenu.Item(
              { onSelect: () => Effect.log("Action 3") },
              "Action 3",
            ),
          ]),
        ],
      );

      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.alignItems = "center";
      wrapper.style.gap = "16px";
      wrapper.appendChild(statusText);

      const buttonRow = document.createElement("div");
      buttonRow.appendChild(openButton);
      buttonRow.appendChild(closeButton);
      wrapper.appendChild(buttonRow);

      wrapper.appendChild(menu);
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "menu-story-container";
    container.style.flexDirection = "column";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const DangerousActions: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({}, "More Actions"),
        DropdownMenu.Content({}, [
          DropdownMenu.Item({ onSelect: () => Effect.log("Edit") }, "Edit"),
          DropdownMenu.Item(
            { onSelect: () => Effect.log("Duplicate") },
            "Duplicate",
          ),
          DropdownMenu.Item({ onSelect: () => Effect.log("Share") }, "Share"),
          DropdownMenu.Separator({}),
          DropdownMenu.Group({}, [
            DropdownMenu.Label({}, "Danger Zone"),
            DropdownMenu.Item(
              { onSelect: () => Effect.log("Archive") },
              "Archive",
            ),
            DropdownMenu.Item(
              { onSelect: () => Effect.log("Delete") },
              "Delete",
            ),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "menu-story-container";

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
        DropdownMenu.Trigger({}, "File"),
        DropdownMenu.Content({}, [
          DropdownMenu.Item({ onSelect: () => Effect.log("New") }, "New"),
          DropdownMenu.Item({ onSelect: () => Effect.log("Open") }, "Open"),
          DropdownMenu.Separator({}),
          DropdownMenu.Sub({}, [
            DropdownMenu.SubTrigger({}, "Share →"),
            DropdownMenu.SubContent({}, [
              DropdownMenu.Item(
                { onSelect: () => Effect.log("Email") },
                "Email",
              ),
              DropdownMenu.Item(
                { onSelect: () => Effect.log("Slack") },
                "Slack",
              ),
              DropdownMenu.Item(
                { onSelect: () => Effect.log("Copy Link") },
                "Copy Link",
              ),
            ]),
          ]),
          DropdownMenu.Sub({}, [
            DropdownMenu.SubTrigger({}, "Export →"),
            DropdownMenu.SubContent({}, [
              DropdownMenu.Item({ onSelect: () => Effect.log("PDF") }, "PDF"),
              DropdownMenu.Item({ onSelect: () => Effect.log("PNG") }, "PNG"),
              DropdownMenu.Item({ onSelect: () => Effect.log("SVG") }, "SVG"),
              DropdownMenu.Separator({}),
              DropdownMenu.Sub({}, [
                DropdownMenu.SubTrigger({}, "More Formats →"),
                DropdownMenu.SubContent({}, [
                  DropdownMenu.Item(
                    { onSelect: () => Effect.log("JPEG") },
                    "JPEG",
                  ),
                  DropdownMenu.Item(
                    { onSelect: () => Effect.log("WebP") },
                    "WebP",
                  ),
                  DropdownMenu.Item(
                    { onSelect: () => Effect.log("TIFF") },
                    "TIFF",
                  ),
                ]),
              ]),
            ]),
          ]),
          DropdownMenu.Separator({}),
          DropdownMenu.Item({ onSelect: () => Effect.log("Print") }, "Print"),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "menu-story-container";

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
        DropdownMenu.Trigger({}, "View Options"),
        DropdownMenu.Content({}, [
          DropdownMenu.Label({}, "Display"),
          DropdownMenu.CheckboxItem(
            {
              checked: showGrid,
              onCheckedChange: (checked) => Effect.log(`Show Grid: ${checked}`),
            },
            "Show Grid",
          ),
          DropdownMenu.CheckboxItem(
            {
              checked: showRulers,
              onCheckedChange: (checked) =>
                Effect.log(`Show Rulers: ${checked}`),
            },
            "Show Rulers",
          ),
          DropdownMenu.CheckboxItem(
            {
              checked: snapToGrid,
              onCheckedChange: (checked) =>
                Effect.log(`Snap to Grid: ${checked}`),
            },
            "Snap to Grid",
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "menu-story-container";

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
        DropdownMenu.Trigger({}, "Sort By"),
        DropdownMenu.Content({}, [
          DropdownMenu.RadioGroup(
            {
              value: sortBy,
              onValueChange: (value) => Effect.log(`Sort by: ${value}`),
            },
            [
              DropdownMenu.RadioItem({ value: "name" }, "Name"),
              DropdownMenu.RadioItem({ value: "date" }, "Date Modified"),
              DropdownMenu.RadioItem({ value: "size" }, "Size"),
              DropdownMenu.RadioItem({ value: "type" }, "Type"),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "menu-story-container";

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

      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({}, "View"),
        DropdownMenu.Content({}, [
          DropdownMenu.Group({}, [
            DropdownMenu.Label({}, "Options"),
            DropdownMenu.CheckboxItem(
              { checked: showHidden },
              "Show Hidden Files",
            ),
            DropdownMenu.CheckboxItem(
              { checked: showExtensions },
              "Show File Extensions",
            ),
          ]),
          DropdownMenu.Separator({}),
          DropdownMenu.Group({}, [
            DropdownMenu.Label({}, "Sort By"),
            DropdownMenu.RadioGroup({ value: sortBy }, [
              DropdownMenu.RadioItem({ value: "name" }, "Name"),
              DropdownMenu.RadioItem({ value: "date" }, "Date"),
              DropdownMenu.RadioItem({ value: "size" }, "Size"),
            ]),
          ]),
          DropdownMenu.Separator({}),
          DropdownMenu.Group({}, [
            DropdownMenu.Label({}, "View As"),
            DropdownMenu.RadioGroup({ value: viewMode }, [
              DropdownMenu.RadioItem({ value: "list" }, "List"),
              DropdownMenu.RadioItem({ value: "grid" }, "Grid"),
              DropdownMenu.RadioItem({ value: "columns" }, "Columns"),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "menu-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
