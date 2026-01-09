import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Tooltip } from "@effex/primitives";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

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
        Tooltip.Trigger({}, $.button({ class: "btn btn-primary" }, "Hover me")),
        Tooltip.Content(
          {
            side: args.side,
            align: args.align,
            class:
              "bg-neutral text-neutral-content px-3 py-2 rounded-box text-sm shadow-lg",
          },
          "This is a helpful tooltip",
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
        Tooltip.Trigger(
          {},
          $.button({ class: "btn btn-square btn-ghost" }, "💾"),
        ),
        Tooltip.Content(
          {
            side: "top",
            class:
              "bg-neutral text-neutral-content px-3 py-2 rounded-box text-sm shadow-lg",
          },
          "Save",
        ),
      ]);

      const editTooltip = yield* Tooltip.Root({ delayDuration: 300 }, [
        Tooltip.Trigger(
          {},
          $.button({ class: "btn btn-square btn-ghost" }, "✏️"),
        ),
        Tooltip.Content(
          {
            side: "top",
            class:
              "bg-neutral text-neutral-content px-3 py-2 rounded-box text-sm shadow-lg",
          },
          "Edit",
        ),
      ]);

      const deleteTooltip = yield* Tooltip.Root({ delayDuration: 300 }, [
        Tooltip.Trigger(
          {},
          $.button({ class: "btn btn-square btn-ghost" }, "🗑️"),
        ),
        Tooltip.Content(
          {
            side: "top",
            class:
              "bg-neutral text-neutral-content px-3 py-2 rounded-box text-sm shadow-lg",
          },
          "Delete",
        ),
      ]);

      const wrapper = document.createElement("div");
      wrapper.className = "flex gap-2";
      wrapper.appendChild(saveTooltip);
      wrapper.appendChild(editTooltip);
      wrapper.appendChild(deleteTooltip);
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

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
          $.button({ class: "btn btn-secondary" }, "Hover for details"),
        ),
        Tooltip.Content(
          {
            side: "top",
            class:
              "bg-neutral text-neutral-content px-3 py-2 rounded-box text-sm shadow-lg max-w-xs",
          },
          "This is a longer tooltip that contains more detailed information about the action or element.",
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
            return yield* $.div({ class: "flex justify-center items-center" }, [
              Tooltip.Root({ delayDuration: 200 }, [
                Tooltip.Trigger(
                  {},
                  $.button(
                    { class: "btn btn-sm btn-outline" },
                    `${pos.side}/${pos.align}`,
                  ),
                ),
                Tooltip.Content(
                  {
                    side: pos.side,
                    align: pos.align,
                    class:
                      "bg-neutral text-neutral-content px-3 py-2 rounded-box text-sm shadow-lg",
                  },
                  `Side: ${pos.side}, Align: ${pos.align}`,
                ),
              ]),
            ]);
          }),
        ),
      );

      const grid = document.createElement("div");
      grid.className = "grid grid-cols-3 gap-4";
      items.forEach((item) => grid.appendChild(item));
      return grid;
    });

    const container = document.createElement("div");
    container.className = "p-8";

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
          $.button({ class: "btn btn-accent" }, "Focus me (Tab)"),
        ),
        Tooltip.Content(
          {
            side: "top",
            class:
              "bg-neutral text-neutral-content px-3 py-2 rounded-box text-sm shadow-lg",
          },
          "Tooltips also show on keyboard focus",
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

export const Colors: Story = {
  render: () => {
    const element = $.div({ class: "flex flex-wrap gap-4 justify-center" }, [
      Effect.gen(function* () {
        return yield* Tooltip.Root({ delayDuration: 200 }, [
          Tooltip.Trigger(
            {},
            $.button({ class: "btn btn-primary" }, "Primary"),
          ),
          Tooltip.Content(
            {
              side: "top",
              class:
                "bg-primary text-primary-content px-3 py-2 rounded-box text-sm shadow-lg",
            },
            "Primary tooltip",
          ),
        ]);
      }),
      Effect.gen(function* () {
        return yield* Tooltip.Root({ delayDuration: 200 }, [
          Tooltip.Trigger(
            {},
            $.button({ class: "btn btn-secondary" }, "Secondary"),
          ),
          Tooltip.Content(
            {
              side: "top",
              class:
                "bg-secondary text-secondary-content px-3 py-2 rounded-box text-sm shadow-lg",
            },
            "Secondary tooltip",
          ),
        ]);
      }),
      Effect.gen(function* () {
        return yield* Tooltip.Root({ delayDuration: 200 }, [
          Tooltip.Trigger({}, $.button({ class: "btn btn-accent" }, "Accent")),
          Tooltip.Content(
            {
              side: "top",
              class:
                "bg-accent text-accent-content px-3 py-2 rounded-box text-sm shadow-lg",
            },
            "Accent tooltip",
          ),
        ]);
      }),
      Effect.gen(function* () {
        return yield* Tooltip.Root({ delayDuration: 200 }, [
          Tooltip.Trigger({}, $.button({ class: "btn btn-info" }, "Info")),
          Tooltip.Content(
            {
              side: "top",
              class:
                "bg-info text-info-content px-3 py-2 rounded-box text-sm shadow-lg",
            },
            "Info tooltip",
          ),
        ]);
      }),
      Effect.gen(function* () {
        return yield* Tooltip.Root({ delayDuration: 200 }, [
          Tooltip.Trigger(
            {},
            $.button({ class: "btn btn-success" }, "Success"),
          ),
          Tooltip.Content(
            {
              side: "top",
              class:
                "bg-success text-success-content px-3 py-2 rounded-box text-sm shadow-lg",
            },
            "Success tooltip",
          ),
        ]);
      }),
      Effect.gen(function* () {
        return yield* Tooltip.Root({ delayDuration: 200 }, [
          Tooltip.Trigger(
            {},
            $.button({ class: "btn btn-warning" }, "Warning"),
          ),
          Tooltip.Content(
            {
              side: "top",
              class:
                "bg-warning text-warning-content px-3 py-2 rounded-box text-sm shadow-lg",
            },
            "Warning tooltip",
          ),
        ]);
      }),
      Effect.gen(function* () {
        return yield* Tooltip.Root({ delayDuration: 200 }, [
          Tooltip.Trigger({}, $.button({ class: "btn btn-error" }, "Error")),
          Tooltip.Content(
            {
              side: "top",
              class:
                "bg-error text-error-content px-3 py-2 rounded-box text-sm shadow-lg",
            },
            "Error tooltip",
          ),
        ]);
      }),
    ]);

    const container = document.createElement("div");
    container.className = "p-8";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
