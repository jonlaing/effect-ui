import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Slider, type SliderValue } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { span } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Slider.stories.css";

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
      return yield* Slider.Root(
        {
          defaultValue: 50,
          min: args.min,
          max: args.max,
          step: args.step,
          disabled: args.disabled,
        },
        [
          Slider.Track({}, [Slider.Range({})]),
          Slider.Thumb({ "aria-label": "Value" }),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "slider-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "slider-wrapper";
    wrapper.innerHTML = "<label>Volume</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const WithValue: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<SliderValue>(50);
      const valueDisplay = value.map((v) => String(v));

      const slider = yield* Slider.Root(
        {
          value,
          onValueChange: (v) => value.set(v),
        },
        [
          Slider.Track({}, [Slider.Range({})]),
          Slider.Thumb({ "aria-label": "Value" }),
        ],
      );

      const display = yield* span({ class: "slider-value" }, valueDisplay);

      const sliderWithValue = document.createElement("div");
      sliderWithValue.className = "slider-with-value";
      sliderWithValue.appendChild(slider);
      sliderWithValue.appendChild(display);

      return sliderWithValue as unknown as HTMLElement;
    });

    const container = document.createElement("div");
    container.className = "slider-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "slider-wrapper";
    wrapper.innerHTML = "<label>Value with display</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
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

      const slider = yield* Slider.Root(
        {
          value,
          onValueChange: (v) => value.set(v),
        },
        [
          Slider.Track({}, [Slider.Range({})]),
          Slider.Thumb({ "aria-label": "Minimum" }),
          Slider.Thumb({ "aria-label": "Maximum" }),
        ],
      );

      const display = yield* span({ class: "slider-value" }, valueDisplay);

      const sliderWithValue = document.createElement("div");
      sliderWithValue.className = "slider-with-value";
      sliderWithValue.appendChild(slider);
      sliderWithValue.appendChild(display);

      return sliderWithValue as unknown as HTMLElement;
    });

    const container = document.createElement("div");
    container.className = "slider-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "slider-wrapper";
    wrapper.innerHTML = "<label>Price Range</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const Vertical: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<SliderValue>(75);
      const valueDisplay = value.map((v) => `${v}%`);

      const slider = yield* Slider.Root(
        {
          value,
          onValueChange: (v) => value.set(v),
          orientation: "vertical",
        },
        [
          Slider.Track({}, [Slider.Range({})]),
          Slider.Thumb({ "aria-label": "Volume" }),
        ],
      );

      const display = yield* span({ class: "slider-value" }, valueDisplay);

      const verticalWrapper = document.createElement("div");
      verticalWrapper.className = "vertical-slider-wrapper";
      verticalWrapper.appendChild(slider);
      verticalWrapper.appendChild(display);

      return verticalWrapper as unknown as HTMLElement;
    });

    const container = document.createElement("div");
    container.className = "slider-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "slider-wrapper";
    wrapper.innerHTML = "<label>Vertical Slider</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const CustomStep: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<SliderValue>(50);
      const valueDisplay = value.map((v) => `${v}%`);

      const slider = yield* Slider.Root(
        {
          value,
          onValueChange: (v) => value.set(v),
          step: 10,
          min: 0,
          max: 100,
        },
        [
          Slider.Track({}, [Slider.Range({})]),
          Slider.Thumb({ "aria-label": "Value" }),
        ],
      );

      const display = yield* span({ class: "slider-value" }, valueDisplay);

      const sliderWithValue = document.createElement("div");
      sliderWithValue.className = "slider-with-value";
      sliderWithValue.appendChild(slider);
      sliderWithValue.appendChild(display);

      return sliderWithValue as unknown as HTMLElement;
    });

    const container = document.createElement("div");
    container.className = "slider-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "slider-wrapper";
    wrapper.innerHTML = "<label>Step: 10</label>";
    container.appendChild(wrapper);

    const marks = document.createElement("div");
    marks.className = "slider-marks";
    marks.innerHTML = "<span>0</span><span>50</span><span>100</span>";
    wrapper.appendChild(marks);

    renderEffectAsync(element).then((el) => {
      // Insert before marks
      wrapper.insertBefore(el, marks);
    });

    return container;
  },
};

export const Disabled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Slider.Root({ defaultValue: 50, disabled: true }, [
        Slider.Track({}, [Slider.Range({})]),
        Slider.Thumb({ "aria-label": "Value" }),
      ]);
    });

    const container = document.createElement("div");
    container.className = "slider-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "slider-wrapper";
    wrapper.innerHTML = "<label>Disabled</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const Inverted: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<SliderValue>(25);
      const valueDisplay = value.map((v) => `${v}`);

      const slider = yield* Slider.Root(
        {
          value,
          onValueChange: (v) => value.set(v),
          inverted: true,
        },
        [
          Slider.Track({}, [Slider.Range({})]),
          Slider.Thumb({ "aria-label": "Value" }),
        ],
      );

      const display = yield* span({ class: "slider-value" }, valueDisplay);

      const sliderWithValue = document.createElement("div");
      sliderWithValue.className = "slider-with-value";
      sliderWithValue.appendChild(slider);
      sliderWithValue.appendChild(display);

      return sliderWithValue as unknown as HTMLElement;
    });

    const container = document.createElement("div");
    container.className = "slider-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "slider-wrapper";
    wrapper.innerHTML = "<label>Inverted (right-to-left)</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
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

      const slider = yield* Slider.Root(
        {
          value,
          onValueChange: (v) => value.set(v),
          minStepsBetweenThumbs: 10,
        },
        [
          Slider.Track({}, [Slider.Range({})]),
          Slider.Thumb({ "aria-label": "Minimum" }),
          Slider.Thumb({ "aria-label": "Maximum" }),
        ],
      );

      const display = yield* span({ class: "slider-value" }, valueDisplay);

      const sliderWithValue = document.createElement("div");
      sliderWithValue.className = "slider-with-value";
      sliderWithValue.appendChild(slider);
      sliderWithValue.appendChild(display);

      return sliderWithValue as unknown as HTMLElement;
    });

    const container = document.createElement("div");
    container.className = "slider-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "slider-wrapper";
    wrapper.innerHTML =
      "<label>Min 10 steps between thumbs (thumbs can't get closer)</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};
