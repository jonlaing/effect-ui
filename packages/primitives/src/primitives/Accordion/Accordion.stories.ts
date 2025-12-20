import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Accordion } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Accordion.stories.css";

const meta: Meta = {
  title: "Primitives/Accordion",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Single: Story = {
  render: () => {
    const element = Accordion.Root(
      { type: "single", defaultValue: "item-1", collapsible: true },
      [
        Accordion.Item({ value: "item-1" }, [
          Accordion.Trigger({ class: "accordion-trigger" }, "Section 1"),
          Accordion.Content({ class: "accordion-content" }, [
            $.p("This is the content for section 1."),
            $.p("Only one section can be open at a time in single mode."),
          ]),
        ]),
        Accordion.Item({ value: "item-2" }, [
          Accordion.Trigger({ class: "accordion-trigger" }, "Section 2"),
          Accordion.Content({ class: "accordion-content" }, [
            $.p("This is the content for section 2."),
            $.p("Click the trigger to expand this section."),
          ]),
        ]),
        Accordion.Item({ value: "item-3" }, [
          Accordion.Trigger({ class: "accordion-trigger" }, "Section 3"),
          Accordion.Content({ class: "accordion-content" }, [
            $.p("This is the content for section 3."),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "accordion-story-container";

    renderEffectAsync(element).then((el) => {
      el.classList.add("accordion-root");
      container.appendChild(el);
    });

    return container;
  },
};

export const Multiple: Story = {
  render: () => {
    const element = Accordion.Root(
      { type: "multiple", defaultValue: ["item-1", "item-2"] },
      [
        Accordion.Item({ value: "item-1" }, [
          Accordion.Trigger({ class: "accordion-trigger" }, "Section 1"),
          Accordion.Content({ class: "accordion-content" }, [
            $.p("This is section 1. Multiple sections can be open."),
          ]),
        ]),
        Accordion.Item({ value: "item-2" }, [
          Accordion.Trigger({ class: "accordion-trigger" }, "Section 2"),
          Accordion.Content({ class: "accordion-content" }, [
            $.p("This is section 2. It starts open along with section 1."),
          ]),
        ]),
        Accordion.Item({ value: "item-3" }, [
          Accordion.Trigger({ class: "accordion-trigger" }, "Section 3"),
          Accordion.Content({ class: "accordion-content" }, [
            $.p("This is section 3. Click to open it too!"),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "accordion-story-container";

    renderEffectAsync(element).then((el) => {
      el.classList.add("accordion-root");
      container.appendChild(el);
    });

    return container;
  },
};

export const NonCollapsible: Story = {
  render: () => {
    const element = Accordion.Root(
      { type: "single", defaultValue: "item-1", collapsible: false },
      [
        Accordion.Item({ value: "item-1" }, [
          Accordion.Trigger({ class: "accordion-trigger" }, "Section 1"),
          Accordion.Content({ class: "accordion-content" }, [
            $.p("In non-collapsible mode, one item must always be open."),
            $.p("Try clicking this section - it won't close."),
          ]),
        ]),
        Accordion.Item({ value: "item-2" }, [
          Accordion.Trigger({ class: "accordion-trigger" }, "Section 2"),
          Accordion.Content({ class: "accordion-content" }, [
            $.p("Click here to switch to this section."),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "accordion-story-container";

    renderEffectAsync(element).then((el) => {
      el.classList.add("accordion-root");
      container.appendChild(el);
    });

    return container;
  },
};

export const WithDisabledItem: Story = {
  render: () => {
    const element = Accordion.Root(
      { type: "single", defaultValue: "item-1", collapsible: true },
      [
        Accordion.Item({ value: "item-1" }, [
          Accordion.Trigger({ class: "accordion-trigger" }, "Enabled Section"),
          Accordion.Content({ class: "accordion-content" }, [
            $.p("This section can be toggled normally."),
          ]),
        ]),
        Accordion.Item({ value: "item-2", disabled: true }, [
          Accordion.Trigger({ class: "accordion-trigger" }, "Disabled Section"),
          Accordion.Content({ class: "accordion-content" }, [
            $.p("You shouldn't be able to see this!"),
          ]),
        ]),
        Accordion.Item({ value: "item-3" }, [
          Accordion.Trigger({ class: "accordion-trigger" }, "Another Enabled"),
          Accordion.Content({ class: "accordion-content" }, [
            $.p("This section is also enabled."),
          ]),
        ]),
      ],
    );

    const container = document.createElement("div");
    container.className = "accordion-story-container";

    renderEffectAsync(element).then((el) => {
      el.classList.add("accordion-root");
      container.appendChild(el);
    });

    return container;
  },
};

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<string | null>("item-2");

      const buttons = $.div(
        { style: { marginBottom: "1rem", display: "flex", gap: "0.5rem" } },
        [
          $.button(
            {
              onClick: () => value.set("item-1"),
              style: { padding: "0.5rem 1rem", cursor: "pointer" },
            },
            "Open 1",
          ),
          $.button(
            {
              onClick: () => value.set("item-2"),
              style: { padding: "0.5rem 1rem", cursor: "pointer" },
            },
            "Open 2",
          ),
          $.button(
            {
              onClick: () => value.set(null),
              style: { padding: "0.5rem 1rem", cursor: "pointer" },
            },
            "Close All",
          ),
        ],
      );

      // Wrap accordion in a div to add class
      const accordionWrapper = $.div({ class: "accordion-root" }, [
        Accordion.Root({ type: "single", value, collapsible: true }, [
          Accordion.Item({ value: "item-1" }, [
            Accordion.Trigger({ class: "accordion-trigger" }, "Section 1"),
            Accordion.Content({ class: "accordion-content" }, [
              $.p("Controlled from external buttons!"),
            ]),
          ]),
          Accordion.Item({ value: "item-2" }, [
            Accordion.Trigger({ class: "accordion-trigger" }, "Section 2"),
            Accordion.Content({ class: "accordion-content" }, [
              $.p("Click the buttons above to control which section is open."),
            ]),
          ]),
        ]),
      ]);

      return yield* $.div({}, [buttons, accordionWrapper]);
    });

    const container = document.createElement("div");
    container.className = "accordion-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
