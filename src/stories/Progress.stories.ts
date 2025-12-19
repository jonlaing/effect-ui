import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Progress } from "../primitives/Progress";
import { Signal } from "@core/Signal";
import { $ } from "@dom/Element/Element";
import { renderEffectAsync } from "./helpers";

import "./progress.css";

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

export const Default: Story = {
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "progress-story-container" }, [
        $.div({ class: "progress-demo" }, [
          $.div({ class: "progress-demo-label" }, "Progress"),
          Progress.Root({ value: args.value, max: args.max }, [
            Progress.Indicator({}),
          ]),
          $.div({ class: "progress-demo-value" }, `${args.value}%`),
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

export const Indeterminate: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "progress-story-container" }, [
        $.div({ class: "progress-demo" }, [
          $.div({ class: "progress-demo-label" }, "Loading..."),
          Progress.Root({ value: null }, [Progress.Indicator({})]),
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

export const Complete: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "progress-story-container" }, [
        $.div({ class: "progress-demo" }, [
          $.div({ class: "progress-demo-label" }, "Complete!"),
          Progress.Root({ value: 100, max: 100 }, [Progress.Indicator({})]),
          $.div({ class: "progress-demo-value" }, "100%"),
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

export const Sizes: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "progress-story-container" }, [
        $.div({ class: "progress-demo progress-sm" }, [
          $.div({ class: "progress-demo-label" }, "Small"),
          Progress.Root({ value: 40 }, [Progress.Indicator({})]),
        ]),
        $.div({ class: "progress-demo" }, [
          $.div({ class: "progress-demo-label" }, "Default"),
          Progress.Root({ value: 60 }, [Progress.Indicator({})]),
        ]),
        $.div({ class: "progress-demo progress-lg" }, [
          $.div({ class: "progress-demo-label" }, "Large"),
          Progress.Root({ value: 80 }, [Progress.Indicator({})]),
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

export const Colors: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "progress-story-container" }, [
        $.div({ class: "progress-demo" }, [
          $.div({ class: "progress-demo-label" }, "Default (Blue/Purple)"),
          Progress.Root({ value: 60 }, [Progress.Indicator({})]),
        ]),
        $.div({ class: "progress-demo progress-success" }, [
          $.div({ class: "progress-demo-label" }, "Success (Green)"),
          Progress.Root({ value: 60 }, [Progress.Indicator({})]),
        ]),
        $.div({ class: "progress-demo progress-warning" }, [
          $.div({ class: "progress-demo-label" }, "Warning (Orange)"),
          Progress.Root({ value: 60 }, [Progress.Indicator({})]),
        ]),
        $.div({ class: "progress-demo progress-error" }, [
          $.div({ class: "progress-demo-label" }, "Error (Red)"),
          Progress.Root({ value: 60 }, [Progress.Indicator({})]),
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

export const Striped: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "progress-story-container" }, [
        $.div({ class: "progress-demo progress-striped" }, [
          $.div({ class: "progress-demo-label" }, "Striped (animated)"),
          Progress.Root({ value: 70 }, [Progress.Indicator({})]),
          $.div({ class: "progress-demo-value" }, "70%"),
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

export const CustomValueLabel: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "progress-story-container" }, [
        $.div({ class: "progress-demo" }, [
          $.div({ class: "progress-demo-label" }, "Steps completed"),
          Progress.Root({
            value: 3,
            max: 5,
            getValueLabel: (value, max) => `${value} of ${max} steps completed`,
          }, [Progress.Indicator({})]),
          $.div({ class: "progress-demo-value" }, "3 of 5 steps"),
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

export const Animated: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const progress = yield* Signal.make(0);

      // Animate progress
      const animate = () => {
        let value = 0;
        const interval = setInterval(() => {
          value += 2;
          if (value > 100) value = 0;
          Effect.runSync(progress.set(value));
        }, 50);
        return interval;
      };

      // Start animation
      const intervalId = animate();

      // Clean up on unmount (in a real app, this would be in a finalizer)
      setTimeout(() => clearInterval(intervalId), 60000);

      const valueText = progress.map((v) => `${v}%`);

      return yield* $.div({ class: "progress-story-container" }, [
        $.div({ class: "progress-demo" }, [
          $.div({ class: "progress-demo-label" }, "Animated Progress"),
          Progress.Root({ value: progress }, [Progress.Indicator({})]),
          $.div({ class: "progress-demo-value" }, valueText),
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
