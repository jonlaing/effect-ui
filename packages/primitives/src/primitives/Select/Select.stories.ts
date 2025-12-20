import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Select } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Select.stories.css";

type SelectStoryArgs = {
  placeholder?: string;
  disabled?: boolean;
};

const meta: Meta<SelectStoryArgs> = {
  title: "Primitives/Select",
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text when no value selected",
    },
    disabled: {
      control: "boolean",
      description: "Whether the select is disabled",
    },
  },
  args: {
    placeholder: "Select a fruit...",
    disabled: false,
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* Select.Root(
        { placeholder: args.placeholder, disabled: args.disabled },
        [
          Select.Trigger({}, [Select.Value({})]),
          Select.Content({}, [
            Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
            Select.Item({ value: "banana" }, Select.ItemText({}, "Banana")),
            Select.Item({ value: "orange" }, [Select.ItemText({}, "Orange")]),
            Select.Item({ value: "grape" }, [Select.ItemText({}, "Grape")]),
            Select.Item({ value: "mango" }, [Select.ItemText({}, "Mango")]),
          ]),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "select-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export default meta;
type Story = StoryObj<SelectStoryArgs>;

export const Default: Story = {};

export const WithDefaultValue: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Select.Root({ defaultValue: "banana" }, [
        Select.Trigger({}, [Select.Value({ placeholder: "Select..." })]),
        Select.Content({}, [
          Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
          Select.Item({ value: "banana" }, [Select.ItemText({}, "Banana")]),
          Select.Item({ value: "orange" }, [Select.ItemText({}, "Orange")]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "select-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithDisabledItem: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Select.Root({ placeholder: "Select..." }, [
        Select.Trigger({}, [Select.Value({})]),
        Select.Content({}, [
          Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
          Select.Item(
            {
              value: "banana",
              disabled: true,
            },
            [Select.ItemText({}, "Banana (unavailable)")],
          ),
          Select.Item({ value: "orange" }, [Select.ItemText({}, "Orange")]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "select-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithGroups: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Select.Root({ placeholder: "Select food..." }, [
        Select.Trigger({}, [Select.Value({})]),
        Select.Content({}, [
          Select.Group({}, [
            Select.Label({}, "Fruits"),
            Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
            Select.Item({ value: "banana" }, [Select.ItemText({}, "Banana")]),
            Select.Item({ value: "orange" }, [Select.ItemText({}, "Orange")]),
          ]),
          Select.Separator({}),
          Select.Group({}, [
            Select.Label({}, "Vegetables"),
            Select.Item({ value: "carrot" }, [Select.ItemText({}, "Carrot")]),
            Select.Item({ value: "broccoli" }, [
              Select.ItemText({}, "Broccoli"),
            ]),
            Select.Item({ value: "spinach" }, [Select.ItemText({}, "Spinach")]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "select-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make("orange");

      const statusText = document.createElement("p");
      statusText.style.fontSize = "14px";
      statusText.style.color = "#6b7280";
      statusText.style.marginBottom = "16px";

      // Update status text reactively
      yield* Effect.sync(() => {
        const updateStatus = () => {
          Effect.runSync(
            Effect.gen(function* () {
              const currentValue = yield* value.get;
              statusText.textContent = `Selected: ${currentValue || "none"}`;
            }),
          );
        };
        updateStatus();
        // Simple polling for demo - in real app would use subscription
        setInterval(updateStatus, 100);
      });

      const select = yield* Select.Root(
        {
          value,
          onValueChange: (v) => Effect.log(`Value changed to: ${v}`),
        },
        [
          Select.Trigger({}, [Select.Value({ placeholder: "Select..." })]),
          Select.Content({}, [
            Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
            Select.Item({ value: "banana" }, [Select.ItemText({}, "Banana")]),
            Select.Item({ value: "orange" }, [Select.ItemText({}, "Orange")]),
          ]),
        ],
      );

      const wrapper = document.createElement("div");
      wrapper.appendChild(statusText);
      wrapper.appendChild(select);
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "select-story-container";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const LongList: Story = {
  render: () => {
    const countries = [
      "Afghanistan",
      "Albania",
      "Algeria",
      "Argentina",
      "Australia",
      "Austria",
      "Belgium",
      "Brazil",
      "Canada",
      "Chile",
      "China",
      "Colombia",
      "Denmark",
      "Egypt",
      "Finland",
      "France",
      "Germany",
      "Greece",
      "India",
      "Indonesia",
      "Ireland",
      "Italy",
      "Japan",
      "Mexico",
      "Netherlands",
      "New Zealand",
      "Norway",
      "Poland",
      "Portugal",
      "Russia",
      "South Korea",
      "Spain",
      "Sweden",
      "Switzerland",
      "United Kingdom",
      "United States",
    ];

    const element = Effect.gen(function* () {
      return yield* Select.Root({ placeholder: "Select a country..." }, [
        Select.Trigger({}, [Select.Value({})]),
        Select.Content(
          {},
          countries.map((country) =>
            Select.Item(
              {
                value: country.toLowerCase().replace(/\s/g, "-"),
              },
              [Select.ItemText({}, country)],
            ),
          ),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "select-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const TopPositioned: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Select.Root({ placeholder: "Opens upward..." }, [
        Select.Trigger({}, [Select.Value({})]),
        Select.Content({ side: "top" }, [
          Select.Item({ value: "option1" }, [Select.ItemText({}, "Option 1")]),
          Select.Item({ value: "option2" }, [Select.ItemText({}, "Option 2")]),
          Select.Item({ value: "option3" }, [Select.ItemText({}, "Option 3")]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "select-story-container";
    container.style.alignItems = "flex-end";
    container.style.paddingTop = "200px";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
