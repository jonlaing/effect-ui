import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";

import { $, Signal } from "@effex/dom";
import { TreeView } from "@effex/primitives";

import { renderEffectAsync } from "../../storyHelpers";

const meta: Meta = {
  title: "Primitives/TreeView",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const Chevron = () =>
  $.span(
    { class: "text-xs mr-1 transition-transform data-[state=open]:rotate-90" },
    "▶",
  );

const ChevronSpacer = () => $.span({ class: "w-4 mr-1 inline-block" });

const FolderIcon = () => $.span({ class: "mr-2" }, "📁");

const FileIcon = () => $.span({ class: "mr-2" }, "📄");

export const Default: Story = {
  render: () => {
    const element = TreeView.Root(
      {
        "aria-label": "File tree",
        defaultExpanded: ["folder-1"],
        class: "menu bg-base-200 rounded-box w-64 p-2",
      },
      [
        TreeView.Item({ id: "folder-1", class: "" }, [
          TreeView.ItemLabel(
            {
              class:
                "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
            },
            [Chevron(), $.span({}, "Documents")],
          ),
          TreeView.ItemContent({ class: "ml-4" }, [
            TreeView.Item({ id: "file-1", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
                },
                [ChevronSpacer(), $.span({}, "resume.pdf")],
              ),
            ]),
            TreeView.Item({ id: "file-2", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
                },
                [ChevronSpacer(), $.span({}, "cover-letter.pdf")],
              ),
            ]),
          ]),
        ]),
        TreeView.Item({ id: "folder-2", class: "rounded-btn" }, [
          TreeView.ItemLabel(
            {
              class:
                "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
            },
            [Chevron(), $.span({}, "Photos")],
          ),
          TreeView.ItemContent({ class: "ml-4" }, [
            TreeView.Item({ id: "file-3", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
                },
                [ChevronSpacer(), $.span({}, "vacation.jpg")],
              ),
            ]),
          ]),
        ]),
        TreeView.Item({ id: "file-4", class: "rounded-btn" }, [
          TreeView.ItemLabel(
            {
              class:
                "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
            },
            [ChevronSpacer(), $.span({}, "notes.txt")],
          ),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
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
        class: "menu bg-base-200 rounded-box w-64 p-2",
      },
      [
        TreeView.Item({ id: "folder-1", class: "rounded-btn" }, [
          TreeView.ItemLabel(
            {
              class:
                "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer data-[selected=true]:bg-primary data-[selected=true]:text-primary-content",
            },
            [Chevron(), $.span({}, "Documents")],
          ),
          TreeView.ItemContent({ class: "ml-4" }, [
            TreeView.Item({ id: "file-1", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer data-[selected=true]:bg-primary data-[selected=true]:text-primary-content",
                },
                [ChevronSpacer(), $.span({}, "report.pdf")],
              ),
            ]),
            TreeView.Item({ id: "file-2", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer data-[selected=true]:bg-primary data-[selected=true]:text-primary-content",
                },
                [ChevronSpacer(), $.span({}, "presentation.pptx")],
              ),
            ]),
            TreeView.Item({ id: "file-3", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer data-[selected=true]:bg-primary data-[selected=true]:text-primary-content",
                },
                [ChevronSpacer(), $.span({}, "spreadsheet.xlsx")],
              ),
            ]),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
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
        class: "menu bg-base-200 rounded-box w-64 p-2",
      },
      [
        TreeView.Item({ id: "folder-1", class: "rounded-btn" }, [
          TreeView.ItemLabel(
            {
              class:
                "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-content",
            },
            [Chevron(), $.span({}, "Select Multiple")],
          ),
          TreeView.ItemContent({ class: "ml-4" }, [
            TreeView.Item({ id: "file-1", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-content",
                },
                [ChevronSpacer(), $.span({}, "Item 1 (selected)")],
              ),
            ]),
            TreeView.Item({ id: "file-2", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-content",
                },
                [ChevronSpacer(), $.span({}, "Item 2")],
              ),
            ]),
            TreeView.Item({ id: "file-3", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-content",
                },
                [ChevronSpacer(), $.span({}, "Item 3 (selected)")],
              ),
            ]),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
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
        class: "menu bg-base-200 rounded-box w-64 p-2",
      },
      [
        TreeView.Item({ id: "folder-1", class: "rounded-btn" }, [
          TreeView.ItemLabel(
            {
              class:
                "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
            },
            [Chevron(), $.span({}, "Project Files")],
          ),
          TreeView.ItemContent({ class: "ml-4" }, [
            TreeView.Item({ id: "file-1", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
                },
                [ChevronSpacer(), $.span({}, "editable.txt")],
              ),
            ]),
            TreeView.Item(
              { id: "file-2", disabled: true, class: "rounded-btn opacity-50" },
              [
                TreeView.ItemLabel(
                  {
                    class:
                      "flex items-center px-2 py-1 rounded-btn cursor-not-allowed",
                  },
                  [ChevronSpacer(), $.span({}, "locked.txt (disabled)")],
                ),
              ],
            ),
            TreeView.Item({ id: "file-3", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
                },
                [ChevronSpacer(), $.span({}, "another-file.txt")],
              ),
            ]),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
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
        class: "menu bg-base-200 rounded-box w-64 p-2",
      },
      [
        TreeView.Item({ id: "l1", class: "rounded-btn" }, [
          TreeView.ItemLabel(
            {
              class:
                "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
            },
            [Chevron(), $.span({}, "Level 1")],
          ),
          TreeView.ItemContent({ class: "ml-4" }, [
            TreeView.Item({ id: "l2", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
                },
                [Chevron(), $.span({}, "Level 2")],
              ),
              TreeView.ItemContent({ class: "ml-4" }, [
                TreeView.Item({ id: "l3", class: "rounded-btn" }, [
                  TreeView.ItemLabel(
                    {
                      class:
                        "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
                    },
                    [Chevron(), $.span({}, "Level 3")],
                  ),
                  TreeView.ItemContent({ class: "ml-4" }, [
                    TreeView.Item({ id: "l4", class: "rounded-btn" }, [
                      TreeView.ItemLabel(
                        {
                          class:
                            "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
                        },
                        [ChevronSpacer(), $.span({}, "Level 4 (leaf)")],
                      ),
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
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
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
        class: "menu bg-base-200 rounded-box w-72 p-2",
      },
      [
        TreeView.Item({ id: "src", class: "rounded-btn" }, [
          TreeView.ItemLabel(
            {
              class:
                "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
            },
            [Chevron(), FolderIcon(), $.span({}, "src")],
          ),
          TreeView.ItemContent({ class: "ml-4" }, [
            TreeView.Item({ id: "components", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
                },
                [Chevron(), FolderIcon(), $.span({}, "components")],
              ),
              TreeView.ItemContent({ class: "ml-4" }, [
                TreeView.Item({ id: "button-tsx", class: "rounded-btn" }, [
                  TreeView.ItemLabel(
                    {
                      class:
                        "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer justify-between",
                    },
                    [
                      $.div({ class: "flex items-center" }, [
                        ChevronSpacer(),
                        FileIcon(),
                        $.span({}, "Button.tsx"),
                      ]),
                      $.span({ class: "badge badge-sm badge-ghost" }, "2.4 KB"),
                    ],
                  ),
                ]),
                TreeView.Item({ id: "input-tsx", class: "rounded-btn" }, [
                  TreeView.ItemLabel(
                    {
                      class:
                        "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer justify-between",
                    },
                    [
                      $.div({ class: "flex items-center" }, [
                        ChevronSpacer(),
                        FileIcon(),
                        $.span({}, "Input.tsx"),
                      ]),
                      $.span({ class: "badge badge-sm badge-ghost" }, "1.8 KB"),
                    ],
                  ),
                ]),
              ]),
            ]),
            TreeView.Item({ id: "app-tsx", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer justify-between",
                },
                [
                  $.div({ class: "flex items-center" }, [
                    ChevronSpacer(),
                    FileIcon(),
                    $.span({}, "App.tsx"),
                  ]),
                  $.span({ class: "badge badge-sm badge-ghost" }, "3.2 KB"),
                ],
              ),
            ]),
            TreeView.Item({ id: "index-ts", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer justify-between",
                },
                [
                  $.div({ class: "flex items-center" }, [
                    ChevronSpacer(),
                    FileIcon(),
                    $.span({}, "index.ts"),
                  ]),
                  $.span({ class: "badge badge-sm badge-ghost" }, "0.5 KB"),
                ],
              ),
            ]),
          ]),
        ]),
        TreeView.Item({ id: "package-json", class: "rounded-btn" }, [
          TreeView.ItemLabel(
            {
              class:
                "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer justify-between",
            },
            [
              $.div({ class: "flex items-center" }, [
                ChevronSpacer(),
                FileIcon(),
                $.span({}, "package.json"),
              ]),
              $.span({ class: "badge badge-sm badge-ghost" }, "1.1 KB"),
            ],
          ),
        ]),
        TreeView.Item({ id: "readme-md", class: "rounded-btn" }, [
          TreeView.ItemLabel(
            {
              class:
                "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer justify-between",
            },
            [
              $.div({ class: "flex items-center" }, [
                ChevronSpacer(),
                FileIcon(),
                $.span({}, "README.md"),
              ]),
              $.span({ class: "badge badge-sm badge-ghost" }, "4.7 KB"),
            ],
          ),
        ]),
      ],
    );

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
      const expanded = yield* Signal.Set.make<string>(["folder-1"]);
      const selected = yield* Signal.Set.make<string>([]);

      const buttons = $.div({ class: "flex gap-2 mb-4 flex-wrap" }, [
        $.button(
          {
            onClick: () => expanded.add("folder-1"),
            class: "btn btn-sm btn-outline",
          },
          "Expand All",
        ),
        $.button(
          {
            onClick: () => expanded.clear(),
            class: "btn btn-sm btn-outline",
          },
          "Collapse All",
        ),
        $.button(
          {
            onClick: () => selected.replace(["file-1", "file-2"]),
            class: "btn btn-sm btn-outline",
          },
          "Select Files",
        ),
        $.button(
          {
            onClick: () => selected.clear(),
            class: "btn btn-sm btn-outline",
          },
          "Clear Selection",
        ),
      ]);

      const treeWrapper = $.div({}, [
        TreeView.Root(
          {
            "aria-label": "Controlled tree",
            selectionMode: "multiple",
            expanded,
            selected,
            class: "menu bg-base-200 rounded-box w-64 p-2",
          },
          [
            TreeView.Item({ id: "folder-1", class: "rounded-btn" }, [
              TreeView.ItemLabel(
                {
                  class:
                    "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer",
                },
                [Chevron(), $.span({}, "Controlled Folder")],
              ),
              TreeView.ItemContent({ class: "ml-4" }, [
                TreeView.Item({ id: "file-1", class: "rounded-btn" }, [
                  TreeView.ItemLabel(
                    {
                      class:
                        "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer data-[selected=true]:bg-accent data-[selected=true]:text-accent-content",
                    },
                    [ChevronSpacer(), $.span({}, "File 1")],
                  ),
                ]),
                TreeView.Item({ id: "file-2", class: "rounded-btn" }, [
                  TreeView.ItemLabel(
                    {
                      class:
                        "flex items-center px-2 py-1 rounded-btn hover:bg-base-300 cursor-pointer data-[selected=true]:bg-accent data-[selected=true]:text-accent-content",
                    },
                    [ChevronSpacer(), $.span({}, "File 2")],
                  ),
                ]),
              ]),
            ]),
          ],
        ),
      ]);

      return yield* $.div({}, [buttons, treeWrapper]);
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
