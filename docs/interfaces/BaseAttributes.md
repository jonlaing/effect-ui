[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / BaseAttributes

# Interface: BaseAttributes

Defined in: [src/dom/Element/types.ts:126](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Element/types.ts#L126)

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
```

## Properties

### class?

> `readonly` `optional` **class**: `ClassValue`

Defined in: [src/dom/Element/types.ts:128](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Element/types.ts#L128)

CSS class name(s) - can be a string, array of strings, or reactive versions

***

### id?

> `readonly` `optional` **id**: `string`

Defined in: [src/dom/Element/types.ts:134](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Element/types.ts#L134)

Element ID

***

### style?

> `readonly` `optional` **style**: `Record`\<`string`, `StyleValue`\> \| [`Readable`](Readable.md)\<`Record`\<`string`, `string`\>\>

Defined in: [src/dom/Element/types.ts:130](https://github.com/jonlaing/effect-ui/blob/aacf1bed760c2d540b930ff4141953153ab6a6f4/src/dom/Element/types.ts#L130)

Inline styles as a record of property-value pairs
