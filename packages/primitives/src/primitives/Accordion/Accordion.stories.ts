import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Accordion } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

const meta: Meta = {
  title: "Primitives/Accordion",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Single: Story = {
  render: () => {
    const element = Accordion.Root(
      {
        type: "single",
        defaultValue: "item-1",
        collapsible: true,
        class: "join join-vertical w-full max-w-md",
      },
      [
        Accordion.Item(
          {
            value: "item-1",
            class:
              "collapse collapse-arrow join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Section 1",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p({}, "This is the content for section 1."),
              $.p(
                { class: "text-base-content/70 mt-2" },
                "Only one section can be open at a time in single mode.",
              ),
            ]),
          ],
        ),
        Accordion.Item(
          {
            value: "item-2",
            class:
              "collapse collapse-arrow join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Section 2",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p({}, "This is the content for section 2."),
              $.p(
                { class: "text-base-content/70 mt-2" },
                "Click the trigger to expand this section.",
              ),
            ]),
          ],
        ),
        Accordion.Item(
          {
            value: "item-3",
            class:
              "collapse collapse-arrow join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Section 3",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p({}, "This is the content for section 3."),
            ]),
          ],
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

export const Multiple: Story = {
  render: () => {
    const element = Accordion.Root(
      {
        type: "multiple",
        defaultValue: ["item-1", "item-2"],
        class: "join join-vertical w-full max-w-md",
      },
      [
        Accordion.Item(
          {
            value: "item-1",
            class:
              "collapse collapse-arrow join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Section 1",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p({}, "This is section 1. Multiple sections can be open."),
            ]),
          ],
        ),
        Accordion.Item(
          {
            value: "item-2",
            class:
              "collapse collapse-arrow join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Section 2",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p(
                {},
                "This is section 2. It starts open along with section 1.",
              ),
            ]),
          ],
        ),
        Accordion.Item(
          {
            value: "item-3",
            class:
              "collapse collapse-arrow join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Section 3",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p({}, "This is section 3. Click to open it too!"),
            ]),
          ],
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

export const NonCollapsible: Story = {
  render: () => {
    const element = Accordion.Root(
      {
        type: "single",
        defaultValue: "item-1",
        collapsible: false,
        class: "join join-vertical w-full max-w-md",
      },
      [
        Accordion.Item(
          {
            value: "item-1",
            class:
              "collapse collapse-arrow join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Section 1",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p({}, "In non-collapsible mode, one item must always be open."),
              $.p(
                { class: "text-base-content/70 mt-2" },
                "Try clicking this section - it won't close.",
              ),
            ]),
          ],
        ),
        Accordion.Item(
          {
            value: "item-2",
            class:
              "collapse collapse-arrow join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Section 2",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p({}, "Click here to switch to this section."),
            ]),
          ],
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

export const WithDisabledItem: Story = {
  render: () => {
    const element = Accordion.Root(
      {
        type: "single",
        defaultValue: "item-1",
        collapsible: true,
        class: "join join-vertical w-full max-w-md",
      },
      [
        Accordion.Item(
          {
            value: "item-1",
            class:
              "collapse collapse-arrow join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Enabled Section",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p({}, "This section can be toggled normally."),
            ]),
          ],
        ),
        Accordion.Item(
          {
            value: "item-2",
            disabled: true,
            class:
              "collapse collapse-arrow join-item border border-base-300 bg-base-100 opacity-50",
          },
          [
            Accordion.Trigger(
              {
                class: "collapse-title text-lg font-medium cursor-not-allowed",
              },
              "Disabled Section",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p({}, "You shouldn't be able to see this!"),
            ]),
          ],
        ),
        Accordion.Item(
          {
            value: "item-3",
            class:
              "collapse collapse-arrow join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Another Enabled",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p({}, "This section is also enabled."),
            ]),
          ],
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

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const value = yield* Signal.make<string | null>("item-2");

      return yield* $.div({ class: "flex flex-col gap-4" }, [
        $.div({ class: "flex gap-2" }, [
          $.button(
            {
              onClick: () => value.set("item-1"),
              class: "btn btn-sm btn-outline",
            },
            "Open 1",
          ),
          $.button(
            {
              onClick: () => value.set("item-2"),
              class: "btn btn-sm btn-outline",
            },
            "Open 2",
          ),
          $.button(
            { onClick: () => value.set(null), class: "btn btn-sm btn-outline" },
            "Close All",
          ),
        ]),
        Accordion.Root(
          {
            type: "single",
            value,
            collapsible: true,
            class: "join join-vertical w-full max-w-md",
          },
          [
            Accordion.Item(
              {
                value: "item-1",
                class:
                  "collapse collapse-arrow join-item border border-base-300 bg-base-100",
              },
              [
                Accordion.Trigger(
                  { class: "collapse-title text-lg font-medium" },
                  "Section 1",
                ),
                Accordion.Content({ class: "collapse-content" }, [
                  $.p({}, "Controlled from external buttons!"),
                ]),
              ],
            ),
            Accordion.Item(
              {
                value: "item-2",
                class:
                  "collapse collapse-arrow join-item border border-base-300 bg-base-100",
              },
              [
                Accordion.Trigger(
                  { class: "collapse-title text-lg font-medium" },
                  "Section 2",
                ),
                Accordion.Content({ class: "collapse-content" }, [
                  $.p(
                    {},
                    "Click the buttons above to control which section is open.",
                  ),
                ]),
              ],
            ),
          ],
        ),
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

export const WithPlusIcon: Story = {
  render: () => {
    const element = Accordion.Root(
      {
        type: "single",
        defaultValue: "item-1",
        collapsible: true,
        class: "join join-vertical w-full max-w-md",
      },
      [
        Accordion.Item(
          {
            value: "item-1",
            class:
              "collapse collapse-plus join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Plus/Minus Icon",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p(
                {},
                "This accordion uses plus/minus icons instead of arrows.",
              ),
            ]),
          ],
        ),
        Accordion.Item(
          {
            value: "item-2",
            class:
              "collapse collapse-plus join-item border border-base-300 bg-base-100",
          },
          [
            Accordion.Trigger(
              { class: "collapse-title text-lg font-medium" },
              "Another Section",
            ),
            Accordion.Content({ class: "collapse-content" }, [
              $.p({}, "Click to expand this section."),
            ]),
          ],
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

export const FAQ: Story = {
  render: () => {
    const faqs = [
      {
        question: "What is your refund policy?",
        answer:
          "We offer a 30-day money-back guarantee. If you're not satisfied with your purchase, contact our support team for a full refund.",
      },
      {
        question: "How do I track my order?",
        answer:
          "Once your order ships, you'll receive an email with tracking information. You can also check your order status in your account dashboard.",
      },
      {
        question: "Do you offer international shipping?",
        answer:
          "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location.",
      },
      {
        question: "How can I contact customer support?",
        answer:
          "You can reach us via email at support@example.com or through our live chat available 24/7 on the website.",
      },
    ];

    const element = $.div({ class: "flex flex-col gap-4 max-w-lg" }, [
      $.h2({ class: "text-xl font-bold" }, "Frequently Asked Questions"),
      Accordion.Root(
        {
          type: "single",
          collapsible: true,
          class: "join join-vertical w-full",
        },
        faqs.map((faq, index) =>
          Accordion.Item(
            {
              value: `item-${index}`,
              class:
                "collapse collapse-arrow join-item border border-base-300 bg-base-100",
            },
            [
              Accordion.Trigger(
                { class: "collapse-title font-medium" },
                faq.question,
              ),
              Accordion.Content({ class: "collapse-content" }, [
                $.p({ class: "text-base-content/70" }, faq.answer),
              ]),
            ],
          ),
        ),
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
