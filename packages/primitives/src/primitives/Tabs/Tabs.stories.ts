import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
import { Tabs } from "@effex/primitives";
import { $ } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Tabs.stories.css";

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
          Tabs.List({}, [
            Tabs.Trigger({ value: "account" }, "Account"),
            Tabs.Trigger({ value: "password" }, "Password"),
            Tabs.Trigger({ value: "settings" }, "Settings"),
          ]),
          Tabs.Content({ value: "account" }, [
            $.h3("Account Settings"),
            $.p(
              "Manage your account information and preferences. Update your display name, email address, and profile picture.",
            ),
          ]),
          Tabs.Content({ value: "password" }, [
            $.h3("Password"),
            $.p(
              "Change your password here. After saving, you'll be logged out and need to sign in with your new password.",
            ),
          ]),
          Tabs.Content({ value: "settings" }, [
            $.h3("Settings"),
            $.p(
              "Configure your application settings. Adjust notifications, privacy preferences, and more.",
            ),
          ]),
        ],
      );
    });

    const container = document.createElement("div");
    container.className = "tabs-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export default meta;
type Story = StoryObj<TabsStoryArgs>;

export const Default: Story = {};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      const root = yield* Tabs.Root(
        {
          defaultValue: args.defaultValue,
          orientation: args.orientation,
        },
        [
          Tabs.List({}, [
            Tabs.Trigger({ value: "account" }, "Account"),
            Tabs.Trigger({ value: "password" }, "Password"),
            Tabs.Trigger({ value: "settings" }, "Settings"),
          ]),
          Tabs.Content({ value: "account" }, [
            $.h3("Account Settings"),
            $.p("Manage your account information."),
          ]),
          Tabs.Content({ value: "password" }, [
            $.h3("Password"),
            $.p("Change your password here."),
          ]),
          Tabs.Content({ value: "settings" }, [
            $.h3("Settings"),
            $.p("Configure your application settings."),
          ]),
        ],
      );

      const wrapper = document.createElement("div");
      wrapper.className = "tabs-vertical-container";
      wrapper.appendChild(root);
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "tabs-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const ManualActivation: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const info = yield* $.p(
        {
          style: { fontSize: "14px", color: "#6b7280", marginBottom: "16px" },
        },
        "Use arrow keys to navigate, then press Enter or Space to select a tab.",
      );

      const tabs = yield* Tabs.Root(
        {
          defaultValue: "tab1",
          activationMode: "manual",
        },
        [
          Tabs.List({}, [
            Tabs.Trigger({ value: "tab1" }, "Tab 1"),
            Tabs.Trigger({ value: "tab2" }, "Tab 2"),
            Tabs.Trigger({ value: "tab3" }, "Tab 3"),
          ]),
          Tabs.Content({ value: "tab1" }, [
            $.p(
              "Content for Tab 1. Focus moves with arrows, but you must press Enter/Space to activate.",
            ),
          ]),
          Tabs.Content({ value: "tab2" }, [$.p("Content for Tab 2.")]),
          Tabs.Content({ value: "tab3" }, [$.p("Content for Tab 3.")]),
        ],
      );

      const wrapper = document.createElement("div");
      wrapper.appendChild(info);
      wrapper.appendChild(tabs);
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "tabs-story-container";

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
        Tabs.List({}, [
          Tabs.Trigger({ value: "active" }, "Active Tab"),
          Tabs.Trigger({ value: "disabled", disabled: true }, "Disabled Tab"),
          Tabs.Trigger({ value: "another" }, "Another Tab"),
        ]),
        Tabs.Content({ value: "active" }, [
          $.p("This is the active tab content."),
        ]),
        Tabs.Content({ value: "disabled" }, [
          $.p("You shouldn't be able to see this (disabled tab)."),
        ]),
        Tabs.Content({ value: "another" }, [
          $.p("This is another tab's content."),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "tabs-story-container";

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

      const statusText = yield* $.p(
        { style: { fontSize: "14px", color: "#6b7280", marginBottom: "16px" } },
        activeTab.map((tab) => `Current tab: ${tab}`),
      );

      const buttonGroup = yield* $.div(
        { style: { display: "flex", gap: "8px", marginBottom: "16px" } },
        [
          $.button(
            {
              class: "tabs-form-button",
              onClick: () => activeTab.set("tab1"),
            },
            "Go to Tab 1",
          ),
          $.button(
            {
              class: "tabs-form-button",
              onClick: () => activeTab.set("tab2"),
            },
            "Go to Tab 2",
          ),
          $.button(
            {
              class: "tabs-form-button",
              onClick: () => activeTab.set("tab3"),
            },
            "Go to Tab 3",
          ),
        ],
      );

      const tabs = yield* Tabs.Root(
        {
          value: activeTab,
          onValueChange: (value) => Effect.log(`Tab changed to: ${value}`),
        },
        [
          Tabs.List({}, [
            Tabs.Trigger({ value: "tab1" }, "Tab 1"),
            Tabs.Trigger({ value: "tab2" }, "Tab 2"),
            Tabs.Trigger({ value: "tab3" }, "Tab 3"),
          ]),
          Tabs.Content({ value: "tab1" }, [
            $.p(
              "Content for Tab 1. You can control this from the buttons above.",
            ),
          ]),
          Tabs.Content({ value: "tab2" }, [$.p("Content for Tab 2.")]),
          Tabs.Content({ value: "tab3" }, [$.p("Content for Tab 3.")]),
        ],
      );

      const wrapper = document.createElement("div");
      wrapper.appendChild(statusText);
      wrapper.appendChild(buttonGroup);
      wrapper.appendChild(tabs);
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "tabs-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const CardStyle: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Tabs.Root({ defaultValue: "overview" }, [
        Tabs.List({ class: "tabs-card-list" }, [
          Tabs.Trigger({ value: "overview" }, "Overview"),
          Tabs.Trigger({ value: "analytics" }, "Analytics"),
          Tabs.Trigger({ value: "reports" }, "Reports"),
          Tabs.Trigger({ value: "notifications" }, "Notifications"),
        ]),
        Tabs.Content({ value: "overview" }, [
          $.h3("Overview"),
          $.p(
            "Welcome to your dashboard. Here's a quick overview of your account.",
          ),
        ]),
        Tabs.Content({ value: "analytics" }, [
          $.h3("Analytics"),
          $.p("View detailed analytics and insights about your usage."),
        ]),
        Tabs.Content({ value: "reports" }, [
          $.h3("Reports"),
          $.p("Generate and download reports for your data."),
        ]),
        Tabs.Content({ value: "notifications" }, [
          $.h3("Notifications"),
          $.p("Manage your notification preferences."),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "tabs-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithForms: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* Tabs.Root({ defaultValue: "account" }, [
        Tabs.List({}, [
          Tabs.Trigger({ value: "account" }, "Account"),
          Tabs.Trigger({ value: "password" }, "Password"),
        ]),
        Tabs.Content({ value: "account" }, [
          $.div({ class: "tabs-form-group" }, [
            $.label({ class: "tabs-form-label", for: "name" }, "Name"),
            $.input({
              id: "name",
              class: "tabs-form-input",
              type: "text",
              placeholder: "Enter your name",
            }),
          ]),
          $.div({ class: "tabs-form-group" }, [
            $.label({ class: "tabs-form-label", for: "email" }, "Email"),
            $.input({
              id: "email",
              class: "tabs-form-input",
              type: "email",
              placeholder: "Enter your email",
            }),
          ]),
          $.button({ class: "tabs-form-button" }, "Save Changes"),
        ]),
        Tabs.Content({ value: "password" }, [
          $.div({ class: "tabs-form-group" }, [
            $.label(
              { class: "tabs-form-label", for: "current" },
              "Current Password",
            ),
            $.input({
              id: "current",
              class: "tabs-form-input",
              type: "password",
            }),
          ]),
          $.div({ class: "tabs-form-group" }, [
            $.label({ class: "tabs-form-label", for: "new" }, "New Password"),
            $.input({
              id: "new",
              class: "tabs-form-input",
              type: "password",
            }),
          ]),
          $.div({ class: "tabs-form-group" }, [
            $.label(
              { class: "tabs-form-label", for: "confirm" },
              "Confirm Password",
            ),
            $.input({
              id: "confirm",
              class: "tabs-form-input",
              type: "password",
            }),
          ]),
          $.button({ class: "tabs-form-button" }, "Update Password"),
        ]),
      ]);
    });

    const container = document.createElement("div");
    container.className = "tabs-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const ForceMount: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const info = yield* $.p(
        { style: { fontSize: "14px", color: "#6b7280", marginBottom: "16px" } },
        "With forceMount, all tab panels are always in the DOM (hidden when inactive). Check the DOM inspector.",
      );

      const tabs = yield* Tabs.Root({ defaultValue: "tab1" }, [
        Tabs.List({}, [
          Tabs.Trigger({ value: "tab1" }, "Tab 1"),
          Tabs.Trigger({ value: "tab2" }, "Tab 2"),
          Tabs.Trigger({ value: "tab3" }, "Tab 3"),
        ]),
        Tabs.Content({ value: "tab1", forceMount: true }, [
          $.p("Content 1 - always mounted"),
        ]),
        Tabs.Content({ value: "tab2", forceMount: true }, [
          $.p("Content 2 - always mounted"),
        ]),
        Tabs.Content({ value: "tab3", forceMount: true }, [
          $.p("Content 3 - always mounted"),
        ]),
      ]);

      const wrapper = document.createElement("div");
      wrapper.appendChild(info);
      wrapper.appendChild(tabs);
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "tabs-story-container";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
