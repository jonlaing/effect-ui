import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Tooltip } from "@effex/primitives";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Tooltip.stories.css";

type TooltipStoryArgs = {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  delayDuration?: number;
};

const meta: Meta<TooltipStoryArgs> = {
  title: "Primitives/Tooltip",
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
    delayDuration: {
      control: "number",
      description: "Delay before showing (ms)",
    },
  },
  args: {
    side: "top",
    align: "center",
    delayDuration: 700,
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* Tooltip.Root({ delayDuration: args.delayDuration }, [
        Tooltip.Trigger(
          {},
          $.button({ class: "tooltip-demo-button" }, "Hover me"),
        ),
        Tooltip.Content(
          { side: args.side, align: args.align },
          "This is a helpful tooltip",
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "tooltip-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export default meta;
type Story = StoryObj<TooltipStoryArgs>;

export const Default: Story = {};

export const QuickDelay: Story = {
  args: {
    delayDuration: 200,
  },
};

export const NoDelay: Story = {
  args: {
    delayDuration: 0,
  },
};

export const BottomSide: Story = {
  args: {
    side: "bottom",
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
    side: "top",
    align: "start",
  },
};

export const AlignEnd: Story = {
  args: {
    side: "top",
    align: "end",
  },
};

export const IconButtons: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const saveTooltip = yield* Tooltip.Root({ delayDuration: 300 }, [
        Tooltip.Trigger({}, $.button({ class: "tooltip-icon-button" }, "💾")),
        Tooltip.Content({ side: "top" }, "Save"),
      ]);

      const editTooltip = yield* Tooltip.Root({ delayDuration: 300 }, [
        Tooltip.Trigger({}, $.button({ class: "tooltip-icon-button" }, "✏️")),
        Tooltip.Content({ side: "top" }, "Edit"),
      ]);

      const deleteTooltip = yield* Tooltip.Root({ delayDuration: 300 }, [
        Tooltip.Trigger({}, $.button({ class: "tooltip-icon-button" }, "🗑️")),
        Tooltip.Content({ side: "top" }, "Delete"),
      ]);

      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.gap = "8px";
      wrapper.appendChild(saveTooltip);
      wrapper.appendChild(editTooltip);
      wrapper.appendChild(deleteTooltip);
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "tooltip-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const LongContent: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Tooltip.Root({ delayDuration: 300 }, [
        Tooltip.Trigger(
          {},
          $.button({ class: "tooltip-demo-button" }, "Hover for details"),
        ),
        Tooltip.Content(
          { side: "top" },
          "This is a longer tooltip that contains more detailed information about the action or element.",
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "tooltip-story-container";

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
            const cell = yield* $.div({ class: "tooltip-position-cell" }, [
              Tooltip.Root({ delayDuration: 200 }, [
                Tooltip.Trigger(
                  {},
                  $.button(
                    { class: "tooltip-demo-button" },
                    `${pos.side}/${pos.align}`,
                  ),
                ),
                Tooltip.Content(
                  { side: pos.side, align: pos.align },
                  `Side: ${pos.side}, Align: ${pos.align}`,
                ),
              ]),
            ]);
            return cell;
          }),
        ),
      );

      const grid = document.createElement("div");
      grid.className = "tooltip-position-grid";
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

export const FocusTrigger: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Tooltip.Root({ delayDuration: 0 }, [
        Tooltip.Trigger(
          {},
          $.button({ class: "tooltip-demo-button" }, "Focus me (Tab)"),
        ),
        Tooltip.Content(
          { side: "top" },
          "Tooltips also show on keyboard focus",
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "tooltip-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
