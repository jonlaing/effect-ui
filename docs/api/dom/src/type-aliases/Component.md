[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [dom/src](../README.md) / Component

# Type Alias: Component\<Name, Props, E, R\>

> **Component**\<`Name`, `Props`, `E`, `R`\> = `object` & `IsEmptyProps`\<`Props`\> *extends* `true` ? \{(): [`Element`](Element.md)\<`E`, `R`\>; \<`CE`, `CR`\>(`children`): [`Element`](Element.md)\<`CE` \| `E`, `CR` \| `R`\>; (`props`): [`Element`](Element.md)\<`E`, `R`\>; \<`CE`, `CR`\>(`props`, `children`): [`Element`](Element.md)\<`CE` \| `E`, `CR` \| `R`\>; \} : \{(`props`): [`Element`](Element.md)\<`E`, `R`\>; \<`CE`, `CR`\>(`props`, `children`): [`Element`](Element.md)\<`E` \| `CE`, `R` \| `CR`\>; \}

Defined in: [packages/dom/src/Component.ts:40](https://github.com/jonlaing/effex/blob/e712ed29ee888bf34312ef448dc28fddadfdefbd/packages/dom/src/Component.ts#L40)

A named component function that renders props to an Element.
Supports multiple call signatures similar to element factories.
Props can be omitted when the component has no required props.

## Type Declaration

### \_tag

> `readonly` **\_tag**: `Name`

The component's identifying tag name

## Type Parameters

### Name

`Name` *extends* `string`

The component's tag name for identification

### Props

`Props` = `object`

The props type accepted by the component

### E

`E` = `never`

The error type that can be produced by the component

### R

`R` = `never`

The requirements/context type needed by the component

## Example

```ts
// Component with no props - can omit the argument
const Header = component("Header", () => $.h1("Welcome"))
Header()  // No props needed

// Props with children as second argument
Link({ href: "/" }, "Home")
Link({ href: "/about", class: "nav-link" }, ["About Us"])
```

Note: Error and requirement types from children are inferred at the call site
and combined with the component's own types in the return type.
