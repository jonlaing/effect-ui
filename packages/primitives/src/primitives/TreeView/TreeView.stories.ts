import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { TreeView } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./TreeView.stories.css";

const meta: Meta = {
  title: "Primitives/TreeView",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

// Helper component for chevron icon
const Chevron = () => $.span({ class: "treeview-chevron" }, "▶");

// Helper component for spacer (leaf items)
const ChevronSpacer = () => $.span({ class: "treeview-chevron-spacer" });

// Simple folder icon
const FolderIcon = () =>
  $.span({ class: "treeview-icon treeview-icon-folder" }, "📁");

// Simple file icon
const FileIcon = () =>
  $.span({ class: "treeview-icon treeview-icon-file" }, "📄");

export const Default: Story = {
  render: () => {
    const element = TreeView.Root(
      { "aria-label": "File tree", defaultExpanded: ["folder-1"] },
      [
        TreeView.Item({ id: "folder-1", class: "treeview-item" }, [
          TreeView.ItemLabel({ class: "treeview-label" }, [
            Chevron(),
            $.span({ class: "treeview-name" }, "Documents"),
          ]),
          TreeView.ItemContent({ class: "treeview-content" }, [
            TreeView.Item({ id: "file-1", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                $.span({ class: "treeview-name" }, "resume.pdf"),
              ]),
            ]),
            TreeView.Item({ id: "file-2", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                $.span({ class: "treeview-name" }, "cover-letter.pdf"),
              ]),
            ]),
          ]),
        ]),
        TreeView.Item({ id: "folder-2", class: "treeview-item" }, [
          TreeView.ItemLabel({ class: "treeview-label" }, [
            Chevron(),
            $.span({ class: "treeview-name" }, "Photos"),
          ]),
          TreeView.ItemContent({ class: "treeview-content" }, [
            TreeView.Item({ id: "file-3", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                $.span({ class: "treeview-name" }, "vacation.jpg"),
              ]),
            ]),
          ]),
        ]),
        TreeView.Item({ id: "file-4", class: "treeview-item" }, [
          TreeView.ItemLabel({ class: "treeview-label" }, [
            ChevronSpacer(),
            $.span({ class: "treeview-name" }, "notes.txt"),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "treeview-story-container";

    renderEffectAsync(element).then((el) => {
      el.classList.add("treeview-root");
      container.appendChild(el);
    });

    return container;
  },
};

export const SingleSelection: Story = {
  render: () => {
    const element = TreeView.Root(
      {
        "aria-label": "File tree with single selection",
        selectionMode: "single",
        defaultExpanded: ["folder-1"],
        defaultSelected: ["file-1"],
      },
      [
        TreeView.Item({ id: "folder-1", class: "treeview-item" }, [
          TreeView.ItemLabel({ class: "treeview-label" }, [
            Chevron(),
            $.span({ class: "treeview-name" }, "Documents"),
          ]),
          TreeView.ItemContent({ class: "treeview-content" }, [
            TreeView.Item({ id: "file-1", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                $.span({ class: "treeview-name" }, "report.pdf"),
              ]),
            ]),
            TreeView.Item({ id: "file-2", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                $.span({ class: "treeview-name" }, "presentation.pptx"),
              ]),
            ]),
            TreeView.Item({ id: "file-3", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                $.span({ class: "treeview-name" }, "spreadsheet.xlsx"),
              ]),
            ]),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "treeview-story-container";

    renderEffectAsync(element).then((el) => {
      el.classList.add("treeview-root");
      container.appendChild(el);
    });

    return container;
  },
};

export const MultipleSelection: Story = {
  render: () => {
    const element = TreeView.Root(
      {
        "aria-label": "File tree with multiple selection",
        selectionMode: "multiple",
        defaultExpanded: ["folder-1"],
        defaultSelected: ["file-1", "file-3"],
      },
      [
        TreeView.Item({ id: "folder-1", class: "treeview-item" }, [
          TreeView.ItemLabel({ class: "treeview-label" }, [
            Chevron(),
            $.span({ class: "treeview-name" }, "Select Multiple"),
          ]),
          TreeView.ItemContent({ class: "treeview-content" }, [
            TreeView.Item({ id: "file-1", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                $.span({ class: "treeview-name" }, "Item 1 (selected)"),
              ]),
            ]),
            TreeView.Item({ id: "file-2", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                $.span({ class: "treeview-name" }, "Item 2"),
              ]),
            ]),
            TreeView.Item({ id: "file-3", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                $.span({ class: "treeview-name" }, "Item 3 (selected)"),
              ]),
            ]),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "treeview-story-container";

    renderEffectAsync(element).then((el) => {
      el.classList.add("treeview-root");
      container.appendChild(el);
    });

    return container;
  },
};

export const WithDisabledItems: Story = {
  render: () => {
    const element = TreeView.Root(
      {
        "aria-label": "File tree with disabled items",
        selectionMode: "single",
        defaultExpanded: ["folder-1"],
      },
      [
        TreeView.Item({ id: "folder-1", class: "treeview-item" }, [
          TreeView.ItemLabel({ class: "treeview-label" }, [
            Chevron(),
            $.span({ class: "treeview-name" }, "Project Files"),
          ]),
          TreeView.ItemContent({ class: "treeview-content" }, [
            TreeView.Item({ id: "file-1", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                $.span({ class: "treeview-name" }, "editable.txt"),
              ]),
            ]),
            TreeView.Item(
              { id: "file-2", class: "treeview-item", disabled: true },
              [
                TreeView.ItemLabel({ class: "treeview-label" }, [
                  ChevronSpacer(),
                  $.span({ class: "treeview-name" }, "locked.txt (disabled)"),
                ]),
              ],
            ),
            TreeView.Item({ id: "file-3", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                $.span({ class: "treeview-name" }, "another-file.txt"),
              ]),
            ]),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "treeview-story-container";

    renderEffectAsync(element).then((el) => {
      el.classList.add("treeview-root");
      container.appendChild(el);
    });

    return container;
  },
};

export const DeeplyNested: Story = {
  render: () => {
    const element = TreeView.Root(
      {
        "aria-label": "Deeply nested tree",
        defaultExpanded: ["l1", "l2", "l3"],
      },
      [
        TreeView.Item({ id: "l1", class: "treeview-item" }, [
          TreeView.ItemLabel({ class: "treeview-label" }, [
            Chevron(),
            $.span({ class: "treeview-name" }, "Level 1"),
          ]),
          TreeView.ItemContent({ class: "treeview-content" }, [
            TreeView.Item({ id: "l2", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                Chevron(),
                $.span({ class: "treeview-name" }, "Level 2"),
              ]),
              TreeView.ItemContent({ class: "treeview-content" }, [
                TreeView.Item({ id: "l3", class: "treeview-item" }, [
                  TreeView.ItemLabel({ class: "treeview-label" }, [
                    Chevron(),
                    $.span({ class: "treeview-name" }, "Level 3"),
                  ]),
                  TreeView.ItemContent({ class: "treeview-content" }, [
                    TreeView.Item({ id: "l4", class: "treeview-item" }, [
                      TreeView.ItemLabel({ class: "treeview-label" }, [
                        ChevronSpacer(),
                        $.span({ class: "treeview-name" }, "Level 4 (leaf)"),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "treeview-story-container";

    renderEffectAsync(element).then((el) => {
      el.classList.add("treeview-root");
      container.appendChild(el);
    });

    return container;
  },
};

export const FileExplorer: Story = {
  render: () => {
    const element = TreeView.Root(
      {
        "aria-label": "File explorer",
        selectionMode: "single",
        defaultExpanded: ["src", "components"],
      },
      [
        TreeView.Item({ id: "src", class: "treeview-item" }, [
          TreeView.ItemLabel({ class: "treeview-label" }, [
            Chevron(),
            FolderIcon(),
            $.span({ class: "treeview-name" }, "src"),
          ]),
          TreeView.ItemContent({ class: "treeview-content" }, [
            TreeView.Item({ id: "components", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                Chevron(),
                FolderIcon(),
                $.span({ class: "treeview-name" }, "components"),
              ]),
              TreeView.ItemContent({ class: "treeview-content" }, [
                TreeView.Item({ id: "button-tsx", class: "treeview-item" }, [
                  TreeView.ItemLabel({ class: "treeview-label" }, [
                    ChevronSpacer(),
                    FileIcon(),
                    $.span({ class: "treeview-name" }, "Button.tsx"),
                    $.span({ class: "treeview-info" }, "2.4 KB"),
                  ]),
                ]),
                TreeView.Item({ id: "input-tsx", class: "treeview-item" }, [
                  TreeView.ItemLabel({ class: "treeview-label" }, [
                    ChevronSpacer(),
                    FileIcon(),
                    $.span({ class: "treeview-name" }, "Input.tsx"),
                    $.span({ class: "treeview-info" }, "1.8 KB"),
                  ]),
                ]),
              ]),
            ]),
            TreeView.Item({ id: "app-tsx", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                FileIcon(),
                $.span({ class: "treeview-name" }, "App.tsx"),
                $.span({ class: "treeview-info" }, "3.2 KB"),
              ]),
            ]),
            TreeView.Item({ id: "index-ts", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                ChevronSpacer(),
                FileIcon(),
                $.span({ class: "treeview-name" }, "index.ts"),
                $.span({ class: "treeview-info" }, "0.5 KB"),
              ]),
            ]),
          ]),
        ]),
        TreeView.Item({ id: "package-json", class: "treeview-item" }, [
          TreeView.ItemLabel({ class: "treeview-label" }, [
            ChevronSpacer(),
            FileIcon(),
            $.span({ class: "treeview-name" }, "package.json"),
            $.span({ class: "treeview-info" }, "1.1 KB"),
          ]),
        ]),
        TreeView.Item({ id: "readme-md", class: "treeview-item" }, [
          TreeView.ItemLabel({ class: "treeview-label" }, [
            ChevronSpacer(),
            FileIcon(),
            $.span({ class: "treeview-name" }, "README.md"),
            $.span({ class: "treeview-info" }, "4.7 KB"),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "treeview-story-container";

    renderEffectAsync(element).then((el) => {
      el.classList.add("treeview-root");
      container.appendChild(el);
    });

    return container;
  },
};

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const expanded = yield* Signal.Set.make<string>(["folder-1"]);
      const selected = yield* Signal.Set.make<string>([]);

      const buttons = $.div(
        {
          style: {
            marginBottom: "1rem",
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          },
        },
        [
          $.button(
            {
              onClick: () => expanded.add("folder-1"),
              style: {
                padding: "0.5rem",
                cursor: "pointer",
                fontSize: "0.75rem",
              },
            },
            "Expand All",
          ),
          $.button(
            {
              onClick: () => expanded.clear(),
              style: {
                padding: "0.5rem",
                cursor: "pointer",
                fontSize: "0.75rem",
              },
            },
            "Collapse All",
          ),
          $.button(
            {
              onClick: () => selected.replace(["file-1", "file-2"]),
              style: {
                padding: "0.5rem",
                cursor: "pointer",
                fontSize: "0.75rem",
              },
            },
            "Select Files",
          ),
          $.button(
            {
              onClick: () => selected.clear(),
              style: {
                padding: "0.5rem",
                cursor: "pointer",
                fontSize: "0.75rem",
              },
            },
            "Clear Selection",
          ),
        ],
      );

      const treeWrapper = $.div({ class: "treeview-root" }, [
        TreeView.Root(
          {
            "aria-label": "Controlled tree",
            selectionMode: "multiple",
            expanded,
            selected,
          },
          [
            TreeView.Item({ id: "folder-1", class: "treeview-item" }, [
              TreeView.ItemLabel({ class: "treeview-label" }, [
                Chevron(),
                $.span({ class: "treeview-name" }, "Controlled Folder"),
              ]),
              TreeView.ItemContent({ class: "treeview-content" }, [
                TreeView.Item({ id: "file-1", class: "treeview-item" }, [
                  TreeView.ItemLabel({ class: "treeview-label" }, [
                    ChevronSpacer(),
                    $.span({ class: "treeview-name" }, "File 1"),
                  ]),
                ]),
                TreeView.Item({ id: "file-2", class: "treeview-item" }, [
                  TreeView.ItemLabel({ class: "treeview-label" }, [
                    ChevronSpacer(),
                    $.span({ class: "treeview-name" }, "File 2"),
                  ]),
                ]),
              ]),
            ]),
          ],
        ),
      ]);

      return yield* $.div({}, [buttons, treeWrapper]);
    });

    const container = document.createElement("div");
    container.className = "treeview-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
