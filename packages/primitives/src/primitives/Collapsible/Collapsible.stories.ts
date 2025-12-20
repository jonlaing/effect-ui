import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Collapsible } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Collapsible.stories.css";

type CollapsibleStoryArgs = {
  defaultOpen?: boolean;
  disabled?: boolean;
  triggerText?: string;
  contentText?: string;
};

const meta: Meta<CollapsibleStoryArgs> = {
  title: "Primitives/Collapsible",
  tags: ["autodocs"],
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description: "Whether the collapsible starts open",
    },
    disabled: {
      control: "boolean",
      description: "Whether the collapsible is disabled",
    },
    triggerText: {
      control: "text",
      description: "Text for the trigger button",
    },
    contentText: {
      control: "text",
      description: "Text content inside the collapsible",
    },
  },
  args: {
    defaultOpen: false,
    disabled: false,
    triggerText: "Toggle Content",
    contentText: "This is the collapsible content that can be shown or hidden.",
  },
  render: (args) => {
    const element = Collapsible.Root(
      {
        defaultOpen: args.defaultOpen,
        disabled: args.disabled,
      },
      [
        Collapsible.Trigger(
          { class: "collapsible-trigger" },
          args.triggerText!,
        ),
        Collapsible.Content({ class: "collapsible-content" }, [
          $.p(args.contentText!),
        ]),
      ],
    );

    // Create container and render async
    const container = document.createElement("div");
    container.className = "story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export default meta;
type Story = StoryObj<CollapsibleStoryArgs>;

export const Default: Story = {};

export const DefaultOpen: Story = {
  args: {
    defaultOpen: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    triggerText: "Disabled (cannot toggle)",
  },
};

export const WithAnimation: Story = {
  render: () => {
    // Animation is now automatic via CSS transitions on data-state changes.
    // The collapsible-content class styles both open and closed states.
    const element = Collapsible.Root({ defaultOpen: false }, [
      Collapsible.Trigger(
        { class: "collapsible-trigger" },
        "Toggle with Animation",
      ),
      Collapsible.Content({ class: "collapsible-content" }, [
        $.p("This content animates in and out."),
        $.p("The animation uses CSS grid transitions."),
      ]),
    ]);

    const container = document.createElement("div");
    container.className = "story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const isOpen = yield* Signal.make(false);

      const toggleButton = $.button(
        {
          class: "external-toggle",
          onClick: () => isOpen.update((v) => !v),
        },
        isOpen.map((open) => (open ? "Close Externally" : "Open Externally")),
      );

      const collapsible = Collapsible.Root({ open: isOpen }, [
        Collapsible.Trigger(
          { class: "collapsible-trigger" },
          "Internal Toggle",
        ),
        Collapsible.Content({ class: "collapsible-content" }, [
          $.p("This collapsible can be controlled from outside!"),
          $.p("Click either button to toggle."),
        ]),
      ]);

      return yield* $.div({ class: "controlled-demo" }, [
        toggleButton,
        collapsible,
      ]);
    });

    const container = document.createElement("div");
    container.className = "story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const CustomTrigger: Story = {
  render: () => {
    const element = Collapsible.Root({ defaultOpen: false }, [
      Collapsible.Trigger({ as: "div", class: "custom-trigger" }, [
        $.span({ class: "trigger-icon" }, "▶"),
        $.span("Click anywhere on this row"),
      ]),
      Collapsible.Content({ class: "collapsible-content" }, [
        $.p(
          "Using as='div' allows custom trigger content with keyboard support.",
        ),
      ]),
    ]);

    const container = document.createElement("div");
    container.className = "story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Nested: Story = {
  render: () => {
    const element = Collapsible.Root({ defaultOpen: true }, [
      Collapsible.Trigger(
        { class: "collapsible-trigger" },
        "Outer Collapsible",
      ),
      Collapsible.Content({ class: "collapsible-content" }, [
        $.p("This is the outer content."),
        Collapsible.Root({ defaultOpen: false }, [
          Collapsible.Trigger(
            { class: "collapsible-trigger nested" },
            "Inner Collapsible",
          ),
          Collapsible.Content({ class: "collapsible-content nested" }, [
            $.p("This is nested content!"),
          ]),
        ]),
      ]),
    ]);

    const container = document.createElement("div");
    container.className = "story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
