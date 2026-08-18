---
title: "Components"
description: "Define components as plain functions or Effect generators, with context providers and children."
order: 1
---

# Components

Stax components are just functions that return Elements. There's no special component class, no hooks rules, and no lifecycle methods. A component is either a plain function (for static content) or an Effect generator (for state and context).

## Simple Components

Components without state or context requirements are plain functions:

```typescript
import { $ } from "@stax-ui/dom";

const Greeting = (props: { name: string }) =>
  $.h1({}, `Hello, ${props.name}!`);
```

### With Children

Use generics on `E` and `R` to propagate error and requirement types from children:

```typescript
import { type Element } from "@stax-ui/dom";

const Card = <E, R>(
  props: { title: string },
  children: Element.Child<E, R>,
) =>
  $.div({ class: "card" },
    $.h2({}, props.title),
    children,
  );
```

This ensures that if the children require a context or may produce an error, those types flow through to the Card's return type. The compiler tracks them for you.

## Stateful Components

Use `Effect.gen` when you need signals, context, or other Effects:

```typescript
import { Effect } from "effect";
import { $, Signal } from "@stax-ui/dom";

const Counter = () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);

    return yield* $.div({},
      $.button(
        { onClick: () => count.update((n) => n - 1) },
        "-",
      ),
      $.span({}, count),
      $.button(
        { onClick: () => count.update((n) => n + 1) },
        "+",
      ),
    );
  });
```

The `yield*` is where Effects are executed. `Signal.make` creates a scoped signal, `$.div` creates a DOM element — both are Effects, so they compose naturally.

### Accessing Context

Components that depend on context simply `yield*` the context tag:

```typescript
const UserBadge = () =>
  Effect.gen(function* () {
    const user = yield* UserContext;
    return yield* $.span({}, user.name);
  });
```

The `UserContext` requirement appears in the component's `R` type channel. If you try to render `UserBadge` without providing `UserContext`, TypeScript catches it at compile time.

## Context Providers

Use `provide` to supply context to children:

```typescript
import { Context, Effect } from "effect";
import { $, provide } from "@stax-ui/dom";

class ThemeContext extends Context.Tag("ThemeContext")<
  ThemeContext,
  Theme
>() {}

const ThemedButton = (props: { label: string }) =>
  Effect.gen(function* () {
    const theme = yield* ThemeContext;
    return yield* $.button(
      { style: { backgroundColor: theme.primary } },
      props.label,
    );
  });

// Provide context to children
$.div({},
  provide(ThemeContext, myTheme,
    ThemedButton({ label: "Click" }),
  ),
);
```

`provide` removes `ThemeContext` from the `R` channel — downstream code no longer needs to satisfy that requirement.

## Running Your App

Use `runApp` and `mount` to start your application:

```typescript
import { Effect } from "effect";
import { mount, runApp } from "@stax-ui/dom";

runApp(
  Effect.gen(function* () {
    yield* mount(App(), document.getElementById("root")!);
  }),
);
```

`runApp` handles boilerplate: scoping, the signal registry, and keeping the process alive. You can pass additional layers:

```typescript
import { Navigation } from "@stax-ui/router";

runApp(
  Effect.gen(function* () {
    yield* mount(App(), document.getElementById("root")!);
  }),
  { layer: Navigation.makeLayer(router) },
);
```
