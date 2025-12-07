[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / BaseAttributes

# Interface: BaseAttributes

Defined in: src/Element/types.ts:85

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

Defined in: src/Element/types.ts:87

CSS class name(s)

***

### id?

> `readonly` `optional` **id**: `string`

Defined in: src/Element/types.ts:93

Element ID

***

### style?

> `readonly` `optional` **style**: `Record`\<`string`, `StyleValue`\> \| [`Readable`](Readable.md)\<`Record`\<`string`, `string`\>\>

Defined in: src/Element/types.ts:89

Inline styles as a record of property-value pairs
