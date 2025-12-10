[**@jonlaing/effect-ui**](../README.md)

---

[@jonlaing/effect-ui](../globals.md) / component

# Function: component()

> **component**\<`Name`, `Props`, `E`, `R`\>(`name`, `render`): [`Component`](../type-aliases/Component.md)\<`Name`, `Props`, `E`, `R`\>

Defined in: [src/dom/Component.ts:111](https://github.com/jonlaing/effect-ui/blob/5dcbd96e71866aa767e66bbf641843f4b888e1d7/src/dom/Component.ts#L111)

Create a named component from a render function.
The render function receives props and optional children as separate arguments.

## Type Parameters

### Name

`Name` _extends_ `string`

### Props

`Props` = `object`

### E

`E` = `never`

### R

`R` = `never`

## Parameters

### name

`Name`

Unique name for the component (useful for debugging)

### render

(`props`, `children?`) => [`Element`](../type-aliases/Element.md)\<`E`, `R`\>

Function that renders props and children to an Element

## Returns

[`Component`](../type-aliases/Component.md)\<`Name`, `Props`, `E`, `R`\>

## Examples

```ts
// Simple component without children
interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button = component("Button", (props: ButtonProps) =>
  button({ onClick: props.onClick }, [props.label]),
);

// Usage
Button({ label: "Click me", onClick: () => console.log("clicked") });
```

```ts
// Component with children as second argument
interface LinkProps {
  href: string;
  class?: string;
}

const Link = component("Link", (props: LinkProps, children) =>
  a({ href: props.href, class: props.class }, children ?? []),
);

// Usage - children as second argument
Link({ href: "/" }, "Home");
Link({ href: "/about", class: "nav-link" }, ["About", " Us"]);
```

```ts
// Component with context requirements
const NavLink = component("NavLink", (props: { href: string }, children) =>
  Effect.gen(function* () {
    const router = yield* RouterContext;
    return yield* button(
      { onClick: () => router.push(props.href) },
      children ?? [],
    );
  }),
);
// Type: Component<"NavLink", { href: string }, never, RouterContext>
```
