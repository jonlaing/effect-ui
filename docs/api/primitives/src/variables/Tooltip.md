[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / Tooltip

# Variable: Tooltip

> `const` **Tooltip**: `object`

Defined in: [packages/primitives/src/primitives/Tooltip/Tooltip.ts:293](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tooltip/Tooltip.ts#L293)

Headless Tooltip primitive for building accessible hover hints.

Features:
- Controlled and uncontrolled modes
- Configurable delay before showing
- Configurable positioning (side, align, offsets)
- Portal rendering (escapes overflow)
- ARIA attributes (role="tooltip", aria-describedby)
- Data attributes for styling
- Shows on hover and focus

## Type Declaration

### Content

> **Content**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"TooltipContent"`, [`TooltipContentProps`](../interfaces/TooltipContentProps.md), `never`, [`TooltipCtx`](../classes/TooltipCtx.md)\>

Content area for the Tooltip.
Renders in a Portal and is positioned relative to the trigger.

#### Example

```ts
Tooltip.Content({ side: "top", align: "center" }, "Tooltip text")
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for a Tooltip. Manages open/closed state and provides
context to child components.

#### Parameters

##### props

[`TooltipRootProps`](../interfaces/TooltipRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`TooltipCtx`](../classes/TooltipCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`TooltipCtx`](../classes/TooltipCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

#### Example

```ts
Tooltip.Root({ delayDuration: 300 }, [
  Tooltip.Trigger({}, $.button({}, "Hover me")),
  Tooltip.Content({ side: "top" }, "Helpful tooltip text"),
])
```

### Trigger

> **Trigger**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"TooltipTrigger"`, [`TooltipTriggerProps`](../interfaces/TooltipTriggerProps.md), `never`, [`TooltipCtx`](../classes/TooltipCtx.md)\>

Element that triggers the tooltip on hover/focus.
Wraps children in a span for event handling.

#### Example

```ts
Tooltip.Trigger({}, $.button({}, "Hover me"))
```

## Example

```ts
// Basic usage
Tooltip.Root({ delayDuration: 300 }, [
  Tooltip.Trigger({}, $.button({}, "Save")),
  Tooltip.Content({ side: "top" }, "Save your changes"),
])

// Different positions
Tooltip.Root({}, [
  Tooltip.Trigger({}, $.button({}, "Help")),
  Tooltip.Content({ side: "right", align: "start" }, "Click for help"),
])
```
