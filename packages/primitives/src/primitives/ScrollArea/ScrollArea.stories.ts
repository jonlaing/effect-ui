import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { ScrollArea } from "@effex/primitives";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

type ScrollAreaStoryArgs = {
  type?: "auto" | "always" | "scroll" | "hover";
  scrollHideDelay?: number;
};

const meta: Meta<ScrollAreaStoryArgs> = {
  title: "Primitives/ScrollArea",
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["auto", "always", "scroll", "hover"],
      description: "Scrollbar visibility behavior",
    },
    scrollHideDelay: {
      control: { type: "number", min: 0, max: 2000, step: 100 },
      description: "Delay before hiding scrollbars (ms)",
    },
  },
  args: {
    type: "hover",
    scrollHideDelay: 600,
  },
};

export default meta;
type Story = StoryObj<ScrollAreaStoryArgs>;

const loremParagraphs = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.",
  "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.",
  "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
];

export const Default: Story = {
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* $.div(
        {
          class: "h-64 w-full max-w-md bg-base-200 rounded-box overflow-hidden",
        },
        [
          ScrollArea.Root(
            {
              type: args.type,
              scrollHideDelay: args.scrollHideDelay,
              class: "h-full w-full",
            },
            [
              ScrollArea.Viewport({ class: "h-full w-full p-4" }, [
                $.div(
                  { class: "space-y-4" },
                  loremParagraphs.map((text, i) =>
                    $.div({}, [
                      $.h3({ class: "font-bold text-lg" }, `Section ${i + 1}`),
                      $.p({ class: "text-base-content/70" }, text),
                    ]),
                  ),
                ),
              ]),
              ScrollArea.Scrollbar(
                {
                  orientation: "vertical",
                  class: "w-2 bg-base-300 rounded-full",
                },
                [ScrollArea.Thumb({ class: "bg-primary rounded-full" })],
              ),
            ],
          ),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const AlwaysVisible: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div(
        {
          class: "h-64 w-full max-w-md bg-base-200 rounded-box overflow-hidden",
        },
        [
          ScrollArea.Root({ type: "always", class: "h-full w-full" }, [
            ScrollArea.Viewport({ class: "h-full w-full p-4" }, [
              $.div(
                { class: "space-y-4" },
                loremParagraphs.map((text, i) =>
                  $.div({}, [
                    $.h3({ class: "font-bold text-lg" }, `Section ${i + 1}`),
                    $.p({ class: "text-base-content/70" }, text),
                  ]),
                ),
              ),
            ]),
            ScrollArea.Scrollbar(
              {
                orientation: "vertical",
                class: "w-2 bg-base-300 rounded-full",
              },
              [ScrollArea.Thumb({ class: "bg-secondary rounded-full" })],
            ),
          ]),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const HorizontalScroll: Story = {
  render: () => {
    const tags = [
      "JavaScript",
      "TypeScript",
      "React",
      "Vue",
      "Svelte",
      "Angular",
      "Effect-TS",
      "Node.js",
      "Deno",
      "Bun",
      "GraphQL",
      "REST",
      "WebSockets",
      "Docker",
      "Kubernetes",
    ];

    const element = Effect.gen(function* () {
      return yield* $.div(
        { class: "h-20 w-96 bg-base-200 rounded-box overflow-hidden" },
        [
          ScrollArea.Root({ type: "hover", class: "h-full w-full" }, [
            ScrollArea.Viewport({ class: "h-full w-full p-4" }, [
              $.div(
                { class: "flex gap-2 whitespace-nowrap" },
                tags.map((tag) =>
                  $.span({ class: "badge badge-primary" }, tag),
                ),
              ),
            ]),
            ScrollArea.Scrollbar(
              {
                orientation: "horizontal",
                class: "h-2 bg-base-300 rounded-full",
              },
              [ScrollArea.Thumb({ class: "bg-accent rounded-full" })],
            ),
          ]),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const BothScrollbars: Story = {
  render: () => {
    const gridItems = Array.from({ length: 25 }, (_, i) => i + 1);

    const element = Effect.gen(function* () {
      return yield* $.div(
        { class: "h-64 w-64 bg-base-200 rounded-box overflow-hidden" },
        [
          ScrollArea.Root({ type: "hover", class: "h-full w-full" }, [
            ScrollArea.Viewport({ class: "h-full w-full p-4" }, [
              $.div(
                { class: "grid grid-cols-5 gap-2", style: { width: "400px" } },
                gridItems.map((num) =>
                  $.div(
                    {
                      class:
                        "w-16 h-16 bg-primary text-primary-content flex items-center justify-center rounded-btn font-bold",
                    },
                    String(num),
                  ),
                ),
              ),
            ]),
            ScrollArea.Scrollbar(
              {
                orientation: "vertical",
                class: "w-2 bg-base-300 rounded-full",
              },
              [ScrollArea.Thumb({ class: "bg-info rounded-full" })],
            ),
            ScrollArea.Scrollbar(
              {
                orientation: "horizontal",
                class: "h-2 bg-base-300 rounded-full",
              },
              [ScrollArea.Thumb({ class: "bg-info rounded-full" })],
            ),
            ScrollArea.Corner({ class: "bg-base-300" }),
          ]),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const ScrollOnlyType: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-3" }, [
        $.p(
          { class: "text-sm text-base-content/70" },
          'Scrollbars only appear while scrolling (type="scroll")',
        ),
        $.div(
          {
            class:
              "h-64 w-full max-w-md bg-base-200 rounded-box overflow-hidden",
          },
          [
            ScrollArea.Root(
              { type: "scroll", scrollHideDelay: 800, class: "h-full w-full" },
              [
                ScrollArea.Viewport({ class: "h-full w-full p-4" }, [
                  $.div(
                    { class: "space-y-4" },
                    loremParagraphs.map((text, i) =>
                      $.div({}, [
                        $.h3(
                          { class: "font-bold text-lg" },
                          `Section ${i + 1}`,
                        ),
                        $.p({ class: "text-base-content/70" }, text),
                      ]),
                    ),
                  ),
                ]),
                ScrollArea.Scrollbar(
                  {
                    orientation: "vertical",
                    class:
                      "w-2 bg-base-300 rounded-full transition-opacity opacity-0 data-[state=visible]:opacity-100",
                  },
                  [ScrollArea.Thumb({ class: "bg-warning rounded-full" })],
                ),
              ],
            ),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const AutoType: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-3" }, [
        $.p(
          { class: "text-sm text-base-content/70" },
          'Scrollbars visible when content overflows (type="auto")',
        ),
        $.div(
          {
            class:
              "h-64 w-full max-w-md bg-base-200 rounded-box overflow-hidden",
          },
          [
            ScrollArea.Root({ type: "auto", class: "h-full w-full" }, [
              ScrollArea.Viewport({ class: "h-full w-full p-4" }, [
                $.div(
                  { class: "space-y-4" },
                  loremParagraphs.map((text, i) =>
                    $.div({}, [
                      $.h3({ class: "font-bold text-lg" }, `Section ${i + 1}`),
                      $.p({ class: "text-base-content/70" }, text),
                    ]),
                  ),
                ),
              ]),
              ScrollArea.Scrollbar(
                {
                  orientation: "vertical",
                  class: "w-2 bg-base-300 rounded-full",
                },
                [ScrollArea.Thumb({ class: "bg-success rounded-full" })],
              ),
            ]),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const NoOverflow: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-3" }, [
        $.p(
          { class: "text-sm text-base-content/70" },
          "When content doesn't overflow, scrollbars are hidden",
        ),
        $.div(
          {
            class:
              "h-64 w-full max-w-md bg-base-200 rounded-box overflow-hidden",
          },
          [
            ScrollArea.Root({ type: "always", class: "h-full w-full" }, [
              ScrollArea.Viewport({ class: "h-full w-full p-4" }, [
                $.div({ class: "space-y-2" }, [
                  $.p({}, "This content fits within the viewport."),
                  $.p(
                    { class: "text-base-content/70" },
                    "No scrolling needed here.",
                  ),
                ]),
              ]),
              ScrollArea.Scrollbar(
                {
                  orientation: "vertical",
                  class:
                    "w-2 bg-base-300 rounded-full transition-opacity opacity-0 data-[state=visible]:opacity-100",
                },
                [ScrollArea.Thumb({ class: "bg-error rounded-full" })],
              ),
            ]),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
