import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Separator } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Separator.stories.css";

type SeparatorStoryArgs = {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
};

const meta: Meta<SeparatorStoryArgs> = {
  title: "Primitives/Separator",
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
      description: "Orientation of the separator",
    },
    decorative: {
      control: { type: "boolean" },
      description: "Whether the separator is purely decorative",
    },
  },
  args: {
    orientation: "horizontal",
    decorative: true,
  },
};

export default meta;
type Story = StoryObj<SeparatorStoryArgs>;

export const Horizontal: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "separator-story-container" }, [
        $.div({ class: "separator-demo" }, [
          $.div({ class: "separator-demo-label" }, "Horizontal Separator"),
          $.div({ class: "separator-content-box" }, [
            $.p({ class: "separator-text" }, "Content above the separator"),
            Separator({ class: "separator-horizontal" }),
            $.p({ class: "separator-text" }, "Content below the separator"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Vertical: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "separator-story-container" }, [
        $.div({ class: "separator-demo" }, [
          $.div({ class: "separator-demo-label" }, "Vertical Separator"),
          $.div({ class: "separator-inline-content" }, [
            $.span({}, "Home"),
            Separator({ orientation: "vertical", class: "separator-vertical" }),
            $.span({}, "Blog"),
            Separator({ orientation: "vertical", class: "separator-vertical" }),
            $.span({}, "Docs"),
            Separator({ orientation: "vertical", class: "separator-vertical" }),
            $.span({}, "Source"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Semantic: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "separator-story-container" }, [
        $.div({ class: "separator-demo" }, [
          $.div({ class: "separator-demo-label" }, "Semantic Separator"),
          $.p(
            { class: "separator-demo-description" },
            'This separator has role="separator" and is announced by screen readers',
          ),
          $.div({ class: "separator-content-box" }, [
            $.p({ class: "separator-text" }, "Section One"),
            Separator({ decorative: false, class: "separator-horizontal" }),
            $.p({ class: "separator-text" }, "Section Two"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const StyledVariants: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "separator-story-container" }, [
        $.div({ class: "separator-demo" }, [
          $.div({ class: "separator-demo-label" }, "Styled Variants"),
          $.div({ class: "separator-variants" }, [
            $.div({ class: "separator-variant" }, [
              $.span({ class: "separator-variant-label" }, "Default"),
              Separator({ class: "separator-horizontal" }),
            ]),
            $.div({ class: "separator-variant" }, [
              $.span({ class: "separator-variant-label" }, "Dashed"),
              Separator({ class: "separator-dashed" }),
            ]),
            $.div({ class: "separator-variant" }, [
              $.span({ class: "separator-variant-label" }, "Dotted"),
              Separator({ class: "separator-dotted" }),
            ]),
            $.div({ class: "separator-variant" }, [
              $.span({ class: "separator-variant-label" }, "Gradient"),
              Separator({ class: "separator-gradient" }),
            ]),
            $.div({ class: "separator-variant" }, [
              $.span({ class: "separator-variant-label" }, "Thick"),
              Separator({ class: "separator-thick" }),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithContent: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "separator-story-container" }, [
        $.div({ class: "separator-demo" }, [
          $.div({ class: "separator-demo-label" }, "Separator with Content"),
          $.div({ class: "separator-content-box" }, [
            $.p({ class: "separator-text" }, "Content above"),
            $.div({ class: "separator-with-text" }, [
              Separator({ class: "separator-flex-line" }),
              $.span({ class: "separator-label" }, "OR"),
              Separator({ class: "separator-flex-line" }),
            ]),
            $.p({ class: "separator-text" }, "Content below"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const ReactiveOrientation: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const isVertical = yield* Signal.make(false);
      const orientation = isVertical.map((v) =>
        v ? ("vertical" as const) : ("horizontal" as const),
      );

      const handleToggle = () =>
        Effect.gen(function* () {
          const current = yield* isVertical.get;
          yield* isVertical.set(!current);
        });

      const containerClass = isVertical.map((v) =>
        v
          ? "separator-reactive-content separator-reactive-vertical"
          : "separator-reactive-content separator-reactive-horizontal",
      );

      return yield* $.div({ class: "separator-story-container" }, [
        $.div({ class: "separator-demo" }, [
          $.div({ class: "separator-demo-label" }, "Reactive Orientation"),
          $.p(
            { class: "separator-demo-description" },
            "Click the button to toggle orientation",
          ),
          $.div({ class: containerClass }, [
            $.span({}, "Item A"),
            Separator({ orientation, class: "separator-reactive" }),
            $.span({}, "Item B"),
          ]),
          $.button({ class: "separator-button", onClick: handleToggle }, [
            "Toggle Orientation",
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
