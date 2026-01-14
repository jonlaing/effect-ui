import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";

import { $, Signal } from "@effex/dom";

import { renderEffectAsync } from "../../storyHelpers";
import { Splitter } from "./Splitter";

const meta: Meta = {
  title: "Primitives/Splitter",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const PanelContent = (title: string, content: string) =>
  $.div({ class: "p-4 h-full" }, [
    $.div({ class: "font-bold text-lg mb-2" }, title),
    $.div({ class: "text-base-content/70 text-sm" }, content),
  ]);

export const Horizontal: Story = {
  render: () => {
    const element = Splitter.Root(
      {
        orientation: "horizontal",
        defaultSizes: [30, 70],
        "aria-label": "Horizontal splitter",
        class: "h-64 w-full rounded-box border border-base-300 overflow-hidden",
      },
      [
        Splitter.Panel({ class: "bg-base-200" }, [
          PanelContent(
            "Sidebar",
            "This is the sidebar panel. Drag the handle to resize.",
          ),
        ]),
        Splitter.Handle({
          "aria-label": "Resize sidebar",
          class:
            "w-1 bg-base-300 hover:bg-primary transition-colors cursor-col-resize",
        }),
        Splitter.Panel({ class: "bg-base-100" }, [
          PanelContent(
            "Main Content",
            "This is the main content area. It takes up the remaining space.",
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

export const Vertical: Story = {
  render: () => {
    const element = Splitter.Root(
      {
        orientation: "vertical",
        defaultSizes: [25, 75],
        "aria-label": "Vertical splitter",
        class: "h-64 w-full rounded-box border border-base-300 overflow-hidden",
      },
      [
        Splitter.Panel({ class: "bg-base-200" }, [
          PanelContent("Header", "This is the header panel."),
        ]),
        Splitter.Handle({
          "aria-label": "Resize header",
          class:
            "h-1 bg-base-300 hover:bg-primary transition-colors cursor-row-resize",
        }),
        Splitter.Panel({ class: "bg-base-100" }, [
          PanelContent(
            "Content",
            "This is the main content area below the header.",
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

export const ThreePanels: Story = {
  render: () => {
    const element = Splitter.Root(
      {
        orientation: "horizontal",
        defaultSizes: [20, 60, 20],
        "aria-label": "Three panel layout",
        class: "h-64 w-full rounded-box border border-base-300 overflow-hidden",
      },
      [
        Splitter.Panel({ class: "bg-base-200" }, [
          PanelContent("Left Sidebar", "Navigation or tools."),
        ]),
        Splitter.Handle({
          "aria-label": "Resize left sidebar",
          class:
            "w-1 bg-base-300 hover:bg-primary transition-colors cursor-col-resize",
        }),
        Splitter.Panel({ class: "bg-base-100" }, [
          PanelContent("Main Content", "Primary content area."),
        ]),
        Splitter.Handle({
          "aria-label": "Resize right sidebar",
          class:
            "w-1 bg-base-300 hover:bg-primary transition-colors cursor-col-resize",
        }),
        Splitter.Panel({ class: "bg-base-200" }, [
          PanelContent("Right Sidebar", "Properties or details."),
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

export const WithMinMax: Story = {
  render: () => {
    const element = Splitter.Root(
      {
        orientation: "horizontal",
        defaultSizes: [30, 70],
        "aria-label": "Splitter with constraints",
        class: "h-64 w-full rounded-box border border-base-300 overflow-hidden",
      },
      [
        Splitter.Panel({ minSize: 15, maxSize: 50, class: "bg-primary/10" }, [
          PanelContent(
            "Constrained Panel",
            "This panel has min 15% and max 50% size constraints.",
          ),
        ]),
        Splitter.Handle({
          "aria-label": "Resize panel",
          class:
            "w-1 bg-primary hover:bg-primary-focus transition-colors cursor-col-resize",
        }),
        Splitter.Panel({ minSize: 30, class: "bg-base-100" }, [
          PanelContent("Main Content", "This panel has a minimum size of 30%."),
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

export const Disabled: Story = {
  render: () => {
    const element = Splitter.Root(
      {
        orientation: "horizontal",
        defaultSizes: [40, 60],
        disabled: true,
        "aria-label": "Disabled splitter",
        class:
          "h-64 w-full rounded-box border border-base-300 overflow-hidden opacity-70",
      },
      [
        Splitter.Panel({ class: "bg-base-200" }, [
          PanelContent(
            "Panel A",
            "The splitter is disabled. Handle cannot be dragged.",
          ),
        ]),
        Splitter.Handle({
          "aria-label": "Resize",
          class: "w-1 bg-base-300 cursor-not-allowed",
        }),
        Splitter.Panel({ class: "bg-base-100" }, [
          PanelContent("Panel B", "Resize functionality is disabled."),
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
      const sizes = yield* Signal.make<number[]>([50, 50]);

      const buttons = $.div({ class: "flex gap-2 mb-4 flex-wrap" }, [
        $.button(
          {
            onClick: () => sizes.set([25, 75]),
            class: "btn btn-sm btn-outline",
          },
          "25% / 75%",
        ),
        $.button(
          {
            onClick: () => sizes.set([50, 50]),
            class: "btn btn-sm btn-outline",
          },
          "50% / 50%",
        ),
        $.button(
          {
            onClick: () => sizes.set([75, 25]),
            class: "btn btn-sm btn-outline",
          },
          "75% / 25%",
        ),
      ]);

      const splitterWrapper = $.div(
        { class: "h-64 rounded-box border border-base-300 overflow-hidden" },
        [
          Splitter.Root(
            {
              sizes,
              "aria-label": "Controlled splitter",
            },
            [
              Splitter.Panel({ class: "bg-base-200" }, [
                PanelContent(
                  "Panel A",
                  "Click buttons above to control sizes programmatically.",
                ),
              ]),
              Splitter.Handle({
                "aria-label": "Resize",
                class:
                  "w-1 bg-base-300 hover:bg-primary transition-colors cursor-col-resize",
              }),
              Splitter.Panel({ class: "bg-base-100" }, [
                PanelContent(
                  "Panel B",
                  "Sizes can also be changed by dragging.",
                ),
              ]),
            ],
          ),
        ],
      );

      return yield* $.div({}, [buttons, splitterWrapper]);
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Nested: Story = {
  render: () => {
    const element = Splitter.Root(
      {
        orientation: "horizontal",
        defaultSizes: [25, 75],
        "aria-label": "Outer horizontal splitter",
        class: "h-80 w-full rounded-box border border-base-300 overflow-hidden",
      },
      [
        Splitter.Panel({ class: "bg-base-200" }, [
          PanelContent("Sidebar", "Left navigation area."),
        ]),
        Splitter.Handle({
          "aria-label": "Resize sidebar",
          class:
            "w-1 bg-base-300 hover:bg-primary transition-colors cursor-col-resize",
        }),
        Splitter.Panel({ class: "bg-base-100" }, [
          Splitter.Root(
            {
              orientation: "vertical",
              defaultSizes: [70, 30],
              "aria-label": "Inner vertical splitter",
              class: "h-full",
            },
            [
              Splitter.Panel({ class: "bg-base-100" }, [
                PanelContent("Main Editor", "Primary editing area."),
              ]),
              Splitter.Handle({
                "aria-label": "Resize terminal",
                class:
                  "h-1 bg-base-300 hover:bg-secondary transition-colors cursor-row-resize",
              }),
              Splitter.Panel({ class: "bg-neutral text-neutral-content" }, [
                PanelContent("Terminal", "Command line interface."),
              ]),
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

export const IDELayout: Story = {
  render: () => {
    const element = Splitter.Root(
      {
        orientation: "horizontal",
        defaultSizes: [20, 60, 20],
        "aria-label": "IDE layout",
        class: "h-96 w-full rounded-box border border-base-300 overflow-hidden",
      },
      [
        Splitter.Panel({ minSize: 10, class: "bg-base-200" }, [
          PanelContent(
            "Explorer",
            "File tree, search, source control, extensions...",
          ),
        ]),
        Splitter.Handle({
          "aria-label": "Resize explorer",
          class:
            "w-1 bg-base-300 hover:bg-primary transition-colors cursor-col-resize",
        }),
        Splitter.Panel({ minSize: 30, class: "bg-base-100" }, [
          Splitter.Root(
            {
              orientation: "vertical",
              defaultSizes: [70, 30],
              "aria-label": "Editor area",
              class: "h-full",
            },
            [
              Splitter.Panel({ class: "bg-base-100" }, [
                PanelContent(
                  "Editor",
                  "Code editing area with tabs for open files.",
                ),
              ]),
              Splitter.Handle({
                "aria-label": "Resize panel",
                class:
                  "h-1 bg-base-300 hover:bg-secondary transition-colors cursor-row-resize",
              }),
              Splitter.Panel(
                { minSize: 10, class: "bg-neutral text-neutral-content" },
                [
                  PanelContent(
                    "Panel",
                    "Problems, Output, Terminal, Debug Console...",
                  ),
                ],
              ),
            ],
          ),
        ]),
        Splitter.Handle({
          "aria-label": "Resize outline",
          class:
            "w-1 bg-base-300 hover:bg-primary transition-colors cursor-col-resize",
        }),
        Splitter.Panel({ minSize: 10, class: "bg-base-200" }, [
          PanelContent("Outline", "Document outline, timeline, minimap..."),
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
