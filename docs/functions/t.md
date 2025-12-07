[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / t

# Function: t()

> **t**(`strings`, ...`values`): [`Readable`](../interfaces/Readable.md)\<`string`\>

Defined in: src/Template.ts:28

Tagged template literal for creating reactive strings.
Interpolated Readable values will automatically update the string when they change.

## Parameters

### strings

`TemplateStringsArray`

### values

...readonly `unknown`[]

## Returns

[`Readable`](../interfaces/Readable.md)\<`string`\>

## Example

```ts
const name = yield* Signal.make("World")
const count = yield* Signal.make(0)

// Static parts stay static, reactive parts update
const message = t`Hello, ${name}! Count: ${count}`

// Use in elements
div([message])  // Updates when name or count changes
```
