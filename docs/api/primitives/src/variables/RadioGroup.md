[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / RadioGroup

# Variable: RadioGroup

> `const` **RadioGroup**: `object`

Defined in: [packages/primitives/src/primitives/RadioGroup/RadioGroup.ts:305](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/RadioGroup/RadioGroup.ts#L305)

Headless RadioGroup primitive for building accessible radio button groups.

Features:
- Controlled and uncontrolled modes
- Horizontal and vertical orientations
- Full keyboard support (arrows select and focus, Home, End, Space)
- ARIA attributes (role, aria-checked, aria-required, aria-orientation)
- Roving tabindex for proper focus management
- Data attributes for styling
- Form integration via name attribute

## Type Declaration

### Item

> **Item**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"RadioGroupItem"`, [`RadioGroupItemProps`](../interfaces/RadioGroupItemProps.md), `never`, [`RadioGroupCtx`](../classes/RadioGroupCtx.md)\>

Individual radio item button. Renders as a button with role="radio".
Uses roving tabindex - only the selected item has tabindex=0.

#### Example

```ts
$.div({ class: "radio-item" }, [
  RadioGroup.Item({ value: "option1", id: "opt1" }),
  $.label({ for: "opt1" }, "Option 1"),
])
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for RadioGroup. Manages selected value state and provides
context to child components. Handles keyboard navigation.

#### Parameters

##### props

[`RadioGroupRootProps`](../interfaces/RadioGroupRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`RadioGroupCtx`](../classes/RadioGroupCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`RadioGroupCtx`](../classes/RadioGroupCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

#### Example

```ts
RadioGroup.Root({ defaultValue: "comfortable", name: "spacing" }, [
  $.div({ class: "radio-item" }, [
    RadioGroup.Item({ value: "default", id: "r1" }),
    $.label({ for: "r1" }, "Default"),
  ]),
  $.div({ class: "radio-item" }, [
    RadioGroup.Item({ value: "comfortable", id: "r2" }),
    $.label({ for: "r2" }, "Comfortable"),
  ]),
])
```

## Example

```ts
// Basic usage
RadioGroup.Root({ defaultValue: "comfortable", name: "spacing" }, [
  $.div({ class: "radio-item" }, [
    RadioGroup.Item({ value: "default", id: "r1" }),
    $.label({ for: "r1" }, "Default"),
  ]),
  $.div({ class: "radio-item" }, [
    RadioGroup.Item({ value: "comfortable", id: "r2" }),
    $.label({ for: "r2" }, "Comfortable"),
  ]),
  $.div({ class: "radio-item" }, [
    RadioGroup.Item({ value: "compact", id: "r3" }),
    $.label({ for: "r3" }, "Compact"),
  ]),
])

// Controlled with horizontal orientation
const selected = yield* Signal.make("option1")
RadioGroup.Root({
  value: selected,
  orientation: "horizontal",
  onValueChange: (v) => Effect.log(`Selected: ${v}`),
}, [...])
```
