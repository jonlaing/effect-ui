import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";
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
  Tooltip,
  Toggle,
  type SliderValue,
} from "@effex/primitives";
import { $, Boundary, button, input, label } from "@effex/dom";
import { Signal } from "@effex/dom";
import { renderEffectAsync } from "../../storyHelpers";

import "./Showcase.stories.css";

const meta: Meta = {
  title: "Showcase/Dashboard",
  tags: ["autodocs"],
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
      const header = $.header({ class: "showcase-header" }, [
        $.div({ class: "showcase-logo" }, [
          $.span({ class: "showcase-logo-icon" }, "\u2699"),
          $.span({}, "Settings"),
        ]),
        $.nav({ class: "showcase-nav" }, [
          Tooltip.Root({ delayDuration: 300 }, [
            Tooltip.Trigger(
              {},
              button({ class: "showcase-nav-btn" }, "\u2302 Home"),
            ),
            Tooltip.Content({ side: "bottom" }, "Go to homepage"),
          ]),
          Tooltip.Root({ delayDuration: 300 }, [
            Tooltip.Trigger(
              {},
              button({ class: "showcase-nav-btn" }, "\u2630 Docs"),
            ),
            Tooltip.Content({ side: "bottom" }, "View documentation"),
          ]),
        ]),
        $.div({ class: "showcase-header-actions" }, [
          // User dropdown menu
          DropdownMenu.Root({}, [
            DropdownMenu.Trigger({ class: "showcase-user-btn" }, [
              $.span({ class: "showcase-avatar" }, "JD"),
              $.span({}, "John Doe"),
              $.span({ class: "showcase-caret" }, "\u25BC"),
            ]),
            DropdownMenu.Content(
              { class: "showcase-dropdown", side: "bottom", align: "start" },
              [
                DropdownMenu.Item({ class: "showcase-dropdown-item" }, [
                  $.span({}, "\u263A Profile"),
                ]),
                DropdownMenu.Item({ class: "showcase-dropdown-item" }, [
                  $.span({}, "\u2699 Settings"),
                ]),
                DropdownMenu.Separator({ class: "showcase-dropdown-sep" }),
                DropdownMenu.Item({ class: "showcase-dropdown-item danger" }, [
                  $.span({}, "\u2192 Sign out"),
                ]),
              ],
            ),
          ]),
        ]),
      ]);

      // Main content with tabs
      const mainContent = $.main({ class: "showcase-main" }, [
        $.div({ class: "showcase-tabs" }, [
          Tabs.Root({ defaultValue: "general" }, [
            Tabs.List({ class: "showcase-tabs-list" }, [
              Tabs.Trigger(
                { value: "general", class: "showcase-tab" },
                "General",
              ),
              Tabs.Trigger(
                { value: "appearance", class: "showcase-tab" },
                "Appearance",
              ),
              Tabs.Trigger(
                { value: "privacy", class: "showcase-tab" },
                "Privacy",
              ),
              Tabs.Trigger(
                { value: "advanced", class: "showcase-tab" },
                "Advanced",
              ),
            ]),

            // General Tab
            Tabs.Content({ value: "general", class: "showcase-tab-content" }, [
              ScrollArea.Root(
                { type: "always", class: "showcase-scroll-area" },
                [
                  ScrollArea.Viewport({ class: "showcase-scroll-viewport" }, [
                    $.div({ class: "showcase-scroll-content" }, [
                      $.div({ class: "showcase-section" }, [
                        $.h2({}, "Account Settings"),
                        Separator({ class: "showcase-separator" }),

                        // Notifications switch
                        $.div({ class: "showcase-setting-row" }, [
                          $.div({ class: "showcase-setting-info" }, [
                            $.label({}, "Email Notifications"),
                            $.p(
                              { class: "showcase-setting-desc" },
                              "Receive email updates about your account",
                            ),
                          ]),
                          Switch({
                            checked: notifications,
                            class: "showcase-switch",
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
                        ]),

                        // Volume slider
                        $.div({ class: "showcase-setting-row" }, [
                          $.div({ class: "showcase-setting-info" }, [
                            $.label({}, "Notification Volume"),
                            $.p(
                              { class: "showcase-setting-desc" },
                              volume.map((v) => `Current volume: ${v}%`),
                            ),
                          ]),
                          Slider.Root(
                            {
                              value: volume,
                              min: 0,
                              max: 100,
                              step: 1,
                              class: "showcase-slider",
                            },
                            [
                              Slider.Track({ class: "showcase-slider-track" }, [
                                Slider.Range({
                                  class: "showcase-slider-range",
                                }),
                              ]),
                              Slider.Thumb({ class: "showcase-slider-thumb" }),
                            ],
                          ),
                        ]),

                        // Language select
                        $.div({ class: "showcase-setting-row" }, [
                          $.div({ class: "showcase-setting-info" }, [
                            $.label({}, "Language"),
                            $.p(
                              { class: "showcase-setting-desc" },
                              "Choose your preferred language",
                            ),
                          ]),
                          Select.Root({ defaultValue: "en" }, [
                            Select.Trigger(
                              { class: "showcase-select-trigger" },
                              [
                                Select.Value({
                                  placeholder: "Select language",
                                }),
                                $.span(
                                  { class: "showcase-select-icon" },
                                  "\u25BC",
                                ),
                              ],
                            ),
                            Select.Content(
                              { class: "showcase-select-content" },
                              [
                                Select.Item(
                                  {
                                    value: "en",
                                    class: "showcase-select-item",
                                  },
                                  [Select.ItemText({}, "English")],
                                ),
                                Select.Item(
                                  {
                                    value: "es",
                                    class: "showcase-select-item",
                                  },
                                  [Select.ItemText({}, "Español")],
                                ),
                                Select.Item(
                                  {
                                    value: "fr",
                                    class: "showcase-select-item",
                                  },
                                  [Select.ItemText({}, "Français")],
                                ),
                                Select.Item(
                                  {
                                    value: "de",
                                    class: "showcase-select-item",
                                  },
                                  [Select.ItemText({}, "Deutsch")],
                                ),
                                Select.Item(
                                  {
                                    value: "ja",
                                    class: "showcase-select-item",
                                  },
                                  [Select.ItemText({}, "日本語")],
                                ),
                              ],
                            ),
                          ]),
                        ]),
                      ]),

                      // Accordion section
                      $.div({ class: "showcase-section" }, [
                        $.h2({}, "Help & Support"),
                        Separator({ class: "showcase-separator" }),

                        $.div({ class: "showcase-accordion" }, [
                          Accordion.Root(
                            {
                              type: "single",
                              collapsible: true,
                            },
                            [
                              Accordion.Item({ value: "faq1" }, [
                                Accordion.Trigger(
                                  { class: "showcase-accordion-trigger" },
                                  [
                                    $.span({}, "How do I reset my password?"),
                                    $.span(
                                      { class: "showcase-accordion-icon" },
                                      "\u25BC",
                                    ),
                                  ],
                                ),
                                Accordion.Content(
                                  { class: "showcase-accordion-content" },
                                  [
                                    $.p(
                                      {},
                                      "Go to the login page and click 'Forgot Password'. Enter your email address and we'll send you a reset link.",
                                    ),
                                  ],
                                ),
                              ]),
                              Accordion.Item({ value: "faq2" }, [
                                Accordion.Trigger(
                                  { class: "showcase-accordion-trigger" },
                                  [
                                    $.span({}, "How do I change my email?"),
                                    $.span(
                                      { class: "showcase-accordion-icon" },
                                      "\u25BC",
                                    ),
                                  ],
                                ),
                                Accordion.Content(
                                  { class: "showcase-accordion-content" },
                                  [
                                    $.p(
                                      {},
                                      "Navigate to Account Settings > Email and click 'Change Email'. You'll need to verify your new email address.",
                                    ),
                                  ],
                                ),
                              ]),
                              Accordion.Item({ value: "faq3" }, [
                                Accordion.Trigger(
                                  { class: "showcase-accordion-trigger" },
                                  [
                                    $.span({}, "How do I delete my account?"),
                                    $.span(
                                      { class: "showcase-accordion-icon" },
                                      "\u25BC",
                                    ),
                                  ],
                                ),
                                Accordion.Content(
                                  { class: "showcase-accordion-content" },
                                  [
                                    $.p(
                                      {},
                                      "Contact support to request account deletion. This action is irreversible and all your data will be permanently removed.",
                                    ),
                                  ],
                                ),
                              ]),
                            ],
                          ),
                        ]),
                      ]),
                    ]),
                  ]),
                  ScrollArea.Scrollbar(
                    { orientation: "vertical", class: "showcase-scrollbar" },
                    [ScrollArea.Thumb({ class: "showcase-scrollbar-thumb" })],
                  ),
                ],
              ),
            ]),

            // Appearance Tab
            Tabs.Content(
              { value: "appearance", class: "showcase-tab-content" },
              [
                $.div({ class: "showcase-section" }, [
                  $.h2({}, "Theme Settings"),
                  Separator({ class: "showcase-separator" }),

                  // Dark mode toggle
                  $.div({ class: "showcase-setting-row" }, [
                    $.div({ class: "showcase-setting-info" }, [
                      $.label({}, "Dark Mode"),
                      $.p(
                        { class: "showcase-setting-desc" },
                        "Toggle dark theme",
                      ),
                    ]),
                    Toggle(
                      {
                        pressed: darkMode,
                        class: "showcase-toggle",
                        onPressedChange: (pressed: boolean) =>
                          darkMode.set(pressed),
                      },
                      [darkMode.map((d) => (d ? "\u263E" : "\u2600"))],
                    ),
                  ]),

                  // Theme radio group
                  $.div({ class: "showcase-setting-block" }, [
                    $.label({ class: "showcase-label" }, "Color Theme"),
                    RadioGroup.Root(
                      {
                        value: selectedTheme,
                        class: "showcase-radio-group",
                        onValueChange: (value: string) =>
                          selectedTheme.set(value),
                      },
                      [
                        $.div({ class: "showcase-radio-option" }, [
                          RadioGroup.Item({
                            value: "light",
                            class: "showcase-radio",
                          }),
                          label({}, "Light"),
                        ]),
                        $.div({ class: "showcase-radio-option" }, [
                          RadioGroup.Item({
                            value: "dark",
                            class: "showcase-radio",
                          }),
                          label({}, "Dark"),
                        ]),
                        $.div({ class: "showcase-radio-option" }, [
                          RadioGroup.Item({
                            value: "system",
                            class: "showcase-radio",
                          }),
                          label({}, "System"),
                        ]),
                      ],
                    ),
                  ]),

                  // Font size select
                  $.div({ class: "showcase-setting-block" }, [
                    $.label({ class: "showcase-label" }, "Font Size"),
                    Select.Root(
                      {
                        value: fontSize,
                        onValueChange: (value: string) => fontSize.set(value),
                      },
                      [
                        Select.Trigger({ class: "showcase-select-trigger" }, [
                          Select.Value({ placeholder: "Select size" }),
                          $.span({ class: "showcase-select-icon" }, "\u25BC"),
                        ]),
                        Select.Content({ class: "showcase-select-content" }, [
                          Select.Item(
                            { value: "small", class: "showcase-select-item" },
                            [Select.ItemText({}, "Small")],
                          ),
                          Select.Item(
                            { value: "medium", class: "showcase-select-item" },
                            [Select.ItemText({}, "Medium")],
                          ),
                          Select.Item(
                            { value: "large", class: "showcase-select-item" },
                            [Select.ItemText({}, "Large")],
                          ),
                        ]),
                      ],
                    ),
                  ]),
                ]),
              ],
            ),

            // Privacy Tab
            Tabs.Content({ value: "privacy", class: "showcase-tab-content" }, [
              $.div({ class: "showcase-section" }, [
                $.h2({}, "Privacy Controls"),
                Separator({ class: "showcase-separator" }),

                // Checkboxes
                $.div({ class: "showcase-checkbox-group" }, [
                  $.div({ class: "showcase-checkbox-row" }, [
                    Checkbox({
                      defaultChecked: true,
                      class: "showcase-checkbox",
                    }),
                    label({}, "Allow analytics cookies"),
                  ]),
                  $.div({ class: "showcase-checkbox-row" }, [
                    Checkbox({
                      defaultChecked: false,
                      class: "showcase-checkbox",
                    }),
                    label({}, "Share usage data with partners"),
                  ]),
                  $.div({ class: "showcase-checkbox-row" }, [
                    Checkbox({
                      defaultChecked: true,
                      class: "showcase-checkbox",
                    }),
                    label({}, "Show online status"),
                  ]),
                ]),

                Separator({ class: "showcase-separator" }),

                // Danger zone with popover info
                $.div({ class: "showcase-danger-zone" }, [
                  $.div({ class: "showcase-danger-header" }, [
                    $.h3({}, "Danger Zone"),
                    Popover.Root({}, [
                      Popover.Trigger({ class: "showcase-info-btn" }, "\u2139"),
                      Popover.Content(
                        { class: "showcase-popover", side: "top" },
                        [
                          $.p(
                            {},
                            "These actions are permanent and cannot be undone.",
                          ),
                          Popover.Close(
                            { class: "showcase-popover-close" },
                            "\u00D7",
                          ),
                        ],
                      ),
                    ]),
                  ]),
                  AlertDialog.Root({}, [
                    AlertDialog.Trigger(
                      { class: "showcase-danger-btn" },
                      "Delete Account",
                    ),
                    AlertDialog.Portal({}, [
                      AlertDialog.Overlay({ class: "showcase-overlay" }),
                      AlertDialog.Content({ class: "showcase-alert-content" }, [
                        AlertDialog.Title({}, "Are you absolutely sure?"),
                        AlertDialog.Description({}, [
                          "This action cannot be undone. This will permanently delete your account and remove all your data from our servers.",
                        ]),
                        $.div({ class: "showcase-alert-actions" }, [
                          AlertDialog.Cancel(
                            { class: "showcase-btn-secondary" },
                            "Cancel",
                          ),
                          AlertDialog.Action(
                            { class: "showcase-btn-danger" },
                            "Yes, delete account",
                          ),
                        ]),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
            ]),

            // Advanced Tab
            Tabs.Content({ value: "advanced", class: "showcase-tab-content" }, [
              $.div({ class: "showcase-section" }, [
                $.h2({}, "Advanced Settings"),
                Separator({ class: "showcase-separator" }),

                // Upload progress
                $.div({ class: "showcase-setting-block" }, [
                  $.label({ class: "showcase-label" }, "Storage Usage"),
                  Progress.Root(
                    { value: uploadProgress, class: "showcase-progress" },
                    [
                      Progress.Indicator({
                        class: "showcase-progress-indicator",
                      }),
                    ],
                  ),
                  $.p(
                    { class: "showcase-progress-label" },
                    uploadProgress.map((v) => `${v}% of 100GB used`),
                  ),
                ]),

                // Dialog for editing
                $.div({ class: "showcase-setting-block" }, [
                  $.label({ class: "showcase-label" }, "API Configuration"),
                  Dialog.Root({}, [
                    Dialog.Trigger(
                      { class: "showcase-btn-primary" },
                      "Configure API Keys",
                    ),
                    Dialog.Portal({}, [
                      Dialog.Overlay({ class: "showcase-overlay" }),
                      Dialog.Content({ class: "showcase-dialog-content" }, [
                        Dialog.Title({}, "API Configuration"),
                        Dialog.Description(
                          {},
                          "Manage your API keys and endpoints.",
                        ),
                        $.div({ class: "showcase-form" }, [
                          $.div({ class: "showcase-form-field" }, [
                            label({}, "API Key"),
                            input({
                              type: "text",
                              class: "showcase-input",
                              placeholder: "sk-...",
                            }),
                          ]),
                          $.div({ class: "showcase-form-field" }, [
                            label({}, "Endpoint URL"),
                            input({
                              type: "url",
                              class: "showcase-input",
                              placeholder: "https://api.example.com",
                            }),
                          ]),
                        ]),
                        $.div({ class: "showcase-dialog-actions" }, [
                          Dialog.Close(
                            { class: "showcase-btn-secondary" },
                            "Cancel",
                          ),
                          Dialog.Close(
                            { class: "showcase-btn-primary" },
                            "Save Changes",
                          ),
                        ]),
                        Dialog.Close(
                          { class: "showcase-dialog-close" },
                          "\u00D7",
                        ),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]);

      // Footer
      const footer = $.footer({ class: "showcase-footer" }, [
        $.div({ class: "showcase-footer-actions" }, [
          button(
            { class: "showcase-btn-secondary", onClick: showErrorToast },
            "Reset to Defaults",
          ),
          button(
            { class: "showcase-btn-primary", onClick: showSuccessToast },
            "Save All Changes",
          ),
        ]),
      ]);

      // Toast viewport
      yield* Toast.Viewport(
        { class: "showcase-toast-viewport" },
        Toast.Root({ class: "showcase-toast" }, [
          Toast.Title({ class: "showcase-toast-title" }),
          Toast.Description({ class: "showcase-toast-description" }),
          Toast.Close({ class: "showcase-toast-close" }),
        ]),
      );

      return yield* Boundary.error(
        () =>
          $.div({ class: "showcase-layout" }, [header, mainContent, footer]),
        () =>
          $.div(
            { class: "showcase-error" },
            "Something went wrong. Please refresh the page.",
          ),
      );
    });

    const wrapped = Toast.Provider({ position: "bottom-right" }, app);

    const container = document.createElement("div");
    container.className = "showcase-container";

    renderEffectAsync(wrapped).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
