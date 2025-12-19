[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / Combobox

# Variable: Combobox

> `const` **Combobox**: `object`

Defined in: [src/primitives/Combobox/Combobox.ts:1032](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/Combobox/Combobox.ts#L1032)

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

> **Content**: [`Component`](../type-aliases/Component.md)\<`"ComboboxContent"`, [`ComboboxContentProps`](../interfaces/ComboboxContentProps.md), `never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

Content area for the Combobox listbox.
Renders in a Portal and is positioned relative to the input.

#### Example

```ts
Combobox.Content({}, [
  Combobox.Item({ value: "apple" }, "Apple"),
])
```

### Empty

> **Empty**: [`Component`](../type-aliases/Component.md)\<`"ComboboxEmpty"`, [`ComboboxEmptyProps`](../interfaces/ComboboxEmptyProps.md), `never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

Shown when no items match the search.
Only renders when not loading and no items are present.

#### Example

```ts
Combobox.Empty({}, "No results found")
```

### Group

> **Group**: [`Component`](../type-aliases/Component.md)\<`"ComboboxGroup"`, [`ComboboxGroupProps`](../interfaces/ComboboxGroupProps.md), `never`, `Scope`\>

Groups related items together.

#### Example

```ts
Combobox.Group({}, [
  Combobox.Label({}, "Fruits"),
  Combobox.Item({ value: "apple" }, "Apple"),
])
```

### Input

> **Input**: [`Component`](../type-aliases/Component.md)\<`"ComboboxInput"`, [`ComboboxInputProps`](../interfaces/ComboboxInputProps.md), `never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

The input field for the Combobox.

#### Example

```ts
Combobox.Input({ placeholder: "Search fruits..." })
```

### Item()

> **Item**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

An item in the Combobox listbox.
Automatically filtered based on the filter function.

#### Parameters

##### props

[`ComboboxItemProps`](../interfaces/ComboboxItemProps.md)

##### children

[`Element`](../type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md) \| [`ComboboxItemCtx`](../classes/ComboboxItemCtx.md)\> | [`Element`](../type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md) \| [`ComboboxItemCtx`](../classes/ComboboxItemCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

#### Example

```ts
Combobox.Item({ value: "apple" }, [Combobox.ItemText({}, "Apple")])
```

### ItemText

> **ItemText**: [`Component`](../type-aliases/Component.md)\<`"ComboboxItemText"`, [`ComboboxItemTextProps`](../interfaces/ComboboxItemTextProps.md), `never`, [`ComboboxItemCtx`](../classes/ComboboxItemCtx.md)\>

Text content for a Combobox item.
Automatically registers the text as the item's display value.

#### Example

```ts
Combobox.ItemText({}, "Apple")
```

### Label

> **Label**: [`Component`](../type-aliases/Component.md)\<`"ComboboxLabel"`, [`ComboboxLabelProps`](../interfaces/ComboboxLabelProps.md), `never`, `Scope`\>

Label for a group of items.

#### Example

```ts
Combobox.Label({}, "Fruits")
```

### Loading

> **Loading**: [`Component`](../type-aliases/Component.md)\<`"ComboboxLoading"`, [`ComboboxLoadingProps`](../interfaces/ComboboxLoadingProps.md), `never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>

Shown during async loading.
Only renders when isLoading is true.

#### Example

```ts
Combobox.Loading({}, "Searching...")
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)

Root container for a Combobox. Manages state and provides context.

#### Parameters

##### props

[`ComboboxRootProps`](../interfaces/ComboboxRootProps.md)

##### children

[`Element`](../type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\> | [`Element`](../type-aliases/Element.md)\<`never`, [`ComboboxCtx`](../classes/ComboboxCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)

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
