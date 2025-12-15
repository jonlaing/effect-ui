import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Checkbox, type CheckedState } from "../primitives/Checkbox";
import { $ } from "@dom/Element/Element";
import { Signal } from "@core/Signal";
import { renderEffectAsync } from "./helpers";

import "./checkbox.css";

const meta: Meta = {
  title: "Primitives/Checkbox",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const element = $.div({ class: "checkbox-row" }, [
      Checkbox({ class: "checkbox", id: "terms" }),
      $.label({ class: "checkbox-label", for: "terms" }, "Accept terms"),
    ]);

    const container = document.createElement("div");
    container.className = "checkbox-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const DefaultChecked: Story = {
  render: () => {
    const element = $.div({ class: "checkbox-row" }, [
      Checkbox({ class: "checkbox", id: "accepted", defaultChecked: true }),
      $.label({ class: "checkbox-label", for: "accepted" }, "Already accepted"),
    ]);

    const container = document.createElement("div");
    container.className = "checkbox-story-container";

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

      const status = $.div(
        { style: { fontSize: "0.875rem", color: "#666", marginTop: "0.5rem" } },
        selectAll.map(
          (c) =>
            `State: ${c === "indeterminate" ? "indeterminate" : c ? "checked" : "unchecked"}`,
        ),
      );

      return yield* $.div({}, [
        $.div({ class: "checkbox-row" }, [
          Checkbox({ class: "checkbox", id: "select-all", checked: selectAll }),
          $.label(
            { class: "checkbox-label", for: "select-all" },
            "Select all (starts indeterminate)",
          ),
        ]),
        status,
      ]);
    });

    const container = document.createElement("div");
    container.className = "checkbox-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Disabled: Story = {
  render: () => {
    const element = $.div({ class: "checkbox-group" }, [
      $.div({ class: "checkbox-row" }, [
        Checkbox({
          class: "checkbox",
          id: "disabled-unchecked",
          disabled: true,
        }),
        $.label(
          {
            class: "checkbox-label",
            for: "disabled-unchecked",
            "data-disabled": "",
          },
          "Disabled unchecked",
        ),
      ]),
      $.div({ class: "checkbox-row" }, [
        Checkbox({
          class: "checkbox",
          id: "disabled-checked",
          disabled: true,
          defaultChecked: true,
        }),
        $.label(
          {
            class: "checkbox-label",
            for: "disabled-checked",
            "data-disabled": "",
          },
          "Disabled checked",
        ),
      ]),
    ]);

    const container = document.createElement("div");
    container.className = "checkbox-story-container";

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

      return yield* $.div({ class: "checkbox-group" }, [
        $.div({ class: "checkbox-row" }, [
          Checkbox({ class: "checkbox", id: "email", checked: option1 }),
          $.label(
            { class: "checkbox-label", for: "email" },
            "Email notifications",
          ),
        ]),
        $.div({ class: "checkbox-row" }, [
          Checkbox({ class: "checkbox", id: "sms", checked: option2 }),
          $.label({ class: "checkbox-label", for: "sms" }, "SMS notifications"),
        ]),
        $.div({ class: "checkbox-row" }, [
          Checkbox({ class: "checkbox", id: "push", checked: option3 }),
          $.label(
            { class: "checkbox-label", for: "push" },
            "Push notifications",
          ),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "checkbox-story-container";

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
        $.div({ class: "checkbox-row" }, [
          Checkbox({
            class: "checkbox",
            id: "callback",
            onCheckedChange: (checked) =>
              lastAction.set(
                `Changed to ${checked} at ${new Date().toLocaleTimeString()}`,
              ),
          }),
          $.label({ class: "checkbox-label", for: "callback" }, "Click me"),
        ]),
        $.div(
          {
            style: { fontSize: "0.875rem", color: "#666", marginTop: "0.5rem" },
          },
          lastAction,
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "checkbox-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
