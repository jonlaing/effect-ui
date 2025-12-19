import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { ScrollArea } from "../primitives/ScrollArea";
import { $ } from "@dom/Element/Element";
import { renderEffectAsync } from "./helpers";

import "./scrollarea.css";

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
      return yield* $.div({ class: "scrollarea-demo" }, [
        ScrollArea.Root(
          { type: args.type, scrollHideDelay: args.scrollHideDelay },
          [
            ScrollArea.Viewport({}, [
              $.div(
                { class: "scrollarea-long-content" },
                loremParagraphs.map((text, i) =>
                  $.div({}, [
                    $.h3(`Section ${i + 1}`),
                    $.p(text),
                  ]),
                ),
              ),
            ]),
            ScrollArea.Scrollbar({ orientation: "vertical" }, [
              ScrollArea.Thumb({}),
            ]),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "scrollarea-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const AlwaysVisible: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "scrollarea-demo scrollarea-always" }, [
        ScrollArea.Root({ type: "always" }, [
          ScrollArea.Viewport({}, [
            $.div(
              { class: "scrollarea-long-content" },
              loremParagraphs.map((text, i) =>
                $.div({}, [
                  $.h3(`Section ${i + 1}`),
                  $.p(text),
                ]),
              ),
            ),
          ]),
          ScrollArea.Scrollbar({ orientation: "vertical" }, [
            ScrollArea.Thumb({}),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "scrollarea-story-container";

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
        {
          class: "scrollarea-demo",
          style: { height: "80px", width: "400px" },
        },
        [
          ScrollArea.Root({ type: "hover" }, [
            ScrollArea.Viewport({}, [
              $.div(
                { class: "scrollarea-tags" },
                tags.map((tag) => $.span({ class: "scrollarea-tag" }, tag)),
              ),
            ]),
            ScrollArea.Scrollbar({ orientation: "horizontal" }, [
              ScrollArea.Thumb({}),
            ]),
          ]),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "scrollarea-story-container";

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
      return yield* $.div({ class: "scrollarea-demo scrollarea-demo--large" }, [
        ScrollArea.Root({ type: "hover" }, [
          ScrollArea.Viewport({}, [
            $.div(
              { class: "scrollarea-grid" },
              gridItems.map((num) =>
                $.div({ class: "scrollarea-grid-item" }, String(num)),
              ),
            ),
          ]),
          ScrollArea.Scrollbar({ orientation: "vertical" }, [
            ScrollArea.Thumb({}),
          ]),
          ScrollArea.Scrollbar({ orientation: "horizontal" }, [
            ScrollArea.Thumb({}),
          ]),
          ScrollArea.Corner({}),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "scrollarea-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const ScrollOnlyType: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({}, [
        $.p(
          {
            style: {
              marginBottom: "12px",
              color: "#64748b",
              fontSize: "14px",
            },
          },
          'Scrollbars only appear while scrolling (type="scroll")',
        ),
        $.div({ class: "scrollarea-demo" }, [
          ScrollArea.Root({ type: "scroll", scrollHideDelay: 800 }, [
            ScrollArea.Viewport({}, [
              $.div(
                { class: "scrollarea-long-content" },
                loremParagraphs.map((text, i) =>
                  $.div({}, [
                    $.h3(`Section ${i + 1}`),
                    $.p(text),
                  ]),
                ),
              ),
            ]),
            ScrollArea.Scrollbar({ orientation: "vertical" }, [
              ScrollArea.Thumb({}),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "scrollarea-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const AutoType: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({}, [
        $.p(
          {
            style: {
              marginBottom: "12px",
              color: "#64748b",
              fontSize: "14px",
            },
          },
          'Scrollbars visible when content overflows (type="auto")',
        ),
        $.div({ class: "scrollarea-demo" }, [
          ScrollArea.Root({ type: "auto" }, [
            ScrollArea.Viewport({}, [
              $.div(
                { class: "scrollarea-long-content" },
                loremParagraphs.map((text, i) =>
                  $.div({}, [
                    $.h3(`Section ${i + 1}`),
                    $.p(text),
                  ]),
                ),
              ),
            ]),
            ScrollArea.Scrollbar({ orientation: "vertical" }, [
              ScrollArea.Thumb({}),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "scrollarea-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const NoOverflow: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({}, [
        $.p(
          {
            style: {
              marginBottom: "12px",
              color: "#64748b",
              fontSize: "14px",
            },
          },
          "When content doesn't overflow, scrollbars are hidden",
        ),
        $.div({ class: "scrollarea-demo" }, [
          ScrollArea.Root({ type: "always" }, [
            ScrollArea.Viewport({}, [
              $.div({ class: "scrollarea-content" }, [
                $.p("This content fits within the viewport."),
                $.p("No scrolling needed here."),
              ]),
            ]),
            ScrollArea.Scrollbar({ orientation: "vertical" }, [
              ScrollArea.Thumb({}),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "scrollarea-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
