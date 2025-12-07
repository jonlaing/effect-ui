[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / component

# Function: component()

> **component**\<`Name`, `Props`\>(`name`, `render`): [`Component`](../interfaces/Component.md)\<`Name`, `Props`\>

Defined in: src/Component.ts:34

Create a named component from a render function.

## Type Parameters

### Name

`Name` *extends* `string`

### Props

`Props` = `object`

## Parameters

### name

`Name`

Unique name for the component (useful for debugging)

### render

(`props`) => [`Element`](../type-aliases/Element.md)

Function that renders props to an Element

## Returns

[`Component`](../interfaces/Component.md)\<`Name`, `Props`\>

## Example

```ts
interface ButtonProps {
  label: string
  onClick: () => void
}

const Button = component("Button", (props: ButtonProps) =>
  button({ onClick: props.onClick }, [props.label])
)

// Usage
Button({ label: "Click me", onClick: () => console.log("clicked") })
```
