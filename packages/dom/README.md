# @effex/dom

DOM rendering for Effex applications. This package provides elements, components, control flow primitives, animation, and mounting utilities.

> **Note:** This package re-exports everything from `@effex/core`. You don't need to install both.

## Installation

```bash
pnpm add @effex/dom effect
```

## Basic Usage

### Simple Components

For components that just render static or prop-based content, return the element directly:

```ts
import { $, component } from "@effex/dom";

const Greeting = component("Greeting", (props: { name: string }) =>
  $.div({ class: "greeting" }, [
    $.h1(`Hello, ${props.name}!`),
    $.p("Welcome to Effex"),
  ]),
);
```

### Stateful Components

Use `Effect.gen` when your component needs to create signals, derived values, or access context:

```ts
import { Effect } from "effect";
import { $, Signal, component } from "@effex/dom";

const Counter = component("Counter", () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);

    return yield* $.div([
      $.button({ onClick: () => count.update((n) => n - 1) }, "-"),
      $.span(count),
      $.button({ onClick: () => count.update((n) => n + 1) }, "+"),
    ]);
  }),
);
```

### Running Your App

Use `runApp` to mount your application. It handles scoping, the SignalRegistry, and keeping the app alive:

```ts
import { Effect } from "effect";
import { mount, runApp } from "@effex/dom";

runApp(
  Effect.gen(function* () {
    yield* mount(Counter(), document.getElementById("root")!);
  }),
);
```

## Elements

The `$` namespace contains all HTML element factories (`$.div`, `$.span`, `$.button`, etc.). Elements are Effects that must be yielded:

```ts
yield* $.div({ class: "container", style: { color: "red" } }, [
  $.h1(["Hello, ", name]),
  $.p(t`${count} items`),
]);
```

Single children don't need to be wrapped in arrays:

```ts
yield* $.h1("Hello World");
yield* $.button({ onClick: handleClick }, "Click me");
```

You can also import elements individually:

```ts
import { div, span, button } from "@effex/dom";
```

## Control Flow

### when

Conditionally render elements based on a reactive boolean:

```ts
import { when } from "@effex/dom";

when(isLoggedIn, {
  container: () => $.div({ class: "login-status" }), // optional
  onTrue: () => $.div("Welcome back!"),
  onFalse: () => $.div("Please log in"),
});
```

### match

Pattern match on a reactive value:

```ts
import { match } from "@effex/dom";

match(status, {
  cases: [
    { pattern: "loading", render: () => Spinner() },
    { pattern: "error", render: () => ErrorMessage() },
    { pattern: "success", render: () => Content() },
  ],
  fallback: () => $.div("Unknown status"),
});
```

### each

Render a list of items with automatic keying:

```ts
import { each } from "@effex/dom";

each(todos, {
  container: () => $.ul({ class: "todo-list" }), // optional
  key: (todo) => todo.id,
  render: (todo) => $.li(todo.map((t) => t.text)),
});
```

## Async Boundaries

### Suspense

Handle async rendering with loading states:

```ts
import { Boundary } from "@effex/dom";

Boundary.suspense({
  render: () =>
    Effect.gen(function* () {
      const user = yield* fetchUser(id);
      return yield* UserProfile({ user });
    }),
  fallback: () => $.div("Loading..."),
  catch: (error) => $.div(`Error: ${error.message}`),
  delay: "200 millis", // Avoid loading flash
});
```

Options:
- `render` - Async Effect that returns the element
- `fallback` - Element to show while loading
- `catch` - Optional error handler
- `delay` - Optional delay before showing fallback (accepts Effect Duration strings)

### Error Boundary

Handle errors in component subtrees:

```ts
Boundary.error(
  () => RiskyComponent(),
  (error) => $.div(`Failed: ${error.message}`),
);
```

## Context

Effex uses Effect's Context system for dependency injection:

```ts
import { Context, Effect } from "effect";
import { $, component, provide } from "@effex/dom";

// Define a context
interface Theme {
  primary: string;
  secondary: string;
}

class ThemeContext extends Context.Tag("ThemeContext")<ThemeContext, Theme>() {}

// Consume context
const ThemedButton = component("ThemedButton", (props: { label: string }) =>
  Effect.gen(function* () {
    const theme = yield* ThemeContext;
    return yield* $.button(
      { style: { backgroundColor: theme.primary } },
      props.label,
    );
  }),
);

// Provide context to children
const App = component("App", () =>
  Effect.gen(function* () {
    const theme: Theme = { primary: "#007bff", secondary: "#6c757d" };

    return yield* $.div(
      provide(ThemeContext, theme, [
        ThemedButton({ label: "Click me" }),
      ]),
    );
  }),
);
```

## Animation

CSS-based animation primitives for `when`, `match`, and `each`:

```ts
import { when, each, match, stagger } from "@effex/dom";

// Simple enter/exit animations
when(isVisible, {
  onTrue: () => Modal(),
  onFalse: () => $.span(),
  animate: { enter: "fade-in", exit: "fade-out" },
});

// With initial and final state classes (great for Tailwind)
when(isOpen, {
  onTrue: () => Dropdown(),
  onFalse: () => $.span(),
  animate: {
    enterFrom: "opacity-0 scale-95",
    enterTo: "opacity-100 scale-100",
    exit: "fade-out",
  },
});

// Staggered list animations
each(items, {
  container: () => $.ul(),
  key: (item) => item.id,
  render: (item) => ListItem(item),
  animate: {
    enter: "slide-in",
    exit: "slide-out",
    stagger: stagger(50), // 50ms between items
  },
});

// Route transitions
match(router.currentRoute, {
  cases: [
    { pattern: "home", render: () => HomePage() },
    { pattern: "about", render: () => AboutPage() },
  ],
  fallback: () => NotFound(),
  animate: { enter: "fade-in", exit: "fade-out" },
});
```

### Animation Options

```ts
interface AnimationOptions {
  enter?: string;        // CSS class(es) for enter animation
  exit?: string;         // CSS class(es) for exit animation
  enterFrom?: string;    // Initial state class (removed after animation)
  enterTo?: string;      // Final state class (persisted)
  exitTo?: string;       // Exit target state class
  timeout?: number;      // Max wait time in ms (default: 5000)
  respectReducedMotion?: boolean; // Skip if user prefers (default: true)

  // Lifecycle hooks
  onBeforeEnter?: (el: HTMLElement) => Effect<void> | void;
  onEnter?: (el: HTMLElement) => Effect<void> | void;
  onBeforeExit?: (el: HTMLElement) => Effect<void> | void;
  onExit?: (el: HTMLElement) => Effect<void> | void;
}
```

### Stagger Utilities

```ts
import { stagger, staggerFromCenter, staggerEased } from "@effex/dom";

stagger(50);              // Linear: 0ms, 50ms, 100ms...
staggerFromCenter(30);    // Center-out: middle items animate first
staggerEased(500, easeOut); // Apply easing curve to timing
```

### Timing Utilities

```ts
import { delay, sequence, parallel } from "@effex/dom";

yield* delay(200, runEnterAnimation(element, options));
yield* sequence(exitAnimation, enterAnimation);
yield* parallel(anim1, anim2, anim3);
```

### Example CSS

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.fade-in { animation: fade-in 0.3s ease-out forwards; }
.fade-out { animation: fade-in 0.2s ease-in reverse forwards; }
.slide-in { animation: slide-in 0.3s ease-out forwards; }
.slide-out { animation: slide-in 0.2s ease-in reverse forwards; }
```

## Portal

Render children into a different DOM node:

```ts
import { Portal, $ } from "@effex/dom";

// Render to document.body (default)
Portal(() => Modal({ title: "Hello" }));

// Render to a specific element
Portal({ target: "#modal-root" }, () =>
  $.div({ class: "dropdown" }, [
    $.button("Option 1"),
    $.button("Option 2"),
  ]),
);

// Render to an element reference
Portal({ target: containerElement }, () => Tooltip({ content: "Help" }));
```

Portal is useful for modals, dropdowns, and tooltips that need to escape parent `overflow: hidden` or `z-index` stacking contexts.

## Mounting

### mount

Mount an element into a container:

```ts
import { mount } from "@effex/dom";

yield* mount(App(), document.getElementById("root")!);
```

### runApp

Run a complete application with all boilerplate handled:

```ts
import { runApp, mount } from "@effex/dom";

runApp(
  Effect.gen(function* () {
    yield* mount(App(), document.getElementById("root")!);
  }),
);
```

`runApp` handles:
- Scoping for proper resource cleanup
- Providing the SignalRegistry
- Keeping the app alive until page unload

## API Reference

### Elements

- `$.<element>(attrs?, children?)` - Create an HTML element
- `component(name, render)` - Define a component

### Control Flow

- `when(condition, options)` - Conditional rendering
- `match(value, options)` - Pattern matching
- `each(items, options)` - List rendering

### Boundaries

- `Boundary.suspense(options)` - Async loading boundary
- `Boundary.error(render, catch)` - Error boundary

### Context

- `provide(tag, value, children)` - Provide context to children

### Animation

- `stagger(delay)` - Linear stagger function
- `staggerFromCenter(delay)` - Center-out stagger
- `staggerEased(duration, easing)` - Eased stagger
- `delay(ms, effect)` - Delay an effect
- `sequence(...effects)` - Run effects in sequence
- `parallel(...effects)` - Run effects in parallel

### Mounting

- `mount(element, container)` - Mount an element
- `runApp(program, options?)` - Run an application
