[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / Popover

# Variable: Popover

> `const` **Popover**: `object`

Defined in: [packages/primitives/src/primitives/Popover/Popover.ts:414](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Popover/Popover.ts#L414)

Headless Popover primitive for building accessible floating content.

Features:
- Controlled and uncontrolled modes
- Configurable positioning (side, align, offsets)
- Click outside to close
- Escape key to close
- Portal rendering (escapes overflow)
- ARIA attributes
- Data attributes for styling

## Type Declaration

### Anchor

> **Anchor**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"PopoverAnchor"`, [`PopoverAnchorProps`](../interfaces/PopoverAnchorProps.md), `never`, [`PopoverCtx`](../classes/PopoverCtx.md)\>

Optional anchor element for positioning.
Use this when the popover should be positioned relative to a different
element than the trigger.

#### Example

```ts
Popover.Anchor({ class: "anchor-area" }, [
  // Content that the popover positions relative to
])
```

### Close

> **Close**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"PopoverClose"`, [`PopoverCloseProps`](../interfaces/PopoverCloseProps.md), `never`, [`PopoverCtx`](../classes/PopoverCtx.md)\>

Button that closes the Popover.

#### Example

```ts
Popover.Close({ class: "close-btn" }, "Close")
```

### Content

> **Content**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"PopoverContent"`, [`PopoverContentProps`](../interfaces/PopoverContentProps.md), `never`, [`PopoverCtx`](../classes/PopoverCtx.md)\>

Content area for the Popover.
Renders in a Portal and is positioned relative to the trigger/anchor.

#### Example

```ts
Popover.Content({ side: "bottom", align: "start" }, [
  $.div({ class: "popover-body" }, [
    $.p("Some popover content"),
  ]),
  Popover.Close({}, "Close"),
])
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for a Popover. Manages open/closed state and provides
context to child components.

#### Parameters

##### props

[`PopoverRootProps`](../interfaces/PopoverRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`PopoverCtx`](../classes/PopoverCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`PopoverCtx`](../classes/PopoverCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

#### Example

```ts
Popover.Root({ defaultOpen: false }, [
  Popover.Trigger({}, "Open"),
  Popover.Content({ side: "bottom" }, [
    $.p("Popover content"),
    Popover.Close({}, "Close"),
  ]),
])
```

### Trigger

> **Trigger**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"PopoverTrigger"`, [`PopoverTriggerProps`](../interfaces/PopoverTriggerProps.md), `never`, [`PopoverCtx`](../classes/PopoverCtx.md)\>

Button that toggles the Popover open/closed.
Also serves as the default anchor for positioning.

#### Example

```ts
Popover.Trigger({ class: "btn" }, "Open Popover")
```

## Example

```ts
// Basic usage
Popover.Root({ defaultOpen: false }, [
  Popover.Trigger({ class: "btn" }, "Open"),
  Popover.Content({ side: "bottom", align: "start" }, [
    $.div({ class: "popover-body" }, [
      $.p("Popover content here"),
    ]),
    Popover.Close({}, "Close"),
  ]),
])

// Controlled with custom anchor
const isOpen = yield* Signal.make(false)
Popover.Root({ open: isOpen }, [
  Popover.Anchor({ class: "anchor" }, [$.span("Anchor point")]),
  Popover.Trigger({}, "Toggle"),
  Popover.Content({ side: "right" }, [...]),
])
```
