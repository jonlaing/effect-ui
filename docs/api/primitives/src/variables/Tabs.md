[**effex-monorepo**](../../../README.md)

***

[effex-monorepo](../../../modules.md) / [primitives/src](../README.md) / Tabs

# Variable: Tabs

> `const` **Tabs**: `object`

Defined in: [packages/primitives/src/primitives/Tabs/Tabs.ts:361](https://github.com/jonlaing/effex/blob/df5bcd687dfc005f51162b57280671d110f09f63/packages/primitives/src/primitives/Tabs/Tabs.ts#L361)

Headless Tabs primitive for building accessible tabbed interfaces.

Features:
- Controlled and uncontrolled modes
- Horizontal and vertical orientations
- Automatic or manual activation
- Full keyboard support (arrows, Home, End)
- ARIA attributes (role, aria-selected, aria-controls, aria-labelledby)
- Roving tabindex for proper focus management
- Conditional rendering or force mount option
- Data attributes for styling

## Type Declaration

### Content

> **Content**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"TabsContent"`, [`TabsContentProps`](../interfaces/TabsContentProps.md), `never`, [`TabsCtx`](../classes/TabsCtx.md)\>

Content panel associated with a tab trigger.
Only visible when its corresponding trigger is active.

#### Example

```ts
Tabs.Content({ value: "tab1" }, [
  $.p("This is the content for tab 1"),
])
```

### List

> **List**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"TabsList"`, [`TabsListProps`](../interfaces/TabsListProps.md), `never`, [`TabsCtx`](../classes/TabsCtx.md)\>

Container for tab triggers. Handles keyboard navigation.

#### Example

```ts
Tabs.List({ class: "tabs-list" }, [
  Tabs.Trigger({ value: "tab1" }, "Tab 1"),
  Tabs.Trigger({ value: "tab2" }, "Tab 2"),
])
```

### Root()

> **Root**: (`props`, `children`) => [`Element`](../../../dom/src/type-aliases/Element.md)

Root container for Tabs. Manages active tab state and provides
context to child components.

#### Parameters

##### props

[`TabsRootProps`](../interfaces/TabsRootProps.md)

##### children

[`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`TabsCtx`](../classes/TabsCtx.md)\> | [`Element`](../../../dom/src/type-aliases/Element.md)\<`never`, [`TabsCtx`](../classes/TabsCtx.md)\>[]

#### Returns

[`Element`](../../../dom/src/type-aliases/Element.md)

#### Example

```ts
Tabs.Root({ defaultValue: "tab1" }, [
  Tabs.List({}, [
    Tabs.Trigger({ value: "tab1" }, "Tab 1"),
    Tabs.Trigger({ value: "tab2" }, "Tab 2"),
  ]),
  Tabs.Content({ value: "tab1" }, [$.p("Content 1")]),
  Tabs.Content({ value: "tab2" }, [$.p("Content 2")]),
])
```

### Trigger

> **Trigger**: [`Component`](../../../dom/src/type-aliases/Component.md)\<`"TabsTrigger"`, [`TabsTriggerProps`](../interfaces/TabsTriggerProps.md), `never`, [`TabsCtx`](../classes/TabsCtx.md)\>

Tab trigger button. Activates its corresponding content panel.

#### Example

```ts
Tabs.Trigger({ value: "tab1", class: "tab-trigger" }, "Account")
```

## Example

```ts
// Basic usage
Tabs.Root({ defaultValue: "account" }, [
  Tabs.List({ class: "tabs-list" }, [
    Tabs.Trigger({ value: "account" }, "Account"),
    Tabs.Trigger({ value: "password" }, "Password"),
    Tabs.Trigger({ value: "settings", disabled: true }, "Settings"),
  ]),
  Tabs.Content({ value: "account" }, [
    $.h3("Account Settings"),
    $.p("Manage your account details here."),
  ]),
  Tabs.Content({ value: "password" }, [
    $.h3("Password"),
    $.p("Change your password here."),
  ]),
  Tabs.Content({ value: "settings" }, [
    $.h3("Settings"),
    $.p("This tab is disabled."),
  ]),
])

// Controlled with vertical orientation
const activeTab = yield* Signal.make("tab1")
Tabs.Root({
  value: activeTab,
  orientation: "vertical",
  onValueChange: (v) => Effect.log(`Tab changed to ${v}`),
}, [...])
```
