import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";

import { $, Signal } from "@effex/dom";
import { Checkbox, type CheckedState } from "@effex/primitives";

import { renderEffectAsync } from "../../storyHelpers";

const meta: Meta = {
  title: "Primitives/Checkbox",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const element = $.label(
      { class: "label cursor-pointer gap-3 justify-start" },
      [
        Checkbox({ class: "checkbox checkbox-primary", id: "terms" }),
        $.span({ class: "label-text" }, "Accept terms"),
      ],
    );

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const DefaultChecked: Story = {
  render: () => {
    const element = $.label(
      { class: "label cursor-pointer gap-3 justify-start" },
      [
        Checkbox({
          class: "checkbox checkbox-primary",
          id: "accepted",
          defaultChecked: true,
        }),
        $.span({ class: "label-text" }, "Already accepted"),
      ],
    );

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
      const selectAll = yield* Signal.make<CheckedState>("indeterminate");

      const getStateLabel = (c: CheckedState) => {
        if (c === "indeterminate") return "indeterminate";
        return c ? "checked" : "unchecked";
      };

      const status = $.div(
        { class: "text-sm text-base-content/70 mt-2" },
        selectAll.map((c) => `State: ${getStateLabel(c)}`),
      );

      return yield* $.div({}, [
        $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
          Checkbox({
            class: "checkbox checkbox-primary",
            id: "select-all",
            checked: selectAll,
          }),
          $.span({ class: "label-text" }, "Select all (starts indeterminate)"),
        ]),
        status,
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
    const element = $.div({ class: "flex flex-col gap-2" }, [
      $.label(
        { class: "label cursor-not-allowed gap-3 justify-start opacity-50" },
        [
          Checkbox({
            class: "checkbox",
            id: "disabled-unchecked",
            disabled: true,
          }),
          $.span({ class: "label-text" }, "Disabled unchecked"),
        ],
      ),
      $.label(
        { class: "label cursor-not-allowed gap-3 justify-start opacity-50" },
        [
          Checkbox({
            class: "checkbox checkbox-primary",
            id: "disabled-checked",
            disabled: true,
            defaultChecked: true,
          }),
          $.span({ class: "label-text" }, "Disabled checked"),
        ],
      ),
    ]);

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const CheckboxGroup: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const option1 = yield* Signal.make<CheckedState>(true);
      const option2 = yield* Signal.make<CheckedState>(false);
      const option3 = yield* Signal.make<CheckedState>(false);

      return yield* $.div({ class: "flex flex-col gap-1" }, [
        $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
          Checkbox({
            class: "checkbox checkbox-primary",
            id: "email",
            checked: option1,
          }),
          $.span({ class: "label-text" }, "Email notifications"),
        ]),
        $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
          Checkbox({
            class: "checkbox checkbox-primary",
            id: "sms",
            checked: option2,
          }),
          $.span({ class: "label-text" }, "SMS notifications"),
        ]),
        $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
          Checkbox({
            class: "checkbox checkbox-primary",
            id: "push",
            checked: option3,
          }),
          $.span({ class: "label-text" }, "Push notifications"),
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

export const WithCallback: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const lastAction = yield* Signal.make("No actions yet");

      return yield* $.div({}, [
        $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
          Checkbox({
            class: "checkbox checkbox-secondary",
            id: "callback",
            onCheckedChange: (checked) =>
              lastAction.set(
                `Changed to ${checked} at ${new Date().toLocaleTimeString()}`,
              ),
          }),
          $.span({ class: "label-text" }, "Click me"),
        ]),
        $.div({ class: "text-sm text-base-content/70 mt-2" }, lastAction),
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
    const element = $.div({ class: "flex flex-col gap-2" }, [
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Checkbox({ class: "checkbox checkbox-xs checkbox-primary" }),
        $.span({ class: "label-text" }, "Extra small"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Checkbox({ class: "checkbox checkbox-sm checkbox-primary" }),
        $.span({ class: "label-text" }, "Small"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Checkbox({ class: "checkbox checkbox-md checkbox-primary" }),
        $.span({ class: "label-text" }, "Medium"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Checkbox({ class: "checkbox checkbox-lg checkbox-primary" }),
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
        Checkbox({ class: "checkbox checkbox-primary", defaultChecked: true }),
        $.span({ class: "label-text" }, "Primary"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Checkbox({
          class: "checkbox checkbox-secondary",
          defaultChecked: true,
        }),
        $.span({ class: "label-text" }, "Secondary"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Checkbox({ class: "checkbox checkbox-accent", defaultChecked: true }),
        $.span({ class: "label-text" }, "Accent"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Checkbox({ class: "checkbox checkbox-success", defaultChecked: true }),
        $.span({ class: "label-text" }, "Success"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Checkbox({ class: "checkbox checkbox-warning", defaultChecked: true }),
        $.span({ class: "label-text" }, "Warning"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Checkbox({ class: "checkbox checkbox-error", defaultChecked: true }),
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
