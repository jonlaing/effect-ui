<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./effex-logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./effex-logo-light.svg">
  <img src="./effex-logo-dark.svg" alt="Effex" width="200">
</picture>

A reactive UI framework built on [Effect](https://effect.website/). Effex provides a declarative way to build web interfaces with fine-grained reactivity, automatic cleanup, and full type safety.

## Why Effex?

Effex brings the power of [Effect](https://effect.website/) to frontend development. If you're building with Effect, this is a UI framework that speaks the same language.

### Typed Error Handling

Every element has type `Element<E, R>` where `E` is the error channel. Errors propagate through the component tree, and you **must** handle them before mounting:

```ts
// This won't compile - UserProfile might fail with ApiError
mount(UserProfile(), document.body); // Type error!

// Handle the error first
mount(
  Boundary.error(
    () => UserProfile(),
    (error) => $.div(`Failed to load: ${error.message}`),
  ),
  document.body,
); // Compiles
```

TypeScript tells you at build time which components can fail and forces you to handle it.

### Fine-Grained Reactivity

Effex uses signals for reactive state. When a signal updates, only the DOM nodes that actually depend on that signal update. No virtual DOM, no diffing, no wasted work:

```ts
const Counter: Component.Unit = () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);
    console.log("setup"); // Logs once, on mount
    return yield* $.div(count); // count changes update only this text node
  });
```

### Automatic Resource Cleanup

Effex uses Effect's scope system. Subscriptions, timers, and other resources are automatically cleaned up when components unmount:

```ts
yield* eventSource.pipe(
  Stream.runForEach(handler),
  Effect.forkIn(scope), // Cleaned up when scope closes
);
```

### The Effect Ecosystem

Effex gives you access to Effect's entire ecosystem:

- **Schema**: Runtime validation with static types
- **Streams**: Reactive data flows
- **Services**: Dependency injection via Effect's context system
- **Retry/timeout**: Built-in resilience patterns
- **Structured concurrency**: Fork, join, and race without footguns

## Quick Start

```bash
# Create a new project
pnpm create effex my-app
cd my-app
pnpm install
pnpm dev
```

Or install packages individually:

```bash
# For a simple SPA
pnpm add @effex/dom @effex/router effect

# For full-stack SSR
pnpm add @effex/platform effect
```

### Hello World

```ts
import { Effect } from "effect";
import { $, Component, Signal, mount, runApp } from "@effex/dom";

const Counter: Component.Unit = () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);

    return yield* $.div([
      $.button({ onClick: () => count.update((n) => n - 1) }, "-"),
      $.span(count),
      $.button({ onClick: () => count.update((n) => n + 1) }, "+"),
    ]);
  });

runApp(
  Effect.gen(function* () {
    yield* mount(Counter(), document.getElementById("root")!);
  }),
);
```

## Packages

Effex is organized into focused packages. Use what you need:

| Package | Description |
|---------|-------------|
| [`@effex/core`](./packages/core) | Reactive primitives: Signals, Derived values, reactive collections |
| [`@effex/dom`](./packages/dom) | DOM rendering, elements, control flow, components, animation |
| [`@effex/router`](./packages/router) | Type-safe routing with Effect Schema validation |
| [`@effex/form`](./packages/form) | Form handling with Effect Schema validation |
| [`@effex/primitives`](./packages/primitives) | Headless UI components (Dialog, Dropdown, Tabs, etc.) |
| [`@effex/platform`](./packages/platform) | Full-stack meta-framework: SSR, hydration, loaders, actions |
| [`@effex/vite-plugin`](./packages/vite-plugin) | Vite plugin for file-based routing |
| [`create-effex`](./packages/create-effex) | CLI to scaffold new projects |

**Note:** `@effex/dom` re-exports everything from `@effex/core`, and `@effex/platform` re-exports everything from all packages. For most apps, you only need one import.

## Why No JSX?

Effex uses function calls instead of JSX:

```ts
// Effex
$.div({ class: "container" }, [
  $.h1("Hello"),
  $.p(t`Count: ${count}`),
  Counter(),
])

// vs JSX
<div class="container">
  <h1>Hello</h1>
  <p>Count: {count}</p>
  <Counter />
</div>
```

**Why we chose this approach:**

1. **Error type preservation**: Elements have type `Element<E>` where `E` is the error channel. JSX would erase this to `JSX.Element`, losing type-safe error propagation.

2. **No build configuration**: Works out of the box with any TypeScript setup. No jsx runtime, tsconfig tweaks, or bundler plugins needed.

3. **Explicit Effects**: Every element is an Effect that must be yielded. JSX would obscure this.

4. **Consistent syntax**: Components and elements use the same call syntax.

## Element Helpers

The `Element` namespace provides pipeable DOM manipulation helpers for working with element refs and animation hooks:

```ts
import { Element, $ } from "@effex/dom";

// Create an element ref
const buttonRef = yield* Element.ref<HTMLButtonElement>();

// Use in animation hooks
when(isOpen, {
  onTrue: () => Dropdown(),
  animate: {
    onEnter: (el) => el.pipe(
      Element.setStyles({ "transform-origin": "top" }),
      Element.focusFirst("[data-item]"),
    ),
  },
});

// Chain operations
el.pipe(
  Element.addClass("active"),
  Element.setStyles({ opacity: "1" }),
  Element.setAttribute("aria-expanded", "true"),
  Element.focus,
)
```

Helpers are available for styles, classes, attributes, data attributes, focus, scrolling, events, and more. See the [`@effex/dom` README](./packages/dom/README.md#element-helpers) for the full API.

## Coming from Another Framework?

We have migration guides with concept mapping and side-by-side examples:

- [Coming from React](./REACT-MIGRATION.md)
- [Coming from Vue](./VUE-MIGRATION.md)
- [Coming from Svelte](./SVELTE-MIGRATION.md)

## API Documentation

Generate full API docs locally:

```bash
pnpm docs:gen
```

## Acknowledgments

Effex stands on the shoulders of giants:

- **[Effect](https://effect.website/)** - The foundation of everything. Effect's approach to typed errors, resource management, and structured concurrency inspired this entire project.

- **[React](https://react.dev/)** - The component model and hooks patterns heavily influenced Effex's API design.

- **[Solid](https://www.solidjs.com/)** - Our fine-grained reactivity system draws direct inspiration from Solid's brilliant reactive primitives.

- **[TanStack](https://tanstack.com/)** - The router and form APIs are inspired by TanStack Router and TanStack Form.

- **[Radix](https://www.radix-ui.com/)** - Our headless UI primitives follow patterns established by Radix.

## License

MIT
