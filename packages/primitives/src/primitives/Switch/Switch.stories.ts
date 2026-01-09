import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Switch } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

const meta: Meta = {
  title: "Primitives/Switch",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const element = Switch({ class: "toggle toggle-primary" });

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
    const element = Switch({
      class: "toggle toggle-primary",
      defaultChecked: true,
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithLabel: Story = {
  render: () => {
    const element = $.label(
      { class: "label cursor-pointer gap-3 justify-start" },
      [
        Switch({ class: "toggle toggle-primary" }),
        $.span({ class: "label-text" }, "Enable notifications"),
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

export const Disabled: Story = {
  render: () => {
    const element = $.div({ class: "flex gap-6" }, [
      $.label(
        { class: "label cursor-not-allowed gap-3 justify-start opacity-50" },
        [
          Switch({ class: "toggle", disabled: true }),
          $.span({ class: "label-text" }, "Disabled off"),
        ],
      ),
      $.label(
        { class: "label cursor-not-allowed gap-3 justify-start opacity-50" },
        [
          Switch({
            class: "toggle toggle-primary",
            disabled: true,
            defaultChecked: true,
          }),
          $.span({ class: "label-text" }, "Disabled on"),
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

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const checked = yield* Signal.make(false);

      const status = $.div(
        { class: "badge badge-neutral mt-2" },
        checked.map((c) => `Status: ${c ? "ON" : "OFF"}`),
      );

      return yield* $.div({ class: "flex flex-col items-start" }, [
        $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
          Switch({ class: "toggle toggle-primary", checked }),
          $.span({ class: "label-text" }, "Airplane mode"),
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

export const Sizes: Story = {
  render: () => {
    const element = $.div({ class: "flex flex-col gap-3" }, [
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Switch({ class: "toggle toggle-xs toggle-primary" }),
        $.span({ class: "label-text" }, "Extra small"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Switch({ class: "toggle toggle-sm toggle-primary" }),
        $.span({ class: "label-text" }, "Small"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Switch({ class: "toggle toggle-md toggle-primary" }),
        $.span({ class: "label-text" }, "Medium"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Switch({ class: "toggle toggle-lg toggle-primary" }),
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
    const element = $.div({ class: "flex flex-col gap-3" }, [
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Switch({ class: "toggle toggle-primary", defaultChecked: true }),
        $.span({ class: "label-text" }, "Primary"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Switch({ class: "toggle toggle-secondary", defaultChecked: true }),
        $.span({ class: "label-text" }, "Secondary"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Switch({ class: "toggle toggle-accent", defaultChecked: true }),
        $.span({ class: "label-text" }, "Accent"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Switch({ class: "toggle toggle-success", defaultChecked: true }),
        $.span({ class: "label-text" }, "Success"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Switch({ class: "toggle toggle-warning", defaultChecked: true }),
        $.span({ class: "label-text" }, "Warning"),
      ]),
      $.label({ class: "label cursor-pointer gap-3 justify-start" }, [
        Switch({ class: "toggle toggle-error", defaultChecked: true }),
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
