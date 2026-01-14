import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { RadioGroup } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

type RadioGroupStoryArgs = {
  defaultValue?: string;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  required?: boolean;
};

const meta: Meta<RadioGroupStoryArgs> = {
  title: "Primitives/RadioGroup",
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "Default selected value",
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Layout orientation",
    },
    disabled: {
      control: "boolean",
      description: "Disable entire group",
    },
    required: {
      control: "boolean",
      description: "Whether selection is required",
    },
  },
  args: {
    defaultValue: "comfortable",
    orientation: "vertical",
    disabled: false,
    required: false,
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* RadioGroup.Root(
        {
          defaultValue: args.defaultValue,
          orientation: args.orientation,
          disabled: args.disabled,
          required: args.required,
          name: "spacing",
          class: "flex flex-col gap-2",
        },
        [
          $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
            RadioGroup.Item({
              value: "default",
              id: "r1",
              class: "radio radio-primary",
            }),
            $.span({ class: "label-text" }, "Default"),
          ]),
          $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
            RadioGroup.Item({
              value: "comfortable",
              id: "r2",
              class: "radio radio-primary",
            }),
            $.span({ class: "label-text" }, "Comfortable"),
          ]),
          $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
            RadioGroup.Item({
              value: "compact",
              id: "r3",
              class: "radio radio-primary",
            }),
            $.span({ class: "label-text" }, "Compact"),
          ]),
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
type Story = StoryObj<RadioGroupStoryArgs>;

export const Default: Story = {};

export const Horizontal: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* RadioGroup.Root(
        {
          defaultValue: "comfortable",
          orientation: "horizontal",
          class: "flex gap-4",
        },
        [
          $.label({ class: "label cursor-pointer gap-2" }, [
            RadioGroup.Item({ value: "default", class: "radio radio-primary" }),
            $.span({ class: "label-text" }, "Default"),
          ]),
          $.label({ class: "label cursor-pointer gap-2" }, [
            RadioGroup.Item({
              value: "comfortable",
              class: "radio radio-primary",
            }),
            $.span({ class: "label-text" }, "Comfortable"),
          ]),
          $.label({ class: "label cursor-pointer gap-2" }, [
            RadioGroup.Item({ value: "compact", class: "radio radio-primary" }),
            $.span({ class: "label-text" }, "Compact"),
          ]),
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

export const WithDisabledItem: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* RadioGroup.Root(
        { defaultValue: "option1", class: "flex flex-col gap-2" },
        [
          $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
            RadioGroup.Item({ value: "option1", class: "radio radio-primary" }),
            $.span({ class: "label-text" }, "Option 1"),
          ]),
          $.label(
            {
              class: "label cursor-not-allowed gap-3 justify-start opacity-50",
            },
            [
              RadioGroup.Item({
                value: "option2",
                class: "radio radio-primary",
                disabled: true,
              }),
              $.span({ class: "label-text" }, "Option 2 (Disabled)"),
            ],
          ),
          $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
            RadioGroup.Item({ value: "option3", class: "radio radio-primary" }),
            $.span({ class: "label-text" }, "Option 3"),
          ]),
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

export const DisabledGroup: Story = {
  args: {
    disabled: true,
    defaultValue: "comfortable",
  },
};

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const selected = yield* Signal.make("option1");

      return yield* $.div({ class: "flex flex-col gap-4" }, [
        $.div(
          { class: "badge badge-neutral" },
          selected.map((v) => `Selected: ${v}`),
        ),
        $.div({ class: "flex gap-2" }, [
          $.button(
            {
              class: "btn btn-xs btn-outline",
              onClick: () => selected.set("option1"),
            },
            "Select Option 1",
          ),
          $.button(
            {
              class: "btn btn-xs btn-outline",
              onClick: () => selected.set("option2"),
            },
            "Select Option 2",
          ),
          $.button(
            {
              class: "btn btn-xs btn-outline",
              onClick: () => selected.set("option3"),
            },
            "Select Option 3",
          ),
        ]),
        RadioGroup.Root({ value: selected, class: "flex flex-col gap-2" }, [
          $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
            RadioGroup.Item({
              value: "option1",
              class: "radio radio-secondary",
            }),
            $.span({ class: "label-text" }, "Option 1"),
          ]),
          $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
            RadioGroup.Item({
              value: "option2",
              class: "radio radio-secondary",
            }),
            $.span({ class: "label-text" }, "Option 2"),
          ]),
          $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
            RadioGroup.Item({
              value: "option3",
              class: "radio radio-secondary",
            }),
            $.span({ class: "label-text" }, "Option 3"),
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

export const CardStyle: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const selected = yield* Signal.make("startup");

      const options = [
        {
          value: "startup",
          title: "Startup",
          description: "Best for small teams just getting started.",
        },
        {
          value: "business",
          title: "Business",
          description: "For growing teams that need more features.",
        },
        {
          value: "enterprise",
          title: "Enterprise",
          description: "For large organizations with complex needs.",
        },
      ];

      return yield* RadioGroup.Root(
        { value: selected, class: "flex flex-col gap-3" },
        options.map((option) =>
          $.label(
            {
              class: selected.map(
                (v) =>
                  `card card-border cursor-pointer transition-all ${v === option.value ? "border-primary bg-primary/10" : "hover:border-base-content/30"}`,
              ),
            },
            [
              $.div({ class: "card-body p-4 flex-row items-center gap-4" }, [
                RadioGroup.Item({
                  value: option.value,
                  class: "radio radio-primary",
                }),
                $.div({}, [
                  $.p({ class: "font-semibold" }, option.title),
                  $.p(
                    { class: "text-sm text-base-content/70" },
                    option.description,
                  ),
                ]),
              ]),
            ],
          ),
        ),
      );
    });

    const container = document.createElement("div");
    container.className = "p-4 max-w-md";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithForm: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const selected = yield* Signal.make("");

      const handleClick = () =>
        Effect.gen(function* () {
          const value = yield* selected.get;
          if (value) {
            alert(`Form submitted with: ${value}`);
          } else {
            alert("Please select an option");
          }
        });

      return yield* $.div({ class: "card bg-base-200 max-w-sm" }, [
        $.div({ class: "card-body" }, [
          $.h3({ class: "card-title text-base" }, "Select your preference:"),
          RadioGroup.Root(
            {
              value: selected,
              name: "preference",
              required: true,
              class: "flex flex-col gap-1 my-4",
            },
            [
              $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
                RadioGroup.Item({
                  value: "email",
                  class: "radio radio-accent",
                }),
                $.span({ class: "label-text" }, "Email notifications"),
              ]),
              $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
                RadioGroup.Item({ value: "sms", class: "radio radio-accent" }),
                $.span({ class: "label-text" }, "SMS notifications"),
              ]),
              $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
                RadioGroup.Item({ value: "push", class: "radio radio-accent" }),
                $.span({ class: "label-text" }, "Push notifications"),
              ]),
              $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
                RadioGroup.Item({ value: "none", class: "radio radio-accent" }),
                $.span({ class: "label-text" }, "No notifications"),
              ]),
            ],
          ),
          $.div({ class: "card-actions justify-end" }, [
            $.button(
              { class: "btn btn-primary btn-sm", onClick: handleClick },
              "Submit",
            ),
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

export const Sizes: Story = {
  render: () => {
    const element = $.div({ class: "flex flex-col gap-4" }, [
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        $.input({
          type: "radio",
          name: "size",
          class: "radio radio-xs radio-primary",
          checked: true,
        }),
        $.span({ class: "label-text" }, "Extra small"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        $.input({
          type: "radio",
          name: "size",
          class: "radio radio-sm radio-primary",
        }),
        $.span({ class: "label-text" }, "Small"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        $.input({
          type: "radio",
          name: "size",
          class: "radio radio-md radio-primary",
        }),
        $.span({ class: "label-text" }, "Medium"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        $.input({
          type: "radio",
          name: "size",
          class: "radio radio-lg radio-primary",
        }),
        $.span({ class: "label-text" }, "Large"),
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
    const element = $.div({ class: "flex flex-col gap-2" }, [
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        $.input({
          type: "radio",
          name: "color",
          class: "radio radio-primary",
          checked: true,
        }),
        $.span({ class: "label-text" }, "Primary"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        $.input({
          type: "radio",
          name: "color",
          class: "radio radio-secondary",
        }),
        $.span({ class: "label-text" }, "Secondary"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        $.input({ type: "radio", name: "color", class: "radio radio-accent" }),
        $.span({ class: "label-text" }, "Accent"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        $.input({ type: "radio", name: "color", class: "radio radio-success" }),
        $.span({ class: "label-text" }, "Success"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        $.input({ type: "radio", name: "color", class: "radio radio-warning" }),
        $.span({ class: "label-text" }, "Warning"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        $.input({ type: "radio", name: "color", class: "radio radio-error" }),
        $.span({ class: "label-text" }, "Error"),
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
