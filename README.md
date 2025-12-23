# Effex

A reactive UI framework built on [Effect](https://effect.website/). Effex provides a declarative way to build web interfaces with fine-grained reactivity, automatic cleanup, and full type safety.

## Table of Contents

- [Why Effex?](#why-effex)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Core Concepts](#core-concepts)
  - [Signals](#signals)
  - [Derived Values](#derived-values)
  - [Custom Equality](#custom-equality)
  - [Reactive Collections](#reactive-collections)
  - [Lifting Functions (CVA, clsx)](#lifting-functions-cva-clsx)
  - [Reactive Props](#reactive-props)
  - [Template Strings](#template-strings)
  - [Elements](#elements)
  - [Control Flow](#control-flow)
  - [Context](#context)
- [Router](#router)
- [Async Data Loading](#async-data-loading)
- [Forms](#forms)
- [Animation](#animation)
- [Primitives](#primitives)
- [Portal](#portal)
- [Server-Side Rendering](#server-side-rendering)
- [Why No JSX?](#why-no-jsx)
- [API Documentation](#api-documentation)
- [Acknowledgments](#acknowledgments)

## Why Effex?

Effex brings the power of [Effect](https://effect.website/) to frontend development. If you're building with Effect, this is a UI framework that speaks the same language.

### Typed Error Handling

Every element has type `Element<E>` where `E` is the error channel. Errors propagate through the component tree, and you **must** handle them before mounting:

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
const Counter = component("Counter", () =>
  Effect.gen(function* () {
    const count = yield* Signal.make(0);
    console.log("setup"); // Logs once, on mount
    return yield* $.div(count); // count changes update only this text node
  }),
);
```

Signal updates are surgical. A parent's state change doesn't affect unrelated children.

### Automatic Resource Cleanup

Effex uses Effect's scope system. Subscriptions, timers, and other resources are automatically cleaned up when components unmount:

```ts
yield* eventSource.pipe(
  Stream.runForEach(handler),
  Effect.forkIn(scope), // Cleaned up when scope closes
);
```

No manual cleanup, no forgotten unsubscribes, no memory leaks.

### The Effect Ecosystem

Effex gives you access to Effect's entire ecosystem:

- **Schema**: Runtime validation with static types
- **Streams**: Reactive data flows
- **Services**: Dependency injection via Effect's context system
- **Retry/timeout**: Built-in resilience patterns
- **Structured concurrency**: Fork, join, and race without footguns

### Unified Async Handling

Loading states, errors, and success rendering in one place:

```ts
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

### Coming from Another Framework?

We have migration guides with concept mapping and side-by-side examples:

- [Coming from React](./REACT-MIGRATION.md)
- [Coming from Vue](./VUE-MIGRATION.md)
- [Coming from Svelte](./SVELTE-MIGRATION.md)

---

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
    $.p("Welcome to Effect UI"),
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
    // Need Effect.gen to create signals
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

The `$` namespace contains all HTML element factories (`$.div`, `$.span`, `$.button`, etc.). You can also import elements individually if you prefer:

```ts
import { div, span, button } from "@effex/dom";
```

## Core Concepts

### Signals

Signals are reactive values that can be read and updated:

```ts
const count = yield* Signal.make(0);

// Read the current value
const current = yield* count.get;

// Update the value
yield* count.set(5);
yield* count.update((n) => n + 1);
```

### Derived Values

Derived values automatically recompute when their dependencies change:

```ts
const firstName = yield* Signal.make("John");
const lastName = yield* Signal.make("Doe");

const fullName = yield* Derived.sync(
  [firstName, lastName],
  ([first, last]) => `${first} ${last}`,
);
```

### Custom Equality

By default, Signal and Derived use strict equality (`===`) to determine if a value has changed. You can provide a custom `equals` function to control when updates propagate:

```ts
interface User {
  id: number;
  name: string;
  lastSeen: Date;
}

// Only trigger updates when the user ID changes, ignoring lastSeen timestamps
const currentUser = yield* Signal.make<User>(
  { id: 1, name: "Alice", lastSeen: new Date() },
  { equals: (a, b) => a.id === b.id },
);

// For derived values too
const userDisplay = yield* Derived.sync(
  [currentUser],
  ([user]) => ({ id: user.id, displayName: user.name.toUpperCase() }),
  { equals: (a, b) => a.id === b.id && a.displayName === b.displayName },
);
```

This is particularly useful for:

- **Objects with irrelevant fields** (timestamps, metadata)
- **Expensive computations** that shouldn't re-run on semantically equal inputs
- **Normalized data** where you want to compare by ID rather than reference

### Reactive Collections

Effex provides reactive versions of Array, Map, and Set. Unlike in React where you must clone collections on every mutation, these allow in-place mutations that automatically trigger reactive updates.

#### Signal.Array

A reactive array with in-place mutation methods:

```ts
const todos = yield* Signal.Array.make<Todo>([]);

// In-place mutations (no cloning needed!)
yield* todos.push({ id: 1, text: "Learn Effex", done: false });
yield* todos.unshift(firstItem);
yield* todos.pop();
yield* todos.shift();
yield* todos.splice(1, 2, replacement);
yield* todos.insertAt(0, item);
yield* todos.removeAt(index);
yield* todos.remove(specificItem);  // By reference
yield* todos.move(fromIndex, toIndex);  // Great for drag-and-drop
yield* todos.sort((a, b) => a.id - b.id);
yield* todos.reverse();
yield* todos.clear();

// Transform entire array (like filter/map)
yield* todos.update(arr => arr.filter(t => !t.done));
yield* todos.set(newTodos);

// Reactive length
todos.length  // Readable<number>

// Use with Control.each
each(todos, {
  key: todo => todo.id,
  render: todo => TodoItem(todo),
});
```

#### Signal.Map

A reactive Map for key-value stores:

```ts
const users = yield* Signal.Map.make<string, User>();

// Mutations
yield* users.set("u1", { name: "Alice", role: "admin" });
yield* users.delete("u1");
yield* users.clear();

// Reads
const user = yield* users.get("u1");
const exists = yield* users.has("u1");

// Replace or transform entire map
yield* users.replace(new Map([["u2", bob]]));
yield* users.update(m => new Map([...m].filter(([_, u]) => u.role === "admin")));

// Reactive derived values
users.size     // Readable<number>
users.entries  // Readable<readonly [string, User][]>
users.keys     // Readable<readonly string[]>
users.values   // Readable<readonly User[]>

// For use with Readable.combine
users.readable // Readable<ReadonlyMap<string, User>>
```

#### Signal.Set

A reactive Set for unique collections:

```ts
const tags = yield* Signal.Set.make<string>(["draft"]);

// Mutations
yield* tags.add("important");
yield* tags.delete("draft");
yield* tags.toggle("featured");  // Add if missing, remove if present
yield* tags.clear();

// Reads
const hasTag = yield* tags.has("important");

// Replace or transform
yield* tags.replace(["new", "tags"]);
yield* tags.update(s => new Set([...s].filter(t => t !== "archived")));

// Reactive derived values
tags.size    // Readable<number>
tags.values  // Readable<readonly string[]>

// For use with Readable.combine
tags.readable // Readable<ReadonlySet<string>>
```

**Why This Matters**: In React, mutating a Map/Set doesn't trigger re-renders because the reference is unchanged. You're forced to clone on every mutation:

```tsx
// React (painful)
setMap(new Map(map).set(key, value));
setSet(new Set(set).add(item));
```

With Effex's reactive collections, mutations are O(1) and automatically trigger updates.

### Reactive Props

Many components accept props that can be either static values or reactive `Readable` values. This is expressed using the `Readable.Reactive<T>` type:

```ts
import { Readable } from "@effex/dom";

// Reactive<T> means: T | Readable<T>
interface ButtonProps {
  disabled?: Readable.Reactive<boolean>;
  class?: Readable.Reactive<string>;
}
```

When implementing a component with reactive props, use `Readable.of()` to normalize the prop to a `Readable<T>`:

```ts
const Button = component("Button", (props: ButtonProps, children) =>
  Effect.gen(function* () {
    // Normalize props - works whether they're static or reactive
    const disabled = Readable.of(props.disabled ?? false);
    const className = Readable.of(props.class ?? "");

    // Use .map() for derived attributes based on single reactive props
    // You can use Derived.sync for multiple dependencies if needed
    const ariaDisabled = disabled.map((d) => (d ? "true" : undefined));
    const tabIndex = disabled.map((d) => (d ? -1 : 0));

    return yield* $.button(
      {
        class: className,
        disabled: disabled,
        "aria-disabled": ariaDisabled,
        tabIndex: tabIndex,
      },
      children ?? [],
    );
  }),
);
```

This pattern lets consumers pass either static or reactive values:

```ts
// Static value - button is always disabled
Button({ disabled: true }, "Click me");

// Reactive value - button disabled state follows signal
const isLoading = yield* Signal.make(false);
Button({ disabled: isLoading }, "Submit");
```

When you need to read a reactive prop's current value in an event handler, use `.get`:

```ts
const handleClick = () =>
  Effect.gen(function* () {
    const isDisabled = yield* disabled.get;
    if (isDisabled) return;
    // ... handle click
  });
```

### Lifting Functions (CVA, clsx)

When using utility libraries like [class-variance-authority (CVA)](https://cva.style/docs) or [clsx](https://github.com/lukeed/clsx), use `Readable.lift` to make them reactive-aware. The lifted function accepts either static values or `Readable` values for any property, and returns a `Readable` that updates when any reactive input changes.

```ts
import { cva } from "class-variance-authority";
import { $, Signal, Readable, component } from "@effex/dom";
import { Effect } from "effect";

// Define your CVA function as usual
const buttonStyles = cva("btn font-medium rounded", {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-200 text-gray-800",
    },
    size: {
      sm: "px-2 py-1 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

// Lift it to accept Readables
const reactiveButtonStyles = Readable.lift(buttonStyles);

// Now use it with reactive or static values
const Button = component("Button", () =>
  Effect.gen(function* () {
    const variant = yield* Signal.make<"primary" | "secondary">("primary");

    // className is Readable<string> - updates when variant changes
    const className = reactiveButtonStyles({ variant, size: "md" });

    return yield* $.div([
      $.button({ class: className }, "Styled Button"),
      $.button({ onClick: () => variant.set("secondary") }, "Make Secondary"),
    ]);
  }),
);
```

This works with any function that takes an object as its argument:

```ts
import { clsx } from "clsx";

const reactiveClsx = Readable.lift(clsx);

// Mix static and reactive values
const isActive = yield* Signal.make(false);
const className = reactiveClsx({ btn: true, "btn-active": isActive });
```

### Template Strings

The `t` tagged template literal creates reactive strings that update when any interpolated Signal changes:

```ts
import { t } from "@effex/dom";

const name = yield* Signal.make("World");
const count = yield* Signal.make(0);

// Creates a Readable<string> that updates automatically
const message = t`Hello, ${name}! Count: ${count}`;

// Use directly as element children
yield* $.div(message);
yield* $.p(t`You have ${count} items`);
```

This is cleaner than array concatenation for text with multiple reactive values:

```ts
// With t`` template
$.p(t`${count} items remaining (${completed} done)`);

// vs array concatenation
$.p([count, " items remaining (", completed, " done)"]);
```

### Elements

Create DOM elements with reactive attributes and children. Elements are Effects that must be yielded:

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

### Control Flow

Conditionally render elements:

```ts
when(isLoggedIn, {
  container: () => $.div({ class: "login-status" }), // optional, `div` by default
  onTrue: () => $.div("Welcome back!"),
  onFalse: () => $.div("Please log in"),
});

each(todos, {
  container: () => $.ul({ class: "todo-list" }), // optional, `div` by default
  key: (todo) => todo.id,
  render: (todo) => $.li(todo.map((t) => t.text)),
});
```

### Context

Effex uses Effect's Context system for dependency injection. Define a service with `Context.Tag`, then use `provide` to make it available to child components:

```ts
import { Context, Effect } from "effect";
import { $, component, provide } from "@effex/dom";

// Define a theme context
interface Theme {
  primary: string;
  secondary: string;
}

class ThemeContext extends Context.Tag("ThemeContext")<ThemeContext, Theme>() {}

// Component that consumes the context
const ThemedButton = component("ThemedButton", (props: { label: string }) =>
  Effect.gen(function* () {
    const theme = yield* ThemeContext;
    return yield* $.button(
      { style: { backgroundColor: theme.primary, color: "white" } },
      props.label,
    );
  }),
);

// Provide the context to children
const App = component("App", () =>
  Effect.gen(function* () {
    const theme: Theme = { primary: "#007bff", secondary: "#6c757d" };

    return yield* $.div(
      provide(ThemeContext, theme, [
        ThemedButton({ label: "Click me" }),
        ThemedButton({ label: "Another button" }),
      ]),
    );
  }),
);
```

The `provide` helper wraps children with `Effect.provideService`, making the context available to all descendants. Components that `yield*` the context tag will receive the provided value.

### Router

Effex includes a typed router with Effect Schema validation for route params.

```ts
import { Context, Effect, Schema } from "effect";
import {
  $,
  component,
  mount,
  runApp,
} from "@effex/dom";
import {
  Route,
  Router,
  Link,
  makeTypedRouterLayer,
  type RouterInfer,
} from "@effex/router";

// Define routes with typed params
const routes = {
  home: Route.make("/"),
  user: Route.make("/users/:id", {
    params: Schema.Struct({ id: Schema.String }),
  }),
};

// Infer the router type and create a typed context
type AppRouter = RouterInfer<typeof routes>;
class AppRouterContext extends Context.Tag("AppRouterContext")<
  AppRouterContext,
  AppRouter
>() {}

// Components can yield the typed router from context
const App = component("App", () =>
  Effect.gen(function* () {
    const router = yield* AppRouterContext;

    // router.currentRoute is typed as "home" | "user" | null
    // router.routes.user.params is typed as Readable<{ id: string } | null>

    return yield* $.div([
      $.nav([
        Link({ href: "/" }, "Home"),
        Link({ href: "/users/123" }, "User 123"),
      ]),
      $.div(router.pathname.map((p) => `Current: ${p}`)),
    ]);
  }),
);

// Run the app
runApp(
  Effect.gen(function* () {
    const router = yield* Router.make(routes);
    const routerLayer = makeTypedRouterLayer(router, AppRouterContext);
    yield* mount(App().pipe(Effect.provide(routerLayer)), document.body);
  }),
);
```

The `Link` component uses `RouterContext` internally for navigation. Use `makeTypedRouterLayer` to provide both the base router context and your typed context in one layer.

### Async Data Loading

Use `Boundary.suspense` for async rendering with loading states. It accepts an options object:

```ts
import { match, Boundary } from "@effex/dom";

// Simulate API call
const fetchUser = (id: string) =>
  Effect.gen(function* () {
    yield* Effect.sleep("500 millis");
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  });

// In your app
match(router.currentRoute, {
  cases: [
    // Simple route
    {
      pattern: "home",
      render: () => HomePage(),
    },
    // Route with async data
    {
      pattern: "user",
      render: () =>
        Boundary.suspense({
          render: () =>
            Effect.gen(function* () {
              const params = yield* router.routes.user.params.get;
              const user = yield* fetchUser(params.id);
              return yield* UserPage({ user });
            }),
          fallback: () => $.div("Loading user..."),
          catch: (error) => $.div(`Error: ${error}`),
          delay: "200 millis", // Only show loading after 200ms
        }),
    },
  ],
});
```

`Boundary.suspense` options:

- `render`: Async Effect that returns the element
- `fallback`: Element to show while loading
- `catch`: Optional error handler
- `delay`: Optional delay before showing fallback (accepts Effect Duration strings like `"200 millis"`, `"1 second"`, or a number in ms). Prevents loading flash on fast responses.

### Forms

Effex includes a form system with Effect Schema validation:

```ts
import { Effect, Schema } from "effect";
import { $, component, when } from "@effex/dom";
import { Form } from "@effex/form";

// Define a schema for validation
const LoginSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Email is required" }),
  ),
  password: Schema.String.pipe(
    Schema.minLength(8, {
      message: () => "Password must be at least 8 characters",
    }),
  ),
});

const LoginForm = component("LoginForm", () =>
  Effect.gen(function* () {
    const form = yield* Form.make({
      schema: LoginSchema,
      initial: { email: "", password: "" },
    });

    const handleSubmit = () =>
      form.submit((values) =>
        Effect.gen(function* () {
          // values is typed as { email: string, password: string }
          console.log("Submitting:", values);
          yield* form.reset();
        }),
      );

    return yield* $.div({ class: "login-form" }, [
      $.div([
        $.label("Email"),
        $.input({
          type: "email",
          value: form.fields.email.value,
          onInput: (e) =>
            form.fields.email.value.set((e.target as HTMLInputElement).value),
          onBlur: () => form.fields.email.touch(),
        }),
        // Show errors when field is touched
        when(form.fields.email.errors.map((errs) => errs.length > 0), {
          onTrue: () =>
            $.span(
              { class: "error" },
              form.fields.email.errors.map((e) => e[0] ?? ""),
            ),
          onFalse: () => $.span(),
        }),
      ]),
      $.div([
        $.label("Password"),
        $.input({
          type: "password",
          value: form.fields.password.value,
          onInput: (e) =>
            form.fields.password.value.set(
              (e.target as HTMLInputElement).value,
            ),
          onBlur: () => form.fields.password.touch(),
        }),
        when(form.fields.password.errors.map((errs) => errs.length > 0), {
          onTrue: () =>
            $.span(
              { class: "error" },
              form.fields.password.errors.map((e) => e[0] ?? ""),
            ),
          onFalse: () => $.span(),
        }),
      ]),
      $.button(
        {
          onClick: () => handleSubmit(),
          disabled: form.isSubmitting,
        },
        form.isSubmitting.map((s) => (s ? "Submitting..." : "Log In")),
      ),
    ]);
  }),
);
```

Form features:

- **Schema validation**: Uses Effect Schema for type-safe validation with custom error messages
- **Field state**: Each field has `value`, `errors`, `touched`, and `dirty` readables
- **Validation timing**: Configure when validation runs with `validation: "hybrid" | "blur" | "change" | "submit"`
- **Form state**: Access `isValid`, `isSubmitting`, `isTouched`, `isDirty`, and aggregated `errors`
- **Actions**: `submit()`, `reset()`, `setErrors()`, `validate()`, `getValues()`

### Animation

Effex provides CSS-based animation primitives for `when`, `match`, and `each` components. Animations are CSS-first - you provide class names, and the library manages the lifecycle and timing.

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

// Route transitions with match
match(router.currentRoute, {
  cases: [
    { pattern: "home", render: () => HomePage() },
    { pattern: "about", render: () => AboutPage() },
  ],
  fallback: () => NotFound(),
  animate: { enter: "fade-in", exit: "fade-out" },
});
```

**Animation Options:**

```ts
interface AnimationOptions {
  enter?: string; // CSS class(es) for enter animation
  exit?: string; // CSS class(es) for exit animation
  enterFrom?: string; // Initial state class (removed after animation)
  enterTo?: string; // Final state class (persisted)
  exitTo?: string; // Exit target state class
  timeout?: number; // Max wait time in ms (default: 5000)
  respectReducedMotion?: boolean; // Skip animations if user prefers (default: true)

  // Lifecycle hooks
  onBeforeEnter?: (el: HTMLElement) => Effect<void> | void;
  onEnter?: (el: HTMLElement) => Effect<void> | void;
  onBeforeExit?: (el: HTMLElement) => Effect<void> | void;
  onExit?: (el: HTMLElement) => Effect<void> | void;
}
```

**Stagger Utilities:**

```ts
import { stagger, staggerFromCenter, staggerEased } from "@effex/dom";

stagger(50); // Linear: 0ms, 50ms, 100ms...
staggerFromCenter(30); // Center-out: middle items animate first
staggerEased(500, easeOut); // Apply easing curve to stagger timing
```

**Timing Utilities:**

```ts
import { delay, sequence, parallel } from "@effex/dom";

// Delay before animation
yield* delay(200, runEnterAnimation(element, options));

// Run animations sequentially
yield* sequence(exitAnimation, enterAnimation);

// Run animations in parallel
yield* parallel(anim1, anim2, anim3);
```

Example CSS for animations:

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

Animation features:

- **CSS-first**: Uses CSS classes for animations - works with any CSS framework
- **Event-based timing**: Listens for `animationend`/`transitionend` to know when exit animations complete
- **Reduced motion**: Respects `prefers-reduced-motion` by default
- **Backward compatible**: Animation options are optional - existing code works unchanged
- **Lifecycle hooks**: Run code before/after animations (e.g., focus an element after enter)

### Primitives

Effex includes a set of headless UI components inspired by [Radix UI](https://www.radix-ui.com/). These are fully accessible, unstyled components that handle complex interactions out of the box.

```bash
pnpm add @effex/primitives
```

Available components:

- **Accordion** - Collapsible content sections
- **AlertDialog** - Modal dialogs requiring user action
- **Checkbox** - Tri-state checkbox with label
- **Combobox** - Searchable autocomplete select
- **ContextMenu** - Right-click context menus
- **Dialog** - Modal dialogs
- **DropdownMenu** - Dropdown menus with keyboard navigation
- **NavigationMenu** - Accessible navigation with submenus
- **Popover** - Floating content panels
- **Progress** - Progress indicators
- **RadioGroup** - Radio button groups
- **ScrollArea** - Custom scrollbar styling
- **Select** - Custom select dropdowns
- **Slider** - Range input sliders
- **Switch** - Toggle switches
- **Tabs** - Tabbed content panels
- **Toast** - Notification toasts
- **Toggle** - Toggle buttons
- **Tooltip** - Hover tooltips

All primitives follow consistent patterns:

```ts
import { Dialog } from "@effex/primitives";

Dialog.Root({ defaultOpen: false }, [
  Dialog.Trigger({}, "Open Dialog"),
  Dialog.Content({ class: "dialog-content" }, [
    Dialog.Title({}, "Dialog Title"),
    Dialog.Description({}, "Dialog description text"),
    $.p("Your dialog content here"),
    Dialog.Close({}, "Close"),
  ]),
]);
```

Features:
- **Accessible by default** - ARIA attributes, keyboard navigation, focus management
- **Unstyled** - Style with your own CSS or Tailwind
- **Data attributes** - `data-state`, `data-disabled`, etc. for CSS selectors
- **Controlled & uncontrolled** - Use with or without external state
- **Portal rendering** - Dropdowns/popovers escape overflow:hidden

### Portal

Portals render children into a different DOM node, outside the normal component hierarchy. This is useful for modals, dropdowns, and tooltips that need to escape parent `overflow: hidden` or `z-index` stacking contexts.

```ts
import { Portal, $ } from "@effex/dom";

// Render to document.body (default)
Portal(() => Modal({ title: "Hello" }));

// Render to a specific element by selector
Portal({ target: "#modal-root" }, () =>
  $.div({ class: "dropdown" }, [$.button("Option 1"), $.button("Option 2")]),
);

// Render to an element reference
Portal({ target: containerElement }, () => Tooltip({ content: "Help text" }));
```

Portal returns a hidden placeholder element in the original DOM position while the actual content lives in the portal target. When the component unmounts (scope closes), the portal content is automatically cleaned up.

**Options:**

```ts
interface PortalOptions {
  target?: HTMLElement | string; // Default: document.body
}
```

**Example: Modal with Portal**

```ts
const Modal = component(
  "Modal",
  (props: {
    isOpen: Readable<boolean>;
    onClose: () => void;
    children: () => Element;
  }) =>
    when(props.isOpen, {
      onTrue: () =>
        Portal(() =>
          $.div({ class: "modal-overlay", onClick: props.onClose }, [
            $.div(
              {
                class: "modal-content",
                onClick: (e) => e.stopPropagation(), // Prevent closing when clicking content
              },
              [
                $.button({ class: "close", onClick: props.onClose }, "×"),
                props.children(),
              ],
            ),
          ]),
        ),
      onFalse: () => $.span(),
    }),
);
```

### Server-Side Rendering

Effex supports server-side rendering (SSR) with hydration through the `@effex/platform` package. This is a meta-framework that provides everything you need for full-stack Effex applications.

```bash
pnpm add @effex/platform
```

`@effex/platform` re-exports everything from all other Effex packages, so you only need one import:

```ts
import { $, Signal, when, render, hydrateApp, Platform, RouteLoader } from "@effex/platform";
```

#### Server Rendering

Use `render` to render your app to HTML on the server:

```ts
import { render, renderToDocument } from "@effex/platform";
import { App } from "./App";

// In your server handler (Bun, Node, Deno, etc.)
const handler = async (request: Request) => {
  const result = await render(App(), { request });

  // Use renderToDocument for a complete HTML page
  const html = renderToDocument(result, {
    title: "My Effex App",
    scripts: ["/app.js"],
    styles: ["/app.css"],
  });

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      ...Object.fromEntries(result.headers),
    },
  });
};
```

The render result includes:
- `html` - The rendered HTML string
- `loaderData` - Serialized loader data for hydration
- `loaderDataScript` - HTML-safe JSON string for embedding
- `headers` - Response headers (cookies, etc.)
- `platformContext` - Access to platform services

#### Client Hydration

Use `hydrateApp` to hydrate the server-rendered HTML on the client:

```ts
// client.ts
import { hydrateApp } from "@effex/platform";
import { App } from "./App";

hydrateApp(App(), document.getElementById("root")!);
```

Hydration:
- Reads loader data from `window.__EFFEX_LOADER_DATA__`
- Attaches event handlers to existing DOM elements
- Sets up reactive subscriptions
- Cleans up loader data after hydration

#### Platform Services

Access platform utilities via the `Platform` service:

```ts
import { Effect } from "effect";
import { Platform } from "@effex/platform";

const handler = Effect.gen(function* () {
  // Environment detection
  const isServer = yield* Platform.isServer;
  const isClient = yield* Platform.isClient;

  // Cookie access (works on both server and client)
  const cookies = yield* Platform.cookies;
  const session = yield* cookies.get("session");
  yield* cookies.set("theme", "dark", { maxAge: 86400, path: "/" });

  // Server-only: access request and set response headers
  const request = yield* Platform.request;
  yield* Platform.setHeader("X-Custom-Header", "value");
});
```

#### Data Serialization

The platform handles serialization of complex types for SSR hydration. Types that JSON doesn't natively support are preserved:

- `Date` - Serialized as ISO strings, restored as Date objects
- `Map` and `Set` - Serialized as arrays, restored as Map/Set
- `BigInt` - Serialized as strings, restored as BigInt
- `RegExp` - Serialized with source and flags
- `URL` - Serialized as href strings
- `undefined`, `NaN`, `Infinity` - Preserved correctly

```ts
import { serialize, deserialize } from "@effex/platform";

const data = {
  created: new Date(),
  items: new Set([1, 2, 3]),
  metadata: new Map([["key", "value"]]),
};

// Serialize for SSR
const json = serializeSync(data);

// Deserialize on client (happens automatically during hydration)
const restored = deserializeSync(json);
// restored.created instanceof Date === true
// restored.items instanceof Set === true
```

## Why No JSX?

Effex uses function calls instead of JSX. This is a deliberate design choice:

```ts
// Effex
$.div({ class: "container" }, [
  $.h1("Hello"),
  $.p(["Count: ", count]),
  Counter(),  // No props needed
])

// vs JSX
<div class="container">
  <h1>Hello</h1>
  <p>Count: {count}</p>
  <Counter />
</div>
```

**Why we chose this approach:**

1. **Error type preservation**: Elements have type `Element<E>` where `E` is the error channel. JSX would erase this to `JSX.Element`, losing type-safe error propagation through component trees.

2. **No build configuration**: Works out of the box with any TypeScript setup. No jsx runtime, tsconfig tweaks, or bundler plugins needed.

3. **Explicit Effects**: Every element is an Effect that must be yielded. JSX would obscure this, making it unclear what's happening under the hood.

4. **Consistent syntax**: Components and elements use the same call syntax. No mental switching between `<Component />` and `Component()`.

The function-based API is already quite clean for UI structure, and deeply nested markup is often a sign to extract components anyway.

## API Documentation

See the [docs/api](./docs/api) folder for full API documentation.

## Acknowledgments

Effex stands on the shoulders of giants. We're grateful to these projects for their inspiration:

- **[Effect](https://effect.website/)** - The foundation of everything. Effect's approach to typed errors, resource management, and structured concurrency inspired this entire project. If you haven't explored Effect yet, you're missing out on one of the most well-designed TypeScript libraries in existence.

- **[React](https://react.dev/)** - The component model, hooks patterns, and overall developer experience of React heavily influenced Effex's API design. React proved that declarative UI is the way forward.

- **[Solid](https://www.solidjs.com/)** - Our fine-grained reactivity system (Signals, Derived values, subscriptions) draws direct inspiration from Solid's brilliant reactive primitives. Solid showed that you don't need a virtual DOM to build great UIs.

- **[TanStack](https://tanstack.com/)** - The router and form APIs are inspired by TanStack Router and TanStack Form. Their focus on type safety and developer experience set the bar for what modern web tooling should look like.

- **[Radix](https://www.radix-ui.com/)** - Our headless UI primitives follow patterns established by Radix. Their commitment to accessibility and unstyled, composable components is exactly right.

## License

MIT
