[**@jonlaing/effect-ui**](../README.md)

***

[@jonlaing/effect-ui](../globals.md) / NavigationMenu

# Variable: NavigationMenu

> `const` **NavigationMenu**: `object`

Defined in: [src/primitives/NavigationMenu/NavigationMenu.ts:609](https://github.com/jonlaing/effect-ui/blob/5c8e6a73fe71d5c320b454ab84a9938a1f710309/src/primitives/NavigationMenu/NavigationMenu.ts#L609)

Headless NavigationMenu primitive for building accessible navigation.

Features:
- Horizontal or vertical orientation
- Hover delays to prevent accidental open/close
- Keyboard navigation between items
- Shared viewport for content display
- Animated indicator that follows active trigger

## Type Declaration

### Content

> **Content**: [`Component`](../type-aliases/Component.md)\<`"NavigationMenuContent"`, [`NavigationMenuContentProps`](../interfaces/NavigationMenuContentProps.md), `never`, [`NavigationMenuCtx`](../classes/NavigationMenuCtx.md) \| [`NavigationMenuItemCtx`](../classes/NavigationMenuItemCtx.md)\>

Content panel that appears when the trigger is activated.
Renders inside Item but positions itself absolutely to appear below the menu.

### Indicator

> **Indicator**: [`Component`](../type-aliases/Component.md)\<`"NavigationMenuIndicator"`, [`NavigationMenuIndicatorProps`](../interfaces/NavigationMenuIndicatorProps.md), `never`, [`NavigationMenuCtx`](../classes/NavigationMenuCtx.md)\>

Visual indicator that follows the active trigger.

### Item()

> **Item**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)\<`never`, [`NavigationMenuCtx`](../classes/NavigationMenuCtx.md)\>

Wrapper for a navigation menu item (trigger + content).

#### Parameters

##### props

[`NavigationMenuItemProps`](../interfaces/NavigationMenuItemProps.md)

##### children

[`Child`](../type-aliases/Child.md)\<`never`, [`NavigationMenuCtx`](../classes/NavigationMenuCtx.md) \| [`NavigationMenuItemCtx`](../classes/NavigationMenuItemCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)\<`never`, [`NavigationMenuCtx`](../classes/NavigationMenuCtx.md)\>

### List

> **List**: [`Component`](../type-aliases/Component.md)\<`"NavigationMenuList"`, [`NavigationMenuListProps`](../interfaces/NavigationMenuListProps.md), `never`, [`NavigationMenuCtx`](../classes/NavigationMenuCtx.md)\>

Container for navigation menu items.

### Root()

> **Root**: (`props`, `children`) => [`Element`](../type-aliases/Element.md)

Root container for NavigationMenu. Manages active state and provides context.

#### Parameters

##### props

[`NavigationMenuRootProps`](../interfaces/NavigationMenuRootProps.md)

##### children

[`Element`](../type-aliases/Element.md)\<`never`, [`NavigationMenuCtx`](../classes/NavigationMenuCtx.md)\> | [`Element`](../type-aliases/Element.md)\<`never`, [`NavigationMenuCtx`](../classes/NavigationMenuCtx.md)\>[]

#### Returns

[`Element`](../type-aliases/Element.md)

### Trigger

> **Trigger**: [`Component`](../type-aliases/Component.md)\<`"NavigationMenuTrigger"`, [`NavigationMenuTriggerProps`](../interfaces/NavigationMenuTriggerProps.md), `never`, [`NavigationMenuCtx`](../classes/NavigationMenuCtx.md) \| [`NavigationMenuItemCtx`](../classes/NavigationMenuItemCtx.md)\>

Button that opens the navigation menu content.

### Viewport

> **Viewport**: [`Component`](../type-aliases/Component.md)\<`"NavigationMenuViewport"`, [`NavigationMenuViewportProps`](../interfaces/NavigationMenuViewportProps.md), `never`, [`NavigationMenuCtx`](../classes/NavigationMenuCtx.md)\>

Viewport is a positioning reference for Content elements.
Content elements position themselves relative to this container.
Note: This component is optional - Content will still work without it,
but Viewport provides a consistent positioning anchor.

## Example

```ts
NavigationMenu.Root({ delayDuration: 200 }, [
  NavigationMenu.List({}, [
    NavigationMenu.Item({ value: "products" }, [
      NavigationMenu.Trigger({}, "Products"),
      NavigationMenu.Content({}, [
        Link({ href: "/products/software" }, "Software"),
        Link({ href: "/products/hardware" }, "Hardware"),
      ]),
    ]),
    NavigationMenu.Item({ value: "about" }, [
      NavigationMenu.Trigger({}, "About"),
      NavigationMenu.Content({}, [
        Link({ href: "/about/team" }, "Team"),
        Link({ href: "/about/careers" }, "Careers"),
      ]),
    ]),
  ]),
  NavigationMenu.Viewport({}),
  NavigationMenu.Indicator({}),
])
```
