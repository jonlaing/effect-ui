import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Collapsible } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

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
        Collapsible.Trigger({ class: "btn btn-primary" }, args.triggerText!),
        Collapsible.Content(
          {
            class:
              "mt-4 p-4 bg-base-200 rounded-box data-[state=closed]:hidden",
          },
          [$.p({ class: "text-base-content" }, args.contentText!)],
        ),
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
    const element = Collapsible.Root({ defaultOpen: false }, [
      Collapsible.Trigger(
        { class: "btn btn-secondary" },
        "Toggle with Animation",
      ),
      Collapsible.Content(
        {
          class: "mt-4 p-4 bg-base-200 rounded-box data-[state=closed]:hidden",
        },
        [
          $.p({}, "This content animates in and out."),
          $.p(
            { class: "text-base-content/70 mt-2" },
            "The animation uses CSS grid transitions.",
          ),
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
      const isOpen = yield* Signal.make(false);

      return yield* $.div({ class: "flex flex-col gap-4" }, [
        $.div({ class: "flex gap-2 items-center" }, [
          $.button(
            {
              class: "btn btn-outline btn-sm",
              onClick: () => isOpen.update((v) => !v),
            },
            isOpen.map((open) =>
              open ? "Close Externally" : "Open Externally",
            ),
          ),
          $.div(
            { class: "badge badge-neutral" },
            isOpen.map((open) => (open ? "Open" : "Closed")),
          ),
        ]),
        Collapsible.Root({ open: isOpen }, [
          Collapsible.Trigger({ class: "btn btn-primary" }, "Internal Toggle"),
          Collapsible.Content(
            {
              class:
                "mt-4 p-4 bg-base-200 rounded-box data-[state=closed]:hidden",
            },
            [
              $.p({}, "This collapsible can be controlled from outside!"),
              $.p(
                { class: "text-base-content/70 mt-2" },
                "Click either button to toggle.",
              ),
            ],
          ),
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

export const CustomTrigger: Story = {
  render: () => {
    const element = Collapsible.Root({ defaultOpen: false }, [
      Collapsible.Trigger(
        {
          as: "div",
          class:
            "flex items-center gap-2 p-3 bg-base-200 rounded-box cursor-pointer hover:bg-base-300 transition-colors",
        },
        [
          $.span({ class: "text-lg" }, "▶"),
          $.span({ class: "font-medium" }, "Click anywhere on this row"),
        ],
      ),
      Collapsible.Content(
        {
          class: "mt-2 p-4 bg-base-300 rounded-box data-[state=closed]:hidden",
        },
        [
          $.p(
            { class: "text-base-content/70" },
            "Using as='div' allows custom trigger content with keyboard support.",
          ),
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

export const Nested: Story = {
  render: () => {
    const element = Collapsible.Root({ defaultOpen: true }, [
      Collapsible.Trigger({ class: "btn btn-accent" }, "Outer Collapsible"),
      Collapsible.Content(
        {
          class: "mt-4 p-4 bg-base-200 rounded-box data-[state=closed]:hidden",
        },
        [
          $.p({ class: "mb-4" }, "This is the outer content."),
          Collapsible.Root({ defaultOpen: false }, [
            Collapsible.Trigger(
              { class: "btn btn-sm btn-secondary" },
              "Inner Collapsible",
            ),
            Collapsible.Content(
              {
                class:
                  "mt-2 p-3 bg-base-300 rounded-box data-[state=closed]:hidden",
              },
              [
                $.p(
                  { class: "text-base-content/70" },
                  "This is nested content!",
                ),
              ],
            ),
          ]),
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
