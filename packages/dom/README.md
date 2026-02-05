# @effex/dom

DOM rendering for Effex applications. This package provides elements, components, control flow primitives, animation, SSR/hydration, and mounting utilities.

> **Note:** This package re-exports everything from `@effex/core`. You don't need to install both.

## Installation

```bash
pnpm add @effex/dom effect
```

## Basic Usage

### Simple Components

Components without state or context requirements can be plain functions:

```ts
import { $, collect } from "@effex/dom";

const Greeting = (props: { name: string }) =>
  $.div({ class: "greeting" }, collect(
    $.h1({}, $.of(`Hello, ${props.name}!`)),
    $.p({}, $.of("Welcome to Effex")),
  ));
```

### Stateful Components

Components that need signals, context, or other Effects use `Effect.gen`:

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

Use `runApp` to mount your application:

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

The `$` namespace contains all HTML element factories. Elements are Effects that must be yielded:

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

// Multiple children
yield* $.div({}, collect(
  $.of("Hello"),
  $.span({}, $.of("World")),
));
```

### Template Strings

The `t` tagged template creates reactive strings:

```ts
import { t } from "@effex/dom";

const name = yield* Signal.make("World");
const count = yield* Signal.make(0);

// Creates a Readable<string> that updates automatically
yield* $.p({}, $.of(t`Hello, ${name}! Count: ${count}`));
```

## Defining Components

### Simple (No State/Context)

Components without state or context requirements are plain functions:

```ts
const Greeting = (props: { name: string }) =>
  $.h1({}, $.of(`Hello, ${props.name}!`));

// With children - generic over E and R to propagate types
const Card = <E, R>(props: { title: string }, children: ChildEffect<E, R>) =>
  $.div({ class: "card" }, collect(
    $.h2({}, $.of(props.title)),
    children,
  ));
```

### With State or Context

Use `Effect.gen` when you need signals, context, or other Effects:

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

const UserBadge = () =>
  Effect.gen(function* () {
    const user = yield* UserContext;  // Requires context
    return yield* $.span({}, $.of(user.name));
  });
```

### Context Providers

```ts
import { Context, Effect } from "effect";
import { $, provide } from "@effex/dom";

class ThemeContext extends Context.Tag("ThemeContext")<ThemeContext, Theme>() {}

const ThemedButton = (props: { label: string }) =>
  Effect.gen(function* () {
    const theme = yield* ThemeContext;
    return yield* $.button(
      { style: { backgroundColor: theme.primary } },
      $.of(props.label),
    );
  });

// Provide context
$.div({}, provide(ThemeContext, theme, ThemedButton({ label: "Click" })));
```

## Control Flow

### when

Conditionally render based on a reactive boolean:

```ts
import { when } from "@effex/dom";

when(isLoggedIn, {
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
  fallback: () => $.div({}, $.of("Unknown")),
});
```

### each

Render a list with automatic keying and reconciliation:

```ts
import { each } from "@effex/dom";

each(todos, {
  key: (todo) => todo.id,
  render: (todo) => $.li({}, $.of(todo.map((t) => t.text))),
});
```

### matchOption / matchEither

Match on Option or Either values with unwrapped Readables:

```ts
import { matchOption, matchEither } from "@effex/dom";

// userData.value is Readable<Option<User>>
matchOption(userData.value, {
  onSome: (user) => $.div({}, $.of(user.map((u) => u.name))), // user is Readable<User>
  onNone: () => $.div({}, $.of("No user")),
});

matchEither(result, {
  onRight: (value) => $.div({}, $.of(value)),
  onLeft: (error) => $.span({ class: "error" }, $.of(error)),
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

### Error Boundary

```ts
Boundary.error(
  () => RiskyComponent(),
  (error) => $.div({}, $.of(`Failed: ${error.message}`)),
);
```

## Server-Side Rendering

### renderToString

```ts
import { renderToString } from "@effex/dom/server";

const handler = Effect.gen(function* () {
  const html = yield* renderToString(App());
  return new Response(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="root">${html}</div>
        <script src="/app.js"></script>
      </body>
    </html>
  `);
});
```

### Hydration

```ts
import { hydrate } from "@effex/dom/hydrate";
import { App } from "./App";

hydrate(App(), document.getElementById("root")!);
```

Hydration attaches to server-rendered HTML and sets up reactive bindings without re-rendering.

## Virtual List

For large lists (1000+ items), use `virtualEach` to only render visible items:

```ts
import { virtualEach, VirtualListRef } from "@effex/dom";

// Basic usage
virtualEach(items, {
  key: (item) => item.id,
  itemHeight: 48,
  height: 400,
  render: (item) => $.li({}, $.of(item.map((i) => i.text))),
});

// With scroll control
const listRef = yield* VirtualListRef.make();

yield* virtualEach(items, {
  key: (item) => item.id,
  itemHeight: 60,
  height: 400,
  ref: listRef,
  render: (item, index) => ListItem({ item, index }),
});

// Scroll to item 100
yield* listRef.ready.pipe(
  Effect.flatMap((control) => control.scrollTo(100))
);
```

## Animation

CSS-based animations for control flow:

```ts
import { when, each, stagger } from "@effex/dom";

// Enter/exit animations
when(isOpen, {
  onTrue: () => Modal(),
  onFalse: () => $.span(),
  animate: {
    enterFrom: "opacity-0 scale-95",
    enterTo: "opacity-100 scale-100",
    exit: "fade-out",
  },
});

// Staggered list animations
each(items, {
  key: (item) => item.id,
  render: (item) => ListItem(item),
  animate: {
    enter: "slide-in",
    exit: "slide-out",
    stagger: stagger(50), // 50ms between items
  },
});
```

### Imperative Animations

For one-off animations, use `Element.animate`:

```ts
buttonRef.pipe(
  Element.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }],
    { duration: 200, easing: "ease-out" },
  ),
);
```

## DOM Utilities

### FocusTrap

Trap focus within a container (for modals, dialogs):

```ts
import { FocusTrap } from "@effex/dom";

yield* FocusTrap.make({
  container: dialogElement,
  returnFocus: triggerElement, // Focus returns here when trap is released
});
// Focus is trapped until scope closes
```

### ScrollLock

Prevent body scrolling (for modals):

```ts
import { ScrollLock } from "@effex/dom";

yield* ScrollLock.lock;
// Body scroll is locked until scope closes
```

### UniqueId

Generate unique IDs for ARIA relationships:

```ts
import { UniqueId } from "@effex/dom";

const labelId = yield* UniqueId.make("label");
const inputId = yield* UniqueId.make("input");

yield* $.div({}, collect(
  $.label({ id: labelId, htmlFor: inputId }, $.of("Name")),
  $.input({ id: inputId, "aria-labelledby": labelId }),
));
```

## Portal

Render children into a different DOM node:

```ts
import { Portal } from "@effex/dom";

// Render to document.body
Portal(() => Modal({ title: "Hello" }));

// Render to specific element
Portal({ target: "#modal-root" }, () => Dropdown());
```

## Element Helpers

The `Element` namespace provides pipeable DOM manipulation:

```ts
import { Element, $ } from "@effex/dom";

const buttonRef = yield* Element.ref<HTMLButtonElement>();

// Chain operations
buttonRef.pipe(
  Element.addClass("active"),
  Element.setStyles({ color: "blue" }),
  Element.focus,
);

// Query descendants
buttonRef.pipe(
  Element.querySelector(".icon"),
  Element.setStyles({ opacity: "1" }),
);
```

### Common Operations

```ts
// Classes
el.pipe(Element.addClass("active", "highlighted"));
el.pipe(Element.removeClass("loading"));
el.pipe(Element.toggleClass("expanded"));

// Styles
el.pipe(Element.setStyles({ opacity: "1", fontSize: "16px" }));
el.pipe(Element.setStyle("backgroundColor", "red"));

// Attributes
el.pipe(Element.setAttribute("aria-expanded", "true"));
el.pipe(Element.toggleAttribute("disabled"));

// Data attributes
el.pipe(Element.setData("state", "open"));  // data-state="open"
el.pipe(Element.getData("state"));          // Effect<string, DataAttributeNotFound>

// Focus
el.pipe(Element.focus);
el.pipe(Element.focusFirst("[data-item]"));

// Content
el.pipe(Element.setTextContent("Hello"));
```

## API Reference

### Elements

- `$.<element>(attrs?, children?)` - Create an HTML element
- `$.of(value)` - Lift a primitive or Readable into a child
- `collect(...children)` - Combine multiple children
- `t\`template\`` - Create reactive template string

### Control Flow

- `when(condition, options)` - Conditional rendering
- `match(value, options)` - Pattern matching
- `each(items, options)` - List rendering
- `matchOption(option, options)` - Match on Option
- `matchEither(either, options)` - Match on Either

### Boundaries

- `Boundary.suspense(options)` - Async loading boundary
- `Boundary.error(render, catch)` - Error boundary

### Mounting

- `mount(element, container)` - Mount an element
- `runApp(program)` - Run an application
- `renderToString(element)` - SSR (from `@effex/dom/server`)
- `hydrate(element, container)` - Hydration (from `@effex/dom/hydrate`)

### Virtual List

- `virtualEach(items, options)` - Virtualized list rendering
- `VirtualListRef.make()` - Create scroll control ref

### Utilities

- `FocusTrap.make(options)` - Trap focus in container
- `ScrollLock.lock` - Lock body scroll
- `UniqueId.make(prefix?)` - Generate unique ID
- `Portal(options?, children)` - Render to different DOM node
- `provide(tag, value, children)` - Provide context

### Animation

- `stagger(delay)` - Linear stagger function
- `staggerFromCenter(delay)` - Center-out stagger
- `delay(ms, effect)` - Delay an effect
- `sequence(...effects)` - Run in sequence
- `parallel(...effects)` - Run in parallel
