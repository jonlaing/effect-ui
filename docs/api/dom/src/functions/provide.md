[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / provide

# Function: provide()

> **provide**\<`I`, `S`, `E`, `R`\>(`tag`, `value`, `children`): [`Child`](../type-aliases/Child.md)\<`E`, `Exclude`\<`R`, `I`\>\>[]

Defined in: [packages/dom/src/Provide.ts:39](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Provide.ts#L39)

Provide a context value to children elements.
Similar to React's Context.Provider pattern.

Supports partial context provision - if children require multiple contexts,
providing one will satisfy that requirement and leave the rest.

## Type Parameters

### I

`I`

### S

`S`

### E

`E` = `never`

### R

`R` = `I`

## Parameters

### tag

`Tag`\<`I`, `S`\>

The Effect Context tag

### value

`S`

The value to provide

### children

Elements that require this context (and possibly others)

[`Child`](../type-aliases/Child.md)\<`E`, `R`\> | readonly [`Child`](../type-aliases/Child.md)\<`E`, `R`\>[]

## Returns

[`Child`](../type-aliases/Child.md)\<`E`, `Exclude`\<`R`, `I`\>\>[]

The children with context provided, requiring only remaining contexts

## Examples

```ts
// Define a context
class ThemeCtx extends Context.Tag("Theme")<ThemeCtx, { color: string }>() {}

// Provide it to children
$.div(
  { class: "app" },
  provide(ThemeCtx, { color: "blue" }, [
    ThemedButton({}),
    ThemedText({}, "Hello"),
  ])
)
```

```ts
// Nested contexts - children require AccordionCtx | AccordionItemCtx
// After providing AccordionItemCtx, they only require AccordionCtx
provide(AccordionItemCtx, itemCtx, children)
```
