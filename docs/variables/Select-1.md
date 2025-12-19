[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Select

# Variable: Select

> `const` **Select**: `object`

Defined in: [src/primitives/Select/Select.ts:695](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Select/Select.ts#L695)

Headless Select primitive for building accessible dropdown selects.

Features:
- Controlled and uncontrolled modes
- Configurable positioning
- Click outside to close
- Escape key to close
- Keyboard navigation
- Portal rendering
- ARIA attributes (combobox, listbox, option)
- Data attributes for styling
- Groups and labels
- Automatic label registration from ItemText string children

## Type Declaration

### Content

> **Content**: [`Component`](../type-aliases/Component.md)\<`"SelectContent"`, [`SelectContentProps`](../interfaces/SelectContentProps.md), `never`, [`SelectCtx`](../classes/SelectCtx.md)\>

Content area for the Select dropdown.
Renders in a Portal and is positioned relative to the trigger.

#### Example

```ts
Select.Content({ side: "bottom" }, [
  Select.Item({ value: "1" }, [Select.ItemText({}, "Option 1")]),
])
```

### Group

> **Group**: [`Component`](../type-aliases/Component.md)\<`"SelectGroup"`, [`SelectGroupProps`](../interfaces/SelectGroupProps.md), `never`, `Scope`\>

Groups related items together.

#### Example

```ts
Select.Group({}, [
  Select.Label({}, "Fruits"),
  Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
])
```

### Item()

> **Item**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)\<`never`, [`SelectCtx`](../classes/SelectCtx.md)\>

A selectable item within the Select.
ItemText with string children will automatically register the display label.

#### Parameters

##### props

[`SelectItemProps`](../interfaces/SelectItemProps.md)

##### children

[`Element`](../type-aliases/Element.md)\<`never`, [`SelectCtx`](../classes/SelectCtx.md) \| [`SelectItemCtx`](../classes/SelectItemCtx.md)\> | [`Element`](../type-aliases/Element.md)\<`never`, [`SelectCtx`](../classes/SelectCtx.md) \| [`SelectItemCtx`](../classes/SelectItemCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)\<`never`, [`SelectCtx`](../classes/SelectCtx.md)\>

#### Example

```ts
// Simple usage - label is registered from ItemText automatically
Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")])

// With complex children - use textValue for display label
Select.Item({ value: "apple", textValue: "Apple" }, [
  Select.ItemText({}, [Icon, "Apple"]),
])
```

### ItemText

> **ItemText**: [`Component`](../type-aliases/Component.md)\<`"SelectItemText"`, [`SelectItemTextProps`](../interfaces/SelectItemTextProps.md), `never`, [`SelectItemCtx`](../classes/SelectItemCtx.md)\>

The text content of a Select.Item.
When children is a string, it automatically registers it as the display label.

#### Example

```ts
Select.ItemText({ class: "item-text" }, "Apple")
```

### Label

> **Label**: [`Component`](../type-aliases/Component.md)\<`"SelectLabel"`, [`SelectLabelProps`](../interfaces/SelectLabelProps.md), `never`, `Scope`\>

Label for a group of items.

#### Example

```ts
Select.Label({}, "Category Name")
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)

Root container for a Select. Manages open/closed state, selected value,
and provides context to child components.

#### Parameters

##### props

[`SelectRootProps`](../interfaces/SelectRootProps.md)

##### children

[`Element`](../type-aliases/Element.md)\<`never`, [`SelectCtx`](../classes/SelectCtx.md)\> | [`Element`](../type-aliases/Element.md)\<`never`, [`SelectCtx`](../classes/SelectCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)

#### Example

```ts
Select.Root({ placeholder: "Select a fruit" }, [
  Select.Trigger({}, [Select.Value({})]),
  Select.Content({}, [
    Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
    Select.Item({ value: "banana" }, [Select.ItemText({}, "Banana")]),
  ]),
])
```

### Separator

> **Separator**: [`Component`](../type-aliases/Component.md)\<`"SelectSeparator"`, [`SelectSeparatorProps`](../interfaces/SelectSeparatorProps.md), `never`, `Scope`\>

Visual separator between items or groups.

#### Example

```ts
Select.Separator({})
```

### Trigger

> **Trigger**: [`Component`](../type-aliases/Component.md)\<`"SelectTrigger"`, [`SelectTriggerProps`](../interfaces/SelectTriggerProps.md), `never`, [`SelectCtx`](../classes/SelectCtx.md)\>

Button that opens/closes the Select dropdown.

#### Example

```ts
Select.Trigger({ class: "select-trigger" }, [
  Select.Value({}),
])
```

### Value

> **Value**: [`Component`](../type-aliases/Component.md)\<`"SelectValue"`, [`SelectValueProps`](../interfaces/SelectValueProps.md), `never`, [`SelectCtx`](../classes/SelectCtx.md)\>

Displays the selected value's label or placeholder.

#### Example

```ts
Select.Value({ placeholder: "Choose..." })
```

## Example

```ts
// Basic usage
Select.Root({ placeholder: "Select a fruit" }, [
  Select.Trigger({}, [Select.Value({})]),
  Select.Content({}, [
    Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
    Select.Item({ value: "banana" }, [Select.ItemText({}, "Banana")]),
    Select.Item({ value: "orange" }, [Select.ItemText({}, "Orange")]),
  ]),
])

// With groups
Select.Root({}, [
  Select.Trigger({}, [Select.Value({ placeholder: "Select..." })]),
  Select.Content({}, [
    Select.Group({}, [
      Select.Label({}, "Fruits"),
      Select.Item({ value: "apple" }, [Select.ItemText({}, "Apple")]),
    ]),
    Select.Separator({}),
    Select.Group({}, [
      Select.Label({}, "Vegetables"),
      Select.Item({ value: "carrot" }, [Select.ItemText({}, "Carrot")]),
    ]),
  ]),
])
```
