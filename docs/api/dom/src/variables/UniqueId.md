[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / UniqueId

# Variable: UniqueId

> `const` **UniqueId**: `object`

Defined in: [packages/dom/src/UniqueId.ts:32](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/dom/src/UniqueId.ts#L32)

Generate unique IDs for DOM elements.
Useful for ARIA relationships, label associations, and other cases
where elements need to reference each other by ID.

## Type Declaration

### make()

> **make**: (`prefix`) => `Effect`\<`string`\>

Generate a unique ID, optionally with a prefix.

#### Parameters

##### prefix

`string` = `"uid"`

Optional prefix for the ID (default: "uid")

#### Returns

`Effect`\<`string`\>

Effect that produces a unique string ID

## Example

```ts
// Basic usage
const id = yield* UniqueId.make()
// => "uid-1"

// With prefix
const contentId = yield* UniqueId.make("collapsible-content")
// => "collapsible-content-1"

// For ARIA relationships
Effect.gen(function* () {
  const labelId = yield* UniqueId.make("label")
  const inputId = yield* UniqueId.make("input")

  return yield* $.div([
    $.label({ id: labelId, htmlFor: inputId }, "Name"),
    $.input({ id: inputId, "aria-labelledby": labelId }),
  ])
})
```
