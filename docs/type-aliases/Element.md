[**effect-ui**](../README.md)

***

[effect-ui](../globals.md) / Element

# Type Alias: Element

> **Element** = `Effect.Effect`\<`HTMLElement`, `never`, `Scope.Scope`\>

Defined in: src/Element/types.ts:12

A DOM element wrapped in an Effect with scope management.

## Example

```ts
const myButton: Element = button({ class: "primary" }, ["Click me"])
```
