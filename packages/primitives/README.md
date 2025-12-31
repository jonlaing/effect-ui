# @effex/primitives

Headless UI components for Effex applications. Fully accessible, unstyled components that handle complex interactions out of the box.

Inspired by [Radix UI](https://www.radix-ui.com/).

## Installation

```bash
pnpm add @effex/primitives @effex/dom effect
```

## Available Components

- **Accordion** - Collapsible content sections
- **AlertDialog** - Modal dialogs requiring user action
- **Checkbox** - Tri-state checkbox with label
- **Combobox** - Searchable autocomplete select
- **ContextMenu** - Right-click context menus
- **Dialog** - Modal dialogs
- **DropdownMenu** - Dropdown menus with keyboard navigation
- **NavigationMenu** - Accessible navigation with submenus
- **Popover** - Floating content panels
- **Progress** - Progress indicators
- **RadioGroup** - Radio button groups
- **ScrollArea** - Custom scrollbar styling
- **Select** - Custom select dropdowns
- **Slider** - Range input sliders
- **Switch** - Toggle switches
- **Tabs** - Tabbed content panels
- **Toast** - Notification toasts
- **Toggle** - Toggle buttons
- **Tooltip** - Hover tooltips

## Usage Pattern

All primitives follow a consistent compound component pattern:

```ts
import { Dialog } from "@effex/primitives";

Dialog.Root({ defaultOpen: false }, [
  Dialog.Trigger({}, "Open Dialog"),
  Dialog.Content({ class: "dialog-content" }, [
    Dialog.Title({}, "Dialog Title"),
    Dialog.Description({}, "Dialog description text"),
    $.p("Your dialog content here"),
    Dialog.Close({}, "Close"),
  ]),
]);
```

## Dialog

Modal dialogs with focus management:

```ts
import { Dialog } from "@effex/primitives";

const isOpen = yield* Signal.make(false);

Dialog.Root({ open: isOpen, onOpenChange: (open) => isOpen.set(open) }, [
  Dialog.Trigger({}, "Open"),
  Dialog.Portal([
    Dialog.Overlay({ class: "dialog-overlay" }),
    Dialog.Content({ class: "dialog-content" }, [
      Dialog.Title({}, "Edit Profile"),
      Dialog.Description({}, "Make changes to your profile here."),
      // Your form content
      Dialog.Close({}, "Save"),
    ]),
  ]),
]);
```

## Dropdown Menu

Dropdown menus with keyboard navigation:

```ts
import { DropdownMenu } from "@effex/primitives";

DropdownMenu.Root({}, [
  DropdownMenu.Trigger({}, "Options"),
  DropdownMenu.Portal([
    DropdownMenu.Content({ class: "menu-content" }, [
      DropdownMenu.Item({ onSelect: () => console.log("Edit") }, "Edit"),
      DropdownMenu.Item({ onSelect: () => console.log("Copy") }, "Copy"),
      DropdownMenu.Separator({}),
      DropdownMenu.Item({ onSelect: () => console.log("Delete") }, "Delete"),
    ]),
  ]),
]);
```

## Tabs

Tabbed content panels:

```ts
import { Tabs } from "@effex/primitives";

Tabs.Root({ defaultValue: "account" }, [
  Tabs.List({}, [
    Tabs.Trigger({ value: "account" }, "Account"),
    Tabs.Trigger({ value: "password" }, "Password"),
  ]),
  Tabs.Content({ value: "account" }, [
    // Account settings content
  ]),
  Tabs.Content({ value: "password" }, [
    // Password settings content
  ]),
]);
```

## Select

Custom select dropdowns:

```ts
import { Select } from "@effex/primitives";

Select.Root({ defaultValue: "apple" }, [
  Select.Trigger({ class: "select-trigger" }, [
    Select.Value({ placeholder: "Select a fruit" }),
    Select.Icon({}),
  ]),
  Select.Portal([
    Select.Content({ class: "select-content" }, [
      Select.Viewport({}, [
        Select.Item({ value: "apple" }, [
          Select.ItemText({}, "Apple"),
          Select.ItemIndicator({}, "✓"),
        ]),
        Select.Item({ value: "banana" }, [
          Select.ItemText({}, "Banana"),
          Select.ItemIndicator({}, "✓"),
        ]),
        Select.Item({ value: "orange" }, [
          Select.ItemText({}, "Orange"),
          Select.ItemIndicator({}, "✓"),
        ]),
      ]),
    ]),
  ]),
]);
```

## Accordion

Collapsible content sections:

```ts
import { Accordion } from "@effex/primitives";

Accordion.Root({ type: "single", collapsible: true }, [
  Accordion.Item({ value: "item-1" }, [
    Accordion.Header({}, [
      Accordion.Trigger({}, "Is it accessible?"),
    ]),
    Accordion.Content({}, [
      $.p("Yes. It adheres to the WAI-ARIA design pattern."),
    ]),
  ]),
  Accordion.Item({ value: "item-2" }, [
    Accordion.Header({}, [
      Accordion.Trigger({}, "Is it unstyled?"),
    ]),
    Accordion.Content({}, [
      $.p("Yes. It's unstyled by default."),
    ]),
  ]),
]);
```

## Tooltip

Hover tooltips:

```ts
import { Tooltip } from "@effex/primitives";

Tooltip.Provider({ delayDuration: 300 }, [
  Tooltip.Root({}, [
    Tooltip.Trigger({}, $.button("Hover me")),
    Tooltip.Portal([
      Tooltip.Content({ class: "tooltip-content" }, [
        "Add to library",
        Tooltip.Arrow({}),
      ]),
    ]),
  ]),
]);
```

## Switch

Toggle switches:

```ts
import { Switch } from "@effex/primitives";

const enabled = yield* Signal.make(false);

Switch.Root({
  checked: enabled,
  onCheckedChange: (checked) => enabled.set(checked),
  class: "switch-root",
}, [
  Switch.Thumb({ class: "switch-thumb" }),
]);
```

## Styling

All primitives are unstyled by default. Use CSS with data attributes:

```css
/* Dialog overlay */
.dialog-overlay {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
}

/* Dialog content */
.dialog-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* State-based styling using data attributes */
[data-state="open"] {
  animation: fadeIn 0.2s ease;
}

[data-state="closed"] {
  animation: fadeOut 0.2s ease;
}

[data-disabled] {
  opacity: 0.5;
  pointer-events: none;
}
```

## Features

- **Accessible by default** - ARIA attributes, keyboard navigation, focus management
- **Unstyled** - Style with your own CSS or Tailwind
- **Data attributes** - `data-state`, `data-disabled`, etc. for CSS selectors
- **Controlled & uncontrolled** - Use with or without external state
- **Portal rendering** - Dropdowns/popovers escape overflow:hidden
- **Keyboard navigation** - Full keyboard support
- **Focus management** - Focus trapping and restoration
