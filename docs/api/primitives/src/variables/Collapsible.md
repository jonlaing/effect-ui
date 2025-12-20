[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / Collapsible

# Variable: Collapsible

> `const` **Collapsible**: `object`

Defined in: [packages/primitives/src/primitives/Collapsible/Collapsible.ts:287](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/primitives/src/primitives/Collapsible/Collapsible.ts#L287)

Headless Collapsible primitive for building accessible
show/hide UI patterns.

Features:
- Controlled and uncontrolled modes
- Full keyboard support (Enter/Space)
- ARIA attributes (aria-expanded, aria-controls)
- Animation support via CSS classes
- Disabled state
- Data attributes for styling ([data-state], [data-disabled])

## Type Declaration

### Content

> **Content**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"CollapsibleContent"`, [`CollapsibleContentProps`](../interfaces/CollapsibleContentProps.md), `never`, [`CollapsibleCtx`](../classes/CollapsibleCtx.md)\>

Content area that shows/hides based on the Collapsible state.
Uses CSS transitions triggered by data-state attribute.

The content is always rendered to the DOM. Animation is controlled by CSS:
- `data-state="open"` / `data-state="closed"` triggers CSS transitions
- Uses CSS grid trick for smooth height animation without JS measurement

#### Example

```ts
Collapsible.Content({ class: "my-content" }, [
  $.p("This content can be shown or hidden"),
])
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for a Collapsible. Manages open/closed state and provides
context to child components.

#### Parameters

##### props

[`CollapsibleRootProps`](../interfaces/CollapsibleRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`CollapsibleCtx`](../classes/CollapsibleCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`CollapsibleCtx`](../classes/CollapsibleCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

#### Example

```ts
Collapsible.Root({ defaultOpen: false }, [
  Collapsible.Trigger({}, "Toggle"),
  Collapsible.Content({}, [
    $.div("Collapsible content here"),
  ]),
])
```

### Trigger

> **Trigger**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"CollapsibleTrigger"`, [`CollapsibleTriggerProps`](../interfaces/CollapsibleTriggerProps.md), `never`, [`CollapsibleCtx`](../classes/CollapsibleCtx.md)\>

Button that toggles the Collapsible open/closed state.
Includes proper ARIA attributes and keyboard support.

#### Example

```ts
Collapsible.Trigger({}, "Show more")
Collapsible.Trigger({ as: "div" }, $.span("Custom trigger"))
```

## Example

```ts
// Basic usage
Collapsible.Root({ defaultOpen: false }, [
  Collapsible.Trigger({}, "Toggle section"),
  Collapsible.Content({}, [
    $.div("Hidden content"),
  ]),
])

// With animation
Collapsible.Root({}, [
  Collapsible.Trigger({ class: "trigger-btn" }, "Show details"),
  Collapsible.Content({
    animate: {
      enter: "animate-slide-down",
      exit: "animate-slide-up",
    },
  }, [
    $.p("Animated content"),
  ]),
])

// Controlled
const isOpen = yield* Signal.make(false)
Collapsible.Root({
  open: isOpen,
  onOpenChange: (open) => Effect.log(`Now ${open ? "open" : "closed"}`),
}, [
  Collapsible.Trigger({}, "Controlled toggle"),
  Collapsible.Content({}, [$.div("Content")]),
])
```
