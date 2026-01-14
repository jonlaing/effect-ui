import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";

import { $, Signal } from "@effex/dom";
import { Progress } from "@effex/primitives";

import { renderEffectAsync } from "../../storyHelpers";

type ProgressStoryArgs = {
  value?: number | null;
  max?: number;
};

const meta: Meta<ProgressStoryArgs> = {
  title: "Primitives/Progress",
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Current progress value (null for indeterminate)",
    },
    max: {
      control: { type: "number", min: 1 },
      description: "Maximum value",
    },
  },
  args: {
    value: 60,
    max: 100,
  },
};

export default meta;
type Story = StoryObj<ProgressStoryArgs>;

// Base styles for the progress track and indicator
const trackClass = "h-2 w-full bg-base-300 rounded-full overflow-hidden";
const indicatorBase = "h-full w-full transition-transform duration-200";

export const Default: Story = {
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.div({ class: "flex justify-between text-sm" }, [
          $.span({}, "Progress"),
          $.span({ class: "text-base-content/70" }, `${args.value}%`),
        ]),
        Progress.Root(
          {
            value: args.value,
            max: args.max,
            class: trackClass,
          },
          [Progress.Indicator({ class: `${indicatorBase} bg-primary` })],
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

export const Indeterminate: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.span({ class: "text-sm" }, "Loading..."),
        Progress.Root({ value: null, class: trackClass }, [
          Progress.Indicator({
            class: `${indicatorBase} bg-primary animate-pulse`,
          }),
        ]),
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

export const Complete: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.div({ class: "flex justify-between text-sm" }, [
          $.span({ class: "text-success" }, "Complete!"),
          $.span({ class: "text-base-content/70" }, "100%"),
        ]),
        Progress.Root({ value: 100, max: 100, class: trackClass }, [
          Progress.Indicator({ class: `${indicatorBase} bg-success` }),
        ]),
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

export const Colors: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-4 w-64" }, [
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm" }, "Primary"),
          Progress.Root({ value: 60, class: trackClass }, [
            Progress.Indicator({ class: `${indicatorBase} bg-primary` }),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm" }, "Secondary"),
          Progress.Root({ value: 60, class: trackClass }, [
            Progress.Indicator({ class: `${indicatorBase} bg-secondary` }),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm" }, "Accent"),
          Progress.Root({ value: 60, class: trackClass }, [
            Progress.Indicator({ class: `${indicatorBase} bg-accent` }),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm text-success" }, "Success"),
          Progress.Root({ value: 60, class: trackClass }, [
            Progress.Indicator({ class: `${indicatorBase} bg-success` }),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm text-warning" }, "Warning"),
          Progress.Root({ value: 60, class: trackClass }, [
            Progress.Indicator({ class: `${indicatorBase} bg-warning` }),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm text-error" }, "Error"),
          Progress.Root({ value: 60, class: trackClass }, [
            Progress.Indicator({ class: `${indicatorBase} bg-error` }),
          ]),
        ]),
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

export const CustomValueLabel: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.div({ class: "flex justify-between text-sm" }, [
          $.span({}, "Steps completed"),
          $.span({ class: "text-base-content/70" }, "3 of 5"),
        ]),
        Progress.Root(
          {
            value: 3,
            max: 5,
            class: trackClass,
            getValueLabel: (value, max) => `${value} of ${max} steps completed`,
          },
          [Progress.Indicator({ class: `${indicatorBase} bg-info` })],
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

export const Animated: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const progress = yield* Signal.make(0);

      const animate = () => {
        let value = 0;
        const interval = setInterval(() => {
          value += 2;
          if (value > 100) value = 0;
          Effect.runSync(progress.set(value));
        }, 50);
        return interval;
      };

      const intervalId = animate();
      setTimeout(() => clearInterval(intervalId), 60000);

      const valueText = progress.map((v) => `${v}%`);

      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.div({ class: "flex justify-between text-sm" }, [
          $.span({}, "Animated Progress"),
          $.span({ class: "text-base-content/70" }, valueText),
        ]),
        Progress.Root({ value: progress, class: trackClass }, [
          Progress.Indicator({ class: `${indicatorBase} bg-primary` }),
        ]),
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

export const Sizes: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-4 w-64" }, [
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm" }, "Extra Small (h-1)"),
          Progress.Root(
            {
              value: 60,
              class: "h-1 w-full bg-base-300 rounded-full overflow-hidden",
            },
            [Progress.Indicator({ class: `${indicatorBase} bg-primary` })],
          ),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm" }, "Small (h-2)"),
          Progress.Root({ value: 60, class: trackClass }, [
            Progress.Indicator({ class: `${indicatorBase} bg-primary` }),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm" }, "Medium (h-3)"),
          Progress.Root(
            {
              value: 60,
              class: "h-3 w-full bg-base-300 rounded-full overflow-hidden",
            },
            [Progress.Indicator({ class: `${indicatorBase} bg-primary` })],
          ),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm" }, "Large (h-4)"),
          Progress.Root(
            {
              value: 60,
              class: "h-4 w-full bg-base-300 rounded-full overflow-hidden",
            },
            [Progress.Indicator({ class: `${indicatorBase} bg-primary` })],
          ),
        ]),
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
