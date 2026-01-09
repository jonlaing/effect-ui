import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Select } from "@effex/primitives";
import { Signal } from "@effex/dom";
import { $ } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

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
          Select.Trigger({ class: "select select-bordered w-full max-w-xs" }, [
            Select.Value({}),
          ]),
          Select.Content(
            {
              class:
                "dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow-lg",
            },
            [
              Select.Item(
                {
                  value: "apple",
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Select.ItemText({}, "Apple")],
              ),
              Select.Item(
                {
                  value: "banana",
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                Select.ItemText({}, "Banana"),
              ),
              Select.Item(
                {
                  value: "orange",
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Select.ItemText({}, "Orange")],
              ),
              Select.Item(
                {
                  value: "grape",
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Select.ItemText({}, "Grape")],
              ),
              Select.Item(
                {
                  value: "mango",
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Select.ItemText({}, "Mango")],
              ),
            ],
          ),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

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
        Select.Trigger({ class: "select select-bordered w-full max-w-xs" }, [
          Select.Value({ placeholder: "Select..." }),
        ]),
        Select.Content(
          {
            class:
              "dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow-lg",
          },
          [
            Select.Item(
              {
                value: "apple",
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
              },
              [Select.ItemText({}, "Apple")],
            ),
            Select.Item(
              {
                value: "banana",
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
              },
              [Select.ItemText({}, "Banana")],
            ),
            Select.Item(
              {
                value: "orange",
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
              },
              [Select.ItemText({}, "Orange")],
            ),
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
  args: {
    disabled: true,
  },
};

export const WithDisabledItem: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Select.Root({ placeholder: "Select..." }, [
        Select.Trigger({ class: "select select-bordered w-full max-w-xs" }, [
          Select.Value({}),
        ]),
        Select.Content(
          {
            class:
              "dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow-lg",
          },
          [
            Select.Item(
              {
                value: "apple",
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
              },
              [Select.ItemText({}, "Apple")],
            ),
            Select.Item(
              {
                value: "banana",
                disabled: true,
                class: "rounded-btn p-2 cursor-not-allowed opacity-50",
              },
              [Select.ItemText({}, "Banana (unavailable)")],
            ),
            Select.Item(
              {
                value: "orange",
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
              },
              [Select.ItemText({}, "Orange")],
            ),
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

export const WithGroups: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Select.Root({ placeholder: "Select food..." }, [
        Select.Trigger({ class: "select select-bordered w-full max-w-xs" }, [
          Select.Value({}),
        ]),
        Select.Content(
          {
            class:
              "dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow-lg",
          },
          [
            Select.Group({}, [
              Select.Label({ class: "menu-title" }, "Fruits"),
              Select.Item(
                {
                  value: "apple",
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Select.ItemText({}, "Apple")],
              ),
              Select.Item(
                {
                  value: "banana",
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Select.ItemText({}, "Banana")],
              ),
              Select.Item(
                {
                  value: "orange",
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Select.ItemText({}, "Orange")],
              ),
            ]),
            Select.Separator({ class: "divider my-1" }),
            Select.Group({}, [
              Select.Label({ class: "menu-title" }, "Vegetables"),
              Select.Item(
                {
                  value: "carrot",
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Select.ItemText({}, "Carrot")],
              ),
              Select.Item(
                {
                  value: "broccoli",
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Select.ItemText({}, "Broccoli")],
              ),
              Select.Item(
                {
                  value: "spinach",
                  class:
                    "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                },
                [Select.ItemText({}, "Spinach")],
              ),
            ]),
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

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make("orange");

      return yield* $.div({ class: "flex flex-col gap-4 items-center" }, [
        $.div(
          { class: "badge badge-neutral" },
          value.map((v) => `Selected: ${v || "none"}`),
        ),
        Select.Root(
          {
            value,
            onValueChange: (v) => Effect.log(`Value changed to: ${v}`),
          },
          [
            Select.Trigger(
              { class: "select select-bordered w-full max-w-xs" },
              [Select.Value({ placeholder: "Select..." })],
            ),
            Select.Content(
              {
                class:
                  "dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow-lg",
              },
              [
                Select.Item(
                  {
                    value: "apple",
                    class:
                      "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Select.ItemText({}, "Apple")],
                ),
                Select.Item(
                  {
                    value: "banana",
                    class:
                      "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Select.ItemText({}, "Banana")],
                ),
                Select.Item(
                  {
                    value: "orange",
                    class:
                      "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
                  },
                  [Select.ItemText({}, "Orange")],
                ),
              ],
            ),
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
        Select.Trigger({ class: "select select-bordered w-full max-w-xs" }, [
          Select.Value({}),
        ]),
        Select.Content(
          {
            class:
              "dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow-lg max-h-60 overflow-y-auto",
          },
          countries.map((country) =>
            Select.Item(
              {
                value: country.toLowerCase().replace(/\s/g, "-"),
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
              },
              [Select.ItemText({}, country)],
            ),
          ),
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

export const TopPositioned: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Select.Root({ placeholder: "Opens upward..." }, [
        Select.Trigger({ class: "select select-bordered w-full max-w-xs" }, [
          Select.Value({}),
        ]),
        Select.Content(
          {
            side: "top",
            class:
              "dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow-lg",
          },
          [
            Select.Item(
              {
                value: "option1",
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
              },
              [Select.ItemText({}, "Option 1")],
            ),
            Select.Item(
              {
                value: "option2",
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
              },
              [Select.ItemText({}, "Option 2")],
            ),
            Select.Item(
              {
                value: "option3",
                class:
                  "rounded-btn hover:bg-base-300 p-2 cursor-pointer data-[highlighted]:bg-primary data-[highlighted]:text-primary-content",
              },
              [Select.ItemText({}, "Option 3")],
            ),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4 pt-48 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Sizes: Story = {
  render: () => {
    const element = $.div({ class: "flex flex-col gap-4" }, [
      Effect.gen(function* () {
        return yield* $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm text-base-content/70" }, "Extra Small"),
          Select.Root({ placeholder: "Select..." }, [
            Select.Trigger(
              { class: "select select-bordered select-xs w-full max-w-xs" },
              [Select.Value({})],
            ),
            Select.Content(
              {
                class:
                  "dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow-lg",
              },
              [
                Select.Item(
                  {
                    value: "option1",
                    class:
                      "rounded-btn hover:bg-base-300 p-2 cursor-pointer text-sm",
                  },
                  [Select.ItemText({}, "Option 1")],
                ),
                Select.Item(
                  {
                    value: "option2",
                    class:
                      "rounded-btn hover:bg-base-300 p-2 cursor-pointer text-sm",
                  },
                  [Select.ItemText({}, "Option 2")],
                ),
              ],
            ),
          ]),
        ]);
      }),
      Effect.gen(function* () {
        return yield* $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm text-base-content/70" }, "Small"),
          Select.Root({ placeholder: "Select..." }, [
            Select.Trigger(
              { class: "select select-bordered select-sm w-full max-w-xs" },
              [Select.Value({})],
            ),
            Select.Content(
              {
                class:
                  "dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow-lg",
              },
              [
                Select.Item(
                  {
                    value: "option1",
                    class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                  },
                  [Select.ItemText({}, "Option 1")],
                ),
                Select.Item(
                  {
                    value: "option2",
                    class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                  },
                  [Select.ItemText({}, "Option 2")],
                ),
              ],
            ),
          ]),
        ]);
      }),
      Effect.gen(function* () {
        return yield* $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm text-base-content/70" }, "Medium (default)"),
          Select.Root({ placeholder: "Select..." }, [
            Select.Trigger(
              { class: "select select-bordered w-full max-w-xs" },
              [Select.Value({})],
            ),
            Select.Content(
              {
                class:
                  "dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow-lg",
              },
              [
                Select.Item(
                  {
                    value: "option1",
                    class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                  },
                  [Select.ItemText({}, "Option 1")],
                ),
                Select.Item(
                  {
                    value: "option2",
                    class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                  },
                  [Select.ItemText({}, "Option 2")],
                ),
              ],
            ),
          ]),
        ]);
      }),
      Effect.gen(function* () {
        return yield* $.div({ class: "flex flex-col gap-1" }, [
          $.span({ class: "text-sm text-base-content/70" }, "Large"),
          Select.Root({ placeholder: "Select..." }, [
            Select.Trigger(
              { class: "select select-bordered select-lg w-full max-w-xs" },
              [Select.Value({})],
            ),
            Select.Content(
              {
                class:
                  "dropdown-content menu bg-base-200 rounded-box z-10 w-52 p-2 shadow-lg",
              },
              [
                Select.Item(
                  {
                    value: "option1",
                    class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                  },
                  [Select.ItemText({}, "Option 1")],
                ),
                Select.Item(
                  {
                    value: "option2",
                    class: "rounded-btn hover:bg-base-300 p-2 cursor-pointer",
                  },
                  [Select.ItemText({}, "Option 2")],
                ),
              ],
            ),
          ]),
        ]);
      }),
    ]);

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
