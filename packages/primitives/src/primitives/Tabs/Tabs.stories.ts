import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Tabs } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

type TabsStoryArgs = {
  defaultValue?: string;
  orientation?: "horizontal" | "vertical";
  activationMode?: "automatic" | "manual";
};

const meta: Meta<TabsStoryArgs> = {
  title: "Primitives/Tabs",
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "Default active tab value",
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Tab orientation",
    },
    activationMode: {
      control: "select",
      options: ["automatic", "manual"],
      description: "Activation mode",
    },
  },
  args: {
    defaultValue: "account",
    orientation: "horizontal",
    activationMode: "automatic",
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* Tabs.Root(
        {
          defaultValue: args.defaultValue,
          orientation: args.orientation,
          activationMode: args.activationMode,
        },
        [
          Tabs.List({ class: "tabs tabs-border" }, [
            Tabs.Trigger(
              { value: "account", class: "tab data-[state=active]:tab-active" },
              "Account",
            ),
            Tabs.Trigger(
              {
                value: "password",
                class: "tab data-[state=active]:tab-active",
              },
              "Password",
            ),
            Tabs.Trigger(
              {
                value: "settings",
                class: "tab data-[state=active]:tab-active",
              },
              "Settings",
            ),
          ]),
          Tabs.Content({ value: "account", class: "p-4" }, [
            $.h3({ class: "font-semibold text-lg mb-2" }, "Account Settings"),
            $.p(
              { class: "text-base-content/70" },
              "Manage your account information and preferences. Update your display name, email address, and profile picture.",
            ),
          ]),
          Tabs.Content({ value: "password", class: "p-4" }, [
            $.h3({ class: "font-semibold text-lg mb-2" }, "Password"),
            $.p(
              { class: "text-base-content/70" },
              "Change your password here. After saving, you'll be logged out and need to sign in with your new password.",
            ),
          ]),
          Tabs.Content({ value: "settings", class: "p-4" }, [
            $.h3({ class: "font-semibold text-lg mb-2" }, "Settings"),
            $.p(
              { class: "text-base-content/70" },
              "Configure your application settings. Adjust notifications, privacy preferences, and more.",
            ),
          ]),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "p-4";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export default meta;
type Story = StoryObj<TabsStoryArgs>;

export const Default: Story = {};

export const Lifted: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Tabs.Root({ defaultValue: "tab1" }, [
        Tabs.List({ class: "tabs tabs-lift" }, [
          Tabs.Trigger(
            { value: "tab1", class: "tab data-[state=active]:tab-active" },
            "Tab 1",
          ),
          Tabs.Trigger(
            { value: "tab2", class: "tab data-[state=active]:tab-active" },
            "Tab 2",
          ),
          Tabs.Trigger(
            { value: "tab3", class: "tab data-[state=active]:tab-active" },
            "Tab 3",
          ),
        ]),
        $.div({ class: "bg-base-100 border-base-300 rounded-box p-6 border" }, [
          Tabs.Content({ value: "tab1" }, [$.p({}, "Content for Tab 1")]),
          Tabs.Content({ value: "tab2" }, [$.p({}, "Content for Tab 2")]),
          Tabs.Content({ value: "tab3" }, [$.p({}, "Content for Tab 3")]),
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

export const Boxed: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Tabs.Root({ defaultValue: "tab1" }, [
        Tabs.List({ class: "tabs tabs-box" }, [
          Tabs.Trigger(
            { value: "tab1", class: "tab data-[state=active]:tab-active" },
            "Tab 1",
          ),
          Tabs.Trigger(
            { value: "tab2", class: "tab data-[state=active]:tab-active" },
            "Tab 2",
          ),
          Tabs.Trigger(
            { value: "tab3", class: "tab data-[state=active]:tab-active" },
            "Tab 3",
          ),
        ]),
        Tabs.Content({ value: "tab1", class: "p-4" }, [
          $.p({}, "Content for Tab 1"),
        ]),
        Tabs.Content({ value: "tab2", class: "p-4" }, [
          $.p({}, "Content for Tab 2"),
        ]),
        Tabs.Content({ value: "tab3", class: "p-4" }, [
          $.p({}, "Content for Tab 3"),
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

export const ManualActivation: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({}, [
        $.p(
          { class: "text-sm text-base-content/70 mb-4" },
          "Use arrow keys to navigate, then press Enter or Space to select a tab.",
        ),
        Tabs.Root({ defaultValue: "tab1", activationMode: "manual" }, [
          Tabs.List({ class: "tabs tabs-border" }, [
            Tabs.Trigger(
              { value: "tab1", class: "tab data-[state=active]:tab-active" },
              "Tab 1",
            ),
            Tabs.Trigger(
              { value: "tab2", class: "tab data-[state=active]:tab-active" },
              "Tab 2",
            ),
            Tabs.Trigger(
              { value: "tab3", class: "tab data-[state=active]:tab-active" },
              "Tab 3",
            ),
          ]),
          Tabs.Content({ value: "tab1", class: "p-4" }, [
            $.p(
              {},
              "Content for Tab 1. Focus moves with arrows, but you must press Enter/Space to activate.",
            ),
          ]),
          Tabs.Content({ value: "tab2", class: "p-4" }, [
            $.p({}, "Content for Tab 2."),
          ]),
          Tabs.Content({ value: "tab3", class: "p-4" }, [
            $.p({}, "Content for Tab 3."),
          ]),
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

export const WithDisabledTab: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Tabs.Root({ defaultValue: "active" }, [
        Tabs.List({ class: "tabs tabs-border" }, [
          Tabs.Trigger(
            { value: "active", class: "tab data-[state=active]:tab-active" },
            "Active Tab",
          ),
          Tabs.Trigger(
            { value: "disabled", class: "tab tab-disabled", disabled: true },
            "Disabled Tab",
          ),
          Tabs.Trigger(
            { value: "another", class: "tab data-[state=active]:tab-active" },
            "Another Tab",
          ),
        ]),
        Tabs.Content({ value: "active", class: "p-4" }, [
          $.p({}, "This is the active tab content."),
        ]),
        Tabs.Content({ value: "disabled", class: "p-4" }, [
          $.p({}, "You shouldn't be able to see this (disabled tab)."),
        ]),
        Tabs.Content({ value: "another", class: "p-4" }, [
          $.p({}, "This is another tab's content."),
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

export const Controlled: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const activeTab = yield* Signal.make("tab1");

      return yield* $.div({ class: "flex flex-col gap-4" }, [
        $.div(
          { class: "badge badge-neutral" },
          activeTab.map((tab) => `Current tab: ${tab}`),
        ),
        $.div({ class: "flex gap-2" }, [
          $.button(
            {
              class: "btn btn-xs btn-outline",
              onClick: () => activeTab.set("tab1"),
            },
            "Go to Tab 1",
          ),
          $.button(
            {
              class: "btn btn-xs btn-outline",
              onClick: () => activeTab.set("tab2"),
            },
            "Go to Tab 2",
          ),
          $.button(
            {
              class: "btn btn-xs btn-outline",
              onClick: () => activeTab.set("tab3"),
            },
            "Go to Tab 3",
          ),
        ]),
        Tabs.Root({ value: activeTab }, [
          Tabs.List({ class: "tabs tabs-border" }, [
            Tabs.Trigger(
              { value: "tab1", class: "tab data-[state=active]:tab-active" },
              "Tab 1",
            ),
            Tabs.Trigger(
              { value: "tab2", class: "tab data-[state=active]:tab-active" },
              "Tab 2",
            ),
            Tabs.Trigger(
              { value: "tab3", class: "tab data-[state=active]:tab-active" },
              "Tab 3",
            ),
          ]),
          Tabs.Content({ value: "tab1", class: "p-4" }, [
            $.p(
              {},
              "Content for Tab 1. You can control this from the buttons above.",
            ),
          ]),
          Tabs.Content({ value: "tab2", class: "p-4" }, [
            $.p({}, "Content for Tab 2."),
          ]),
          Tabs.Content({ value: "tab3", class: "p-4" }, [
            $.p({}, "Content for Tab 3."),
          ]),
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

export const WithForms: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* $.div({ class: "card bg-base-200" }, [
        Tabs.Root({ defaultValue: "account" }, [
          Tabs.List({ class: "tabs tabs-border bg-base-300 rounded-t-box" }, [
            Tabs.Trigger(
              { value: "account", class: "tab data-[state=active]:tab-active" },
              "Account",
            ),
            Tabs.Trigger(
              {
                value: "password",
                class: "tab data-[state=active]:tab-active",
              },
              "Password",
            ),
          ]),
          $.div({ class: "card-body" }, [
            Tabs.Content({ value: "account" }, [
              $.div({ class: "form-control w-full" }, [
                $.label({ class: "label" }, [
                  $.span({ class: "label-text" }, "Name"),
                ]),
                $.input({
                  type: "text",
                  class: "input input-bordered w-full",
                  placeholder: "Enter your name",
                }),
              ]),
              $.div({ class: "form-control w-full mt-4" }, [
                $.label({ class: "label" }, [
                  $.span({ class: "label-text" }, "Email"),
                ]),
                $.input({
                  type: "email",
                  class: "input input-bordered w-full",
                  placeholder: "Enter your email",
                }),
              ]),
              $.button({ class: "btn btn-primary mt-6" }, "Save Changes"),
            ]),
            Tabs.Content({ value: "password" }, [
              $.div({ class: "form-control w-full" }, [
                $.label({ class: "label" }, [
                  $.span({ class: "label-text" }, "Current Password"),
                ]),
                $.input({
                  type: "password",
                  class: "input input-bordered w-full",
                }),
              ]),
              $.div({ class: "form-control w-full mt-4" }, [
                $.label({ class: "label" }, [
                  $.span({ class: "label-text" }, "New Password"),
                ]),
                $.input({
                  type: "password",
                  class: "input input-bordered w-full",
                }),
              ]),
              $.div({ class: "form-control w-full mt-4" }, [
                $.label({ class: "label" }, [
                  $.span({ class: "label-text" }, "Confirm Password"),
                ]),
                $.input({
                  type: "password",
                  class: "input input-bordered w-full",
                }),
              ]),
              $.button({ class: "btn btn-primary mt-6" }, "Update Password"),
            ]),
          ]),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-4 max-w-md";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const Sizes: Story = {
  render: () => {
    const element = $.div({ class: "flex flex-col gap-6" }, [
      $.div({}, [
        $.p({ class: "text-sm mb-2 text-base-content/70" }, "Extra Small"),
        Effect.gen(function* () {
          return yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({ class: "tabs tabs-border tabs-xs" }, [
              Tabs.Trigger(
                { value: "tab1", class: "tab data-[state=active]:tab-active" },
                "Tab 1",
              ),
              Tabs.Trigger(
                { value: "tab2", class: "tab data-[state=active]:tab-active" },
                "Tab 2",
              ),
            ]),
          ]);
        }),
      ]),
      $.div({}, [
        $.p({ class: "text-sm mb-2 text-base-content/70" }, "Small"),
        Effect.gen(function* () {
          return yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({ class: "tabs tabs-border tabs-sm" }, [
              Tabs.Trigger(
                { value: "tab1", class: "tab data-[state=active]:tab-active" },
                "Tab 1",
              ),
              Tabs.Trigger(
                { value: "tab2", class: "tab data-[state=active]:tab-active" },
                "Tab 2",
              ),
            ]),
          ]);
        }),
      ]),
      $.div({}, [
        $.p({ class: "text-sm mb-2 text-base-content/70" }, "Medium (default)"),
        Effect.gen(function* () {
          return yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({ class: "tabs tabs-border" }, [
              Tabs.Trigger(
                { value: "tab1", class: "tab data-[state=active]:tab-active" },
                "Tab 1",
              ),
              Tabs.Trigger(
                { value: "tab2", class: "tab data-[state=active]:tab-active" },
                "Tab 2",
              ),
            ]),
          ]);
        }),
      ]),
      $.div({}, [
        $.p({ class: "text-sm mb-2 text-base-content/70" }, "Large"),
        Effect.gen(function* () {
          return yield* Tabs.Root({ defaultValue: "tab1" }, [
            Tabs.List({ class: "tabs tabs-border tabs-lg" }, [
              Tabs.Trigger(
                { value: "tab1", class: "tab data-[state=active]:tab-active" },
                "Tab 1",
              ),
              Tabs.Trigger(
                { value: "tab2", class: "tab data-[state=active]:tab-active" },
                "Tab 2",
              ),
            ]),
          ]);
        }),
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
