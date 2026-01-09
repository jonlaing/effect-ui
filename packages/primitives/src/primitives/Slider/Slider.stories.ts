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

export const Default: Story = {
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.label({ class: "label" }, [
          $.span({ class: "label-text" }, "Volume"),
        ]),
        Slider.Root(
          {
            defaultValue: 50,
            min: args.min,
            max: args.max,
            step: args.step,
            disabled: args.disabled,
            class: "range range-primary",
          },
          [
            Slider.Track({ class: "hidden" }, [Slider.Range({})]),
            Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
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
        $.div({ class: "flex justify-between" }, [
          $.label({ class: "label" }, [
            $.span({ class: "label-text" }, "Value with display"),
          ]),
          $.span(
            { class: "badge badge-neutral" },
            value.map((v) => String(v)),
          ),
        ]),
        Slider.Root(
          {
            value,
            onValueChange: (v) => value.set(v),
            class: "range range-primary",
          },
          [
            Slider.Track({ class: "hidden" }, [Slider.Range({})]),
            Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
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
        $.div({ class: "flex justify-between" }, [
          $.label({ class: "label" }, [
            $.span({ class: "label-text" }, "Price Range"),
          ]),
          $.span({ class: "badge badge-neutral" }, valueDisplay),
        ]),
        Slider.Root(
          {
            value,
            onValueChange: (v) => value.set(v),
            class: "range range-secondary",
          },
          [
            Slider.Track({ class: "hidden" }, [Slider.Range({})]),
            Slider.Thumb({ "aria-label": "Minimum", class: "hidden" }),
            Slider.Thumb({ "aria-label": "Maximum", class: "hidden" }),
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

      return yield* $.div({ class: "flex flex-col items-center gap-2" }, [
        $.label({ class: "label" }, [
          $.span({ class: "label-text" }, "Vertical Slider"),
        ]),
        $.div({ class: "h-48 flex items-center" }, [
          Slider.Root(
            {
              value,
              onValueChange: (v) => value.set(v),
              orientation: "vertical",
              class: "range range-accent range-lg",
            },
            [
              Slider.Track({ class: "hidden" }, [Slider.Range({})]),
              Slider.Thumb({ "aria-label": "Volume", class: "hidden" }),
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
        $.div({ class: "flex justify-between" }, [
          $.label({ class: "label" }, [
            $.span({ class: "label-text" }, "Step: 10"),
          ]),
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
            class: "range range-primary",
          },
          [
            Slider.Track({ class: "hidden" }, [Slider.Range({})]),
            Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
          ],
        ),
        $.div({ class: "flex w-full justify-between text-xs px-2" }, [
          $.span({}, "0"),
          $.span({}, "25"),
          $.span({}, "50"),
          $.span({}, "75"),
          $.span({}, "100"),
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

export const Disabled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "flex flex-col gap-2 w-64 opacity-50" }, [
        $.label({ class: "label" }, [
          $.span({ class: "label-text" }, "Disabled"),
        ]),
        Slider.Root({ defaultValue: 50, disabled: true, class: "range" }, [
          Slider.Track({ class: "hidden" }, [Slider.Range({})]),
          Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
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

export const Inverted: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<SliderValue>(25);

      return yield* $.div({ class: "flex flex-col gap-2 w-64" }, [
        $.div({ class: "flex justify-between" }, [
          $.label({ class: "label" }, [
            $.span({ class: "label-text" }, "Inverted (right-to-left)"),
          ]),
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
            class: "range range-warning",
          },
          [
            Slider.Track({ class: "hidden" }, [Slider.Range({})]),
            Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
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
        $.div({ class: "flex justify-between" }, [
          $.label({ class: "label" }, [
            $.span({ class: "label-text text-sm" }, "Min 10 steps between"),
          ]),
          $.span({ class: "badge badge-neutral" }, valueDisplay),
        ]),
        Slider.Root(
          {
            value,
            onValueChange: (v) => value.set(v),
            minStepsBetweenThumbs: 10,
            class: "range range-info",
          },
          [
            Slider.Track({ class: "hidden" }, [Slider.Range({})]),
            Slider.Thumb({ "aria-label": "Minimum", class: "hidden" }),
            Slider.Thumb({ "aria-label": "Maximum", class: "hidden" }),
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
    const element = $.div({ class: "flex flex-col gap-4 w-64" }, [
      $.div({ class: "flex flex-col gap-1" }, [
        $.span({ class: "text-sm text-base-content/70" }, "Extra Small"),
        Effect.gen(function* () {
          return yield* Slider.Root(
            { defaultValue: 50, class: "range range-xs range-primary" },
            [
              Slider.Track({ class: "hidden" }, [Slider.Range({})]),
              Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
            ],
          );
        }),
      ]),
      $.div({ class: "flex flex-col gap-1" }, [
        $.span({ class: "text-sm text-base-content/70" }, "Small"),
        Effect.gen(function* () {
          return yield* Slider.Root(
            { defaultValue: 50, class: "range range-sm range-primary" },
            [
              Slider.Track({ class: "hidden" }, [Slider.Range({})]),
              Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
            ],
          );
        }),
      ]),
      $.div({ class: "flex flex-col gap-1" }, [
        $.span({ class: "text-sm text-base-content/70" }, "Medium (default)"),
        Effect.gen(function* () {
          return yield* Slider.Root(
            { defaultValue: 50, class: "range range-md range-primary" },
            [
              Slider.Track({ class: "hidden" }, [Slider.Range({})]),
              Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
            ],
          );
        }),
      ]),
      $.div({ class: "flex flex-col gap-1" }, [
        $.span({ class: "text-sm text-base-content/70" }, "Large"),
        Effect.gen(function* () {
          return yield* Slider.Root(
            { defaultValue: 50, class: "range range-lg range-primary" },
            [
              Slider.Track({ class: "hidden" }, [Slider.Range({})]),
              Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
            ],
          );
        }),
      ]),
    ]);

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
    const element = $.div({ class: "flex flex-col gap-4 w-64" }, [
      $.div({ class: "flex flex-col gap-1" }, [
        $.span({ class: "text-sm" }, "Primary"),
        Effect.gen(function* () {
          return yield* Slider.Root(
            { defaultValue: 60, class: "range range-primary" },
            [
              Slider.Track({ class: "hidden" }, [Slider.Range({})]),
              Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
            ],
          );
        }),
      ]),
      $.div({ class: "flex flex-col gap-1" }, [
        $.span({ class: "text-sm" }, "Secondary"),
        Effect.gen(function* () {
          return yield* Slider.Root(
            { defaultValue: 60, class: "range range-secondary" },
            [
              Slider.Track({ class: "hidden" }, [Slider.Range({})]),
              Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
            ],
          );
        }),
      ]),
      $.div({ class: "flex flex-col gap-1" }, [
        $.span({ class: "text-sm" }, "Accent"),
        Effect.gen(function* () {
          return yield* Slider.Root(
            { defaultValue: 60, class: "range range-accent" },
            [
              Slider.Track({ class: "hidden" }, [Slider.Range({})]),
              Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
            ],
          );
        }),
      ]),
      $.div({ class: "flex flex-col gap-1" }, [
        $.span({ class: "text-sm text-success" }, "Success"),
        Effect.gen(function* () {
          return yield* Slider.Root(
            { defaultValue: 60, class: "range range-success" },
            [
              Slider.Track({ class: "hidden" }, [Slider.Range({})]),
              Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
            ],
          );
        }),
      ]),
      $.div({ class: "flex flex-col gap-1" }, [
        $.span({ class: "text-sm text-warning" }, "Warning"),
        Effect.gen(function* () {
          return yield* Slider.Root(
            { defaultValue: 60, class: "range range-warning" },
            [
              Slider.Track({ class: "hidden" }, [Slider.Range({})]),
              Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
            ],
          );
        }),
      ]),
      $.div({ class: "flex flex-col gap-1" }, [
        $.span({ class: "text-sm text-error" }, "Error"),
        Effect.gen(function* () {
          return yield* Slider.Root(
            { defaultValue: 60, class: "range range-error" },
            [
              Slider.Track({ class: "hidden" }, [Slider.Range({})]),
              Slider.Thumb({ "aria-label": "Value", class: "hidden" }),
            ],
          );
        }),
      ]),
    ]);

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
