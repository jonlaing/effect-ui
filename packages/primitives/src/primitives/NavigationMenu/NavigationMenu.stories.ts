import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { NavigationMenu } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./NavigationMenu.stories.css";

type NavigationMenuStoryArgs = {
  orientation?: "horizontal" | "vertical";
  delayDuration?: number;
};

const meta: Meta<NavigationMenuStoryArgs> = {
  title: "Primitives/NavigationMenu",
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Menu orientation",
    },
    delayDuration: {
      control: { type: "number", min: 0, max: 1000, step: 50 },
      description: "Delay before opening (ms)",
    },
  },
  args: {
    orientation: "horizontal",
    delayDuration: 200,
  },
};

export default meta;
type Story = StoryObj<NavigationMenuStoryArgs>;

export const Default: Story = {
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* NavigationMenu.Root(
        {
          orientation: args.orientation,
          delayDuration: args.delayDuration,
          "aria-label": "Main navigation",
        },
        [
          NavigationMenu.List({}, [
            NavigationMenu.Item({ value: "products" }, [
              NavigationMenu.Trigger({}, "Products"),
              NavigationMenu.Content({}, [
                $.div({ class: "navigationmenu-grid" }, [
                  $.a({ href: "#software", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Software"),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Build amazing applications with our SDK",
                    ),
                  ]),
                  $.a({ href: "#hardware", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Hardware"),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Physical devices for your needs",
                    ),
                  ]),
                  $.a({ href: "#services", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Services"),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Professional consulting and support",
                    ),
                  ]),
                  $.a({ href: "#integrations", class: "navigationmenu-link" }, [
                    $.span(
                      { class: "navigationmenu-link-title" },
                      "Integrations",
                    ),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Connect with your favorite tools",
                    ),
                  ]),
                ]),
              ]),
            ]),
            NavigationMenu.Item({ value: "solutions" }, [
              NavigationMenu.Trigger({}, "Solutions"),
              NavigationMenu.Content({}, [
                $.div({ class: "navigationmenu-grid" }, [
                  $.a({ href: "#enterprise", class: "navigationmenu-link" }, [
                    $.span(
                      { class: "navigationmenu-link-title" },
                      "Enterprise",
                    ),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Solutions for large organizations",
                    ),
                  ]),
                  $.a({ href: "#startup", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Startup"),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Get started with our startup plan",
                    ),
                  ]),
                ]),
              ]),
            ]),
            NavigationMenu.Item({ value: "resources" }, [
              NavigationMenu.Trigger({}, "Resources"),
              NavigationMenu.Content({}, [
                $.div({ class: "navigationmenu-grid" }, [
                  $.a({ href: "#docs", class: "navigationmenu-link" }, [
                    $.span(
                      { class: "navigationmenu-link-title" },
                      "Documentation",
                    ),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Learn how to use our products",
                    ),
                  ]),
                  $.a({ href: "#tutorials", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Tutorials"),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Step-by-step guides",
                    ),
                  ]),
                  $.a({ href: "#blog", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Blog"),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Latest news and updates",
                    ),
                  ]),
                  $.a({ href: "#community", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Community"),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Join our developer community",
                    ),
                  ]),
                ]),
              ]),
            ]),
          ]),
          NavigationMenu.Indicator({}),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "navigationmenu-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithFeaturedItem: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* NavigationMenu.Root({ "aria-label": "Main navigation" }, [
        NavigationMenu.List({}, [
          NavigationMenu.Item({ value: "getting-started" }, [
            NavigationMenu.Trigger({}, "Getting Started"),
            NavigationMenu.Content({}, [
              $.div(
                { style: { display: "grid", gridTemplateColumns: "1fr 2fr" } },
                [
                  $.a({ href: "#intro", class: "navigationmenu-featured" }, [
                    $.span(
                      { class: "navigationmenu-featured-title" },
                      "Effect UI",
                    ),
                    $.span(
                      { class: "navigationmenu-featured-description" },
                      "Build reactive UIs with Effect-TS. Type-safe, composable, and elegant.",
                    ),
                  ]),
                  $.div({ class: "navigationmenu-grid" }, [
                    $.a(
                      { href: "#installation", class: "navigationmenu-link" },
                      [
                        $.span(
                          { class: "navigationmenu-link-title" },
                          "Installation",
                        ),
                        $.span(
                          { class: "navigationmenu-link-description" },
                          "How to install and set up Effect UI",
                        ),
                      ],
                    ),
                    $.a({ href: "#quickstart", class: "navigationmenu-link" }, [
                      $.span(
                        { class: "navigationmenu-link-title" },
                        "Quick Start",
                      ),
                      $.span(
                        { class: "navigationmenu-link-description" },
                        "Create your first component in minutes",
                      ),
                    ]),
                    $.a({ href: "#concepts", class: "navigationmenu-link" }, [
                      $.span(
                        { class: "navigationmenu-link-title" },
                        "Core Concepts",
                      ),
                      $.span(
                        { class: "navigationmenu-link-description" },
                        "Understand Signals, Derived, and Effects",
                      ),
                    ]),
                    $.a({ href: "#examples", class: "navigationmenu-link" }, [
                      $.span(
                        { class: "navigationmenu-link-title" },
                        "Examples",
                      ),
                      $.span(
                        { class: "navigationmenu-link-description" },
                        "Real-world usage patterns",
                      ),
                    ]),
                  ]),
                ],
              ),
            ]),
          ]),
          NavigationMenu.Item({ value: "components" }, [
            NavigationMenu.Trigger({}, "Components"),
            NavigationMenu.Content({}, [
              $.div({ class: "navigationmenu-grid navigationmenu-grid--3" }, [
                $.a({ href: "#accordion", class: "navigationmenu-link" }, [
                  $.span({ class: "navigationmenu-link-title" }, "Accordion"),
                  $.span(
                    { class: "navigationmenu-link-description" },
                    "Collapsible content sections",
                  ),
                ]),
                $.a({ href: "#dialog", class: "navigationmenu-link" }, [
                  $.span({ class: "navigationmenu-link-title" }, "Dialog"),
                  $.span(
                    { class: "navigationmenu-link-description" },
                    "Modal dialogs with focus trap",
                  ),
                ]),
                $.a({ href: "#dropdown", class: "navigationmenu-link" }, [
                  $.span(
                    { class: "navigationmenu-link-title" },
                    "Dropdown Menu",
                  ),
                  $.span(
                    { class: "navigationmenu-link-description" },
                    "Accessible dropdown menus",
                  ),
                ]),
                $.a({ href: "#popover", class: "navigationmenu-link" }, [
                  $.span({ class: "navigationmenu-link-title" }, "Popover"),
                  $.span(
                    { class: "navigationmenu-link-description" },
                    "Floating content panels",
                  ),
                ]),
                $.a({ href: "#select", class: "navigationmenu-link" }, [
                  $.span({ class: "navigationmenu-link-title" }, "Select"),
                  $.span(
                    { class: "navigationmenu-link-description" },
                    "Custom select components",
                  ),
                ]),
                $.a({ href: "#tabs", class: "navigationmenu-link" }, [
                  $.span({ class: "navigationmenu-link-title" }, "Tabs"),
                  $.span(
                    { class: "navigationmenu-link-description" },
                    "Tabbed navigation",
                  ),
                ]),
              ]),
            ]),
          ]),
        ]),
        NavigationMenu.Indicator({}),
      ]);
    });

    const container = document.createElement("div");
    container.className = "navigationmenu-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Vertical: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* NavigationMenu.Root(
        { orientation: "vertical", "aria-label": "Sidebar navigation" },
        [
          NavigationMenu.List({}, [
            NavigationMenu.Item({ value: "dashboard" }, [
              NavigationMenu.Trigger({}, "Dashboard"),
              NavigationMenu.Content({}, [
                $.div({ style: { display: "flex", flexDirection: "column" } }, [
                  $.a({ href: "#overview", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Overview"),
                  ]),
                  $.a({ href: "#analytics", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Analytics"),
                  ]),
                  $.a({ href: "#reports", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Reports"),
                  ]),
                ]),
              ]),
            ]),
            NavigationMenu.Item({ value: "settings" }, [
              NavigationMenu.Trigger({}, "Settings"),
              NavigationMenu.Content({}, [
                $.div({ style: { display: "flex", flexDirection: "column" } }, [
                  $.a({ href: "#profile", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Profile"),
                  ]),
                  $.a({ href: "#account", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Account"),
                  ]),
                  $.a({ href: "#security", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Security"),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "navigationmenu-story-container";
    container.style.maxWidth = "300px";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const activeItem = yield* Signal.make<string | null>(null);

      const statusText = yield* $.p(
        activeItem.map((item) =>
          item ? `Active item: ${item}` : "No item selected",
        ),
      );

      const nav = yield* NavigationMenu.Root(
        {
          value: activeItem,
          onValueChange: (value) =>
            Effect.log(`Navigation item changed to: ${value}`),
          "aria-label": "Main navigation",
        },
        [
          NavigationMenu.List({}, [
            NavigationMenu.Item({ value: "products" }, [
              NavigationMenu.Trigger({}, "Products"),
              NavigationMenu.Content({}, [
                $.div({ class: "navigationmenu-grid" }, [
                  $.a({ href: "#software", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Software"),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Build amazing applications",
                    ),
                  ]),
                  $.a({ href: "#hardware", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Hardware"),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Physical devices",
                    ),
                  ]),
                ]),
              ]),
            ]),
            NavigationMenu.Item({ value: "about" }, [
              NavigationMenu.Trigger({}, "About"),
              NavigationMenu.Content({}, [
                $.div({ class: "navigationmenu-grid" }, [
                  $.a({ href: "#team", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Our Team"),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Meet the people behind the product",
                    ),
                  ]),
                  $.a({ href: "#careers", class: "navigationmenu-link" }, [
                    $.span({ class: "navigationmenu-link-title" }, "Careers"),
                    $.span(
                      { class: "navigationmenu-link-description" },
                      "Join our team",
                    ),
                  ]),
                ]),
              ]),
            ]),
          ]),
          NavigationMenu.Indicator({}),
        ],
      );

      const buttons = yield* $.div(
        { style: { display: "flex", gap: "8px", marginTop: "20px" } },
        [
          $.button(
            {
              class: "navigationmenu-simple-link",
              style: { background: "#e2e8f0" },
              onClick: () => activeItem.set("products"),
            },
            "Open Products",
          ),
          $.button(
            {
              class: "navigationmenu-simple-link",
              style: { background: "#e2e8f0" },
              onClick: () => activeItem.set("about"),
            },
            "Open About",
          ),
          $.button(
            {
              class: "navigationmenu-simple-link",
              style: { background: "#e2e8f0" },
              onClick: () => activeItem.set(null),
            },
            "Close All",
          ),
        ],
      );

      const wrapper = document.createElement("div");
      wrapper.appendChild(nav);
      wrapper.appendChild(statusText);
      wrapper.appendChild(buttons);

      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "navigationmenu-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithSimpleLinks: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* NavigationMenu.Root({ "aria-label": "Main navigation" }, [
        NavigationMenu.List({}, [
          NavigationMenu.Item({ value: "products" }, [
            NavigationMenu.Trigger({}, "Products"),
            NavigationMenu.Content({}, [
              $.div({ class: "navigationmenu-grid" }, [
                $.a({ href: "#software", class: "navigationmenu-link" }, [
                  $.span({ class: "navigationmenu-link-title" }, "Software"),
                  $.span(
                    { class: "navigationmenu-link-description" },
                    "Build amazing applications",
                  ),
                ]),
                $.a({ href: "#hardware", class: "navigationmenu-link" }, [
                  $.span({ class: "navigationmenu-link-title" }, "Hardware"),
                  $.span(
                    { class: "navigationmenu-link-description" },
                    "Physical devices",
                  ),
                ]),
              ]),
            ]),
          ]),
          // Simple link without submenu
          $.li({ "data-navigationmenu-item": "" }, [
            $.a(
              { href: "#pricing", class: "navigationmenu-simple-link" },
              "Pricing",
            ),
          ]),
          // Another simple link
          $.li({ "data-navigationmenu-item": "" }, [
            $.a(
              { href: "#contact", class: "navigationmenu-simple-link" },
              "Contact",
            ),
          ]),
        ]),
        NavigationMenu.Indicator({}),
      ]);
    });

    const container = document.createElement("div");
    container.className = "navigationmenu-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
