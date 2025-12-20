import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { ContextMenu } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./ContextMenu.stories.css";

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
          { disabled: args.disabled, class: "context-menu-area" },
          "Right-click here",
        ),
        ContextMenu.Content({}, [
          ContextMenu.Item(
            { onSelect: () => Effect.log("Edit clicked") },
            "Edit",
          ),
          ContextMenu.Item(
            { onSelect: () => Effect.log("Duplicate clicked") },
            "Duplicate",
          ),
          ContextMenu.Separator({}),
          ContextMenu.Item(
            { onSelect: () => Effect.log("Archive clicked") },
            "Archive",
          ),
          ContextMenu.Item(
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
type Story = StoryObj<ContextMenuStoryArgs>;

export const Default: Story = {};

export const WithDisabledItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          { class: "context-menu-area" },
          "Right-click for file options",
        ),
        ContextMenu.Content({}, [
          ContextMenu.Item({ onSelect: () => Effect.log("Open") }, "Open"),
          ContextMenu.Item(
            { onSelect: () => Effect.log("Open With") },
            "Open With...",
          ),
          ContextMenu.Separator({}),
          ContextMenu.Item(
            { onSelect: () => Effect.log("Export"), disabled: true },
            "Export (Pro)",
          ),
          ContextMenu.Item(
            { onSelect: () => Effect.log("Share"), disabled: true },
            "Share (Pro)",
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
      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          { class: "context-menu-area" },
          "Right-click for edit options",
        ),
        ContextMenu.Content({}, [
          ContextMenu.Group({}, [
            ContextMenu.Label({}, "Clipboard"),
            ContextMenu.Item({ onSelect: () => Effect.log("Cut") }, "Cut"),
            ContextMenu.Item({ onSelect: () => Effect.log("Copy") }, "Copy"),
            ContextMenu.Item({ onSelect: () => Effect.log("Paste") }, "Paste"),
          ]),
          ContextMenu.Separator({}),
          ContextMenu.Group({}, [
            ContextMenu.Label({}, "Selection"),
            ContextMenu.Item(
              { onSelect: () => Effect.log("Select All") },
              "Select All",
            ),
            ContextMenu.Item(
              { onSelect: () => Effect.log("Deselect") },
              "Deselect",
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
      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          { class: "context-menu-area" },
          "Right-click for file actions",
        ),
        ContextMenu.Content({}, [
          ContextMenu.Item({ onSelect: () => Effect.log("Open") }, "Open"),
          ContextMenu.Separator({}),
          ContextMenu.Sub({}, [
            ContextMenu.SubTrigger({}, "Share →"),
            ContextMenu.SubContent({}, [
              ContextMenu.Item(
                { onSelect: () => Effect.log("Email") },
                "Email",
              ),
              ContextMenu.Item(
                { onSelect: () => Effect.log("Slack") },
                "Slack",
              ),
              ContextMenu.Item(
                { onSelect: () => Effect.log("Copy Link") },
                "Copy Link",
              ),
            ]),
          ]),
          ContextMenu.Sub({}, [
            ContextMenu.SubTrigger({}, "Export →"),
            ContextMenu.SubContent({}, [
              ContextMenu.Item({ onSelect: () => Effect.log("PDF") }, "PDF"),
              ContextMenu.Item({ onSelect: () => Effect.log("PNG") }, "PNG"),
              ContextMenu.Item({ onSelect: () => Effect.log("SVG") }, "SVG"),
              ContextMenu.Separator({}),
              ContextMenu.Sub({}, [
                ContextMenu.SubTrigger({}, "More Formats →"),
                ContextMenu.SubContent({}, [
                  ContextMenu.Item(
                    { onSelect: () => Effect.log("JPEG") },
                    "JPEG",
                  ),
                  ContextMenu.Item(
                    { onSelect: () => Effect.log("WebP") },
                    "WebP",
                  ),
                  ContextMenu.Item(
                    { onSelect: () => Effect.log("TIFF") },
                    "TIFF",
                  ),
                ]),
              ]),
            ]),
          ]),
          ContextMenu.Separator({}),
          ContextMenu.Item({ onSelect: () => Effect.log("Delete") }, "Delete"),
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

      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          { class: "context-menu-area" },
          "Right-click for view options",
        ),
        ContextMenu.Content({}, [
          ContextMenu.Label({}, "Display"),
          ContextMenu.CheckboxItem(
            {
              checked: showGrid,
              onCheckedChange: (checked) => Effect.log(`Show Grid: ${checked}`),
            },
            "Show Grid",
          ),
          ContextMenu.CheckboxItem(
            {
              checked: showRulers,
              onCheckedChange: (checked) =>
                Effect.log(`Show Rulers: ${checked}`),
            },
            "Show Rulers",
          ),
          ContextMenu.CheckboxItem(
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

      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          { class: "context-menu-area" },
          "Right-click to sort",
        ),
        ContextMenu.Content({}, [
          ContextMenu.RadioGroup(
            {
              value: sortBy,
              onValueChange: (value) => Effect.log(`Sort by: ${value}`),
            },
            [
              ContextMenu.RadioItem({ value: "name" }, "Name"),
              ContextMenu.RadioItem({ value: "date" }, "Date Modified"),
              ContextMenu.RadioItem({ value: "size" }, "Size"),
              ContextMenu.RadioItem({ value: "type" }, "Type"),
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

      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          { class: "context-menu-area" },
          "Right-click for view settings",
        ),
        ContextMenu.Content({}, [
          ContextMenu.Group({}, [
            ContextMenu.Label({}, "Options"),
            ContextMenu.CheckboxItem(
              { checked: showHidden },
              "Show Hidden Files",
            ),
            ContextMenu.CheckboxItem(
              { checked: showExtensions },
              "Show File Extensions",
            ),
          ]),
          ContextMenu.Separator({}),
          ContextMenu.Group({}, [
            ContextMenu.Label({}, "Sort By"),
            ContextMenu.RadioGroup({ value: sortBy }, [
              ContextMenu.RadioItem({ value: "name" }, "Name"),
              ContextMenu.RadioItem({ value: "date" }, "Date"),
              ContextMenu.RadioItem({ value: "size" }, "Size"),
            ]),
          ]),
          ContextMenu.Separator({}),
          ContextMenu.Group({}, [
            ContextMenu.Label({}, "View As"),
            ContextMenu.RadioGroup({ value: viewMode }, [
              ContextMenu.RadioItem({ value: "list" }, "List"),
              ContextMenu.RadioItem({ value: "grid" }, "Grid"),
              ContextMenu.RadioItem({ value: "columns" }, "Columns"),
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

export const ImageContextMenu: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* ContextMenu.Root({}, [
        ContextMenu.Trigger(
          { class: "context-menu-area image-preview" },
          "Right-click on image",
        ),
        ContextMenu.Content({}, [
          ContextMenu.Item(
            { onSelect: () => Effect.log("View Image") },
            "View Image",
          ),
          ContextMenu.Item(
            { onSelect: () => Effect.log("Copy Image") },
            "Copy Image",
          ),
          ContextMenu.Item(
            { onSelect: () => Effect.log("Save Image As...") },
            "Save Image As...",
          ),
          ContextMenu.Separator({}),
          ContextMenu.Item(
            { onSelect: () => Effect.log("Copy Image Address") },
            "Copy Image Address",
          ),
          ContextMenu.Item(
            { onSelect: () => Effect.log("Open Image in New Tab") },
            "Open Image in New Tab",
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
