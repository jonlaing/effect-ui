import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Slider, type SliderValue } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

type SliderStoryArgs = {
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
};

const meta: Meta<SliderStoryArgs> = {
  title: "Primitives/Slider",
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the slider is disabled",
    },
    min: {
      control: "number",
      description: "Minimum value",
    },
    max: {
      control: "number",
      description: "Maximum value",
    },
    step: {
      control: "number",
      description: "Step increment",
    },
  },
  args: {
    disabled: false,
    min: 0,
    max: 100,
    step: 1,
  },
};

export default meta;
type Story = StoryObj<SliderStoryArgs>;

// Base styles for slider parts
const rootClass = "relative flex items-center w-full h-5";
const trackClass =
  "relative w-full h-2 bg-base-300 rounded-full cursor-pointer";
const rangeClass = "absolute h-full bg-primary rounded-full";
const thumbClass =
  "absolute w-5 h-5 bg-primary rounded-full border-2 border-base-100 shadow-md cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary/50 -translate-x-1/2";

export const Default: Story = {
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.label({ class: "text-sm font-medium" }, "Volume"),
        Slider.Root(
          {
            defaultValue: 50,
            min: args.min,
            max: args.max,
            step: args.step,
            disabled: args.disabled,
            class: rootClass,
          },
          [
            Slider.Track({ class: trackClass }, [
              Slider.Range({ class: rangeClass }),
            ]),
            Slider.Thumb({ "aria-label": "Value", class: thumbClass }),
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

export const WithValue: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<SliderValue>(50);

      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.div({ class: "flex justify-between items-center" }, [
          $.label({ class: "text-sm font-medium" }, "Value with display"),
          $.span(
            { class: "badge badge-neutral" },
            value.map((v) => String(v)),
          ),
        ]),
        Slider.Root(
          {
            value,
            onValueChange: (v) => value.set(v),
            class: rootClass,
          },
          [
            Slider.Track({ class: trackClass }, [
              Slider.Range({ class: rangeClass }),
            ]),
            Slider.Thumb({ "aria-label": "Value", class: thumbClass }),
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

export const RangeSlider: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<SliderValue>([25, 75] as const);
      const valueDisplay = value.map((v) => {
        const [min, max] = v as readonly [number, number];
        return `${min} - ${max}`;
      });

      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.div({ class: "flex justify-between items-center" }, [
          $.label({ class: "text-sm font-medium" }, "Price Range"),
          $.span({ class: "badge badge-neutral" }, valueDisplay),
        ]),
        Slider.Root(
          {
            value,
            onValueChange: (v) => value.set(v),
            class: rootClass,
          },
          [
            Slider.Track({ class: trackClass }, [
              Slider.Range({ class: `${rangeClass} bg-secondary` }),
            ]),
            Slider.Thumb({
              "aria-label": "Minimum",
              class: thumbClass.replace("bg-primary", "bg-secondary"),
            }),
            Slider.Thumb({
              "aria-label": "Maximum",
              class: thumbClass.replace("bg-primary", "bg-secondary"),
            }),
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

export const Vertical: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<SliderValue>(75);

      return yield* $.div({ class: "flex flex-col items-center gap-4" }, [
        $.label({ class: "text-sm font-medium" }, "Vertical Slider"),
        $.div({ class: "h-48 flex items-center" }, [
          Slider.Root(
            {
              value,
              onValueChange: (v) => value.set(v),
              orientation: "vertical",
              class: "relative flex justify-center w-5 h-full",
            },
            [
              Slider.Track(
                {
                  class:
                    "relative h-full w-2 bg-base-300 rounded-full cursor-pointer",
                },
                [Slider.Range({ class: `${rangeClass} bg-accent w-full` })],
              ),
              Slider.Thumb({
                "aria-label": "Volume",
                class: thumbClass
                  .replace("bg-primary", "bg-accent")
                  .replace("-translate-x-1/2", "-translate-y-1/2"),
              }),
            ],
          ),
        ]),
        $.span(
          { class: "badge badge-neutral" },
          value.map((v) => `${v}%`),
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

export const CustomStep: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<SliderValue>(50);

      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.div({ class: "flex justify-between items-center" }, [
          $.label({ class: "text-sm font-medium" }, "Step: 10"),
          $.span(
            { class: "badge badge-neutral" },
            value.map((v) => `${v}%`),
          ),
        ]),
        Slider.Root(
          {
            value,
            onValueChange: (v) => value.set(v),
            step: 10,
            min: 0,
            max: 100,
            class: rootClass,
          },
          [
            Slider.Track({ class: trackClass }, [
              Slider.Range({ class: rangeClass }),
            ]),
            Slider.Thumb({ "aria-label": "Value", class: thumbClass }),
          ],
        ),
        $.div(
          {
            class:
              "flex w-full justify-between text-xs text-base-content/70 px-2",
          },
          [
            $.span({}, "0"),
            $.span({}, "25"),
            $.span({}, "50"),
            $.span({}, "75"),
            $.span({}, "100"),
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

export const Disabled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.label(
          { class: "text-sm font-medium text-base-content/50" },
          "Disabled",
        ),
        Slider.Root(
          {
            defaultValue: 50,
            disabled: true,
            class: `${rootClass} opacity-50 cursor-not-allowed`,
          },
          [
            Slider.Track({ class: `${trackClass} cursor-not-allowed` }, [
              Slider.Range({ class: rangeClass }),
            ]),
            Slider.Thumb({
              "aria-label": "Value",
              class: `${thumbClass} cursor-not-allowed`,
            }),
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

export const Inverted: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<SliderValue>(25);

      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.div({ class: "flex justify-between items-center" }, [
          $.label({ class: "text-sm font-medium" }, "Inverted (right-to-left)"),
          $.span(
            { class: "badge badge-neutral" },
            value.map((v) => String(v)),
          ),
        ]),
        Slider.Root(
          {
            value,
            onValueChange: (v) => value.set(v),
            inverted: true,
            class: rootClass,
          },
          [
            Slider.Track({ class: trackClass }, [
              Slider.Range({ class: `${rangeClass} bg-warning` }),
            ]),
            Slider.Thumb({
              "aria-label": "Value",
              class: thumbClass.replace("bg-primary", "bg-warning"),
            }),
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

export const MinStepsBetweenThumbs: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<SliderValue>([30, 70] as const);
      const valueDisplay = value.map((v) => {
        const [min, max] = v as readonly [number, number];
        return `${min} - ${max}`;
      });

      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.div({ class: "flex justify-between items-center" }, [
          $.label({ class: "text-sm font-medium" }, "Min 10 steps between"),
          $.span({ class: "badge badge-neutral" }, valueDisplay),
        ]),
        Slider.Root(
          {
            value,
            onValueChange: (v) => value.set(v),
            minStepsBetweenThumbs: 10,
            class: rootClass,
          },
          [
            Slider.Track({ class: trackClass }, [
              Slider.Range({ class: `${rangeClass} bg-info` }),
            ]),
            Slider.Thumb({
              "aria-label": "Minimum",
              class: thumbClass.replace("bg-primary", "bg-info"),
            }),
            Slider.Thumb({
              "aria-label": "Maximum",
              class: thumbClass.replace("bg-primary", "bg-info"),
            }),
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

export const Sizes: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-6 w-64" }, [
        $.div({ class: "flex flex-col gap-2" }, [
          $.span({ class: "text-sm text-base-content/70" }, "Small"),
          Slider.Root(
            {
              defaultValue: 50,
              class: "relative flex items-center w-full h-4",
            },
            [
              Slider.Track(
                {
                  class:
                    "relative w-full h-1 bg-base-300 rounded-full cursor-pointer",
                },
                [
                  Slider.Range({
                    class: "absolute h-full bg-primary rounded-full",
                  }),
                ],
              ),
              Slider.Thumb({
                "aria-label": "Value",
                class:
                  "absolute w-3 h-3 bg-primary rounded-full border-2 border-base-100 shadow cursor-grab -translate-x-1/2",
              }),
            ],
          ),
        ]),
        $.div({ class: "flex flex-col gap-2" }, [
          $.span({ class: "text-sm text-base-content/70" }, "Medium (default)"),
          Slider.Root({ defaultValue: 50, class: rootClass }, [
            Slider.Track({ class: trackClass }, [
              Slider.Range({ class: rangeClass }),
            ]),
            Slider.Thumb({ "aria-label": "Value", class: thumbClass }),
          ]),
        ]),
        $.div({ class: "flex flex-col gap-2" }, [
          $.span({ class: "text-sm text-base-content/70" }, "Large"),
          Slider.Root(
            {
              defaultValue: 50,
              class: "relative flex items-center w-full h-8",
            },
            [
              Slider.Track(
                {
                  class:
                    "relative w-full h-3 bg-base-300 rounded-full cursor-pointer",
                },
                [
                  Slider.Range({
                    class: "absolute h-full bg-primary rounded-full",
                  }),
                ],
              ),
              Slider.Thumb({
                "aria-label": "Value",
                class:
                  "absolute w-7 h-7 bg-primary rounded-full border-2 border-base-100 shadow-md cursor-grab -translate-x-1/2",
              }),
            ],
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

export const Colors: Story = {
  render: () => {
    const makeSlider = (color: string) =>
      Slider.Root({ defaultValue: 60, class: rootClass }, [
        Slider.Track({ class: trackClass }, [
          Slider.Range({ class: `absolute h-full bg-${color} rounded-full` }),
        ]),
        Slider.Thumb({
          "aria-label": "Value",
          class: `absolute w-5 h-5 bg-${color} rounded-full border-2 border-base-100 shadow-md cursor-grab -translate-x-1/2`,
        }),
      ]);

    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-4 w-64" }, [
        $.div({ class: "flex flex-col gap-2" }, [
          $.span({ class: "text-sm" }, "Primary"),
          makeSlider("primary"),
        ]),
        $.div({ class: "flex flex-col gap-2" }, [
          $.span({ class: "text-sm" }, "Secondary"),
          makeSlider("secondary"),
        ]),
        $.div({ class: "flex flex-col gap-2" }, [
          $.span({ class: "text-sm" }, "Accent"),
          makeSlider("accent"),
        ]),
        $.div({ class: "flex flex-col gap-2" }, [
          $.span({ class: "text-sm text-success" }, "Success"),
          makeSlider("success"),
        ]),
        $.div({ class: "flex flex-col gap-2" }, [
          $.span({ class: "text-sm text-warning" }, "Warning"),
          makeSlider("warning"),
        ]),
        $.div({ class: "flex flex-col gap-2" }, [
          $.span({ class: "text-sm text-error" }, "Error"),
          makeSlider("error"),
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
