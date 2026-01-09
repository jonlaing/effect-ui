import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Popover } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

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
        Popover.Trigger({ class: "btn btn-primary" }, "Open Popover"),
        Popover.Content(
          {
            side: args.side,
            align: args.align,
            sideOffset: args.sideOffset,
            class: "card bg-base-200 shadow-xl p-4 w-72",
          },
          [
            $.h4({ class: "font-semibold mb-2" }, "Popover Title"),
            $.p(
              { class: "text-sm text-base-content/70 mb-4" },
              "This is a basic popover with some content.",
            ),
            Popover.Close({ class: "btn btn-sm btn-ghost" }, "Close"),
          ],
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
        Popover.Trigger({ class: "btn btn-secondary" }, "Update dimensions"),
        Popover.Content(
          {
            side: "bottom",
            align: "start",
            sideOffset: 8,
            class: "card bg-base-200 shadow-xl p-4 w-80",
          },
          [
            $.h4({ class: "font-semibold mb-1" }, "Dimensions"),
            $.p(
              { class: "text-sm text-base-content/70 mb-4" },
              "Set the dimensions for the layer.",
            ),
            $.div({ class: "form-control w-full mb-2" }, [
              $.label({ class: "label" }, [
                $.span({ class: "label-text" }, "Width"),
              ]),
              $.input({
                class: "input input-bordered input-sm w-full",
                type: "text",
                placeholder: "100%",
              }),
            ]),
            $.div({ class: "form-control w-full mb-4" }, [
              $.label({ class: "label" }, [
                $.span({ class: "label-text" }, "Height"),
              ]),
              $.input({
                class: "input input-bordered input-sm w-full",
                type: "text",
                placeholder: "25px",
              }),
            ]),
            $.button({ class: "btn btn-primary btn-sm w-full" }, "Apply"),
          ],
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

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const isOpen = yield* Signal.make(false);

      return yield* $.div({ class: "flex flex-col items-center gap-4" }, [
        $.div(
          { class: "badge badge-neutral" },
          isOpen.map((open) => `Popover is ${open ? "open" : "closed"}`),
        ),
        $.div({ class: "flex gap-2" }, [
          $.button(
            {
              class: "btn btn-sm btn-outline",
              onClick: () => isOpen.set(true),
            },
            "Open",
          ),
          $.button(
            {
              class: "btn btn-sm btn-outline",
              onClick: () => isOpen.set(false),
            },
            "Close",
          ),
        ]),
        Popover.Root(
          {
            open: isOpen,
            onOpenChange: (open) =>
              Effect.log(`Popover ${open ? "opened" : "closed"}`),
          },
          [
            Popover.Trigger({ class: "btn btn-primary" }, "Toggle Popover"),
            Popover.Content(
              { side: "bottom", class: "card bg-base-200 shadow-xl p-4 w-64" },
              [
                $.p(
                  { class: "text-sm" },
                  "This popover is controlled externally.",
                ),
                $.p(
                  { class: "text-sm text-base-content/70 mt-2" },
                  "Use the buttons above to open/close.",
                ),
                Popover.Close({ class: "btn btn-sm btn-ghost mt-3" }, "Close"),
              ],
            ),
          ],
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

export const WithLink: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Popover.Root({ defaultOpen: false }, [
        Popover.Trigger({ class: "btn btn-accent" }, "View details"),
        Popover.Content(
          {
            side: "bottom",
            align: "start",
            class: "card bg-base-200 shadow-xl p-4 w-72",
          },
          [
            $.h4({ class: "font-semibold mb-2" }, "Quick Info"),
            $.p(
              { class: "text-sm text-base-content/70 mb-3" },
              "This is a brief description of the item. Click the link below for more details.",
            ),
            $.a(
              { class: "link link-primary text-sm", href: "#more" },
              "Learn more",
            ),
          ],
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
              Popover.Root({ defaultOpen: false }, [
                Popover.Trigger(
                  { class: "btn btn-sm btn-outline" },
                  `${pos.side}/${pos.align}`,
                ),
                Popover.Content(
                  {
                    side: pos.side,
                    align: pos.align,
                    class: "card bg-base-200 shadow-lg p-3",
                  },
                  [
                    $.p({ class: "text-xs" }, `Side: ${pos.side}`),
                    $.p({ class: "text-xs" }, `Align: ${pos.align}`),
                  ],
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

export const WithOffset: Story = {
  args: {
    side: "bottom",
    align: "center",
    sideOffset: 20,
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* Popover.Root({ defaultOpen: false }, [
        Popover.Trigger({ class: "btn btn-info" }, "Open (20px offset)"),
        Popover.Content(
          {
            side: args.side,
            align: args.align,
            sideOffset: args.sideOffset,
            class: "card bg-base-200 shadow-xl p-4 w-64",
          },
          [
            $.p(
              { class: "text-sm" },
              "This popover has a larger offset from the trigger.",
            ),
            Popover.Close({ class: "btn btn-sm btn-ghost mt-3" }, "Close"),
          ],
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
