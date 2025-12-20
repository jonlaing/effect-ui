[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / Combobox

# Variable: Combobox

> `const` **Combobox**: `object`

Defined in: [packages/primitives/src/primitives/Combobox/Combobox.ts:1046](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Combobox/Combobox.ts#L1046)

Headless Combobox/Autocomplete primitive for building accessible search inputs.

Features:
- Editable input with filtering support
- Async data loading with loading states
- Full keyboard navigation (Arrow keys, Home, End, Enter, Escape)
- WAI-ARIA compliant (combobox, listbox, option roles)
- Controlled and uncontrolled modes
- Highlight tracking separate from selection
- Portal rendering
- Data attributes for styling

## Type Declaration

### Content

> **Content**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ComboboxContent"`, [`ComboboxContentProps`](../interfaces/ComboboxContentProps.md), `never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

Content area for the Combobox listbox.
Renders in a Portal and is positioned relative to the input.

#### Example

```ts
Combobox.Content({}, [
  Combobox.Item({ value: "apple" }, "Apple"),
])
```

### Empty

> **Empty**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ComboboxEmpty"`, [`ComboboxEmptyProps`](../interfaces/ComboboxEmptyProps.md), `never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

Shown when no items match the search.
Only renders when not loading and no items are present.

#### Example

```ts
Combobox.Empty({}, "No results found")
```

### Group

> **Group**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ComboboxGroup"`, [`ComboboxGroupProps`](../interfaces/ComboboxGroupProps.md), `never`, `Scope`\>

Groups related items together.

#### Example

```ts
Combobox.Group({}, [
  Combobox.Label({}, "Fruits"),
  Combobox.Item({ value: "apple" }, "Apple"),
])
```

### Input

> **Input**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ComboboxInput"`, [`ComboboxInputProps`](../interfaces/ComboboxInputProps.md), `never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

The input field for the Combobox.

#### Example

```ts
Combobox.Input({ placeholder: "Search fruits..." })
```

### Item()

> **Item**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

An item in the Combobox listbox.
Automatically filtered based on the filter function.

#### Parameters

##### props

[`ComboboxItemProps`](../interfaces/ComboboxItemProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md) \| [`ComboboxItemCtx`](../classes/ComboboxItemCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md) \| [`ComboboxItemCtx`](../classes/ComboboxItemCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

#### Example

```ts
Combobox.Item({ value: "apple" }, [Combobox.ItemText({}, "Apple")])
```

### ItemText

> **ItemText**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ComboboxItemText"`, [`ComboboxItemTextProps`](../interfaces/ComboboxItemTextProps.md), `never`, [`ComboboxItemCtx`](../classes/ComboboxItemCtx.md)\>

Text content for a Combobox item.
Automatically registers the text as the item's display value.

#### Example

```ts
Combobox.ItemText({}, "Apple")
```

### Label

> **Label**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ComboboxLabel"`, [`ComboboxLabelProps`](../interfaces/ComboboxLabelProps.md), `never`, `Scope`\>

Label for a group of items.

#### Example

```ts
Combobox.Label({}, "Fruits")
```

### Loading

> **Loading**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"ComboboxLoading"`, [`ComboboxLoadingProps`](../interfaces/ComboboxLoadingProps.md), `never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

Shown during async loading.
Only renders when isLoading is true.

#### Example

```ts
Combobox.Loading({}, "Searching...")
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for a Combobox. Manages state and provides context.

#### Parameters

##### props

[`ComboboxRootProps`](../interfaces/ComboboxRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

#### Example

```ts
Combobox.Root({}, [
  Combobox.Input({ placeholder: "Search..." }),
  Combobox.Content({}, [
    Combobox.Item({ value: "apple" }, [Combobox.ItemText({}, "Apple")]),
    Combobox.Item({ value: "banana" }, [Combobox.ItemText({}, "Banana")]),
  ]),
])
```

## Example

```ts
// Basic usage
Combobox.Root({}, [
  Combobox.Input({ placeholder: "Search fruits..." }),
  Combobox.Content({}, [
    Combobox.Item({ value: "apple" }, [Combobox.ItemText({}, "Apple")]),
    Combobox.Item({ value: "banana" }, [Combobox.ItemText({}, "Banana")]),
    Combobox.Item({ value: "cherry" }, [Combobox.ItemText({}, "Cherry")]),
  ]),
])

// With async loading
const inputValue = yield* Signal.make("");
const isLoading = yield* Signal.make(false);

Combobox.Root({ inputValue, isLoading }, [
  Combobox.Input({ placeholder: "Search..." }),
  Combobox.Content({}, [
    Combobox.Loading({}, "Searching..."),
    Combobox.Empty({}, "No results found"),
    // ... dynamically rendered items
  ]),
])
```
