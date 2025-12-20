import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Switch } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Switch.stories.css";

const meta: Meta = {
  title: "Primitives/Switch",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const element = Switch({ class: "switch" });

    const container = document.createElement("div");
    container.className = "switch-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const DefaultChecked: Story = {
  render: () => {
    const element = Switch({ class: "switch", defaultChecked: true });

    const container = document.createElement("div");
    container.className = "switch-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithLabel: Story = {
  render: () => {
    const element = $.div({ class: "switch-row" }, [
      Switch({ class: "switch" }),
      $.span({ class: "switch-label" }, "Enable notifications"),
    ]);

    const container = document.createElement("div");
    container.className = "switch-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Disabled: Story = {
  render: () => {
    const element = $.div({ style: { display: "flex", gap: "1rem" } }, [
      $.div({ class: "switch-row" }, [
        Switch({ class: "switch", disabled: true }),
        $.span({ class: "switch-label" }, "Disabled off"),
      ]),
      $.div({ class: "switch-row" }, [
        Switch({ class: "switch", disabled: true, defaultChecked: true }),
        $.span({ class: "switch-label" }, "Disabled on"),
      ]),
    ]);

    const container = document.createElement("div");
    container.className = "switch-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const checked = yield* Signal.make(false);

      const status = $.div(
        { style: { fontSize: "0.875rem", color: "#666" } },
        checked.map((c) => `Status: ${c ? "ON" : "OFF"}`),
      );

      return yield* $.div({}, [
        $.div({ class: "switch-row" }, [
          Switch({ class: "switch", checked }),
          $.span({ class: "switch-label" }, "Airplane mode"),
        ]),
        status,
      ]);
    });

    const container = document.createElement("div");
    container.className = "switch-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Sizes: Story = {
  render: () => {
    const element = $.div(
      { style: { display: "flex", gap: "1rem", alignItems: "center" } },
      [
        $.div({ class: "switch-row" }, [
          Switch({ class: "switch switch-sm" }),
          $.span({ class: "switch-label" }, "Small"),
        ]),
        $.div({ class: "switch-row" }, [
          Switch({ class: "switch" }),
          $.span({ class: "switch-label" }, "Default"),
        ]),
        $.div({ class: "switch-row" }, [
          Switch({ class: "switch switch-lg" }),
          $.span({ class: "switch-label" }, "Large"),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "switch-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
