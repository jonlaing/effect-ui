import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Combobox } from "../primitives/Combobox";
import { Signal } from "@core/Signal";
import { renderEffectAsync } from "./helpers";

import "./combobox.css";

type ComboboxStoryArgs = {
  disabled?: boolean;
  placeholder?: string;
};

const meta: Meta<ComboboxStoryArgs> = {
  title: "Primitives/Combobox",
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the combobox is disabled",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text for the input",
    },
  },
  args: {
    disabled: false,
    placeholder: "Search...",
  },
};

export default meta;
type Story = StoryObj<ComboboxStoryArgs>;

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry" },
  { value: "fig", label: "Fig" },
  { value: "grape", label: "Grape" },
  { value: "honeydew", label: "Honeydew" },
];

export const Default: Story = {
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* Combobox.Root({ disabled: args.disabled }, [
        Combobox.Input({ placeholder: args.placeholder }),
        Combobox.Content(
          {},
          fruits.map((fruit) =>
            Combobox.Item({ value: fruit.value }, [
              Combobox.ItemText({}, fruit.label),
            ]),
          ),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "combobox-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "combobox-wrapper";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const WithLabel: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Combobox.Root({}, [
        Combobox.Input({ placeholder: "Search fruits..." }),
        Combobox.Content(
          {},
          fruits.map((fruit) =>
            Combobox.Item({ value: fruit.value }, [
              Combobox.ItemText({}, fruit.label),
            ]),
          ),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "combobox-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "combobox-wrapper";
    wrapper.innerHTML = "<label>Fruit</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const WithGroups: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Combobox.Root({}, [
        Combobox.Input({ placeholder: "Search foods..." }),
        Combobox.Content({}, [
          Combobox.Group({}, [
            Combobox.Label({}, "Fruits"),
            Combobox.Item({ value: "apple" }, [Combobox.ItemText({}, "Apple")]),
            Combobox.Item({ value: "banana" }, [
              Combobox.ItemText({}, "Banana"),
            ]),
            Combobox.Item({ value: "cherry" }, [
              Combobox.ItemText({}, "Cherry"),
            ]),
          ]),
          Combobox.Group({}, [
            Combobox.Label({}, "Vegetables"),
            Combobox.Item({ value: "carrot" }, [
              Combobox.ItemText({}, "Carrot"),
            ]),
            Combobox.Item({ value: "broccoli" }, [
              Combobox.ItemText({}, "Broccoli"),
            ]),
            Combobox.Item({ value: "spinach" }, [
              Combobox.ItemText({}, "Spinach"),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "combobox-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "combobox-wrapper";
    wrapper.innerHTML = "<label>Food</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const WithDisabledItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Combobox.Root({}, [
        Combobox.Input({ placeholder: "Select a plan..." }),
        Combobox.Content({}, [
          Combobox.Item({ value: "free" }, [Combobox.ItemText({}, "Free")]),
          Combobox.Item({ value: "basic" }, [Combobox.ItemText({}, "Basic")]),
          Combobox.Item({ value: "pro" }, [Combobox.ItemText({}, "Pro")]),
          Combobox.Item({ value: "enterprise", disabled: true }, [
            Combobox.ItemText({}, "Enterprise (Coming Soon)"),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "combobox-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "combobox-wrapper";
    wrapper.innerHTML = "<label>Plan</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const WithLoadingState: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      // Demonstrate loading state with static loading=true
      const isLoading = yield* Signal.make(true);

      // After 2 seconds, set loading to false
      setTimeout(() => {
        Effect.runSync(isLoading.set(false));
      }, 2000);

      return yield* Combobox.Root({ isLoading }, [
        Combobox.Input({ placeholder: "Loading demo..." }),
        Combobox.Content({}, [
          Combobox.Loading({}, "Searching..."),
          Combobox.Empty({}, "No results found"),
          ...fruits.map((fruit) =>
            Combobox.Item({ value: fruit.value }, [
              Combobox.ItemText({}, fruit.label),
            ]),
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "combobox-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "combobox-wrapper";
    wrapper.innerHTML = "<label>Loading State (loads after 2s)</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make("banana");

      return yield* Combobox.Root(
        {
          value,
          onValueChange: (v) => value.set(v),
        },
        [
          Combobox.Input({ placeholder: "Search fruits..." }),
          Combobox.Content(
            {},
            fruits.map((fruit) =>
              Combobox.Item({ value: fruit.value }, [
                Combobox.ItemText({}, fruit.label),
              ]),
            ),
          ),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "combobox-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "combobox-wrapper";
    wrapper.innerHTML = "<label>Pre-selected Value</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const Disabled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Combobox.Root({ disabled: true }, [
        Combobox.Input({ placeholder: "This is disabled" }),
        Combobox.Content(
          {},
          fruits.map((fruit) =>
            Combobox.Item({ value: fruit.value }, [
              Combobox.ItemText({}, fruit.label),
            ]),
          ),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "combobox-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "combobox-wrapper";
    wrapper.innerHTML = "<label>Disabled Combobox</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const WithFiltering: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Combobox.Root({}, [
        Combobox.Input({ placeholder: "Type to filter fruits..." }),
        Combobox.Content({}, [
          Combobox.Empty({}, "No fruits found"),
          ...fruits.map((fruit) =>
            Combobox.Item({ value: fruit.value }, [
              Combobox.ItemText({}, fruit.label),
            ]),
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "combobox-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "combobox-wrapper";
    wrapper.innerHTML = "<label>Filtered (try typing 'ap' or 'berry')</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const CustomFilterFn: Story = {
  render: () => {
    // Custom filter that only matches from the start of the string
    const startsWithFilter = (inputValue: string, itemTextValue: string) =>
      itemTextValue.toLowerCase().startsWith(inputValue.toLowerCase());

    const element = Effect.gen(function* () {
      return yield* Combobox.Root({ filterFn: startsWithFilter }, [
        Combobox.Input({ placeholder: "Type to filter (starts with)..." }),
        Combobox.Content({}, [
          Combobox.Empty({}, "No fruits found"),
          ...fruits.map((fruit) =>
            Combobox.Item({ value: fruit.value }, [
              Combobox.ItemText({}, fruit.label),
            ]),
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "combobox-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "combobox-wrapper";
    wrapper.innerHTML =
      "<label>Starts With Filter (try 'ch' for Cherry)</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};

export const NoFiltering: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Combobox.Root({ filterFn: null }, [
        Combobox.Input({ placeholder: "Type anything (no filtering)..." }),
        Combobox.Content(
          {},
          fruits.map((fruit) =>
            Combobox.Item({ value: fruit.value }, [
              Combobox.ItemText({}, fruit.label),
            ]),
          ),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "combobox-story-container";
    const wrapper = document.createElement("div");
    wrapper.className = "combobox-wrapper";
    wrapper.innerHTML =
      "<label>No Filtering (all items always visible)</label>";
    container.appendChild(wrapper);

    renderEffectAsync(element).then((el) => {
      wrapper.appendChild(el);
    });

    return container;
  },
};
