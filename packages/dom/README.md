# @effex/dom

DOM rendering for Effex applications. This package provides elements, components, control flow primitives, animation, and mounting utilities.

> **Note:** This package re-exports everything from `@effex/core`. You don't need to install both.

## Installation

```bash
pnpm add @effex/dom effect
```

## Basic Usage

### Simple Functions

Components are just functions that return Effects. Use `Effect.gen` for all components:

```ts
import { Effect } from "effect";
import { $, collect } from "@effex/dom";

const Greeting = (props: { name: string }) =>
  Effect.gen(function* () {
    return yield* $.div({ class: "greeting" }, collect(
      $.h1({}, $.of(`Hello, ${props.name}!`)),
      $.p({}, $.of("Welcome to Effex")),
    ));
  });
```

### Stateful Functions

Functions that need to create signals, derived values, or access context use the same pattern:

```ts
import { Effect } from "effect";
import { $, collect, Signal } from "@effex/dom";

const Counter = () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);

    return yield* $.div({}, collect(
      $.button({ onClick: () => count.update((n) => n - 1) }, $.of("-")),
      $.span({}, $.of(count)),
      $.button({ onClick: () => count.update((n) => n + 1) }, $.of("+")),
    ));
  });
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
yield* $.div({ class: "container", style: { color: "red" } }, collect(
  $.h1({}, $.of(name)),
  $.p({}, $.of(t`${count} items`)),
));
```

Use `$.of()` to lift primitives and Readables into children, and `collect()` to combine multiple children:

```ts
// Single child
yield* $.h1({}, $.of("Hello World"));
yield* $.button({ onClick: handleClick }, $.of("Click me"));

// Multiple children
yield* $.div({}, collect(
  $.of("Hello"),
  $.span({}, $.of("World")),
));
```

You can also import elements individually:

```ts
import { div, span, button, of, collect } from "@effex/dom";
```

## Defining Components

Components are just functions that return Effects. Use `Effect.gen` to define them:

### Functions Without Props

```ts
const Counter = () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);
    return yield* $.div({}, collect(
      $.button({ onClick: () => count.update((n) => n - 1) }, $.of("-")),
      $.span({}, $.of(count)),
      $.button({ onClick: () => count.update((n) => n + 1) }, $.of("+")),
    ));
  });
```

### Functions With Props

```ts
interface GreetingProps {
  name: string;
}

const Greeting = (props: GreetingProps) =>
  Effect.gen(function* () {
    return yield* $.h1({}, $.of(`Hello, ${props.name}!`));
  });

// With context requirements - automatically inferred from yielded effects
const UserBadge = (props: { userId: string }) =>
  Effect.gen(function* () {
    const auth = yield* AuthContext;
    return yield* $.span({}, $.of(`User: ${props.userId}`));
  });
```

### Functions With Children

To accept children and propagate their error/context types, make the function generic over `E` and `R`:

```ts
import type { ChildEffect } from "@effex/dom";

interface CardProps {
  title: string;
  class?: string;
}

const Card = <E, R>(props: CardProps, children: ChildEffect<E, R>) =>
  Effect.gen(function* () {
    return yield* $.div({ class: props.class ?? "card" }, collect(
      $.h2({}, $.of(props.title)),
      children,
    ));
  });

// Usage
Card({ title: "Hello" }, $.p({}, $.of("Content here")));
```

### Context Providers

Functions that provide context to children:

```ts
const MenuContext = Context.Tag<MenuContext, MenuState>();

interface MenuProps {
  orientation: "horizontal" | "vertical";
}

const Menu = <E, R>(props: MenuProps, children: ChildEffect<E, R>) =>
  Effect.gen(function* () {
    const state = yield* createMenuState(props);
    return yield* $.div(
      { class: "menu", role: "menu" },
      provide(MenuContext, state, children),
    );
  });

// Usage
Menu({ orientation: "vertical" }, collect(
  MenuItem({ value: "cut" }, $.of("Cut")),
  MenuItem({ value: "copy" }, $.of("Copy")),
));
```

## Control Flow

### when

Conditionally render elements based on a reactive boolean:

```ts
import { when } from "@effex/dom";

when(isLoggedIn, {
  container: () => $.div({ class: "login-status" }), // optional
  onTrue: () => $.div({}, $.of("Welcome back!")),
  onFalse: () => $.div({}, $.of("Please log in")),
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
  render: (todo) => $.li({}, $.of(todo.map((t) => t.text))),
});
```

### matchOption

Match on an Option value, receiving an unwrapped `Readable` in the `onSome` branch:

```ts
import { matchOption } from "@effex/dom";

// userData.value is Readable<Option<User>>
matchOption(userData.value, {
  onSome: (user) => $.div({}, $.of(user.map((u) => u.name))), // user is Readable<User>
  onNone: () => $.div({}, $.of("No user loaded")),
});
```

This is much cleaner than using `when` with manual Option unwrapping:

```ts
// Without matchOption (verbose)
when(userData.value.map(Option.isSome), {
  onTrue: () => $.div({}, $.of(userData.value.map((opt) =>
    Option.isSome(opt) ? opt.value.name : ""))),
  onFalse: () => $.div({}, $.of("No user loaded")),
});

// With matchOption (clean)
matchOption(userData.value, {
  onSome: (user) => $.div({}, $.of(user.map((u) => u.name))),
  onNone: () => $.div({}, $.of("No user loaded")),
});
```

### matchEither

Match on an Either value, receiving unwrapped `Readable` values in both branches:

```ts
import { matchEither } from "@effex/dom";

matchEither(validationResult, {
  onRight: (value) => $.div({}, $.of(value.map((v) => v.formatted))),
  onLeft: (error) => $.span({ class: "error" }, $.of(error.map((e) => e.message))),
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
  fallback: () => $.div({}, $.of("Loading...")),
  catch: (error) => $.div({}, $.of(`Error: ${error.message}`)),
  delay: "200 millis", // Avoid loading flash
});
```

Options:
- `render` - Async Effect that returns the element
- `fallback` - Element to show while loading
- `catch` - Optional error handler
- `delay` - Optional delay before showing fallback (accepts Effect Duration strings)

### Error Boundary

Handle errors in render subtrees:

```ts
Boundary.error(
  () => RiskyComponent(),
  (error) => $.div({}, $.of(`Failed: ${error.message}`)),
);
```

## Context

Effex uses Effect's Context system for dependency injection:

```ts
import { Context, Effect } from "effect";
import { $, provide } from "@effex/dom";

// Define a context
interface Theme {
  primary: string;
  secondary: string;
}

class ThemeContext extends Context.Tag("ThemeContext")<ThemeContext, Theme>() {}

// Consume context
const ThemedButton = (props: { label: string }) =>
  Effect.gen(function* () {
    const theme = yield* ThemeContext;
    return yield* $.button(
      { style: { backgroundColor: theme.primary } },
      $.of(props.label),
    );
  });

// Provide context to children
const App = () =>
  Effect.gen(function* () {
    const theme: Theme = { primary: "#007bff", secondary: "#6c757d" };

    return yield* $.div(
      {},
      provide(ThemeContext, theme, ThemedButton({ label: "Click me" })),
    );
  });
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

### Imperative Animations

For one-off animations triggered by user actions, use `Element.animate` which wraps the Web Animations API:

```ts
import { Effect } from "effect";
import { Element, $ } from "@effex/dom";

const SubmitButton = () =>
  Effect.gen(function* () {
    const buttonRef = yield* Element.ref<HTMLButtonElement>();

    const handleClick = () =>
      buttonRef.pipe(
        // Pulse animation - resolves when complete
        Element.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.1)" },
            { transform: "scale(1)" },
          ],
          { duration: 200, easing: "ease-out" },
        ),
      );

    return yield* $.button({ ref: buttonRef, onClick: handleClick }, $.of("Submit"));
  });

// Chain actions after animation completes
inputRef.pipe(
  Element.animate([{ opacity: "0" }, { opacity: "1" }], 300),
  Element.focus, // Runs after animation finishes
);
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
import { Portal, $, collect } from "@effex/dom";

// Render to document.body (default)
Portal(() => Modal({ title: "Hello" }));

// Render to a specific element
Portal({ target: "#modal-root" }, () =>
  $.div({ class: "dropdown" }, collect(
    $.button({}, $.of("Option 1")),
    $.button({}, $.of("Option 2")),
  )),
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
- `$.of(value)` - Lift a primitive or Readable into a ChildEffect
- `collect(...children)` - Combine multiple child effects into one

### Control Flow

- `when(condition, options)` - Conditional rendering
- `match(value, options)` - Pattern matching
- `each(items, options)` - List rendering
- `matchOption(option, options)` - Match on Option with unwrapped Readable
- `matchEither(either, options)` - Match on Either with unwrapped Readables

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

## Element Helpers

The `Element` namespace provides pipeable DOM manipulation helpers for use with element refs and animation hooks. All helpers support both data-first and data-last (pipeable) styles.

### Creating Element Refs

```ts
import { Effect } from "effect";
import { Element, $ } from "@effex/dom";

const MyComponent = () =>
  Effect.gen(function* () {
    const buttonRef = yield* Element.ref<HTMLButtonElement>();

    const handleFocus = () =>
      buttonRef.pipe(
        Element.setStyles({ outline: "2px solid blue" }),
        Element.focus,
        Effect.runPromise,
      );

    return yield* $.div({}, $.button({ ref: buttonRef, onClick: handleFocus }, $.of("Click me")));
  });
```

### Usage with Animation Hooks

Element helpers are particularly useful in animation lifecycle hooks:

```ts
when(isOpen, {
  onTrue: () => Dropdown(),
  onFalse: () => $.span(),
  animate: {
    enterFrom: "opacity-0",
    enterTo: "opacity-100",
    onBeforeEnter: (el) =>
      el.pipe(
        Element.setStyles({ "transform-origin": "top" }),
        Element.setData("state", "entering"),
      ),
    onEnter: (el) =>
      el.pipe(
        Element.focusFirst("[data-item]:not([data-disabled])"),
      ),
    onExit: (el) =>
      el.pipe(
        Element.setData("state", "exiting"),
      ),
  },
});
```

### API Styles

All helpers support both data-first and data-last (pipeable) styles:

```ts
// Data-first
Element.setStyles(el, { opacity: "1" });
Element.addClass(el, "active");

// Data-last (pipeable)
el.pipe(Element.setStyles({ opacity: "1" }));
el.pipe(Element.addClass("active"));
```

### Querying & Traversal

These return new elements and can fail if not found:

```ts
// Query descendants
el.pipe(Element.querySelector("[data-value]"))       // Effect<HTMLElement, NoSuchElementException>
el.pipe(Element.querySelectorAll("[data-item]"))     // Effect<HTMLElement[]>

// Traversal
el.pipe(Element.closest("[data-container]"))         // Effect<HTMLElement, NoSuchElementException>
el.pipe(Element.getParent)                           // Effect<HTMLElement, NoSuchElementException>
el.pipe(Element.matches("[data-active]"))            // Effect<boolean>

// Get element dimensions
el.pipe(Element.getBoundingClientRect)               // Effect<DOMRect>

// Recover from failures with Effect.option
el.pipe(Element.querySelector(".optional"), Effect.option)  // Effect<Option<HTMLElement>>
```

### Styles

```ts
// Set multiple styles (both camelCase and kebab-case work)
el.pipe(Element.setStyles({ opacity: "1", fontSize: "16px" }))
el.pipe(Element.setStyles({ opacity: "1", "font-size": "16px" }))

// Set single style
el.pipe(Element.setStyle("backgroundColor", "red"))
el.pipe(Element.setStyle("background-color", "red"))

// Remove style
el.pipe(Element.removeStyle("animation"))
```

### Classes

```ts
// Add classes
el.pipe(Element.addClass("active", "highlighted"))

// Remove classes
el.pipe(Element.removeClass("loading"))

// Toggle class
el.pipe(Element.toggleClass("expanded"))
el.pipe(Element.toggleClass("expanded", true))  // force add

// Replace class
el.pipe(Element.replaceClass("old-class", "new-class"))
```

### Attributes

```ts
// Set attributes
el.pipe(Element.setAttribute("aria-expanded", "true"))
el.pipe(Element.setAttributes({ role: "menu", "aria-label": "Options" }))

// Remove attribute
el.pipe(Element.removeAttribute("disabled"))

// Toggle boolean attribute
el.pipe(Element.toggleAttribute("disabled"))
el.pipe(Element.toggleAttribute("disabled", false))  // force remove

// Get attribute (fails with AttributeNotFound if missing)
el.pipe(Element.getAttribute("data-id"))             // Effect<string, AttributeNotFound>
el.pipe(Element.getAttribute("data-id"), Effect.option)  // Effect<Option<string>>
```

### Data Attributes

```ts
// Set data attribute
el.pipe(Element.setData("state", "open"))  // sets data-state="open"

// Remove data attribute
el.pipe(Element.removeData("state"))

// Get data attribute (fails with DataAttributeNotFound if missing)
el.pipe(Element.getData("state"))                    // Effect<string, DataAttributeNotFound>
el.pipe(Element.getData("state"), Effect.option)     // Effect<Option<string>>
```

### Content

```ts
// Set text content
el.pipe(Element.setTextContent("Hello, world!"))

// Set innerHTML (be careful with untrusted content)
el.pipe(Element.setInnerHTML("<strong>Bold</strong>"))
```

### Focus

```ts
// Basic focus
el.pipe(Element.focus)
el.pipe(Element.blur)

// Focus with options
el.pipe(Element.focusWithOptions({ preventScroll: true }))

// Focus first/last matching descendant
el.pipe(Element.focusFirst("[data-item]:not([data-disabled])"))
el.pipe(Element.focusLast("[data-item]"))
```

### Scrolling

```ts
// Scroll into view
el.pipe(Element.scrollIntoView({ behavior: "smooth", block: "center" }))

// Scroll within element
el.pipe(Element.scrollTo({ top: 0, behavior: "smooth" }))
el.pipe(Element.scrollBy({ top: 100 }))
```

### Events

```ts
// Programmatic click
el.pipe(Element.click)

// Dispatch custom event
el.pipe(Element.dispatchEvent(new CustomEvent("my-event", { detail: { foo: 1 } })))
```

### Input-Specific

```ts
// Select all text
inputEl.pipe(Element.select)

// Set selection range
inputEl.pipe(Element.setSelectionRange(0, 5))
```

### Custom Operations

For operations not covered by the built-in helpers:

```ts
// Synchronous side effect
el.pipe(Element.tap((e) => console.log("Element:", e)))

// Effectful operation
el.pipe(Element.tapEffect((e) => logToServer(e.id)))
```

### Chaining Operations

All mutation helpers preserve the element in the chain:

```ts
el.pipe(
  Element.addClass("container"),
  Element.setStyles({ padding: "10px" }),
  Element.setAttribute("role", "region"),
  Element.setData("state", "active"),
  Element.focus,
)
```

Query operations return new elements for continued chaining:

```ts
el.pipe(
  Element.querySelector(".target"),  // Finds .target child
  Element.addClass("found"),         // Adds class to .target
  Element.setStyles({ color: "blue" }),
)
```

### Synchronous Access

For imperative code paths where you need synchronous element access:

```ts
const el = Element.getUnsafe(buttonRef);
if (el) {
  el.style.transform = `translateX(${x}px)`;
}
```

### Error Types

- `NoSuchElementException` - Element not found (querySelector, closest, getParent)
- `AttributeNotFound` - Attribute doesn't exist (getAttribute)
- `DataAttributeNotFound` - Data attribute doesn't exist (getData)

Use `Effect.option` to convert failures to `Option<T>`:

```ts
// Instead of failing, get Option<string>
el.pipe(Element.getAttribute("maybe-exists"), Effect.option)
```

## Editor Setup

### Tailwind IntelliSense

Effex uses `class` (not `className`) which matches HTML and most modern frameworks. To get Tailwind autocomplete working, configure the language server to recognize Effex's class patterns.

**Neovim** (via `nvim-lspconfig`):

```lua
require('lspconfig').tailwindcss.setup({
  settings = {
    tailwindCSS = {
      experimental = {
        classRegex = {
          { "class:\\s*\"([^\"]*)\"", 1 },
          { "class:\\s*'([^']*)'", 1 },
        },
      },
    },
  },
})
```

**VS Code** (`.vscode/settings.json`):

```json
{
  "tailwindCSS.experimental.classRegex": [
    ["class:\\s*\"([^\"]*)\"", 1],
    ["class:\\s*'([^']*)'", 1]
  ]
}
```

This enables autocomplete for `class: "..."` in element props.
