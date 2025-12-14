import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { RadioGroup } from "../primitives/RadioGroup";
import { $ } from "@dom/Element/Element";
import { Signal } from "@core/Signal";
import { renderEffectAsync } from "./helpers";

import "./radiogroup.css";

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
        },
        [
          $.div({ class: "radio-row" }, [
            RadioGroup.Item({ value: "default", id: "r1" }),
            $.label({ for: "r1" }, "Default"),
          ]),
          $.div({ class: "radio-row" }, [
            RadioGroup.Item({ value: "comfortable", id: "r2" }),
            $.label({ for: "r2" }, "Comfortable"),
          ]),
          $.div({ class: "radio-row" }, [
            RadioGroup.Item({ value: "compact", id: "r3" }),
            $.label({ for: "r3" }, "Compact"),
          ]),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "radiogroup-story-container";

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
  args: {
    orientation: "horizontal",
  },
};

export const WithDisabledItem: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* RadioGroup.Root({ defaultValue: "option1" }, [
        $.div({ class: "radio-row" }, [
          RadioGroup.Item({ value: "option1", id: "opt1" }),
          $.label({ for: "opt1" }, "Option 1"),
        ]),
        $.div({ class: "radio-row" }, [
          RadioGroup.Item({ value: "option2", id: "opt2", disabled: true }),
          $.label({ for: "opt2", "data-disabled": "" }, "Option 2 (Disabled)"),
        ]),
        $.div({ class: "radio-row" }, [
          RadioGroup.Item({ value: "option3", id: "opt3" }),
          $.label({ for: "opt3" }, "Option 3"),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "radiogroup-story-container";

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

      const statusText = yield* $.p(
        { style: { fontSize: "14px", color: "#6b7280", marginBottom: "16px" } },
        selected.map((v) => `Selected: ${v}`),
      );

      const buttonGroup = yield* $.div(
        { style: { display: "flex", gap: "8px", marginBottom: "16px" } },
        [
          $.button(
            {
              class: "radiogroup-form-button",
              onClick: () => selected.set("option1"),
            },
            "Select Option 1",
          ),
          $.button(
            {
              class: "radiogroup-form-button",
              onClick: () => selected.set("option2"),
            },
            "Select Option 2",
          ),
          $.button(
            {
              class: "radiogroup-form-button",
              onClick: () => selected.set("option3"),
            },
            "Select Option 3",
          ),
        ],
      );

      const radioGroup = yield* RadioGroup.Root(
        {
          value: selected,
          onValueChange: (v) => Effect.log(`Selected: ${v}`),
        },
        [
          $.div({ class: "radio-row" }, [
            RadioGroup.Item({ value: "option1", id: "c1" }),
            $.label({ for: "c1" }, "Option 1"),
          ]),
          $.div({ class: "radio-row" }, [
            RadioGroup.Item({ value: "option2", id: "c2" }),
            $.label({ for: "c2" }, "Option 2"),
          ]),
          $.div({ class: "radio-row" }, [
            RadioGroup.Item({ value: "option3", id: "c3" }),
            $.label({ for: "c3" }, "Option 3"),
          ]),
        ],
      );

      const wrapper = document.createElement("div");
      wrapper.appendChild(statusText);
      wrapper.appendChild(buttonGroup);
      wrapper.appendChild(radioGroup);
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "radiogroup-story-container";

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

      return yield* $.div({ class: "radiogroup-card" }, [
        RadioGroup.Root({ value: selected },
          options.map((option) =>
            $.div(
              {
                class: "radio-card",
                "data-selected": selected.map((v) =>
                  v === option.value ? "true" : "false",
                ),
                onClick: () => selected.set(option.value),
              },
              [
                RadioGroup.Item({ value: option.value, id: `card-${option.value}` }),
                $.div({ class: "radio-card-content" }, [
                  $.p({ class: "radio-card-title" }, option.title),
                  $.p({ class: "radio-card-description" }, option.description),
                ]),
              ],
            ),
          ),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "radiogroup-story-container";

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

      return yield* $.div({ class: "radiogroup-form" }, [
        $.label({ class: "radiogroup-form-label" }, "Select your preference:"),
        RadioGroup.Root(
          {
            value: selected,
            name: "preference",
            required: true,
          },
          [
            $.div({ class: "radio-row" }, [
              RadioGroup.Item({ value: "email", id: "pref-email" }),
              $.label({ for: "pref-email" }, "Email notifications"),
            ]),
            $.div({ class: "radio-row" }, [
              RadioGroup.Item({ value: "sms", id: "pref-sms" }),
              $.label({ for: "pref-sms" }, "SMS notifications"),
            ]),
            $.div({ class: "radio-row" }, [
              RadioGroup.Item({ value: "push", id: "pref-push" }),
              $.label({ for: "pref-push" }, "Push notifications"),
            ]),
            $.div({ class: "radio-row" }, [
              RadioGroup.Item({ value: "none", id: "pref-none" }),
              $.label({ for: "pref-none" }, "No notifications"),
            ]),
          ],
        ),
        $.button({ class: "radiogroup-form-button", onClick: handleClick }, "Submit"),
      ]);
    });

    const container = document.createElement("div");
    container.className = "radiogroup-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const NoLoop: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const info = yield* $.p(
        { style: { fontSize: "14px", color: "#6b7280", marginBottom: "16px" } },
        "Keyboard navigation stops at first/last item (no looping).",
      );

      const radioGroup = yield* RadioGroup.Root(
        { defaultValue: "middle", loop: false },
        [
          $.div({ class: "radio-row" }, [
            RadioGroup.Item({ value: "first", id: "nl1" }),
            $.label({ for: "nl1" }, "First (can't go before)"),
          ]),
          $.div({ class: "radio-row" }, [
            RadioGroup.Item({ value: "middle", id: "nl2" }),
            $.label({ for: "nl2" }, "Middle"),
          ]),
          $.div({ class: "radio-row" }, [
            RadioGroup.Item({ value: "last", id: "nl3" }),
            $.label({ for: "nl3" }, "Last (can't go after)"),
          ]),
        ],
      );

      const wrapper = document.createElement("div");
      wrapper.appendChild(info);
      wrapper.appendChild(radioGroup);
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "radiogroup-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
