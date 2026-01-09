import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { NavigationMenu } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

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
          class: "navbar bg-base-200 rounded-box",
        },
        [
          NavigationMenu.List(
            { class: "menu menu-horizontal dropdown-content" },
            [
              NavigationMenu.Item({ value: "products", class: "relative" }, [
                NavigationMenu.Trigger({ class: "btn btn-ghost" }, "Products"),
                NavigationMenu.Content(
                  {
                    class: [
                      "absolute top-full left-0 mt-4 w-96 bg-base-200 rounded-box shadow-xl p-4 z-50",
                      "data-[state=closed]:hidden",
                    ],
                  },
                  [
                    $.div({ class: "grid grid-cols-2 gap-2" }, [
                      $.a(
                        {
                          href: "#software",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Software"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Build amazing applications with our SDK",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#hardware",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Hardware"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Physical devices for your needs",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#services",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Services"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Professional consulting and support",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#integrations",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span(
                            { class: "font-medium block" },
                            "Integrations",
                          ),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Connect with your favorite tools",
                          ),
                        ],
                      ),
                    ]),
                  ],
                ),
              ]),
              NavigationMenu.Item({ value: "solutions", class: "relative" }, [
                NavigationMenu.Trigger({ class: "btn btn-ghost" }, "Solutions"),
                NavigationMenu.Content(
                  {
                    class: [
                      "absolute top-full left-0 mt-4 w-96 bg-base-200 rounded-box shadow-xl p-4 z-50",
                      "data-[state=closed]:hidden",
                    ],
                  },
                  [
                    $.div({ class: "flex flex-col gap-2" }, [
                      $.a(
                        {
                          href: "#enterprise",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Enterprise"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Solutions for large organizations",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#startup",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Startup"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Get started with our startup plan",
                          ),
                        ],
                      ),
                    ]),
                  ],
                ),
              ]),
              NavigationMenu.Item({ value: "resources", class: "relative" }, [
                NavigationMenu.Trigger({ class: "btn btn-ghost" }, "Resources"),
                NavigationMenu.Content(
                  {
                    class: [
                      "absolute top-full left-0 mt-4 w-96 bg-base-200 rounded-box shadow-xl p-4 z-50",
                      "data-[state=closed]:hidden",
                    ],
                  },
                  [
                    $.div({ class: "grid grid-cols-2 gap-2" }, [
                      $.a(
                        {
                          href: "#docs",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span(
                            { class: "font-medium block" },
                            "Documentation",
                          ),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Learn how to use our products",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#tutorials",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Tutorials"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Step-by-step guides",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#blog",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Blog"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Latest news and updates",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#community",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Community"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Join our developer community",
                          ),
                        ],
                      ),
                    ]),
                  ],
                ),
              ]),
            ],
          ),
          NavigationMenu.Indicator({
            class:
              "absolute bottom-0 h-1 bg-primary rounded-full transition-all",
          }),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[300px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithFeaturedItem: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* NavigationMenu.Root(
        {
          "aria-label": "Main navigation",
          class: "navbar bg-base-200 rounded-box",
        },
        [
          NavigationMenu.List(
            { class: "menu menu-horizontal dropdown-content" },
            [
              NavigationMenu.Item(
                { value: "getting-started", class: "relative" },
                [
                  NavigationMenu.Trigger(
                    { class: "btn btn-ghost" },
                    "Getting Started",
                  ),
                  NavigationMenu.Content(
                    {
                      class: [
                        "absolute top-full left-0 mt-4 w-[500px] bg-base-200 rounded-box shadow-xl p-4 z-50",
                        "data-[state=closed]:hidden",
                      ],
                    },
                    [
                      $.div({ class: "grid grid-cols-[1fr_2fr] gap-4" }, [
                        $.a(
                          {
                            href: "#intro",
                            class:
                              "p-4 rounded-btn bg-primary/10 hover:bg-primary/20 block",
                          },
                          [
                            $.span(
                              { class: "font-bold text-lg block text-primary" },
                              "Effex",
                            ),
                            $.span(
                              { class: "text-sm text-base-content/70" },
                              "Build reactive UIs with Effect-TS. Type-safe, composable, and elegant.",
                            ),
                          ],
                        ),
                        $.div({ class: "grid grid-cols-2 gap-2" }, [
                          $.a(
                            {
                              href: "#installation",
                              class: "p-3 rounded-btn hover:bg-base-300 block",
                            },
                            [
                              $.span(
                                { class: "font-medium block" },
                                "Installation",
                              ),
                              $.span(
                                { class: "text-sm text-base-content/70" },
                                "How to install and set up Effex",
                              ),
                            ],
                          ),
                          $.a(
                            {
                              href: "#quickstart",
                              class: "p-3 rounded-btn hover:bg-base-300 block",
                            },
                            [
                              $.span(
                                { class: "font-medium block" },
                                "Quick Start",
                              ),
                              $.span(
                                { class: "text-sm text-base-content/70" },
                                "Create your first component",
                              ),
                            ],
                          ),
                          $.a(
                            {
                              href: "#concepts",
                              class: "p-3 rounded-btn hover:bg-base-300 block",
                            },
                            [
                              $.span(
                                { class: "font-medium block" },
                                "Core Concepts",
                              ),
                              $.span(
                                { class: "text-sm text-base-content/70" },
                                "Signals, Derived, and Effects",
                              ),
                            ],
                          ),
                          $.a(
                            {
                              href: "#examples",
                              class: "p-3 rounded-btn hover:bg-base-300 block",
                            },
                            [
                              $.span(
                                { class: "font-medium block" },
                                "Examples",
                              ),
                              $.span(
                                { class: "text-sm text-base-content/70" },
                                "Real-world usage patterns",
                              ),
                            ],
                          ),
                        ]),
                      ]),
                    ],
                  ),
                ],
              ),
              NavigationMenu.Item({ value: "components", class: "relative" }, [
                NavigationMenu.Trigger(
                  { class: "btn btn-ghost" },
                  "Components",
                ),
                NavigationMenu.Content(
                  {
                    class: [
                      "absolute top-full left-0 mt-4 w-96 bg-base-200 rounded-box shadow-xl p-4 z-50",
                      "data-[state=closed]:hidden",
                    ],
                  },
                  [
                    $.div({ class: "grid grid-cols-3 gap-2" }, [
                      $.a(
                        {
                          href: "#accordion",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Accordion"),
                          $.span(
                            { class: "text-xs text-base-content/70" },
                            "Collapsible sections",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#dialog",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Dialog"),
                          $.span(
                            { class: "text-xs text-base-content/70" },
                            "Modal dialogs",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#dropdown",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Dropdown"),
                          $.span(
                            { class: "text-xs text-base-content/70" },
                            "Dropdown menus",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#popover",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Popover"),
                          $.span(
                            { class: "text-xs text-base-content/70" },
                            "Floating panels",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#select",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Select"),
                          $.span(
                            { class: "text-xs text-base-content/70" },
                            "Custom select",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#tabs",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Tabs"),
                          $.span(
                            { class: "text-xs text-base-content/70" },
                            "Tabbed navigation",
                          ),
                        ],
                      ),
                    ]),
                  ],
                ),
              ]),
            ],
          ),
          NavigationMenu.Indicator({
            class:
              "absolute bottom-0 h-1 bg-primary rounded-full transition-all",
          }),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[350px]";

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
        {
          orientation: "vertical",
          "aria-label": "Sidebar navigation",
          class: "relative",
        },
        [
          NavigationMenu.List({ class: "menu bg-base-200 rounded-box w-56" }, [
            NavigationMenu.Item({ value: "dashboard", class: "relative" }, [
              NavigationMenu.Trigger(
                {
                  class:
                    "w-full text-left px-4 py-2 rounded-btn hover:bg-base-300",
                },
                "Dashboard",
              ),
              NavigationMenu.Content(
                {
                  class: [
                    "absolute left-full top-0 ml-2 w-48 bg-base-200 rounded-box shadow-xl p-2 z-50",
                    "data-[state=closed]:hidden",
                  ],
                },
                [
                  $.div({ class: "flex flex-col" }, [
                    $.a(
                      {
                        href: "#overview",
                        class: "px-3 py-2 rounded-btn hover:bg-base-300",
                      },
                      "Overview",
                    ),
                    $.a(
                      {
                        href: "#analytics",
                        class: "px-3 py-2 rounded-btn hover:bg-base-300",
                      },
                      "Analytics",
                    ),
                    $.a(
                      {
                        href: "#reports",
                        class: "px-3 py-2 rounded-btn hover:bg-base-300",
                      },
                      "Reports",
                    ),
                  ]),
                ],
              ),
            ]),
            NavigationMenu.Item({ value: "settings", class: "relative" }, [
              NavigationMenu.Trigger(
                {
                  class:
                    "w-full text-left px-4 py-2 rounded-btn hover:bg-base-300",
                },
                "Settings",
              ),
              NavigationMenu.Content(
                {
                  class: [
                    "absolute left-full top-0 ml-2 w-48 bg-base-200 rounded-box shadow-xl p-2 z-50",
                    "data-[state=closed]:hidden",
                  ],
                },
                [
                  $.div({ class: "flex flex-col" }, [
                    $.a(
                      {
                        href: "#profile",
                        class: "px-3 py-2 rounded-btn hover:bg-base-300",
                      },
                      "Profile",
                    ),
                    $.a(
                      {
                        href: "#account",
                        class: "px-3 py-2 rounded-btn hover:bg-base-300",
                      },
                      "Account",
                    ),
                    $.a(
                      {
                        href: "#security",
                        class: "px-3 py-2 rounded-btn hover:bg-base-300",
                      },
                      "Security",
                    ),
                  ]),
                ],
              ),
            ]),
          ]),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[200px]";

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
        { class: "mb-4 badge badge-neutral" },
        activeItem.map((item) =>
          item ? `Active: ${item}` : "No item selected",
        ),
      );

      const nav = yield* NavigationMenu.Root(
        {
          value: activeItem,
          onValueChange: (value) =>
            Effect.log(`Navigation item changed to: ${value}`),
          "aria-label": "Main navigation",
          class: "navbar bg-base-200 rounded-box",
        },
        [
          NavigationMenu.List(
            { class: "menu menu-horizontal dropdown-content" },
            [
              NavigationMenu.Item({ value: "products", class: "relative" }, [
                NavigationMenu.Trigger({ class: "btn btn-ghost" }, "Products"),
                NavigationMenu.Content(
                  {
                    class: [
                      "absolute top-full left-0 mt-4 w-64 bg-base-200 rounded-box shadow-xl p-4 z-50",
                      "data-[state=closed]:hidden",
                    ],
                  },
                  [
                    $.div({ class: "flex flex-col gap-2" }, [
                      $.a(
                        {
                          href: "#software",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Software"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Build amazing applications",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#hardware",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Hardware"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Physical devices",
                          ),
                        ],
                      ),
                    ]),
                  ],
                ),
              ]),
              NavigationMenu.Item({ value: "about", class: "relative" }, [
                NavigationMenu.Trigger({ class: "btn btn-ghost" }, "About"),
                NavigationMenu.Content(
                  {
                    class: [
                      "absolute top-full left-0 mt-4 w-64 bg-base-200 rounded-box shadow-xl p-4 z-50",
                      "data-[state=closed]:hidden",
                    ],
                  },
                  [
                    $.div({ class: "flex flex-col gap-2" }, [
                      $.a(
                        {
                          href: "#team",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Our Team"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Meet the people behind the product",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#careers",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Careers"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Join our team",
                          ),
                        ],
                      ),
                    ]),
                  ],
                ),
              ]),
            ],
          ),
          NavigationMenu.Indicator({
            class:
              "absolute bottom-0 h-1 bg-primary rounded-full transition-all",
          }),
        ],
      );

      const buttons = yield* $.div({ class: "flex gap-2 mt-4" }, [
        $.button(
          {
            class: "btn btn-sm btn-outline",
            onClick: () => activeItem.set("products"),
          },
          "Open Products",
        ),
        $.button(
          {
            class: "btn btn-sm btn-outline",
            onClick: () => activeItem.set("about"),
          },
          "Open About",
        ),
        $.button(
          {
            class: "btn btn-sm btn-outline",
            onClick: () => activeItem.set(null),
          },
          "Close All",
        ),
      ]);

      const wrapper = document.createElement("div");
      wrapper.appendChild(statusText);
      wrapper.appendChild(nav);
      wrapper.appendChild(buttons);

      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[300px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithSimpleLinks: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* NavigationMenu.Root(
        {
          "aria-label": "Main navigation",
          class: "navbar bg-base-200 rounded-box",
        },
        [
          NavigationMenu.List(
            { class: "menu menu-horizontal dropdown-content" },
            [
              NavigationMenu.Item({ value: "products", class: "relative" }, [
                NavigationMenu.Trigger({ class: "btn btn-ghost" }, "Products"),
                NavigationMenu.Content(
                  {
                    class: [
                      "absolute top-full left-0 mt-4 w-64 bg-base-200 rounded-box shadow-xl p-4 z-50",
                      "data-[state=closed]:hidden",
                    ],
                  },
                  [
                    $.div({ class: "flex flex-col gap-2" }, [
                      $.a(
                        {
                          href: "#software",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Software"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Build amazing applications",
                          ),
                        ],
                      ),
                      $.a(
                        {
                          href: "#hardware",
                          class: "p-3 rounded-btn hover:bg-base-300 block",
                        },
                        [
                          $.span({ class: "font-medium block" }, "Hardware"),
                          $.span(
                            { class: "text-sm text-base-content/70" },
                            "Physical devices",
                          ),
                        ],
                      ),
                    ]),
                  ],
                ),
              ]),
              $.li({}, [
                $.a({ href: "#pricing", class: "btn btn-ghost" }, "Pricing"),
              ]),
              $.li({}, [
                $.a({ href: "#contact", class: "btn btn-ghost" }, "Contact"),
              ]),
            ],
          ),
          NavigationMenu.Indicator({
            class:
              "absolute bottom-0 h-1 bg-primary rounded-full transition-all",
          }),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4 min-h-[250px]";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
