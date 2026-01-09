import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Progress } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { $ } from "@effex/dom";
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
            class: "progress progress-primary",
          },
          [Progress.Indicator({})],
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
        Progress.Root({ value: null, class: "progress" }, [
          Progress.Indicator({}),
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
        Progress.Root(
          { value: 100, max: 100, class: "progress progress-success" },
          [Progress.Indicator({})],
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

export const Colors: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-4 w-64" }, [
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm" }, "Primary"),
          Progress.Root({ value: 60, class: "progress progress-primary" }, [
            Progress.Indicator({}),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm" }, "Secondary"),
          Progress.Root({ value: 60, class: "progress progress-secondary" }, [
            Progress.Indicator({}),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm" }, "Accent"),
          Progress.Root({ value: 60, class: "progress progress-accent" }, [
            Progress.Indicator({}),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm text-success" }, "Success"),
          Progress.Root({ value: 60, class: "progress progress-success" }, [
            Progress.Indicator({}),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm text-warning" }, "Warning"),
          Progress.Root({ value: 60, class: "progress progress-warning" }, [
            Progress.Indicator({}),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm text-error" }, "Error"),
          Progress.Root({ value: 60, class: "progress progress-error" }, [
            Progress.Indicator({}),
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
            class: "progress progress-info",
            getValueLabel: (value, max) => `${value} of ${max} steps completed`,
          },
          [Progress.Indicator({})],
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
        Progress.Root({ value: progress, class: "progress progress-primary" }, [
          Progress.Indicator({}),
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
