import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Toggle } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Toggle.stories.css";

const meta: Meta = {
  title: "Primitives/Toggle",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const element = Toggle({ class: "toggle" }, "Bold");

    const container = document.createElement("div");
    container.className = "toggle-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const DefaultPressed: Story = {
  render: () => {
    const element = Toggle({ class: "toggle", defaultPressed: true }, "Italic");

    const container = document.createElement("div");
    container.className = "toggle-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Disabled: Story = {
  render: () => {
    const element = $.div({ style: { display: "flex", gap: "1rem" } }, [
      Toggle({ class: "toggle", disabled: true }, "Disabled Off"),
      Toggle(
        { class: "toggle", disabled: true, defaultPressed: true },
        "Disabled On",
      ),
    ]);

    const container = document.createElement("div");
    container.className = "toggle-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const pressed = yield* Signal.make(false);

      const status = $.div(
        { class: "toggle-status" },
        pressed.map((p) => `State: ${p ? "ON" : "OFF"}`),
      );

      const toggle = Toggle({ class: "toggle", pressed }, "Toggle Me");

      const externalButton = $.button(
        {
          onClick: () =>
            Effect.gen(function* () {
              const current = yield* pressed.get;
              yield* pressed.set(!current);
            }),
          style: { padding: "0.5rem 1rem", cursor: "pointer" },
        },
        "Toggle from outside",
      );

      return yield* $.div({}, [toggle, status, externalButton]);
    });

    const container = document.createElement("div");
    container.className = "toggle-story-container";

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

      const toggle = Toggle(
        {
          class: "toggle",
          onPressedChange: (pressed) =>
            lastAction.set(
              `Toggled ${pressed ? "ON" : "OFF"} at ${new Date().toLocaleTimeString()}`,
            ),
        },
        "Click Me",
      );

      const status = $.div({ class: "toggle-status" }, lastAction);

      return yield* $.div({}, [toggle, status]);
    });

    const container = document.createElement("div");
    container.className = "toggle-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const ToggleGroup: Story = {
  render: () => {
    const element = $.div({ class: "toggle-group" }, [
      Toggle({ class: "toggle", defaultPressed: true }, "B"),
      Toggle({ class: "toggle" }, "I"),
      Toggle({ class: "toggle" }, "U"),
      Toggle({ class: "toggle" }, "S"),
    ]);

    const container = document.createElement("div");
    container.className = "toggle-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const IconToggle: Story = {
  render: () => {
    // Using text symbols as icons for simplicity
    const element = $.div({ style: { display: "flex", gap: "0.5rem" } }, [
      Toggle({ class: "toggle toggle-icon", defaultPressed: false }, "★"),
      Toggle({ class: "toggle toggle-icon", defaultPressed: true }, "♥"),
      Toggle({ class: "toggle toggle-icon" }, "⚑"),
    ]);

    const container = document.createElement("div");
    container.className = "toggle-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
