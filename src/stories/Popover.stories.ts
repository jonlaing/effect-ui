import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Popover } from "../primitives/Popover";
import { $ } from "@dom/Element/Element";
import { Signal } from "@core/Signal";
import { renderEffectAsync } from "./helpers";

import "./popover.css";

type PopoverStoryArgs = {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

const meta: Meta<PopoverStoryArgs> = {
  title: "Primitives/Popover",
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Side relative to trigger",
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Alignment along the side",
    },
    sideOffset: {
      control: "number",
      description: "Gap between trigger and content",
    },
  },
  args: {
    side: "bottom",
    align: "center",
    sideOffset: 4,
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* Popover.Root({ defaultOpen: false }, [
        Popover.Trigger({}, "Open Popover"),
        Popover.Content(
          { side: args.side, align: args.align, sideOffset: args.sideOffset },
          [
            $.div({ class: "popover-body" }, [
              $.h4({ class: "popover-title" }, "Popover Title"),
              $.p(
                { class: "popover-description" },
                "This is a basic popover with some content.",
              ),
            ]),
            Popover.Close({}, "Close"),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "popover-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export default meta;
type Story = StoryObj<PopoverStoryArgs>;

export const Default: Story = {};

export const TopSide: Story = {
  args: {
    side: "top",
    align: "center",
  },
};

export const LeftSide: Story = {
  args: {
    side: "left",
    align: "center",
  },
};

export const RightSide: Story = {
  args: {
    side: "right",
    align: "center",
  },
};

export const AlignStart: Story = {
  args: {
    side: "bottom",
    align: "start",
  },
};

export const AlignEnd: Story = {
  args: {
    side: "bottom",
    align: "end",
  },
};

export const WithForm: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Popover.Root({ defaultOpen: false }, [
        Popover.Trigger({}, "Update dimensions"),
        Popover.Content({ side: "bottom", align: "start", sideOffset: 8 }, [
          $.h4({ class: "popover-title" }, "Dimensions"),
          $.p(
            { class: "popover-description" },
            "Set the dimensions for the layer.",
          ),
          $.div({ class: "popover-form" }, [
            $.div({ class: "popover-form-row" }, [
              $.label({ class: "popover-form-label" }, "Width"),
              $.input({
                class: "popover-form-input",
                type: "text",
                placeholder: "100%",
              }),
            ]),
            $.div({ class: "popover-form-row" }, [
              $.label({ class: "popover-form-label" }, "Height"),
              $.input({
                class: "popover-form-input",
                type: "text",
                placeholder: "25px",
              }),
            ]),
            $.button({ class: "popover-form-button" }, "Apply"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "popover-story-container";

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

      const statusText = yield* $.p(
        { style: { fontSize: "14px", color: "#6b7280", marginBottom: "16px" } },
        isOpen.map((open) => `Popover is ${open ? "open" : "closed"}`),
      );

      const buttonGroup = yield* $.div(
        { style: { display: "flex", gap: "8px", marginBottom: "16px" } },
        [
          $.button(
            {
              class: "popover-form-button",
              onClick: () => isOpen.set(true),
            },
            "Open",
          ),
          $.button(
            {
              class: "popover-form-button",
              onClick: () => isOpen.set(false),
            },
            "Close",
          ),
        ],
      );

      const popover = yield* Popover.Root(
        {
          open: isOpen,
          onOpenChange: (open) =>
            Effect.log(`Popover ${open ? "opened" : "closed"}`),
        },
        [
          Popover.Trigger({}, "Toggle Popover"),
          Popover.Content({ side: "bottom" }, [
            $.div({ class: "popover-body" }, [
              $.p("This popover is controlled externally."),
              $.p("Use the buttons above to open/close."),
            ]),
            Popover.Close({}, "Close"),
          ]),
        ],
      );

      const wrapper = document.createElement("div");
      wrapper.appendChild(statusText);
      wrapper.appendChild(buttonGroup);
      wrapper.appendChild(popover);
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "popover-story-container";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithLink: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Popover.Root({ defaultOpen: false }, [
        Popover.Trigger({}, "View details"),
        Popover.Content({ side: "bottom", align: "start" }, [
          $.div({ class: "popover-body" }, [
            $.h4({ class: "popover-title" }, "Quick Info"),
            $.p(
              { class: "popover-description" },
              "This is a brief description of the item. Click the link below for more details.",
            ),
            $.a({ class: "popover-link", href: "#more" }, "Learn more"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "popover-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const AllPositions: Story = {
  render: () => {
    const positions: Array<{
      side: "top" | "bottom" | "left" | "right";
      align: "start" | "center" | "end";
    }> = [
      { side: "top", align: "start" },
      { side: "top", align: "center" },
      { side: "top", align: "end" },
      { side: "left", align: "center" },
      { side: "bottom", align: "center" },
      { side: "right", align: "center" },
      { side: "bottom", align: "start" },
      { side: "bottom", align: "center" },
      { side: "bottom", align: "end" },
    ];

    const element = Effect.gen(function* () {
      const items = yield* Effect.all(
        positions.map((pos) =>
          Effect.gen(function* () {
            const cell = yield* $.div({ class: "popover-position-cell" }, [
              Popover.Root({ defaultOpen: false }, [
                Popover.Trigger({}, `${pos.side}/${pos.align}`),
                Popover.Content({ side: pos.side, align: pos.align }, [
                  $.div({ style: { fontSize: "13px" } }, [
                    $.p(
                      { style: { margin: "0 0 4px 0" } },
                      `Side: ${pos.side}`,
                    ),
                    $.p({ style: { margin: "0" } }, `Align: ${pos.align}`),
                  ]),
                ]),
              ]),
            ]);
            return cell;
          }),
        ),
      );

      const grid = document.createElement("div");
      grid.className = "popover-position-grid";
      items.forEach((item) => grid.appendChild(item));
      return grid;
    });

    const container = document.createElement("div");

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithOffset: Story = {
  args: {
    side: "bottom",
    align: "center",
    sideOffset: 20,
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* Popover.Root({ defaultOpen: false }, [
        Popover.Trigger({}, "Open (20px offset)"),
        Popover.Content(
          { side: args.side, align: args.align, sideOffset: args.sideOffset },
          [
            $.div({ class: "popover-body" }, [
              $.p("This popover has a larger offset from the trigger."),
            ]),
            Popover.Close({}, "Close"),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "popover-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
