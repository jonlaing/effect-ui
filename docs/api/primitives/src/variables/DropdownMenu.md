[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / DropdownMenu

# Variable: DropdownMenu

> `const` **DropdownMenu**: `object`

Defined in: [packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts:1201](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/DropdownMenu/DropdownMenu.ts#L1201)

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

> **CheckboxItem**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DropdownMenuCheckboxItem"`, [`DropdownMenuCheckboxItemProps`](../interfaces/DropdownMenuCheckboxItemProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

A menu item with a checkbox that can be toggled.

#### Example

```ts
const showGrid = yield* Signal.make(true);
DropdownMenu.CheckboxItem({ checked: showGrid }, "Show Grid")
```

### Content

> **Content**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DropdownMenuContent"`, [`DropdownMenuContentProps`](../interfaces/DropdownMenuContentProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

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

> **Group**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DropdownMenuGroup"`, [`DropdownMenuGroupProps`](../interfaces/DropdownMenuGroupProps.md), `never`, `Scope`\>

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

> **Item**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DropdownMenuItem"`, [`DropdownMenuItemProps`](../interfaces/DropdownMenuItemProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

A clickable item within the DropdownMenu.

#### Example

```ts
DropdownMenu.Item({ onSelect: () => Effect.log("Clicked!") }, "Edit")
```

### Label

> **Label**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DropdownMenuLabel"`, [`DropdownMenuLabelProps`](../interfaces/DropdownMenuLabelProps.md), `never`, `Scope`\>

Label for a group of items.

#### Example

```ts
DropdownMenu.Label({}, "Section Title")
```

### RadioGroup()

> **RadioGroup**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

Groups radio items together. Only one item can be selected at a time.

#### Parameters

##### props

[`DropdownMenuRadioGroupProps`](../interfaces/DropdownMenuRadioGroupProps.md)

##### children

[`Child`](../../../dom/src/type-aliases/Child.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md) \| [`DropdownMenuRadioGroupCtx`](../classes/DropdownMenuRadioGroupCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

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

> **RadioItem**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DropdownMenuRadioItem"`, [`DropdownMenuRadioItemProps`](../interfaces/DropdownMenuRadioItemProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md) \| [`DropdownMenuRadioGroupCtx`](../classes/DropdownMenuRadioGroupCtx.md)\>

A radio item within a RadioGroup. Only one can be selected at a time.

#### Example

```ts
DropdownMenu.RadioItem({ value: "option1" }, "Option 1")
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for a DropdownMenu. Manages open/closed state
and provides context to child components.

#### Parameters

##### props

[`DropdownMenuRootProps`](../interfaces/DropdownMenuRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

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

> **Separator**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DropdownMenuSeparator"`, [`DropdownMenuSeparatorProps`](../interfaces/DropdownMenuSeparatorProps.md), `never`, `Scope`\>

Visual separator between items or groups.

#### Example

```ts
DropdownMenu.Separator({})
```

### Sub()

> **Sub**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

Wrapper for a submenu. Manages open/closed state for the submenu
and provides context to SubTrigger and SubContent.

#### Parameters

##### props

[`DropdownMenuSubProps`](../interfaces/DropdownMenuSubProps.md)

##### children

[`Child`](../../../dom/src/type-aliases/Child.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md) \| [`DropdownMenuSubCtx`](../classes/DropdownMenuSubCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

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

> **SubContent**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DropdownMenuSubContent"`, [`DropdownMenuSubContentProps`](../interfaces/DropdownMenuSubContentProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md) \| [`DropdownMenuSubCtx`](../classes/DropdownMenuSubCtx.md)\>

Content area for a submenu. Positioned to the right of SubTrigger.

#### Example

```ts
DropdownMenu.SubContent({}, [
  DropdownMenu.Item({}, "Sub Option 1"),
  DropdownMenu.Item({}, "Sub Option 2"),
])
```

### SubTrigger

> **SubTrigger**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DropdownMenuSubTrigger"`, [`DropdownMenuSubTriggerProps`](../interfaces/DropdownMenuSubTriggerProps.md), `never`, [`DropdownMenuSubCtx`](../classes/DropdownMenuSubCtx.md)\>

Trigger for a submenu. Opens the submenu on hover or ArrowRight key.

#### Example

```ts
DropdownMenu.SubTrigger({}, "More Options →")
```

### Trigger

> **Trigger**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"DropdownMenuTrigger"`, [`DropdownMenuTriggerProps`](../interfaces/DropdownMenuTriggerProps.md), `never`, [`DropdownMenuCtx`](../classes/DropdownMenuCtx.md)\>

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
