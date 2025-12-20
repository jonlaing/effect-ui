[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / ContextMenu

# Variable: ContextMenu

> `const` **ContextMenu**: `object`

Defined in: [packages/primitives/src/primitives/ContextMenu/ContextMenu.ts:1114](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/ContextMenu/ContextMenu.ts#L1114)

Headless ContextMenu primitive for building accessible context menus.

Features:
- Right-click to open at cursor position
- Controlled and uncontrolled modes
- Click outside to close
- Escape key to close
- Full keyboard navigation (Arrow keys, Home, End)
- Portal rendering
- ARIA attributes (menu, menuitem)
- Data attributes for styling
- Groups and labels
- Checkbox and radio items
- Nested submenus

## Type Declaration

### CheckboxItem

> **CheckboxItem**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ContextMenuCheckboxItem"`, [`ContextMenuCheckboxItemProps`](../interfaces/ContextMenuCheckboxItemProps.md), `never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md)\>

A menu item with a checkbox that can be toggled.

#### Example

```ts
const showHidden = yield* Signal.make(false);
ContextMenu.CheckboxItem({ checked: showHidden }, "Show Hidden Files")
```

### Content

> **Content**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ContextMenuContent"`, [`ContextMenuContentProps`](../interfaces/ContextMenuContentProps.md), `never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md)\>

Content area for the ContextMenu.
Renders in a Portal and is positioned at the cursor location.

#### Example

```ts
ContextMenu.Content({}, [
  ContextMenu.Item({}, "Option 1"),
  ContextMenu.Item({}, "Option 2"),
])
```

### Group

> **Group**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ContextMenuGroup"`, [`ContextMenuGroupProps`](../interfaces/ContextMenuGroupProps.md), `never`, `Scope`\>

Groups related items together.

#### Example

```ts
ContextMenu.Group({}, [
  ContextMenu.Label({}, "Edit"),
  ContextMenu.Item({}, "Cut"),
  ContextMenu.Item({}, "Copy"),
])
```

### Item

> **Item**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ContextMenuItem"`, [`ContextMenuItemProps`](../interfaces/ContextMenuItemProps.md), `never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md)\>

A clickable item within the ContextMenu.

#### Example

```ts
ContextMenu.Item({ onSelect: () => Effect.log("Clicked!") }, "Copy")
```

### Label

> **Label**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ContextMenuLabel"`, [`ContextMenuLabelProps`](../interfaces/ContextMenuLabelProps.md), `never`, `Scope`\>

Label for a group of items.

#### Example

```ts
ContextMenu.Label({}, "Section Title")
```

### RadioGroup()

> **RadioGroup**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md)\>

Groups radio items together. Only one item can be selected at a time.

#### Parameters

##### props

[`ContextMenuRadioGroupProps`](../interfaces/ContextMenuRadioGroupProps.md)

##### children

[`Child`](../../../dom/src/type-aliases/Child.md)\<`never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md) \| [`ContextMenuRadioGroupCtx`](../classes/ContextMenuRadioGroupCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md)\>

#### Example

```ts
const viewMode = yield* Signal.make("list");
ContextMenu.RadioGroup({ value: viewMode }, [
  ContextMenu.RadioItem({ value: "list" }, "List"),
  ContextMenu.RadioItem({ value: "grid" }, "Grid"),
])
```

### RadioItem

> **RadioItem**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ContextMenuRadioItem"`, [`ContextMenuRadioItemProps`](../interfaces/ContextMenuRadioItemProps.md), `never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md) \| [`ContextMenuRadioGroupCtx`](../classes/ContextMenuRadioGroupCtx.md)\>

A radio item within a RadioGroup. Only one can be selected at a time.

#### Example

```ts
ContextMenu.RadioItem({ value: "list" }, "List View")
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for a ContextMenu. Manages open/closed state
and provides context to child components.

#### Parameters

##### props

[`ContextMenuRootProps`](../interfaces/ContextMenuRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

#### Example

```ts
ContextMenu.Root({}, [
  ContextMenu.Trigger({}, div({ class: "right-click-area" }, "Right click here")),
  ContextMenu.Content({}, [
    ContextMenu.Item({ onSelect: () => Effect.log("Copy") }, "Copy"),
    ContextMenu.Item({ onSelect: () => Effect.log("Paste") }, "Paste"),
  ]),
])
```

### Separator

> **Separator**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ContextMenuSeparator"`, [`ContextMenuSeparatorProps`](../interfaces/ContextMenuSeparatorProps.md), `never`, `Scope`\>

Visual separator between items or groups.

#### Example

```ts
ContextMenu.Separator({})
```

### Sub()

> **Sub**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md)\>

Wrapper for a submenu. Manages open/closed state for the submenu
and provides context to SubTrigger and SubContent.

#### Parameters

##### props

[`ContextMenuSubProps`](../interfaces/ContextMenuSubProps.md)

##### children

[`Child`](../../../dom/src/type-aliases/Child.md)\<`never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md) \| [`ContextMenuSubCtx`](../classes/ContextMenuSubCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md)\>

#### Example

```ts
ContextMenu.Sub({}, [
  ContextMenu.SubTrigger({}, "More Options"),
  ContextMenu.SubContent({}, [
    ContextMenu.Item({}, "Sub Option 1"),
    ContextMenu.Item({}, "Sub Option 2"),
  ]),
])
```

### SubContent

> **SubContent**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ContextMenuSubContent"`, [`ContextMenuSubContentProps`](../interfaces/ContextMenuSubContentProps.md), `never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md) \| [`ContextMenuSubCtx`](../classes/ContextMenuSubCtx.md)\>

Content area for a submenu. Positioned to the right of SubTrigger.

#### Example

```ts
ContextMenu.SubContent({}, [
  ContextMenu.Item({}, "Sub Option 1"),
  ContextMenu.Item({}, "Sub Option 2"),
])
```

### SubTrigger

> **SubTrigger**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ContextMenuSubTrigger"`, [`ContextMenuSubTriggerProps`](../interfaces/ContextMenuSubTriggerProps.md), `never`, [`ContextMenuSubCtx`](../classes/ContextMenuSubCtx.md)\>

Trigger for a submenu. Opens the submenu on hover or ArrowRight key.

#### Example

```ts
ContextMenu.SubTrigger({}, "More Options →")
```

### Trigger

> **Trigger**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ContextMenuTrigger"`, [`ContextMenuTriggerProps`](../interfaces/ContextMenuTriggerProps.md), `never`, [`ContextMenuCtx`](../classes/ContextMenuCtx.md)\>

The area that responds to right-click to open the context menu.

#### Example

```ts
ContextMenu.Trigger({}, div({ class: "file-item" }, "document.pdf"))
```

## Example

```ts
ContextMenu.Root({}, [
  ContextMenu.Trigger({}, div({ class: "file-item" }, "document.pdf")),
  ContextMenu.Content({}, [
    ContextMenu.Item({ onSelect: () => Effect.log("Open") }, "Open"),
    ContextMenu.Item({ onSelect: () => Effect.log("Copy") }, "Copy"),
    ContextMenu.Separator({}),
    ContextMenu.Item({ onSelect: () => Effect.log("Delete") }, "Delete"),
  ]),
])
```
