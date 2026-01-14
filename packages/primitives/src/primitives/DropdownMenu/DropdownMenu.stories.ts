import type { Meta, StoryObj } from "@storybook/html-vite";
import { Effect } from "effect";

import { $, Signal } from "@effex/dom";
import { DropdownMenu } from "@effex/primitives";

import { renderEffectAsync } from "../../storyHelpers";

type DropdownMenuStoryArgs = {
  disabled?: boolean;
};

const meta: Meta<DropdownMenuStoryArgs> = {
  title: "Primitives/DropdownMenu",
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the trigger is disabled",
    },
  },
  args: {
    disabled: false,
  },
  render: (args) => {
    const element = Effect.gen(function* () {
      return yield* DropdownMenu.Root({ class: "dropdown" }, [
        DropdownMenu.Trigger(
          { disabled: args.disabled, class: "btn btn-primary" },
          "Actions",
        ),
        DropdownMenu.Content(
          {
            asChild: true,
            animate: {
              enterTo: "animate-in fade-in",
              exit: "animate-out fade-out",
            },
          },
          $.ul(
            {
              class: "menu bg-base-200 rounded-box shadow-lg dropdown-content",
            },
            [
              $.li(
                DropdownMenu.Item(
                  {
                    onSelect: () => Effect.log("Edit clicked"),
                  },
                  "Edit",
                ),
              ),
              $.li(
                DropdownMenu.Item(
                  {
                    onSelect: () => Effect.log("Duplicate clicked"),
                  },
                  "Duplicate",
                ),
              ),
              DropdownMenu.Separator({ class: "divider my-1" }),
              // Example using asChild - renders as an anchor tag
              $.li(
                DropdownMenu.Item(
                  {
                    asChild: true,
                    onSelect: () => Effect.log("Documentation clicked"),
                  },
                  $.a({ href: "#docs", class: "text-info" }, "Documentation ↗"),
                ),
              ),
              $.li(
                DropdownMenu.Item(
                  {
                    onSelect: () => Effect.log("Delete clicked"),
                  },
                  "Delete",
                ),
              ),
            ],
          ),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export default meta;
type Story = StoryObj<DropdownMenuStoryArgs>;

export const Default: Story = {};

export const WithDisabledItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({ class: "btn btn-secondary" }, "File"),
        DropdownMenu.Content(
          {},
          $.ul({ class: "menu bg-base-200 rounded-box w-52 p-2 shadow-lg" }, [
            $.li(
              DropdownMenu.Item({ onSelect: () => Effect.log("New") }, "New"),
            ),
            $.li(
              DropdownMenu.Item({ onSelect: () => Effect.log("Open") }, "Open"),
            ),
            $.li(
              DropdownMenu.Item({ onSelect: () => Effect.log("Save") }, "Save"),
            ),
            DropdownMenu.Separator({ class: "divider my-1" }),
            $.li(
              { class: "menu-disabled" },
              DropdownMenu.Item(
                { onSelect: () => Effect.log("Export"), disabled: true },
                "Export (Pro)",
              ),
            ),
            $.li(
              { class: "menu-disabled" },
              DropdownMenu.Item(
                { onSelect: () => Effect.log("Print"), disabled: true },
                "Print (Pro)",
              ),
            ),
          ]),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithGroups: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({ class: "btn btn-accent" }, "Edit"),
        DropdownMenu.Content(
          {},
          $.ul({ class: "menu bg-base-200 rounded-box w-52 p-2 shadow-lg" }, [
            DropdownMenu.Group({}, [
              DropdownMenu.Label({ class: "menu-title" }, "Clipboard"),
              $.li(
                DropdownMenu.Item({ onSelect: () => Effect.log("Cut") }, "Cut"),
              ),
              $.li(
                DropdownMenu.Item(
                  { onSelect: () => Effect.log("Copy") },
                  "Copy",
                ),
              ),
              $.li(
                DropdownMenu.Item(
                  { onSelect: () => Effect.log("Paste") },
                  "Paste",
                ),
              ),
            ]),
            DropdownMenu.Separator({ class: "divider my-1" }),
            DropdownMenu.Group({}, [
              DropdownMenu.Label({ class: "menu-title" }, "Selection"),
              $.li(
                DropdownMenu.Item(
                  { onSelect: () => Effect.log("Select All") },
                  "Select All",
                ),
              ),
              $.li(
                DropdownMenu.Item(
                  { onSelect: () => Effect.log("Deselect") },
                  "Deselect",
                ),
              ),
            ]),
          ]),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const AllPositions: Story = {
  render: () => {
    const positions = [
      {
        side: "bottom" as const,
        align: "start" as const,
        label: "Bottom Start",
      },
      {
        side: "bottom" as const,
        align: "center" as const,
        label: "Bottom Center",
      },
      { side: "bottom" as const, align: "end" as const, label: "Bottom End" },
      { side: "top" as const, align: "start" as const, label: "Top Start" },
      { side: "right" as const, align: "start" as const, label: "Right Start" },
      { side: "left" as const, align: "start" as const, label: "Left Start" },
    ];

    const element = Effect.gen(function* () {
      const menus = yield* Effect.all(
        positions.map(({ side, align, label }) =>
          DropdownMenu.Root({ class: "relative" }, [
            DropdownMenu.Trigger({ class: "btn btn-sm btn-outline" }, label),
            DropdownMenu.Content(
              { side, align },
              $.ul(
                { class: "menu bg-base-200 rounded-box w-40 p-2 shadow-lg" },
                [
                  $.li(DropdownMenu.Item({}, "Option 1")),
                  $.li(DropdownMenu.Item({}, "Option 2")),
                  $.li(DropdownMenu.Item({}, "Option 3")),
                ],
              ),
            ),
          ]),
        ),
      );

      const wrapper = document.createElement("div");
      wrapper.className = "grid grid-cols-3 gap-4";
      menus.forEach((menu) => wrapper.appendChild(menu));
      return wrapper;
    });

    const container = document.createElement("div");
    container.className = "p-8";

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

      return yield* $.div({ class: "flex flex-col items-center gap-4" }, [
        $.div(
          { class: "badge badge-neutral" },
          isOpen.map((open) => `Menu is: ${open ? "open" : "closed"}`),
        ),
        $.div({ class: "flex gap-2" }, [
          $.button(
            {
              class: "btn btn-sm btn-outline",
              onClick: () => isOpen.set(true),
            },
            "Open Menu",
          ),
          $.button(
            {
              class: "btn btn-sm btn-outline",
              onClick: () => isOpen.set(false),
            },
            "Close Menu",
          ),
        ]),
        DropdownMenu.Root(
          {
            open: isOpen,
            onOpenChange: (open) => Effect.log(`Menu open changed to: ${open}`),
          },
          [
            DropdownMenu.Trigger(
              { class: "btn btn-primary" },
              "Controlled Menu",
            ),
            DropdownMenu.Content(
              {},
              $.ul(
                { class: "menu bg-base-200 rounded-box w-48 p-2 shadow-lg" },
                [
                  $.li(
                    DropdownMenu.Item(
                      { onSelect: () => Effect.log("Action 1") },
                      "Action 1",
                    ),
                  ),
                  $.li(
                    DropdownMenu.Item(
                      { onSelect: () => Effect.log("Action 2") },
                      "Action 2",
                    ),
                  ),
                  $.li(
                    DropdownMenu.Item(
                      { onSelect: () => Effect.log("Action 3") },
                      "Action 3",
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithSubmenus: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({ class: "btn btn-info" }, "File"),
        DropdownMenu.Content(
          {},
          $.ul({ class: "menu bg-base-200 rounded-box w-48 p-2 shadow-lg" }, [
            $.li(
              DropdownMenu.Item({ onSelect: () => Effect.log("New") }, "New"),
            ),
            $.li(
              DropdownMenu.Item({ onSelect: () => Effect.log("Open") }, "Open"),
            ),

            DropdownMenu.Separator({ class: "divider my-1" }),
            DropdownMenu.Sub({}, [
              $.li([
                DropdownMenu.SubTrigger({}, ["Share ", $.span("›")]),
                DropdownMenu.SubContent(
                  {},
                  $.ul(
                    {
                      class: "menu bg-base-200 rounded-box w-40 p-2 shadow-lg",
                    },
                    [
                      $.li(
                        DropdownMenu.Item(
                          { onSelect: () => Effect.log("Email") },
                          "Email",
                        ),
                      ),
                      $.li(
                        DropdownMenu.Item(
                          { onSelect: () => Effect.log("Slack") },
                          "Slack",
                        ),
                      ),
                      $.li(
                        DropdownMenu.Item(
                          { onSelect: () => Effect.log("Copy Link") },
                          "Copy Link",
                        ),
                      ),
                    ],
                  ),
                ),
              ]),
            ]),
            DropdownMenu.Sub({}, [
              $.li([
                DropdownMenu.SubTrigger({}, ["Export ", $.span("›")]),
                DropdownMenu.SubContent(
                  {},
                  $.ul(
                    {
                      class: "menu bg-base-200 rounded-box w-40 p-2 shadow-lg",
                    },
                    [
                      $.li(
                        DropdownMenu.Item(
                          { onSelect: () => Effect.log("PDF") },
                          "PDF",
                        ),
                      ),
                      $.li(
                        DropdownMenu.Item(
                          { onSelect: () => Effect.log("PNG") },
                          "PNG",
                        ),
                      ),
                      $.li(
                        DropdownMenu.Item(
                          { onSelect: () => Effect.log("SVG") },
                          "SVG",
                        ),
                      ),
                    ],
                  ),
                ),
              ]),
            ]),
            DropdownMenu.Separator({ class: "divider my-1" }),
            $.li(
              DropdownMenu.Item(
                { onSelect: () => Effect.log("Print") },
                "Print",
              ),
            ),
          ]),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithCheckboxItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const showGrid = yield* Signal.make(true);
      const showRulers = yield* Signal.make(false);
      const snapToGrid = yield* Signal.make(true);

      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({ class: "btn btn-success" }, "View Options"),
        DropdownMenu.Content(
          {},
          $.ul({ class: "menu bg-base-200 rounded-box w-52 p-2 shadow-lg" }, [
            DropdownMenu.Label({ class: "menu-title" }, "Display"),
            $.li(
              DropdownMenu.CheckboxItem(
                {
                  checked: showGrid,
                  onCheckedChange: (checked) =>
                    Effect.log(`Show Grid: ${checked}`),
                },
                "Show Grid",
              ),
            ),
            $.li(
              DropdownMenu.CheckboxItem(
                {
                  checked: showRulers,
                  onCheckedChange: (checked) =>
                    Effect.log(`Show Rulers: ${checked}`),
                },
                "Show Rulers",
              ),
            ),
            $.li(
              DropdownMenu.CheckboxItem(
                {
                  checked: snapToGrid,
                  onCheckedChange: (checked) =>
                    Effect.log(`Snap to Grid: ${checked}`),
                },
                "Snap to Grid",
              ),
            ),
          ]),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};

export const WithRadioItems: Story = {
  render: () => {
    const element = Effect.gen(function* () {
      const sortBy = yield* Signal.make("name");

      return yield* DropdownMenu.Root({}, [
        DropdownMenu.Trigger({ class: "btn btn-warning" }, "Sort By"),
        DropdownMenu.Content(
          {},
          $.ul({ class: "menu bg-base-200 rounded-box w-48 p-2 shadow-lg" }, [
            DropdownMenu.RadioGroup(
              {
                value: sortBy,
                onValueChange: (value) => Effect.log(`Sort by: ${value}`),
              },
              [
                $.li(DropdownMenu.RadioItem({ value: "name" }, "Name")),
                $.li(
                  DropdownMenu.RadioItem({ value: "date" }, "Date Modified"),
                ),
                $.li(DropdownMenu.RadioItem({ value: "size" }, "Size")),
                $.li(DropdownMenu.RadioItem({ value: "type" }, "Type")),
              ],
            ),
          ]),
        ),
      ]);
    });

    const container = document.createElement("div");
    container.className = "p-8 flex justify-center";

    renderEffectAsync(element).then((el) => {
      container.appendChild(el);
    });

    return container;
  },
};
