[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / DropdownMenu

# Variable: DropdownMenu

> `const` **DropdownMenu**: `object`

Defined in: [src/primitives/DropdownMenu/DropdownMenu.ts:1169](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/DropdownMenu/DropdownMenu.ts#L1169)

Headless DropdownMenu primitive for building accessible action menus.

Features:
- Controlled and uncontrolled modes
- Configurable positioning (side, align, offset)
- Click outside to close
- Escape key to close
- Full keyboard navigation (Arrow keys, Home, End)
- Portal rendering
- ARIA attributes (menu, menuitem)
- Data attributes for styling
- Groups and labels

## Type Declaration

### CheckboxItem

> **CheckboxItem**: [`Component`](../type-aliases/Component.md)\<`"DropdownMenuCheckboxItem"`, [`DropdownMenuCheckboxItemProps`](../interfaces/DropdownMenuCheckboxItemProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

A menu item with a checkbox that can be toggled.

#### Example

```ts
const showGrid = yield* Signal.make(true);
DropdownMenu.CheckboxItem({ checked: showGrid }, "Show Grid")
```

### Content

> **Content**: [`Component`](../type-aliases/Component.md)\<`"DropdownMenuContent"`, [`DropdownMenuContentProps`](../interfaces/DropdownMenuContentProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

Content area for the DropdownMenu.
Renders in a Portal and is positioned relative to the trigger.

#### Example

```ts
DropdownMenu.Content({ side: "bottom", align: "start" }, [
  DropdownMenu.Item({}, "Option 1"),
  DropdownMenu.Item({}, "Option 2"),
])
```

### Group

> **Group**: [`Component`](../type-aliases/Component.md)\<`"DropdownMenuGroup"`, [`DropdownMenuGroupProps`](../interfaces/DropdownMenuGroupProps.md), `never`, `Scope`\>

Groups related items together.

#### Example

```ts
DropdownMenu.Group({}, [
  DropdownMenu.Label({}, "Actions"),
  DropdownMenu.Item({}, "Edit"),
  DropdownMenu.Item({}, "Delete"),
])
```

### Item

> **Item**: [`Component`](../type-aliases/Component.md)\<`"DropdownMenuItem"`, [`DropdownMenuItemProps`](../interfaces/DropdownMenuItemProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

A clickable item within the DropdownMenu.

#### Example

```ts
DropdownMenu.Item({ onSelect: () => Effect.log("Clicked!") }, "Edit")
```

### Label

> **Label**: [`Component`](../type-aliases/Component.md)\<`"DropdownMenuLabel"`, [`DropdownMenuLabelProps`](../interfaces/DropdownMenuLabelProps.md), `never`, `Scope`\>

Label for a group of items.

#### Example

```ts
DropdownMenu.Label({}, "Section Title")
```

### RadioGroup()

> **RadioGroup**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

Groups radio items together. Only one item can be selected at a time.

#### Parameters

##### props

[`DropdownMenuRadioGroupProps`](../interfaces/DropdownMenuRadioGroupProps.md)

##### children

[`Child`](../type-aliases/Child.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md) \| [`DropdownMenuRadioGroupCtx`](../classes/DropdownMenuRadioGroupCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

#### Example

```ts
const sortBy = yield* Signal.make("name");
DropdownMenu.RadioGroup({ value: sortBy }, [
  DropdownMenu.RadioItem({ value: "name" }, "Name"),
  DropdownMenu.RadioItem({ value: "date" }, "Date"),
  DropdownMenu.RadioItem({ value: "size" }, "Size"),
])
```

### RadioItem

> **RadioItem**: [`Component`](../type-aliases/Component.md)\<`"DropdownMenuRadioItem"`, [`DropdownMenuRadioItemProps`](../interfaces/DropdownMenuRadioItemProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md) \| [`DropdownMenuRadioGroupCtx`](../classes/DropdownMenuRadioGroupCtx.md)\>

A radio item within a RadioGroup. Only one can be selected at a time.

#### Example

```ts
DropdownMenu.RadioItem({ value: "option1" }, "Option 1")
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)

Root container for a DropdownMenu. Manages open/closed state
and provides context to child components.

#### Parameters

##### props

[`DropdownMenuRootProps`](../interfaces/DropdownMenuRootProps.md)

##### children

[`Element`](../type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\> | [`Element`](../type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)

#### Example

```ts
DropdownMenu.Root({}, [
  DropdownMenu.Trigger({}, "Actions"),
  DropdownMenu.Content({}, [
    DropdownMenu.Item({ onSelect: () => Effect.log("Edit") }, "Edit"),
    DropdownMenu.Item({ onSelect: () => Effect.log("Delete") }, "Delete"),
  ]),
])
```

### Separator

> **Separator**: [`Component`](../type-aliases/Component.md)\<`"DropdownMenuSeparator"`, [`DropdownMenuSeparatorProps`](../interfaces/DropdownMenuSeparatorProps.md), `never`, `Scope`\>

Visual separator between items or groups.

#### Example

```ts
DropdownMenu.Separator({})
```

### Sub()

> **Sub**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

Wrapper for a submenu. Manages open/closed state for the submenu
and provides context to SubTrigger and SubContent.

#### Parameters

##### props

[`DropdownMenuSubProps`](../interfaces/DropdownMenuSubProps.md)

##### children

[`Child`](../type-aliases/Child.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md) \| [`DropdownMenuSubCtx`](../classes/DropdownMenuSubCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

#### Example

```ts
DropdownMenu.Sub({}, [
  DropdownMenu.SubTrigger({}, "More Options"),
  DropdownMenu.SubContent({}, [
    DropdownMenu.Item({}, "Sub Option 1"),
    DropdownMenu.Item({}, "Sub Option 2"),
  ]),
])
```

### SubContent

> **SubContent**: [`Component`](../type-aliases/Component.md)\<`"DropdownMenuSubContent"`, [`DropdownMenuSubContentProps`](../interfaces/DropdownMenuSubContentProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md) \| [`DropdownMenuSubCtx`](../classes/DropdownMenuSubCtx.md)\>

Content area for a submenu. Positioned to the right of SubTrigger.

#### Example

```ts
DropdownMenu.SubContent({}, [
  DropdownMenu.Item({}, "Sub Option 1"),
  DropdownMenu.Item({}, "Sub Option 2"),
])
```

### SubTrigger

> **SubTrigger**: [`Component`](../type-aliases/Component.md)\<`"DropdownMenuSubTrigger"`, [`DropdownMenuSubTriggerProps`](../interfaces/DropdownMenuSubTriggerProps.md), `never`, [`DropdownMenuSubCtx`](../classes/DropdownMenuSubCtx.md)\>

Trigger for a submenu. Opens the submenu on hover or ArrowRight key.

#### Example

```ts
DropdownMenu.SubTrigger({}, "More Options →")
```

### Trigger

> **Trigger**: [`Component`](../type-aliases/Component.md)\<`"DropdownMenuTrigger"`, [`DropdownMenuTriggerProps`](../interfaces/DropdownMenuTriggerProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

Button that opens/closes the DropdownMenu.

#### Example

```ts
DropdownMenu.Trigger({ class: "menu-trigger" }, "Open Menu")
```

## Example

```ts
// Basic usage
DropdownMenu.Root({}, [
  DropdownMenu.Trigger({}, "Actions"),
  DropdownMenu.Content({}, [
    DropdownMenu.Item({ onSelect: () => Effect.log("Edit") }, "Edit"),
    DropdownMenu.Item({ onSelect: () => Effect.log("Duplicate") }, "Duplicate"),
    DropdownMenu.Separator({}),
    DropdownMenu.Item({ onSelect: () => Effect.log("Delete") }, "Delete"),
  ]),
])

// With groups
DropdownMenu.Root({}, [
  DropdownMenu.Trigger({}, "Options"),
  DropdownMenu.Content({}, [
    DropdownMenu.Group({}, [
      DropdownMenu.Label({}, "Edit"),
      DropdownMenu.Item({}, "Cut"),
      DropdownMenu.Item({}, "Copy"),
      DropdownMenu.Item({}, "Paste"),
    ]),
    DropdownMenu.Separator({}),
    DropdownMenu.Group({}, [
      DropdownMenu.Label({}, "View"),
      DropdownMenu.Item({}, "Zoom In"),
      DropdownMenu.Item({}, "Zoom Out"),
    ]),
  ]),
])
```
