[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / Accordion

# Variable: Accordion

> `const` **Accordion**: `object`

Defined in: [packages/primitives/src/primitives/Accordion/Accordion.ts:415](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Accordion/Accordion.ts#L415)

Headless Accordion primitive for building accessible
expandable content sections.

Features:
- Single or multiple items open at once
- Controlled and uncontrolled modes
- Full keyboard support (arrows, Home, End)
- ARIA attributes (aria-expanded, aria-controls, aria-labelledby)
- Disabled state at root or item level
- CSS-based animations via data-state

## Type Declaration

### Content

> **Content**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"AccordionContent"`, [`AccordionContentProps`](../interfaces/AccordionContentProps.md), `never`, [`AccordionItemCtx`](../classes/AccordionItemCtx.md)\>

Content area that shows/hides based on the Accordion item state.
Uses CSS grid trick for smooth height animation.

#### Example

```ts
Accordion.Content({ class: "accordion-content" }, [
  $.p("This content can be shown or hidden"),
])
```

### Item()

> **Item**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AccordionCtx`](../classes/AccordionCtx.md)\>

Individual accordion item container.

#### Parameters

##### props

[`AccordionItemProps`](../interfaces/AccordionItemProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AccordionCtx`](../classes/AccordionCtx.md) \| [`AccordionItemCtx`](../classes/AccordionItemCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AccordionCtx`](../classes/AccordionCtx.md) \| [`AccordionItemCtx`](../classes/AccordionItemCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AccordionCtx`](../classes/AccordionCtx.md)\>

#### Example

```ts
Accordion.Item({ value: "item-1" }, [
  Accordion.Trigger({}, "Section 1"),
  Accordion.Content({}, [$.p("Content here")]),
])
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for an Accordion. Manages open/closed state for all items.

#### Parameters

##### props

[`AccordionRootProps`](../interfaces/AccordionRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AccordionCtx`](../classes/AccordionCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`AccordionCtx`](../classes/AccordionCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

#### Example

```ts
// Single mode - only one open at a time
Accordion.Root({ type: "single", defaultValue: "item-1" }, [
  Accordion.Item({ value: "item-1" }, [...]),
  Accordion.Item({ value: "item-2" }, [...]),
])

// Multiple mode - any number can be open
Accordion.Root({ type: "multiple", defaultValue: ["item-1"] }, [
  Accordion.Item({ value: "item-1" }, [...]),
  Accordion.Item({ value: "item-2" }, [...]),
])
```

### Trigger

> **Trigger**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"AccordionTrigger"`, [`AccordionTriggerProps`](../interfaces/AccordionTriggerProps.md), `never`, [`AccordionCtx`](../classes/AccordionCtx.md) \| [`AccordionItemCtx`](../classes/AccordionItemCtx.md)\>

Button that toggles the Accordion item open/closed.
Includes proper ARIA attributes and keyboard support.

#### Example

```ts
Accordion.Trigger({ class: "accordion-trigger" }, "Click to expand")
```

## Example

```ts
// Single mode with collapsible
Accordion.Root({ type: "single", collapsible: true }, [
  Accordion.Item({ value: "item-1" }, [
    Accordion.Trigger({}, "Section 1"),
    Accordion.Content({}, [$.p("Content 1")]),
  ]),
  Accordion.Item({ value: "item-2" }, [
    Accordion.Trigger({}, "Section 2"),
    Accordion.Content({}, [$.p("Content 2")]),
  ]),
])

// Multiple mode
Accordion.Root({ type: "multiple", defaultValue: ["item-1", "item-2"] }, [
  Accordion.Item({ value: "item-1" }, [...]),
  Accordion.Item({ value: "item-2" }, [...]),
  Accordion.Item({ value: "item-3" }, [...]),
])
```
