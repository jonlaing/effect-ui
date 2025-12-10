[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / Component

# Type Alias: Component\<Name, Props, E, R\>

> **Component**\<`Name`, `Props`, `E`, `R`\> = `object` & `IsEmptyProps`\<`Props`\> _extends_ `true` ? \{(): [`Element`](Element.md)\<`E`, `R`\>; \<`CE`, `CR`\>(`children`): [`Element`](Element.md)\<`E` \| `CE`, `R` \| `CR`\>; (`props`): [`Element`](Element.md)\<`E`, `R`\>; \<`CE`, `CR`\>(`props`, `children`): [`Element`](Element.md)\<`E` \| `CE`, `R` \| `CR`\>; \} : \{(`props`): [`Element`](Element.md)\<`E`, `R`\>; \<`CE`, `CR`\>(`props`, `children`): [`Element`](Element.md)\<`E` \| `CE`, `R` \| `CR`\>; \}

Defined in: [src/dom/Component.ts:38](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Component.ts#L38)

A named component function that renders props to an Element.
Supports multiple call signatures similar to element factories.
Props can be omitted when the component has no required props.

## Type Declaration

### \_tag

> `readonly` **\_tag**: `Name`

The component's identifying tag name

## Type Parameters

### Name

`Name` _extends_ `string`

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
const Header = component("Header", () => $.h1("Welcome"));
Header(); // No props needed

// Props with children as second argument
Link({ href: "/" }, "Home");
Link({ href: "/about", class: "nav-link" }, ["About Us"]);
```

Note: Error and requirement types from children are inferred at the call site
and combined with the component's own types in the return type.
