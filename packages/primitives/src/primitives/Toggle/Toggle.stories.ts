import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Toggle } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

const meta: Meta = {
  title: "Primitives/Toggle",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const element = Toggle(
      { class: "btn btn-sm data-[state=on]:btn-primary" },
      "Bold",
    );

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const DefaultPressed: Story = {
  render: () => {
    const element = Toggle(
      { class: "btn btn-sm data-[state=on]:btn-primary", defaultPressed: true },
      "Italic",
    );

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
    const element = $.div({ class: "flex gap-4" }, [
      Toggle(
        { class: "btn btn-sm data-[state=on]:btn-primary", disabled: true },
        "Disabled Off",
      ),
      Toggle(
        {
          class: "btn btn-sm data-[state=on]:btn-primary",
          disabled: true,
          defaultPressed: true,
        },
        "Disabled On",
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

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const pressed = yield* Signal.make(false);

      const status = $.div(
        { class: "badge badge-neutral mt-2" },
        pressed.map((p) => `State: ${p ? "ON" : "OFF"}`),
      );

      const toggle = Toggle(
        { class: "btn btn-sm data-[state=on]:btn-primary", pressed },
        "Toggle Me",
      );

      const externalButton = $.button(
        {
          class: "btn btn-sm btn-outline mt-2",
          onClick: () =>
            Effect.gen(function* () {
              const current = yield* pressed.get;
              yield* pressed.set(!current);
            }),
        },
        "Toggle from outside",
      );

      return yield* $.div({ class: "flex flex-col items-start gap-2" }, [
        toggle,
        status,
        externalButton,
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

      const toggle = Toggle(
        {
          class: "btn btn-sm data-[state=on]:btn-primary",
          onPressedChange: (pressed) =>
            lastAction.set(
              `Toggled ${pressed ? "ON" : "OFF"} at ${new Date().toLocaleTimeString()}`,
            ),
        },
        "Click Me",
      );

      const status = $.div(
        { class: "text-sm text-base-content/70 mt-2" },
        lastAction,
      );

      return yield* $.div({ class: "flex flex-col items-start" }, [
        toggle,
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

export const ToggleGroup: Story = {
  render: () => {
    const element = $.div({ class: "join" }, [
      Toggle(
        {
          class: "btn btn-sm join-item data-[state=on]:btn-primary",
          defaultPressed: true,
        },
        "B",
      ),
      Toggle(
        { class: "btn btn-sm join-item data-[state=on]:btn-primary" },
        "I",
      ),
      Toggle(
        { class: "btn btn-sm join-item data-[state=on]:btn-primary" },
        "U",
      ),
      Toggle(
        { class: "btn btn-sm join-item data-[state=on]:btn-primary" },
        "S",
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

export const IconToggle: Story = {
  render: () => {
    const element = $.div({ class: "flex gap-2" }, [
      Toggle(
        {
          class: "btn btn-sm btn-square data-[state=on]:btn-warning",
          defaultPressed: false,
        },
        "★",
      ),
      Toggle(
        {
          class: "btn btn-sm btn-square data-[state=on]:btn-error",
          defaultPressed: true,
        },
        "♥",
      ),
      Toggle({ class: "btn btn-sm btn-square data-[state=on]:btn-info" }, "⚑"),
    ]);

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
