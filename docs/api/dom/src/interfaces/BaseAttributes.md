[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / BaseAttributes

# Interface: BaseAttributes\<T\>

Defined in: [packages/dom/src/Element/types.ts:165](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Element/types.ts#L165)

Base attributes available on all elements.

## Example

```ts
// Static class
div({ class: "container" }, [...])

// Array of classes (great for Tailwind)
div({ class: ["flex", "items-center", "gap-4"] }, [...])

// Reactive class
const isActive = yield* Signal.make(false)
div({ class: isActive.map(a => a ? "active" : "inactive") }, [...])

// Mixed array with reactive items
const variant = yield* Signal.make("primary")
div({ class: ["btn", variant.map(v => `btn-${v}`), "rounded"] }, [...])

// Reactive array of classes
const classes = yield* Signal.make(["btn", "btn-primary"])
div({ class: classes }, [...])

// Static styles
div({ style: { color: "red", "font-size": "16px" } }, [...])

// Reactive styles
const width = yield* Signal.make(100)
div({ style: { width: width.map(w => `${w}px`) } }, [...])

// Data attributes
div({ "data-state": "open", "data-testid": "my-div" }, [...])

// Reactive data attributes
const state = yield* Signal.make("closed")
div({ "data-state": state }, [...])
```

## Extends

- `DataAttributes`.`AriaAttributes`

## Type Parameters

### T

`T` *extends* `HTMLElement`

## Indexable

\[`key`: `` `data-${string}` ``\]: `DataAttributeValue`

\[`key`: `` `aria-${string}` ``\]: `AriaAttributeValue`

## Properties

### class?

> `readonly` `optional` **class**: `ClassValue`

Defined in: [packages/dom/src/Element/types.ts:168](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Element/types.ts#L168)

CSS class name(s) - can be a string, array of strings, or reactive versions

***

### id?

> `readonly` `optional` **id**: `string`

Defined in: [packages/dom/src/Element/types.ts:174](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Element/types.ts#L174)

Element ID

***

### innerHTML?

> `readonly` `optional` **innerHTML**: `string` \| [`Readable`](../../../core/src/interfaces/Readable.md)\<`string`\>

Defined in: [packages/dom/src/Element/types.ts:194](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Element/types.ts#L194)

Set the element's innerHTML directly. Useful for rendering HTML strings
from markdown parsers, rich text editors, or sanitized user content.

Note: No automatic sanitization - use DOMPurify or similar if rendering untrusted content.

#### Example

```ts
// Static HTML
$.div({ innerHTML: "<strong>Bold</strong> text" })

// Reactive markdown rendering
const markdown = yield* Signal.make("# Hello");
$.div({ innerHTML: markdown.map(md => marked.parse(md)) })
```

***

### ref?

> `readonly` `optional` **ref**: [`RefType`](../../../core/src/type-aliases/RefType.md)\<`T`\>

Defined in: [packages/dom/src/Element/types.ts:177](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Element/types.ts#L177)

***

### role?

> `readonly` `optional` **role**: `string` \| [`Readable`](../../../core/src/interfaces/Readable.md)\<`string`\>

Defined in: [packages/dom/src/Element/types.ts:176](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Element/types.ts#L176)

ARIA role attribute

***

### style?

> `readonly` `optional` **style**: `Record`\<`string`, `StyleValue`\> \| [`Readable`](../../../core/src/interfaces/Readable.md)\<`Record`\<`string`, `string`\>\>

Defined in: [packages/dom/src/Element/types.ts:170](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Element/types.ts#L170)

Inline styles as a record of property-value pairs
