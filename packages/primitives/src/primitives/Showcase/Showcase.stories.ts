import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";

import { $, Boundary, Signal } from "@effex/dom";
import {
  Accordion,
  AlertDialog,
  Checkbox,
  Dialog,
  DropdownMenu,
  Popover,
  Progress,
  RadioGroup,
  ScrollArea,
  Select,
  Separator,
  Slider,
  Switch,
  Tabs,
  Toast,
  ToastCtx,
  Toggle,
  Tooltip,
  type SliderValue,
} from "@effex/primitives";

import { renderEffectAsync } from "../../storyHelpers";

const meta: Meta = {
  title: "Showcase/Dashboard",
};

export default meta;
type Story = StoryObj;

/**
 * A comprehensive showcase demonstrating most primitives working together
 * in a realistic settings dashboard interface.
 */
export const SettingsDashboard: Story = {
  render: () => {
    const app = Effect.gen(function* () {
      const toastCtx = yield* ToastCtx;

      // Shared state
      const darkMode = yield* Signal.make(false);
      const notifications = yield* Signal.make(true);
      const volume = yield* Signal.make<SliderValue>(75);
      const uploadProgress = yield* Signal.make(45);
      const selectedTheme = yield* Signal.make("system");
      const fontSize = yield* Signal.make("medium");
      const privacySettings = yield* Signal.Map.make<string, boolean>([
        ["analytics", true],
        ["shareData", false],
        ["onlineStatus", true],
      ]);

      // Toast helpers
      const showSuccessToast = () =>
        toastCtx.add({
          title: "Settings saved",
          description: "Your preferences have been updated.",
          type: "success",
        });

      const showErrorToast = () =>
        toastCtx.add({
          title: "Error",
          description: "Something went wrong. Please try again.",
          type: "error",
        });

      // Header with navigation and user menu
      const header = $.header(
        { class: "navbar bg-base-200 rounded-box mb-4" },
        [
          $.div({ class: "flex-1 gap-2" }, [
            $.span({ class: "text-xl" }, "⚙"),
            $.span({ class: "text-xl font-bold" }, "Settings"),
          ]),
          $.nav({ class: "flex-none gap-2" }, [
            Tooltip.Root({ delayDuration: 300 }, [
              Tooltip.Trigger(
                {},
                $.button({ class: "btn btn-ghost btn-sm" }, "⌂ Home"),
              ),
              Tooltip.Content(
                {
                  side: "bottom",
                  class:
                    "bg-neutral text-neutral-content px-3 py-2 rounded-box text-sm",
                },
                "Go to homepage",
              ),
            ]),
            Tooltip.Root({ delayDuration: 300 }, [
              Tooltip.Trigger(
                {},
                $.button({ class: "btn btn-ghost btn-sm" }, "☰ Docs"),
              ),
              Tooltip.Content(
                {
                  side: "bottom",
                  class:
                    "bg-neutral text-neutral-content px-3 py-2 rounded-box text-sm",
                },
                "View documentation",
              ),
            ]),
          ]),
          $.div({ class: "flex-none relative" }, [
            // User dropdown menu
            DropdownMenu.Root({}, [
              DropdownMenu.Trigger({ class: "btn btn-ghost gap-2" }, [
                $.div({ class: "avatar placeholder" }, [
                  $.div(
                    {
                      class:
                        "bg-primary text-primary-content rounded-full w-8 flex items-center justify-center",
                    },
                    [$.span({ class: "text-xs" }, "JD")],
                  ),
                ]),
                $.span({}, "John Doe"),
                $.span({ class: "text-xs" }, "▼"),
              ]),
              DropdownMenu.Content(
                {
                  class: "menu bg-base-300 rounded-box shadow-xl w-52 p-2 mt-2",
                  side: "bottom",
                  align: "end",
                },
                [
                  DropdownMenu.Item(
                    {
                      class:
                        "text-left hover:bg-base-400 px-3 py-2 cursor-pointer",
                    },
                    [$.span({}, "☺ Profile")],
                  ),
                  DropdownMenu.Item(
                    {
                      class:
                        "text-left hover:bg-base-400 px-3 py-2 cursor-pointer",
                    },
                    [$.span({}, "⚙ Settings")],
                  ),
                  DropdownMenu.Separator({ class: "divider my-1" }),
                  DropdownMenu.Item(
                    {
                      class:
                        "text-left hover:bg-error hover:text-error-content px-3 py-2 cursor-pointer",
                    },
                    [$.span({}, "→ Sign out")],
                  ),
                ],
              ),
            ]),
          ]),
        ],
      );

      // Main content with tabs
      const mainContent = $.main({ class: "flex-1" }, [
        $.div({}, [
          Tabs.Root({ defaultValue: "general" }, [
            Tabs.List({ class: "tabs tabs-boxed bg-base-200 mb-4" }, [
              Tabs.Trigger(
                {
                  value: "general",
                  class: "tab data-[state=active]:tab-active",
                },
                "General",
              ),
              Tabs.Trigger(
                {
                  value: "appearance",
                  class: "tab data-[state=active]:tab-active",
                },
                "Appearance",
              ),
              Tabs.Trigger(
                {
                  value: "privacy",
                  class: "tab data-[state=active]:tab-active",
                },
                "Privacy",
              ),
              Tabs.Trigger(
                {
                  value: "advanced",
                  class: "tab data-[state=active]:tab-active",
                },
                "Advanced",
              ),
            ]),

            // General Tab
            Tabs.Content(
              { value: "general", class: "data-[state=inactive]:hidden" },
              [
                ScrollArea.Root({ type: "always", class: "h-96" }, [
                  ScrollArea.Viewport({ class: "h-full w-full pr-4" }, [
                    $.div({ class: "space-y-6" }, [
                      $.div({ class: "card bg-base-200" }, [
                        $.div({ class: "card-body" }, [
                          $.h2({ class: "card-title" }, "Account Settings"),
                          Separator({ class: "divider" }),

                          // Notifications switch
                          $.div(
                            { class: "flex justify-between items-center" },
                            [
                              $.div({}, [
                                $.$.label(
                                  { class: "font-medium" },
                                  "Email Notifications",
                                ),
                                $.p(
                                  { class: "text-sm text-base-content/70" },
                                  "Receive email updates about your account",
                                ),
                              ]),
                              Switch({
                                checked: notifications,
                                class: "toggle toggle-primary",
                                onCheckedChange: (checked: boolean) =>
                                  Effect.gen(function* () {
                                    yield* notifications.set(checked);
                                    yield* toastCtx.add({
                                      title: checked
                                        ? "Notifications enabled"
                                        : "Notifications disabled",
                                      type: "info",
                                    });
                                  }),
                              }),
                            ],
                          ),

                          // Volume slider
                          $.div({ class: "form-control mt-4" }, [
                            $.div(
                              {
                                class: "flex justify-between items-center mb-2",
                              },
                              [
                                $.$.label(
                                  { class: "font-medium" },
                                  "Notification Volume",
                                ),
                                $.span(
                                  { class: "badge badge-neutral" },
                                  volume.map((v) => `${v}%`),
                                ),
                              ],
                            ),
                            Slider.Root(
                              {
                                value: volume,
                                min: 0,
                                max: 100,
                                step: 1,
                                class: "w-full",
                              },
                              [
                                Slider.Track(
                                  {
                                    class:
                                      "h-2 bg-base-300 rounded-full relative",
                                  },
                                  [
                                    Slider.Range({
                                      class:
                                        "absolute h-full bg-primary rounded-full",
                                    }),
                                  ],
                                ),
                                Slider.Thumb({
                                  class:
                                    "w-5 h-5 bg-primary rounded-full block shadow-lg cursor-grab focus:outline-none focus:ring-2 focus:ring-primary/50",
                                }),
                              ],
                            ),
                          ]),

                          // Language select
                          $.div({ class: "form-control mt-4" }, [
                            $.$.label({ class: "label" }, [
                              $.span(
                                { class: "label-text font-medium" },
                                "Language",
                              ),
                            ]),
                            Select.Root({ defaultValue: "en" }, [
                              Select.Trigger(
                                {
                                  class:
                                    "select select-bordered w-full max-w-xs flex justify-between items-center",
                                },
                                [
                                  Select.Value({
                                    placeholder: "Select language",
                                  }),
                                ],
                              ),
                              Select.Content(
                                {
                                  class:
                                    "menu bg-base-200 rounded-box shadow-xl w-full max-w-xs p-2",
                                },
                                [
                                  Select.Item(
                                    {
                                      value: "en",
                                      class:
                                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                                    },
                                    [Select.ItemText({}, "English")],
                                  ),
                                  Select.Item(
                                    {
                                      value: "es",
                                      class:
                                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                                    },
                                    [Select.ItemText({}, "Español")],
                                  ),
                                  Select.Item(
                                    {
                                      value: "fr",
                                      class:
                                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                                    },
                                    [Select.ItemText({}, "Français")],
                                  ),
                                  Select.Item(
                                    {
                                      value: "de",
                                      class:
                                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                                    },
                                    [Select.ItemText({}, "Deutsch")],
                                  ),
                                  Select.Item(
                                    {
                                      value: "ja",
                                      class:
                                        "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                                    },
                                    [Select.ItemText({}, "日本語")],
                                  ),
                                ],
                              ),
                            ]),
                          ]),
                        ]),
                      ]),

                      // Accordion section
                      $.div({ class: "card bg-base-200" }, [
                        $.div({ class: "card-body" }, [
                          $.h2({ class: "card-title" }, "Help & Support"),
                          Separator({ class: "divider" }),

                          $.div({}, [
                            Accordion.Root(
                              {
                                type: "single",
                                collapsible: true,
                                class: "join join-vertical w-full",
                              },
                              [
                                Accordion.Item(
                                  {
                                    value: "faq1",
                                    class: [
                                      "collapse collapse-arrow join-item border border-base-300 bg-base-100",
                                      "data-[state=open]:collapse-open",
                                    ],
                                  },
                                  [
                                    Accordion.Trigger(
                                      {
                                        class:
                                          "collapse-title font-medium text-left",
                                      },
                                      "How do I reset my password?",
                                    ),
                                    Accordion.Content(
                                      { class: "collapse-content" },
                                      [
                                        $.p(
                                          { class: "text-base-content/70" },
                                          "Go to the login page and click 'Forgot Password'. Enter your email address and we'll send you a reset link.",
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                Accordion.Item(
                                  {
                                    value: "faq2",
                                    class: [
                                      "collapse collapse-arrow join-item border border-base-300 bg-base-100",
                                      "data-[state=open]:collapse-open",
                                    ],
                                  },
                                  [
                                    Accordion.Trigger(
                                      {
                                        class:
                                          "collapse-title font-medium text-left",
                                      },
                                      "How do I change my email?",
                                    ),
                                    Accordion.Content(
                                      { class: "collapse-content" },
                                      [
                                        $.p(
                                          { class: "text-base-content/70" },
                                          "Navigate to Account Settings > Email and click 'Change Email'. You'll need to verify your new email address.",
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                Accordion.Item(
                                  {
                                    value: "faq3",
                                    class: [
                                      "collapse collapse-arrow join-item border border-base-300 bg-base-100",
                                      "data-[state=open]:collapse-open",
                                    ],
                                  },
                                  [
                                    Accordion.Trigger(
                                      {
                                        class:
                                          "collapse-title font-medium text-left",
                                      },
                                      "How do I delete my account?",
                                    ),
                                    Accordion.Content(
                                      { class: "collapse-content" },
                                      [
                                        $.p(
                                          { class: "text-base-content/70" },
                                          "Contact support to request account deletion. This action is irreversible and all your data will be permanently removed.",
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ]),
                        ]),
                      ]),
                    ]),
                  ]),
                  ScrollArea.Scrollbar(
                    {
                      orientation: "vertical",
                      class: "w-2 bg-base-300 rounded-full",
                    },
                    [ScrollArea.Thumb({ class: "bg-primary rounded-full" })],
                  ),
                ]),
              ],
            ),

            // Appearance Tab
            Tabs.Content({ value: "appearance" }, [
              $.div({ class: "card bg-base-200" }, [
                $.div({ class: "card-body" }, [
                  $.h2({ class: "card-title" }, "Theme Settings"),
                  Separator({ class: "divider" }),

                  // Dark mode toggle
                  $.div({ class: "flex justify-between items-center" }, [
                    $.div({}, [
                      $.$.label({ class: "font-medium" }, "Dark Mode"),
                      $.p(
                        { class: "text-sm text-base-content/70" },
                        "Toggle dark theme",
                      ),
                    ]),
                    Toggle(
                      {
                        pressed: darkMode,
                        class: "btn btn-circle data-[state=on]:btn-primary",
                        onPressedChange: (pressed: boolean) =>
                          darkMode.set(pressed),
                      },
                      [darkMode.map((d) => (d ? "☾" : "☀"))],
                    ),
                  ]),

                  // Theme radio group
                  $.div({ class: "form-control mt-6" }, [
                    $.$.label({ class: "label" }, [
                      $.span(
                        { class: "label-text font-medium" },
                        "Color Theme",
                      ),
                    ]),
                    RadioGroup.Root(
                      {
                        value: selectedTheme,
                        class: "flex gap-4 mt-2",
                        onValueChange: (value: string) =>
                          selectedTheme.set(value),
                      },
                      [
                        $.div({ class: "flex items-center gap-2" }, [
                          RadioGroup.Item({
                            value: "light",
                            class: "radio radio-primary",
                          }),
                          $.label({}, "Light"),
                        ]),
                        $.div({ class: "flex items-center gap-2" }, [
                          RadioGroup.Item({
                            value: "dark",
                            class: "radio radio-primary",
                          }),
                          $.label({}, "Dark"),
                        ]),
                        $.div({ class: "flex items-center gap-2" }, [
                          RadioGroup.Item({
                            value: "system",
                            class: "radio radio-primary",
                          }),
                          $.label({}, "System"),
                        ]),
                      ],
                    ),
                  ]),

                  // Font size select
                  $.div({ class: "form-control mt-6" }, [
                    $.$.label({ class: "label" }, [
                      $.span({ class: "label-text font-medium" }, "Font Size"),
                    ]),
                    Select.Root(
                      {
                        value: fontSize,
                        onValueChange: (value: string) => fontSize.set(value),
                      },
                      [
                        Select.Trigger(
                          {
                            class:
                              "select select-bordered w-full max-w-xs flex justify-between items-center",
                          },
                          [Select.Value({ placeholder: "Select size" })],
                        ),
                        Select.Content(
                          {
                            class:
                              "menu bg-base-200 rounded-box shadow-xl w-full max-w-xs p-2",
                          },
                          [
                            Select.Item(
                              {
                                value: "small",
                                class:
                                  "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                              },
                              [Select.ItemText({}, "Small")],
                            ),
                            Select.Item(
                              {
                                value: "medium",
                                class:
                                  "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                              },
                              [Select.ItemText({}, "Medium")],
                            ),
                            Select.Item(
                              {
                                value: "large",
                                class:
                                  "rounded-btn hover:bg-base-300 px-3 py-2 cursor-pointer",
                              },
                              [Select.ItemText({}, "Large")],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ]),
                ]),
              ]),
            ]),

            // Privacy Tab
            Tabs.Content(
              { value: "privacy", class: "data-[state=inactive]:hidden" },
              [
                $.div({ class: "card bg-base-200" }, [
                  $.div({ class: "card-body" }, [
                    $.h2({ class: "card-title" }, "Privacy Controls"),
                    Separator({ class: "divider" }),

                    // Checkboxes with Signal.Map
                    $.div({ class: "space-y-4" }, [
                      $.div({ class: "flex items-center gap-3" }, [
                        Checkbox({
                          checked: privacySettings.getOrElse(
                            "analytics",
                            false,
                          ),
                          class: "checkbox checkbox-primary",
                          onCheckedChange: (checked) =>
                            privacySettings.set("analytics", checked === true),
                        }),
                        $.label({}, "Allow analytics cookies"),
                      ]),
                      $.div({ class: "flex items-center gap-3" }, [
                        Checkbox({
                          checked: privacySettings.getOrElse(
                            "shareData",
                            false,
                          ),
                          class: "checkbox checkbox-primary",
                          onCheckedChange: (checked) =>
                            privacySettings.set("shareData", checked === true),
                        }),
                        $.label({}, "Share usage data with partners"),
                      ]),
                      $.div({ class: "flex items-center gap-3" }, [
                        Checkbox({
                          checked: privacySettings.getOrElse(
                            "onlineStatus",
                            false,
                          ),
                          class: "checkbox checkbox-primary",
                          onCheckedChange: (checked) =>
                            privacySettings.set(
                              "onlineStatus",
                              checked === true,
                            ),
                        }),
                        $.label({}, "Show online status"),
                      ]),
                    ]),

                    Separator({ class: "divider" }),

                    // Danger zone with popover info
                    $.div({ class: "bg-error/10 rounded-box p-4" }, [
                      $.div({ class: "flex items-center gap-2 mb-4" }, [
                        $.h3({ class: "font-bold text-error" }, "Danger Zone"),
                        Popover.Root({}, [
                          Popover.Trigger(
                            { class: "btn btn-circle btn-ghost btn-xs" },
                            "ⓘ",
                          ),
                          Popover.Content(
                            {
                              class: "card bg-base-200 shadow-xl w-64",
                              side: "top",
                            },
                            [
                              $.div({ class: "card-body p-4" }, [
                                $.p(
                                  { class: "text-sm" },
                                  "These actions are permanent and cannot be undone.",
                                ),
                              ]),
                              Popover.Close(
                                {
                                  class:
                                    "btn btn-circle btn-ghost btn-xs absolute top-2 right-2",
                                },
                                "×",
                              ),
                            ],
                          ),
                        ]),
                      ]),
                      AlertDialog.Root({}, [
                        AlertDialog.Trigger(
                          { class: "btn btn-error" },
                          "Delete Account",
                        ),
                        AlertDialog.Portal({}, [
                          AlertDialog.Overlay({
                            class: "fixed inset-0 bg-black/50 z-40",
                          }),
                          AlertDialog.Content(
                            {
                              class:
                                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 rounded-box shadow-xl p-6 w-full max-w-md z-50",
                            },
                            [
                              AlertDialog.Title(
                                { class: "text-xl font-bold" },
                                "Are you absolutely sure?",
                              ),
                              AlertDialog.Description(
                                { class: "mt-2 text-base-content/70" },
                                [
                                  "This action cannot be undone. This will permanently delete your account and remove all your data from our servers.",
                                ],
                              ),
                              $.div({ class: "flex justify-end gap-3 mt-6" }, [
                                AlertDialog.Cancel(
                                  { class: "btn btn-ghost" },
                                  "Cancel",
                                ),
                                AlertDialog.Action(
                                  { class: "btn btn-error" },
                                  "Yes, delete account",
                                ),
                              ]),
                            ],
                          ),
                        ]),
                      ]),
                    ]),
                  ]),
                ]),
              ],
            ),

            // Advanced Tab
            Tabs.Content(
              { value: "advanced", class: "data-[state=inactive]:hidden" },
              [
                $.div({ class: "card bg-base-200" }, [
                  $.div({ class: "card-body" }, [
                    $.h2({ class: "card-title" }, "Advanced Settings"),
                    Separator({ class: "divider" }),

                    // Upload progress
                    $.div({ class: "form-control" }, [
                      $.$.label({ class: "label" }, [
                        $.span(
                          { class: "label-text font-medium" },
                          "Storage Usage",
                        ),
                      ]),
                      Progress.Root(
                        { value: uploadProgress, class: "w-full" },
                        [
                          Progress.Indicator({
                            class:
                              "bg-primary h-full transition-all rounded-full",
                          }),
                        ],
                      ),
                      $.p(
                        { class: "text-sm text-base-content/70 mt-2" },
                        uploadProgress.map((v) => `${v}% of 100GB used`),
                      ),
                    ]),

                    // Dialog for editing
                    $.div({ class: "form-control mt-6" }, [
                      $.$.label({ class: "label" }, [
                        $.span(
                          { class: "label-text font-medium" },
                          "API Configuration",
                        ),
                      ]),
                      Dialog.Root({}, [
                        Dialog.Trigger(
                          { class: "btn btn-primary" },
                          "Configure API Keys",
                        ),
                        Dialog.Portal({}, [
                          Dialog.Overlay({
                            class: "fixed inset-0 bg-black/50 z-40",
                          }),
                          Dialog.Content(
                            {
                              class:
                                "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-base-100 rounded-box shadow-xl p-6 w-full max-w-md z-50",
                            },
                            [
                              Dialog.Title(
                                { class: "text-xl font-bold" },
                                "API Configuration",
                              ),
                              Dialog.Description(
                                { class: "mt-2 text-base-content/70" },
                                "Manage your API keys and endpoints.",
                              ),
                              $.div({ class: "space-y-4 mt-4" }, [
                                $.div({ class: "form-control" }, [
                                  $.label({ class: "label" }, [
                                    $.span({ class: "label-text" }, "API Key"),
                                  ]),
                                  $.input({
                                    type: "text",
                                    class: "input input-bordered",
                                    placeholder: "sk-...",
                                  }),
                                ]),
                                $.div({ class: "form-control" }, [
                                  $.label({ class: "label" }, [
                                    $.span(
                                      { class: "label-text" },
                                      "Endpoint URL",
                                    ),
                                  ]),
                                  $.input({
                                    type: "url",
                                    class: "input input-bordered",
                                    placeholder: "https://api.example.com",
                                  }),
                                ]),
                              ]),
                              $.div({ class: "flex justify-end gap-3 mt-6" }, [
                                Dialog.Close(
                                  { class: "btn btn-ghost" },
                                  "Cancel",
                                ),
                                Dialog.Close(
                                  { class: "btn btn-primary" },
                                  "Save Changes",
                                ),
                              ]),
                              Dialog.Close(
                                {
                                  class:
                                    "btn btn-circle btn-ghost btn-sm absolute top-4 right-4",
                                },
                                "×",
                              ),
                            ],
                          ),
                        ]),
                      ]),
                    ]),
                  ]),
                ]),
              ],
            ),
          ]),
        ]),
      ]);

      // Footer
      const footer = $.footer({ class: "mt-6 flex justify-end gap-3" }, [
        $.button(
          { type: "button", class: "btn btn-ghost", onClick: showErrorToast },
          "Reset to Defaults",
        ),
        $.button(
          {
            type: "button",
            class: "btn btn-primary",
            onClick: showSuccessToast,
          },
          "Save All Changes",
        ),
      ]);

      // Toast viewport
      yield* Toast.Viewport(
        { class: "toast toast-end" },
        Toast.Root({ class: "alert shadow-lg" }, [
          Toast.Title({ class: "font-bold" }),
          Toast.Description({ class: "text-sm" }),
          Toast.Close({ class: "btn btn-sm btn-circle btn-ghost" }),
        ]),
      );

      return yield* Boundary.error(
        () =>
          $.div({ class: "p-6 max-w-4xl mx-auto" }, [
            header,
            mainContent,
            footer,
          ]),
        () =>
          $.div(
            { class: "alert alert-error" },
            "Something went wrong. Please refresh the page.",
          ),
      );
    });

    const wrapped = Toast.Provider({ position: "bottom-right" }, app);

    const container = document.createElement("div");
    container.className = "min-h-screen";

    renderEffectAsync(wrapped).then((el) => {
      container.appendChild(el);
    });

    // Add this to track focus changes
    document.addEventListener("focusin", (e) => {
      console.log("Focus moved to:", e.target);
      console.log("Document scrollTop:", document.documentElement.scrollTop);
    });

    // And modify your scroll listener to capture the stack trace
    window.addEventListener("scroll", () => {
      console.log("Scroll happened");
      console.log("Active element:", document.activeElement);
      console.trace(); // This will show the call stack
    });

    return container;
  },
};
