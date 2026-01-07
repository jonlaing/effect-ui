import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Splitter } from "./Splitter";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Splitter.stories.css";

const meta: Meta = {
  title: "Primitives/Splitter",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

// Helper for panel content
const PanelContent = (title: string, content: string) =>
  $.div({ class: "panel-content" }, [
    $.div({ class: "panel-title" }, title),
    $.div({ class: "panel-text" }, content),
  ]);

export const Horizontal: Story = {
  render: () => {
    const element = Splitter.Root(
      {
        orientation: "horizontal",
        defaultSizes: [30, 70],
        "aria-label": "Horizontal splitter",
      },
      [
        Splitter.Panel({}, [
          PanelContent(
            "Sidebar",
            "This is the sidebar panel. Drag the handle to resize.",
          ),
        ]),
        Splitter.Handle({ "aria-label": "Resize sidebar" }),
        Splitter.Panel({}, [
          PanelContent(
            "Main Content",
            "This is the main content area. It takes up the remaining space.",
          ),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "splitter-story-container";

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
      },
      [
        Splitter.Panel({}, [
          PanelContent("Header", "This is the header panel."),
        ]),
        Splitter.Handle({ "aria-label": "Resize header" }),
        Splitter.Panel({}, [
          PanelContent(
            "Content",
            "This is the main content area below the header.",
          ),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "splitter-story-container";

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
      },
      [
        Splitter.Panel({}, [
          PanelContent("Left Sidebar", "Navigation or tools."),
        ]),
        Splitter.Handle({ "aria-label": "Resize left sidebar" }),
        Splitter.Panel({}, [
          PanelContent("Main Content", "Primary content area."),
        ]),
        Splitter.Handle({ "aria-label": "Resize right sidebar" }),
        Splitter.Panel({}, [
          PanelContent("Right Sidebar", "Properties or details."),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "splitter-story-container";

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
      },
      [
        Splitter.Panel({ minSize: 15, maxSize: 50 }, [
          PanelContent(
            "Constrained Panel",
            "This panel has min 15% and max 50% size constraints.",
          ),
        ]),
        Splitter.Handle({ "aria-label": "Resize panel" }),
        Splitter.Panel({ minSize: 30 }, [
          PanelContent("Main Content", "This panel has a minimum size of 30%."),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "splitter-story-container";

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
      },
      [
        Splitter.Panel({}, [
          PanelContent(
            "Panel A",
            "The splitter is disabled. Handle cannot be dragged.",
          ),
        ]),
        Splitter.Handle({ "aria-label": "Resize" }),
        Splitter.Panel({}, [
          PanelContent("Panel B", "Resize functionality is disabled."),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "splitter-story-container";

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
              onClick: () => sizes.set([25, 75]),
              style: {
                padding: "0.5rem",
                cursor: "pointer",
                fontSize: "0.75rem",
              },
            },
            "25% / 75%",
          ),
          $.button(
            {
              onClick: () => sizes.set([50, 50]),
              style: {
                padding: "0.5rem",
                cursor: "pointer",
                fontSize: "0.75rem",
              },
            },
            "50% / 50%",
          ),
          $.button(
            {
              onClick: () => sizes.set([75, 25]),
              style: {
                padding: "0.5rem",
                cursor: "pointer",
                fontSize: "0.75rem",
              },
            },
            "75% / 25%",
          ),
        ],
      );

      const splitterWrapper = $.div({ style: { height: "350px" } }, [
        Splitter.Root(
          {
            sizes,
            "aria-label": "Controlled splitter",
          },
          [
            Splitter.Panel({}, [
              PanelContent(
                "Panel A",
                "Click buttons above to control sizes programmatically.",
              ),
            ]),
            Splitter.Handle({ "aria-label": "Resize" }),
            Splitter.Panel({}, [
              PanelContent("Panel B", "Sizes can also be changed by dragging."),
            ]),
          ],
        ),
      ]);

      return yield* $.div({}, [buttons, splitterWrapper]);
    });

    const container = document.createElement("div");
    container.className = "splitter-story-container";

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
      },
      [
        Splitter.Panel({}, [PanelContent("Sidebar", "Left navigation area.")]),
        Splitter.Handle({ "aria-label": "Resize sidebar" }),
        Splitter.Panel({}, [
          Splitter.Root(
            {
              orientation: "vertical",
              defaultSizes: [70, 30],
              "aria-label": "Inner vertical splitter",
            },
            [
              Splitter.Panel({}, [
                PanelContent("Main Editor", "Primary editing area."),
              ]),
              Splitter.Handle({ "aria-label": "Resize terminal" }),
              Splitter.Panel({}, [
                PanelContent("Terminal", "Command line interface."),
              ]),
            ],
          ),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "splitter-story-container nested-splitter-container";

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
      },
      [
        Splitter.Panel({ minSize: 10 }, [
          PanelContent(
            "Explorer",
            "File tree, search, source control, extensions...",
          ),
        ]),
        Splitter.Handle({ "aria-label": "Resize explorer" }),
        Splitter.Panel({ minSize: 30 }, [
          Splitter.Root(
            {
              orientation: "vertical",
              defaultSizes: [70, 30],
              "aria-label": "Editor area",
            },
            [
              Splitter.Panel({}, [
                PanelContent(
                  "Editor",
                  "Code editing area with tabs for open files.",
                ),
              ]),
              Splitter.Handle({ "aria-label": "Resize panel" }),
              Splitter.Panel({ minSize: 10 }, [
                PanelContent(
                  "Panel",
                  "Problems, Output, Terminal, Debug Console...",
                ),
              ]),
            ],
          ),
        ]),
        Splitter.Handle({ "aria-label": "Resize outline" }),
        Splitter.Panel({ minSize: 10 }, [
          PanelContent("Outline", "Document outline, timeline, minimap..."),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "splitter-story-container nested-splitter-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
