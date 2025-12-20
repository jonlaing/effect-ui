[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [core/src](../README.md) / lift

# Function: lift()

> **lift**\<`T`, `R`\>(`fn`): (`props`) => [`Readable`](../interfaces/Readable.md)\<`R`\>

Defined in: [packages/core/src/Readable.ts:255](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/core/src/Readable.ts#L255)

Lift a function that takes an object as its argument to work with
potentially reactive properties. Properties can be either static values
or Readables, and the result is a Readable that updates when any
reactive property changes.

This is particularly useful for integrating with libraries like
class-variance-authority (CVA) or clsx.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `unknown`\>

### R

`R`

## Parameters

### fn

(`props`) => `R`

## Returns

> (`props`): [`Readable`](../interfaces/Readable.md)\<`R`\>

### Parameters

#### props

\{ \[K in string \| number \| symbol\]: T\[K\] \| Readable\<T\[K\]\> \}

### Returns

[`Readable`](../interfaces/Readable.md)\<`R`\>

## Example

```ts
import { cva } from "class-variance-authority";

const buttonCva = cva("btn font-medium", {
  variants: {
    variant: { primary: "bg-blue-500", secondary: "bg-gray-200" },
    size: { sm: "px-2 py-1", md: "px-4 py-2" },
  },
});

// Lift the CVA function
const buttonStyles = Readable.lift(buttonCva);

// Now it accepts Readables and returns a Readable<string>
const variant = yield* Signal.make<"primary" | "secondary">("primary");
const className = buttonStyles({ variant, size: "md" });
// className: Readable<string> - updates when variant changes

// Use in an element
yield* $.button({ class: className }, "Click me");
```
