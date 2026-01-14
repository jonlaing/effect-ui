import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";

import { $, Signal } from "@effex/dom";
import { Combobox } from "@effex/primitives";

import { renderEffectAsync } from "../../storyHelpers";

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
        Combobox.Input({
          placeholder: args.placeholder,
          class: "input input-bordered w-full max-w-xs",
        }),
        Combobox.Content(
          {
            class:
              "menu bg-base-200 rounded-box shadow-xl w-full max-w-xs p-2 mt-1",
          },
          fruits.map((fruit) =>
            Combobox.Item(
              {
                value: fruit.value,
                class:
                  "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
              },
              [Combobox.ItemText({}, fruit.label)],
            ),
          ),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[300px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithLabel: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "form-control w-full max-w-xs" }, [
        $.label({ class: "label" }, [$.span({ class: "label-text" }, "Fruit")]),
        Combobox.Root({}, [
          Combobox.Input({
            placeholder: "Search fruits...",
            class: "input input-bordered w-full",
          }),
          Combobox.Content(
            { class: "menu bg-base-200 rounded-box shadow-xl w-full p-2 mt-1" },
            fruits.map((fruit) =>
              Combobox.Item(
                {
                  value: fruit.value,
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Combobox.ItemText({}, fruit.label)],
              ),
            ),
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[300px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithGroups: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "form-control w-full max-w-xs" }, [
        $.label({ class: "label" }, [$.span({ class: "label-text" }, "Food")]),
        Combobox.Root({}, [
          Combobox.Input({
            placeholder: "Search foods...",
            class: "input input-bordered w-full",
          }),
          Combobox.Content(
            { class: "menu bg-base-200 rounded-box shadow-xl w-full p-2 mt-1" },
            [
              Combobox.Group({}, [
                Combobox.Label(
                  {
                    class:
                      "menu-title text-xs uppercase text-base-content/50 px-3 py-1",
                  },
                  "Fruits",
                ),
                Combobox.Item(
                  {
                    value: "apple",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Combobox.ItemText({}, "Apple")],
                ),
                Combobox.Item(
                  {
                    value: "banana",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Combobox.ItemText({}, "Banana")],
                ),
                Combobox.Item(
                  {
                    value: "cherry",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Combobox.ItemText({}, "Cherry")],
                ),
              ]),
              Combobox.Group({ class: "mt-2" }, [
                Combobox.Label(
                  {
                    class:
                      "menu-title text-xs uppercase text-base-content/50 px-3 py-1",
                  },
                  "Vegetables",
                ),
                Combobox.Item(
                  {
                    value: "carrot",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Combobox.ItemText({}, "Carrot")],
                ),
                Combobox.Item(
                  {
                    value: "broccoli",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Combobox.ItemText({}, "Broccoli")],
                ),
                Combobox.Item(
                  {
                    value: "spinach",
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Combobox.ItemText({}, "Spinach")],
                ),
              ]),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[400px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithDisabledItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "form-control w-full max-w-xs" }, [
        $.label({ class: "label" }, [$.span({ class: "label-text" }, "Plan")]),
        Combobox.Root({}, [
          Combobox.Input({
            placeholder: "Select a plan...",
            class: "input input-bordered w-full",
          }),
          Combobox.Content(
            { class: "menu bg-base-200 rounded-box shadow-xl w-full p-2 mt-1" },
            [
              Combobox.Item(
                {
                  value: "free",
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Combobox.ItemText({}, "Free")],
              ),
              Combobox.Item(
                {
                  value: "basic",
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Combobox.ItemText({}, "Basic")],
              ),
              Combobox.Item(
                {
                  value: "pro",
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Combobox.ItemText({}, "Pro")],
              ),
              Combobox.Item(
                {
                  value: "enterprise",
                  disabled: true,
                  class: "rounded-btn px-3 py-2 opacity-50 cursor-not-allowed",
                },
                [Combobox.ItemText({}, "Enterprise (Coming Soon)")],
              ),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[300px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithLoadingState: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const isLoading = yield* Signal.make(true);

      setTimeout(() => {
        Effect.runSync(isLoading.set(false));
      }, 2000);

      return yield* $.div({ class: "form-control w-full max-w-xs" }, [
        $.label({ class: "label" }, [
          $.span({ class: "label-text" }, "Loading State (loads after 2s)"),
        ]),
        Combobox.Root({ isLoading }, [
          Combobox.Input({
            placeholder: "Loading demo...",
            class: "input input-bordered w-full",
          }),
          Combobox.Content(
            { class: "menu bg-base-200 rounded-box shadow-xl w-full p-2 mt-1" },
            [
              Combobox.Loading(
                { class: "flex items-center justify-center py-4" },
                [
                  $.span({ class: "loading loading-spinner loading-sm mr-2" }),
                  "Searching...",
                ],
              ),
              Combobox.Empty(
                { class: "text-center py-4 text-base-content/50" },
                "No results found",
              ),
              ...fruits.map((fruit) =>
                Combobox.Item(
                  {
                    value: fruit.value,
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Combobox.ItemText({}, fruit.label)],
                ),
              ),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[300px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make("banana");

      return yield* $.div({ class: "flex flex-col gap-4" }, [
        $.div(
          { class: "badge badge-primary" },
          value.map((v) => `Selected: ${v}`),
        ),
        $.div({ class: "form-control w-full max-w-xs" }, [
          $.label({ class: "label" }, [
            $.span({ class: "label-text" }, "Pre-selected Value"),
          ]),
          Combobox.Root(
            {
              value,
              onValueChange: (v) => value.set(v),
            },
            [
              Combobox.Input({
                placeholder: "Search fruits...",
                class: "input input-bordered w-full",
              }),
              Combobox.Content(
                {
                  class:
                    "menu bg-base-200 rounded-box shadow-xl w-full p-2 mt-1",
                },
                fruits.map((fruit) =>
                  Combobox.Item(
                    {
                      value: fruit.value,
                      class:
                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                    },
                    [Combobox.ItemText({}, fruit.label)],
                  ),
                ),
              ),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[300px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Disabled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "form-control w-full max-w-xs" }, [
        $.label({ class: "label" }, [
          $.span({ class: "label-text" }, "Disabled Combobox"),
        ]),
        Combobox.Root({ disabled: true }, [
          Combobox.Input({
            placeholder: "This is disabled",
            class: "input input-bordered w-full input-disabled",
          }),
          Combobox.Content(
            { class: "menu bg-base-200 rounded-box shadow-xl w-full p-2 mt-1" },
            fruits.map((fruit) =>
              Combobox.Item(
                {
                  value: fruit.value,
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                },
                [Combobox.ItemText({}, fruit.label)],
              ),
            ),
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

export const WithFiltering: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "form-control w-full max-w-xs" }, [
        $.label({ class: "label" }, [
          $.span(
            { class: "label-text" },
            "Filtered (try typing 'ap' or 'berry')",
          ),
        ]),
        Combobox.Root({}, [
          Combobox.Input({
            placeholder: "Type to filter fruits...",
            class: "input input-bordered w-full",
          }),
          Combobox.Content(
            { class: "menu bg-base-200 rounded-box shadow-xl w-full p-2 mt-1" },
            [
              Combobox.Empty(
                { class: "text-center py-4 text-base-content/50" },
                "No fruits found",
              ),
              ...fruits.map((fruit) =>
                Combobox.Item(
                  {
                    value: fruit.value,
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Combobox.ItemText({}, fruit.label)],
                ),
              ),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[300px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const CustomFilterFn: Story = {
  render: () => {
    const startsWithFilter = (inputValue: string, itemTextValue: string) =>
      itemTextValue.toLowerCase().startsWith(inputValue.toLowerCase());

    const element = Effect.gen(function* () {
      return yield* $.div({ class: "form-control w-full max-w-xs" }, [
        $.label({ class: "label" }, [
          $.span(
            { class: "label-text" },
            "Starts With Filter (try 'ch' for Cherry)",
          ),
        ]),
        Combobox.Root({ filterFn: startsWithFilter }, [
          Combobox.Input({
            placeholder: "Type to filter (starts with)...",
            class: "input input-bordered w-full",
          }),
          Combobox.Content(
            { class: "menu bg-base-200 rounded-box shadow-xl w-full p-2 mt-1" },
            [
              Combobox.Empty(
                { class: "text-center py-4 text-base-content/50" },
                "No fruits found",
              ),
              ...fruits.map((fruit) =>
                Combobox.Item(
                  {
                    value: fruit.value,
                    class:
                      "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Combobox.ItemText({}, fruit.label)],
                ),
              ),
            ],
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[300px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const NoFiltering: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "form-control w-full max-w-xs" }, [
        $.label({ class: "label" }, [
          $.span(
            { class: "label-text" },
            "No Filtering (all items always visible)",
          ),
        ]),
        Combobox.Root({ filterFn: null }, [
          Combobox.Input({
            placeholder: "Type anything (no filtering)...",
            class: "input input-bordered w-full",
          }),
          Combobox.Content(
            { class: "menu bg-base-200 rounded-box shadow-xl w-full p-2 mt-1" },
            fruits.map((fruit) =>
              Combobox.Item(
                {
                  value: fruit.value,
                  class:
                    "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Combobox.ItemText({}, fruit.label)],
              ),
            ),
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[300px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
