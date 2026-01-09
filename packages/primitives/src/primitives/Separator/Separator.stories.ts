import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Separator } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

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
      return yield* $.div({ class: "p-4 max-w-md" }, [
        $.h3({ class: "text-lg font-semibold mb-2" }, "Horizontal Separator"),
        $.div({ class: "card bg-base-200" }, [
          $.div({ class: "card-body" }, [
            $.p({}, "Content above the separator"),
            Separator({ class: "divider" }),
            $.p({}, "Content below the separator"),
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
      return yield* $.div({ class: "p-4" }, [
        $.h3({ class: "text-lg font-semibold mb-4" }, "Vertical Separator"),
        $.div({ class: "flex items-center gap-4 text-sm" }, [
          $.span({}, "Home"),
          Separator({
            orientation: "vertical",
            class: "h-4 w-px bg-base-content/30",
          }),
          $.span({}, "Blog"),
          Separator({
            orientation: "vertical",
            class: "h-4 w-px bg-base-content/30",
          }),
          $.span({}, "Docs"),
          Separator({
            orientation: "vertical",
            class: "h-4 w-px bg-base-content/30",
          }),
          $.span({}, "Source"),
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
      return yield* $.div({ class: "p-4 max-w-md" }, [
        $.h3({ class: "text-lg font-semibold mb-2" }, "Semantic Separator"),
        $.p(
          { class: "text-sm text-base-content/70 mb-4" },
          'This separator has role="separator" and is announced by screen readers',
        ),
        $.div({ class: "card bg-base-200" }, [
          $.div({ class: "card-body" }, [
            $.p({}, "Section One"),
            Separator({ decorative: false, class: "divider" }),
            $.p({}, "Section Two"),
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
      return yield* $.div({ class: "p-4 max-w-md space-y-6" }, [
        $.h3({ class: "text-lg font-semibold" }, "Styled Variants"),
        $.div({ class: "space-y-4" }, [
          $.div({ class: "space-y-2" }, [
            $.span({ class: "text-sm text-base-content/70" }, "Default"),
            Separator({ class: "divider" }),
          ]),
          $.div({ class: "space-y-2" }, [
            $.span({ class: "text-sm text-base-content/70" }, "Primary"),
            Separator({ class: "divider divider-primary" }),
          ]),
          $.div({ class: "space-y-2" }, [
            $.span({ class: "text-sm text-base-content/70" }, "Secondary"),
            Separator({ class: "divider divider-secondary" }),
          ]),
          $.div({ class: "space-y-2" }, [
            $.span({ class: "text-sm text-base-content/70" }, "Accent"),
            Separator({ class: "divider divider-accent" }),
          ]),
          $.div({ class: "space-y-2" }, [
            $.span({ class: "text-sm text-base-content/70" }, "Success"),
            Separator({ class: "divider divider-success" }),
          ]),
          $.div({ class: "space-y-2" }, [
            $.span({ class: "text-sm text-base-content/70" }, "Warning"),
            Separator({ class: "divider divider-warning" }),
          ]),
          $.div({ class: "space-y-2" }, [
            $.span({ class: "text-sm text-base-content/70" }, "Error"),
            Separator({ class: "divider divider-error" }),
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
      return yield* $.div({ class: "p-4 max-w-md" }, [
        $.h3({ class: "text-lg font-semibold mb-4" }, "Separator with Content"),
        $.div({ class: "card bg-base-200" }, [
          $.div({ class: "card-body" }, [
            $.p({}, "Content above"),
            $.div({ class: "divider" }, "OR"),
            $.p({}, "Content below"),
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
        v ? "flex items-center gap-4" : "flex flex-col gap-4",
      );

      return yield* $.div({ class: "p-4" }, [
        $.h3({ class: "text-lg font-semibold mb-4" }, "Reactive Orientation"),
        $.p(
          { class: "text-sm text-base-content/70 mb-4" },
          "Click the button to toggle orientation",
        ),
        $.div({ class: containerClass }, [
          $.span({ class: "badge badge-primary" }, "Item A"),
          Separator({
            orientation,
            class: isVertical.map((v) =>
              v ? "h-8 w-px bg-base-content/30" : "divider",
            ),
          }),
          $.span({ class: "badge badge-secondary" }, "Item B"),
        ]),
        $.button(
          { class: "btn btn-outline btn-sm mt-4", onClick: handleToggle },
          "Toggle Orientation",
        ),
      ]);
    });

    const container = document.createElement("div");
    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
