[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / BaseAttributes

# Interface: BaseAttributes

Defined in: [src/dom/Element/types.ts:105](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Element/types.ts#L105)

Base attributes available on all elements.

## Example

```ts
// Static class
div({ class: "container" }, [...])

// Reactive class
const isActive = yield* Signal.make(false)
div({ class: isActive.map(a => a ? "active" : "inactive") }, [...])

// Static styles
div({ style: { color: "red", "font-size": "16px" } }, [...])

// Reactive styles
const width = yield* Signal.make(100)
div({ style: { width: width.map(w => `${w}px`) } }, [...])
```

## Properties

### class?

> `readonly` `optional` **class**: `string` \| [`Readable`](Readable.md)\<`string`\>

Defined in: [src/dom/Element/types.ts:107](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Element/types.ts#L107)

CSS class name(s)

---

### id?

> `readonly` `optional` **id**: `string`

Defined in: [src/dom/Element/types.ts:113](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Element/types.ts#L113)

Element ID

---

### style?

> `readonly` `optional` **style**: `Record`\<`string`, `StyleValue`\> \| [`Readable`](Readable.md)\<`Record`\<`string`, `string`\>\>

Defined in: [src/dom/Element/types.ts:109](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Element/types.ts#L109)

Inline styles as a record of property-value pairs
