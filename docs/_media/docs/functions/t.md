[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / t

# Function: t()

> **t**(`strings`, ...`values`): [`Readable`](../interfaces/Readable.md)\<`string`\>

Defined in: [src/dom/Template.ts:28](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Template.ts#L28)

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
