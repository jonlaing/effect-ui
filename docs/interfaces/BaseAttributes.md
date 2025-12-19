[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / BaseAttributes

# Interface: BaseAttributes\<T\>

Defined in: [src/dom/Element/types.ts:166](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Element/types.ts#L166)

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

Defined in: [src/dom/Element/types.ts:169](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Element/types.ts#L169)

CSS class name(s) - can be a string, array of strings, or reactive versions

***

### id?

> `readonly` `optional` **id**: `string`

Defined in: [src/dom/Element/types.ts:175](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Element/types.ts#L175)

Element ID

***

### ref?

> `readonly` `optional` **ref**: [`RefType`](../type-aliases/RefType.md)\<`T`\>

Defined in: [src/dom/Element/types.ts:178](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Element/types.ts#L178)

***

### role?

> `readonly` `optional` **role**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/dom/Element/types.ts:177](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Element/types.ts#L177)

ARIA role attribute

***

### style?

> `readonly` `optional` **style**: `Record`\<`string`, `StyleValue`\> \| [`Readable`](Readable.md)\<`Record`\<`string`, `string`\>\>

Defined in: [src/dom/Element/types.ts:171](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/dom/Element/types.ts#L171)

Inline styles as a record of property-value pairs
