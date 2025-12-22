# Effex - TODO List

## High Priority

- [x] **Unit Tests for Everything** - Comprehensive test coverage
  - [x] Signal.ts
  - [x] Derived/Derived.ts
  - [x] Derived/helpers.ts
  - [x] Readable.ts
  - [x] Reaction.ts
  - [x] Element/Element.ts
  - [x] Element/helpers.ts
  - [x] Control.ts (when, match, each, ErrorBoundary, Suspense)
  - [x] Component.ts
  - [x] Mount.ts
  - [x] Ref.ts
  - [x] Template.ts
  - [x] Form.ts
  - [x] Field.ts
  - [x] form/helpers.ts

## Medium Priority

- [x] **SVG element support** - Add SVG element factories (`$.svg`, `$.path`, `$.rect`, `$.circle`, `$.line`, `$.g`, `$.text`, etc.)
  - SVG elements require `document.createElementNS` with SVG namespace
  - Different type maps (`SVGElementTagNameMap` vs `HTMLElementTagNameMap`)
  - Enables building charts, icons, and graphics with fine-grained reactivity

- [x] **Storybook Support** - Visual component development and documentation
  - [x] Set up Storybook with HTML framework and Vite
  - [x] Configure path aliases (@core, @dom)
  - [x] Create render helpers for Effect UI components
  - [x] Create Collapsible stories (Default, Animated, Controlled, Nested, etc.)
  - [x] Added storysource addon for viewing Effect-UI code in stories
  - [ ] Create stories for other built-in components as they're developed
  - [ ] Custom Storybook addon to show clean Effex code snippets (instead of full story source)

- [x] **Clean up unused imports** - Fixed build warnings (ParseResult type-only import)

- [x] **Rename to Effex** - Renamed from effect-ui to @effex/* namespace

- [ ] **Improve error messages** - Better developer experience when things go wrong

- [ ] **Performance testing** - Benchmark reactive updates, large lists, etc.
  - [x] Vitest benchmarks in `benchmarks/` directory (internal regression testing)
  - [ ] js-framework-benchmark integration (public comparison numbers)

- [x] **Virtualized list rendering** - Only render visible items for large lists
  - [x] `virtualEach` component with scroll-based visibility detection
  - [x] Fixed-height item support with `itemHeight` option
  - [x] Variable-height support with `estimatedHeight` option (framework ready)
  - [x] Buffer zone via `overscan` option (default: 3 items)
  - [x] Scroll control methods via optional `VirtualListRef`
  - Note: Current `each` handles 100-500 items well; use `virtualEach` for 1000+ items

## Future Considerations

- [ ] **SSR & Multi-Target Rendering** - Server-side rendering and beyond (see Design Decisions)
  - [x] Basic SSR implementation (`@effex/dom/server` with `renderToString`)
  - [x] Basic hydration (`@effex/dom/hydrate` with `hydrate`)
  - [x] Hydration markers on control flow (`data-effex-*` attributes)
  - [x] Suspense SSR (renders fallback with `data-effex-suspense-state`)
  - [x] **Suspense hydration** - Client re-triggers async content after hydration
    - SSR renders fallback with `data-effex-suspense-state="loading"`
    - Hydration finds container via HydrationContext, runs async render
    - Uses DOMRenderer for async content (since it doesn't exist in SSR HTML)
    - Replaces fallback when async completes, updates state to "loaded"
  - [ ] **Data serialization for hydration** - Avoid double-fetching on client
    - Server should serialize fetched data into `<script>window.__EFFEX_DATA__ = {...}</script>`
    - Services could check this cache before making API calls
    - Needs: SSR to collect resolved data, mechanism to inject into HTML, client cache layer
  - [x] **Router SSR refinement** - Router works cleanly for SSR
    - Added `initialSearch` option to `RouterOptions`
    - Router imports core types from `@effex/core` (framework-agnostic)
    - Skips `popstate` listeners when `window` is undefined
    - Navigation methods are no-ops in SSR mode (no errors thrown)
  - [ ] **Streaming SSR** - `renderToStream` for progressive HTML delivery
    - Suspense boundaries could flush placeholders early, stream resolved content later
    - Would require chunked transfer encoding support
  - [ ] **Partial/Islands hydration** - Only hydrate interactive parts
    - Static content could skip hydration entirely
    - Would need way to mark components as static vs interactive

- [ ] **DevTools** - Browser extension or integration for debugging reactive state

- [x] **Animation primitives** - Built-in support for transitions and animations (see Design Decisions below)
  - [x] CSS-first enter/exit animations
  - [x] Animation options for `when`, `match`, `each`
  - [x] Stagger utilities (stagger, staggerFromCenter, staggerEased)
  - [x] Timing utilities (delay, sequence, parallel)
  - [x] Lifecycle hooks (onBeforeEnter, onEnter, onBeforeExit, onExit)
  - [x] Reduced motion support (respects prefers-reduced-motion)

- [x] **Form handling utilities** - Validation, form state management (see Design Decisions below)
  - [x] Schema-based validation with Effect Schema
  - [x] Field-level state (value, errors, touched, dirty)
  - [x] Validation timing (hybrid, blur, change, submit)
  - [x] Form-level state (isValid, isSubmitting, errors)
  - [x] Async validators support
  - [x] Array/dynamic fields (FieldArray)
  - [x] README documentation

- [x] **Router V1** - Basic routing system implemented (see Design Decisions below)
  - [x] Flat routes with path params
  - [x] Effect Schema validation for params
  - [x] History API navigation
  - [x] Route-specific readables (isActive, params)
  - [x] RouterContext and typed router layers
  - [x] Link component
  - [ ] V2: Nested routes, hash routing, route guards, query param schemas
  - [ ] V3: File-based routing (Vite plugin) - see detailed plan below

- [ ] **Documentation site** - Full documentation with examples (TypeDoc is set up)

- [ ] **Architecture/internals documentation** - For contributors and those who want to understand how Effex works under the hood
  - [ ] Reactivity system: How Streams power the reactive graph (Readable, Signal, Derived)
  - [ ] How `combineReadables` merges dependency changes and ensures consistency
  - [ ] DOM subscription lifecycle: `subscribeToReadable`, scopes, and automatic cleanup
  - [ ] Element creation and attribute binding
  - [ ] Control flow internals (`when`, `match`, `each`)
  - [ ] How headless primitives use Context for part communication

- [x] **Rename project directory** - Rename /Users/jon/projects/effect-ui to /Users/jon/projects/effex

- [ ] **Full-fledged demo application** - Comprehensive showcase app demonstrating all Effex features together (may be a separate project). Should include: headless primitives, forms, routing, animations, streaming data, etc.

- [x] **Migration guides** - Help developers coming from other frameworks
  - [x] React migration guide (REACT-MIGRATION.md)
  - [x] Vue migration guide (VUE-MIGRATION.md)
  - [x] Svelte migration guide (SVELTE-MIGRATION.md)
  - [ ] Add "State Management Patterns" section to React migration guide - Show how Effect's existing primitives (Signals, Derived, Context, Streams) replace Redux/useReducer/XState. Most apps don't need dedicated state management libraries.

- [ ] **Table helpers** - TanStack Table-inspired utilities for building data tables with sorting, filtering, pagination, etc.

- [ ] **Chart integration guide** - Document pattern for integrating charting libraries (ECharts, Chart.js, etc.) using refs + Reaction for reactive updates. Don't build our own chart library - wrap existing mature solutions.

- [x] **Streaming async data** - Support for streaming data (e.g., AI chatbot responses)
  - [x] `Readable.fromStream` creates reactive values from Effect Streams
  - [x] `Stream.scan` for accumulating chunks (e.g., chat responses)
  - [x] `innerHTML` prop for rendering dynamic HTML (markdown, rich text)
  - [ ] Documentation/example showing chatbot streaming pattern

- [x] **Map and Set as reactive state** - Better ergonomics for using Map and Set as state. React makes this painful because of reference equality checks. Implemented `Signal.Array`, `Signal.Map`, and `Signal.Set` with in-place mutations that trigger reactive updates.

- [x] **Portal** - Render children into a different DOM node (like React Portal)
  - [x] `Portal(children)` or `Portal({ target }, children)` - defaults to `document.body`
  - [x] Supports element reference or CSS selector as target
  - [x] Cleans up on unmount via scope finalizer
  - [ ] Consider: `PortalTarget` component for named portals

- [ ] **Headless Component Library** - Radix Primitives-style unstyled components with full accessibility
  - No styling opinions, just behavior and a11y
  - WAI-ARIA compliant out of the box
  - Keyboard navigation built-in
  - Focus management
  - Components to include:
    - [x] Dialog / Modal
    - [x] Dropdown Menu
    - [x] Select
    - [x] Combobox / Autocomplete
    - [x] Popover
    - [x] Tooltip
    - [x] Tabs
    - [x] Accordion
    - [x] Toggle
    - [x] Switch
    - [x] Radio Group
    - [x] Checkbox
    - [x] Slider
    - [x] Toast / Notifications
    - [x] Alert Dialog
    - [x] Context Menu
    - [x] Navigation Menu
    - [x] Collapsible
    - [x] Scroll Area
    - [x] Progress
  - Design principles:
    - Composable parts (e.g., `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`)
    - Render props or slot pattern for full control
    - Works with any CSS framework (Tailwind, CSS modules, etc.)
    - Animation integration via existing animation primitives
    - Typed with full inference

## Design Decisions

### JSX (Decided Against)

**Decision:** No JSX support. Use function-based DSL only.

**Reasons:**

1. **Error type preservation**: `Element<E>` carries error types through the component tree. TypeScript's `JSX.Element` is not generic, so JSX would erase error information to `Element<unknown>`.

2. **No build complexity**: Function calls work with any TypeScript setup. JSX would require custom jsx-runtime configuration, tsconfig changes, and bundler setup.

3. **Consistent syntax**: With JSX, we'd need mixed syntax anyway - `<div>` for intrinsics but `{Component({})}` for components that can fail. Function calls are uniform.

4. **Explicit Effects**: Elements are Effects that must be yielded. The function syntax makes this clear; JSX would hide it.

The function-based DSL is clean and idiomatic:

```ts
div({ className: "card" }, [
  h1(title),
  p(description),
  Button({ onClick: handleClick }, "Submit"),
]);
```

### Router

**Approach:** TanStack Router-style with Effect Schema integration

#### V3: File-Based Routing (Future)

**Goal:** Make Effex the Effect.ts answer to Next.js with convention-over-configuration routing.

**Vite Plugin (`@effex/vite-plugin`):**

The plugin scans `src/routes/` and generates a type-safe route tree:

```
src/routes/
  __root.ts           → Root layout, global service providers, error boundaries
  index.ts            → /
  about.ts            → /about
  users/
    index.ts          → /users
    $id.ts            → /users/:id (param segment)
    $id.settings.ts   → /users/:id/settings (nested under param)
  blog/
    [...slug].ts      → /blog/* (catch-all)
  (marketing)/        → Route group (no URL segment)
    pricing.ts        → /pricing
    contact.ts        → /contact
```

**Route File Format:**

```typescript
// src/routes/users/$id.ts
import { Effect, Schema } from "effect";
import { Route } from "@effex/router";
import { div, h1, p } from "@effex/dom";
import { UserService } from "../../services/User";

// Optional: Override inferred params with explicit schema
export const params = Schema.Struct({
  id: Schema.NumberFromString,
});

// Data loader - Effect that runs on server (SSR) and client (navigation)
// Has access to services, can fail with typed errors
export const loader = Effect.gen(function* () {
  const { id } = yield* Route.params<typeof params>();
  const userService = yield* UserService;
  return yield* userService.getById(id);
});

// Optional: Suspense fallback for this route
export const loading = () => div({ class: "skeleton" }, "Loading user...");

// Optional: Error boundary for this route
export const error = (err: unknown) => div({ class: "error" }, `Failed: ${err}`);

// The page component - default export
export default Effect.gen(function* () {
  const user = yield* Route.loaderData<typeof loader>();

  return yield* div({ class: "user-page" }, [
    h1(user.name),
    p(user.email),
  ]);
});
```

**Generated Route Tree:**

```typescript
// src/routeTree.gen.ts (auto-generated, do not edit)
import { Schema } from "effect";

export const routeTree = {
  "/": {
    component: () => import("./routes/index"),
  },
  "/about": {
    component: () => import("./routes/about"),
  },
  "/users": {
    component: () => import("./routes/users/index"),
  },
  "/users/:id": {
    params: Schema.Struct({ id: Schema.NumberFromString }),
    component: () => import("./routes/users/$id"),
  },
  "/users/:id/settings": {
    params: Schema.Struct({ id: Schema.NumberFromString }),
    component: () => import("./routes/users/$id.settings"),
  },
} as const;

export type AppRoutes = typeof routeTree;
export type RoutePath = keyof AppRoutes;
```

**Type-Safe Link Component:**

```typescript
// Generated or augmented
import { Link } from "@effex/router";

// Full type safety - only valid routes, required params
Link({ to: "/users/:id", params: { id: 123 } }, "View User")
Link({ to: "/about" }, "About") // No params needed
Link({ to: "/invalid" }) // TS Error: not a valid route
```

**Effect-Specific Advantages:**

| Feature | Next.js | Effex |
|---------|---------|-------|
| Params validation | Runtime, manual | Schema at compile + runtime |
| Data loading | `async function`, `fetch` | `Effect` with services, retry, timeout |
| Error handling | Error boundaries (React) | Typed error channel, catch at any level |
| Auth/guards | Middleware (string matching) | Effect that fails with `Unauthorized` error |
| Dependencies | React Context, prop drilling | Effect Services (injected, testable) |
| Loading states | `loading.tsx` (file-based) | `loading` export or Suspense |

**Route Guards via Error Channel:**

```typescript
// src/routes/admin/$path.ts
import { Effect } from "effect";
import { Route, Unauthorized } from "@effex/router";
import { AuthService } from "../../services/Auth";

export const loader = Effect.gen(function* () {
  const auth = yield* AuthService;
  const user = yield* auth.getCurrentUser();

  if (!user.isAdmin) {
    return yield* Effect.fail(new Unauthorized({ redirect: "/login" }));
  }

  return { user };
});
```

**Layouts (`__layout.ts`):**

```typescript
// src/routes/users/__layout.ts
import { Effect } from "effect";
import { Route } from "@effex/router";
import { div, nav } from "@effex/dom";

export default Effect.gen(function* () {
  const outlet = yield* Route.outlet(); // Child route renders here

  return yield* div({ class: "users-layout" }, [
    nav([
      Link({ to: "/users" }, "All Users"),
      Link({ to: "/users/new" }, "New User"),
    ]),
    outlet,
  ]);
});
```

**Implementation Phases:**

1. **Phase 1: Vite Plugin MVP**
   - Route directory scanning with chokidar
   - Generate `routeTree.gen.ts` on startup and file changes
   - Dynamic imports for code splitting
   - HMR support for route file changes
   - Basic path-to-pattern conversion (`$id` → `:id`, `[...slug]` → `*`)

2. **Phase 2: Loaders & SSR Data**
   - `loader` export convention
   - `Route.loaderData()` hook to access loaded data
   - Server-side execution during SSR
   - Data serialization into HTML (`__EFFEX_DATA__`)
   - Client-side cache to avoid refetch on hydration

3. **Phase 3: Layouts & Nesting**
   - `__layout.ts` file convention
   - `Route.outlet()` for nested rendering
   - Layout data loaders
   - Parallel route segments (like Next.js `@folder`)

4. **Phase 4: Polish & DX**
   - Route prefetching on hover/visibility
   - Transitions between routes (View Transitions API?)
   - Dev overlay showing current route, params, loader data
   - Error overlay for loader failures
   - `effex generate route users/$id` CLI command

**Open Questions:**

- Should `__root.ts` provide the base HTML shell, or is that separate?
- How to handle API routes (`/api/*`)? Separate convention or same system?
- Integration with Effect's `Layer` - should routes define their service requirements?
- How to handle `notFound` - special file or catch-all pattern?

**File naming conventions (TanStack-inspired):**

| Pattern | Example | URL |
|---------|---------|-----|
| `index.ts` | `routes/index.ts` | `/` |
| `name.ts` | `routes/about.ts` | `/about` |
| `$param.ts` | `routes/$id.ts` | `/:id` |
| `$param.name.ts` | `routes/$id.settings.ts` | `/:id/settings` |
| `[...slug].ts` | `routes/[...slug].ts` | `/*` |
| `(group)/` | `routes/(admin)/` | No URL segment |
| `__layout.ts` | `routes/__layout.ts` | Wraps siblings |
| `__root.ts` | `routes/__root.ts` | App root |

Routes are defined declaratively with typed params:

```ts
const UserRoute = Route.make("/users/:id", {
  params: Schema.Struct({ id: Schema.String }),
});

const PostRoute = Route.make("/posts/:postId/comments/:commentId?", {
  params: Schema.Struct({
    postId: Schema.String,
    commentId: Schema.optional(Schema.String),
  }),
});

const router = yield* Router.make({
  home: HomeRoute,
  user: UserRoute,
  post: PostRoute,
});
```

#### V1 Scope (MVP)

**Included:**

- Flat routes (no nesting)
- History API only
- Path params with Effect Schema validation
- Query params as simple `Readable<URLSearchParams>` on router
- Most-specific-wins route matching (static segments before dynamic)
- Optional catch-all/fallback route
- Route-specific readables: `router.routes.user.params`, `router.routes.user.isActive`
- Navigation as Effects: `router.push(...)`, `router.replace(...)`, `router.back()`

**Deferred to V2:**

- Nested routes with accumulated params
- Hash-based routing (`/#/path`)
- Route guards via Effect error channel
- Query params with Schema validation (currently just `URLSearchParams`)
- Code splitting / lazy route loading

#### Full Feature Set (Future)

**Key features:**

- Type-safe params per route (inferred from Schema)
- Effect Schema for runtime validation
- Support both History API and hash-based routing
- Nested routes with accumulated params:
  ```ts
  const UserRoute = Route.make("/users/:id", {
    params: Schema.Struct({ id: Schema.String }),
    children: {
      profile: Route.make("/profile"),
      settings: Route.make("/settings"),
      posts: Route.make("/posts/:postId", {
        params: Schema.Struct({ postId: Schema.String }),
      }),
    },
  });
  // /users/:id/posts/:postId -> { id: string, postId: string }
  ```
- Route-specific readables: `router.routes.user.params`, `router.routes.user.isActive`
- Navigation as Effects: `router.push(...)`, `router.replace(...)`, `router.back()`
- Route guards via Effect error channel for auth checks, etc.

**Why this approach:**

- Fits naturally with Effect-UI's reactive primitives (routes as Readables)
- Full type safety without manual type annotations
- Familiar to TanStack Router users
- Routes as values enables composition and code splitting

### Forms

**Approach:** Effect Schema integration, headless, TanStack Form-style API

```ts
const form = yield* Form.make({
  schema: Schema.Struct({
    email: Schema.String.pipe(Schema.nonEmpty(), Schema.pattern(emailRegex)),
    password: Schema.String.pipe(Schema.minLength(8)),
    rememberMe: Schema.Boolean,
  }),
  initial: { email: "", password: "", rememberMe: false },
});
```

**Field access - each field is a Signal with metadata:**

```ts
form.fields.email.value; // Signal<string>
form.fields.email.errors; // Readable<string[]>
form.fields.email.touched; // Readable<boolean>
form.fields.email.dirty; // Readable<boolean>
```

**Form-level state:**

```ts
form.isValid; // Readable<boolean>
form.isSubmitting; // Readable<boolean>
form.errors; // Readable<Record<string, string[]>>
```

**Actions:**

```ts
form.submit(onSubmit)        // Effect that validates then calls handler
form.reset()                 // Reset to initial values
form.setErrors(...)          // Set server-side errors
```

**Validation timing options:**

- `"hybrid"` (default) - blur for first validation, then change after
- `"blur"` - validate when field loses focus
- `"change"` - validate on every keystroke
- `"submit"` - only validate when submitting

**Async validation:**

```ts
Form.make({
  schema: ...,
  validators: {
    username: (value) =>
      Effect.gen(function* () {
        const available = yield* api.checkUsername(value)
        return available ? [] : ["Username already taken"]
      }).pipe(Effect.debounce(300)),
  },
})
```

**Array/dynamic fields:**

```ts
form.fields.phoneNumbers.append("");
form.fields.phoneNumbers.remove(index);
form.fields.phoneNumbers.move(fromIndex, toIndex);
form.fields.phoneNumbers.items; // Readable<FieldArray<string>>
```

**Key decisions:**

- Headless - no UI opinions, just state management
- Effect Schema only (no adapters for Zod, etc.) - users of Effect-UI are already in Effect ecosystem
- Field-level subscriptions - only re-render what changed
- Provide primitives + common helpers, let users handle styling

### Animation

**Approach:** CSS-first with event-based timing, extensible for advanced libraries

**Core (built-in):**

- CSS-first transitions - provide class names, library manages lifecycle
- Event-based exit timing - listens for `animationend`/`transitionend` with timeout fallback
- Enter/exit lifecycle for `when()`, `match()`, and `each()`
- Stagger utilities for list animations
- Respects `prefers-reduced-motion` by default

```ts
// Simple fade
when(
  isVisible,
  () => Content(),
  () => div(),
  {
    animate: { enter: "fade-in", exit: "fade-out" },
  },
);

// With initial/final state classes (great for Tailwind)
when(
  isOpen,
  () => Modal(),
  () => div(),
  {
    animate: {
      enterFrom: "opacity-0 scale-95",
      enterTo: "opacity-100 scale-100",
      exit: "fade-out",
    },
  },
);

// Staggered list animations
each(items, keyFn, render, {
  animate: {
    enter: "slide-in",
    exit: "slide-out",
    stagger: 50, // 50ms between items
  },
});

// Custom stagger functions
each(items, keyFn, render, {
  animate: {
    enter: "scale-in",
    stagger: staggerFromCenter(30), // Animate from center outward
  },
});

// With lifecycle hooks
match(status, cases, undefined, {
  animate: {
    enter: "fade-in",
    exit: "fade-out",
    onEnter: (el) => Effect.sync(() => el.focus()),
  },
});
```

**Animation Options:**

```ts
interface AnimationOptions {
  enter?: string; // Class(es) for enter animation
  exit?: string; // Class(es) for exit animation
  enterFrom?: string; // Initial state class (removed after animation)
  enterTo?: string; // Final state class (persisted)
  exitTo?: string; // Exit target state class
  timeout?: number; // Max wait time (default: 5000ms)
  respectReducedMotion?: boolean; // Default: true

  // Lifecycle hooks
  onBeforeEnter?: (el: HTMLElement) => Effect<void> | void;
  onEnter?: (el: HTMLElement) => Effect<void> | void;
  onBeforeExit?: (el: HTMLElement) => Effect<void> | void;
  onExit?: (el: HTMLElement) => Effect<void> | void;
}
```

**Stagger Utilities:**

```ts
stagger(50); // Linear: 0ms, 50ms, 100ms...
staggerFromCenter(30); // Center-out: middle items first
staggerEased(500, easeOut); // Apply easing curve to delays
```

**Timing Utilities:**

```ts
delay(ms, effect); // Add delay before animation
sequence(...effects); // Run animations sequentially
parallel(...effects); // Run animations concurrently
```

**Why this approach:**

- Core stays lean, covers 80% of use cases
- CSS handles performance (GPU-accelerated)
- Exit animations wait for completion before DOM removal
- Backward compatible - animation options are optional
- Enables ecosystem libraries like "effect-ui-framer" or "effect-ui-motion-one"

### Element Error Channel

- `Element<E = never>` - generic over error type
- `Child<E = never>` - children propagate errors
- `mount()` requires `Element<never>` - all errors must be handled before mounting
- Use `ErrorBoundary` or Effect combinators to handle errors

### className vs class

Using `class` directly since we're not using JSX. No reserved word issues with function calls.

### Suspense API

Unified all Suspense variants into a single `Suspense` component with options:

```ts
Suspense({
  render: () => asyncEffect,
  fallback: () => loadingElement,
  catch: (error) => errorElement, // optional
  delay: "200 millis", // optional - delays fallback to avoid flash
});
```

The `delay` option accepts Effect Duration strings. If the render completes before the delay, no fallback is shown - great for route transitions.

### Class arrays for Tailwind

The `class` attribute accepts multiple formats for Tailwind-friendly ergonomics:

```ts
div({ class: "flex items-center" }); // string
div({ class: ["flex", "items-center", "gap-4"] }); // string[]
div({ class: isActive.map((a) => (a ? "on" : "off")) }); // Readable<string>
div({ class: ["btn", variant.map((v) => `btn-${v}`)] }); // mixed with reactives
```

### SSR & Multi-Target Rendering

**Approach:** Abstract rendering through Effect Layers to support multiple targets

The reactive core (Signals, Derived, Readable) is completely platform-agnostic. Only the `$` element factories are DOM-specific. By abstracting rendering through Layers, the same component code can target different environments.

**Architecture:**

```
┌─────────────────────────────────────────────────┐
│                  Component Logic                 │
│         (Signals, Derived, Effects, Streams)     │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Element Description                 │
│    { type: "div", props: {...}, children: [] }  │
└─────────────────────┬───────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        ▼             ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌───────────┐
   │   DOM   │  │  String  │  │ Terminal│  │  Native   │
   │ Renderer│  │ Renderer │  │ Renderer│  │ Renderer  │
   └─────────┘  └──────────┘  └─────────┘  └───────────┘
```

**Renderer Interface:**

```ts
interface Renderer<Node> {
  createNode: (type: string, props: Props) => Effect<Node>
  createTextNode: (text: string) => Effect<Node>
  appendChild: (parent: Node, child: Node) => Effect<void>
  removeChild: (parent: Node, child: Node) => Effect<void>
  setAttribute: (node: Node, key: string, value: unknown) => Effect<void>
  setTextContent: (node: Node, text: string) => Effect<void>
  addEventListener: (node: Node, event: string, handler: Handler) => Effect<void>
}

class RendererContext extends Context.Tag("Renderer")<
  RendererContext,
  Renderer<unknown>
>() {}
```

**Potential Targets:**

- `@effex/dom` - Browser DOM (current implementation)
- `@effex/string` - HTML strings for SSR/static site generation
- `@effex/terminal` - Terminal UI (like Ink for React)
- `@effex/native` - iOS/Android native views
- `@effex/canvas` - Canvas/WebGL for games, data viz
- `@effex/test` - Fast virtual renderer for unit tests (no jsdom)

**Key Insight:** Reactivity works across all targets. A Signal updating triggers `setTextContent` or `setAttribute` on whatever renderer is active. The renderer receives imperative commands and doesn't need to know about reactivity.

**SSR-Specific Considerations:**

1. **Server reactivity** - Only need initial values, not subscriptions. Could provide simplified Signal that skips stream setup.

2. **Streaming** - Effect's streaming could enable progressive HTML. Suspense boundaries could flush placeholders early.

**Hydration via Data Attributes (Preferred Approach):**

Instead of walking the DOM in creation order or using comment markers, use data attributes for direct lookup. Each reactive binding gets a deterministic ID (from creation order via SignalRegistry), and elements are tagged with that ID.

```html
<!-- Reactive text -->
<span data-effex-text="s:0">42</span>

<!-- Reactive attribute -->
<div class="active" data-effex-class="s:1">...</div>

<!-- Event handler (via delegation) -->
<button data-effex-click="h:0">Click me</button>

<!-- when conditional -->
<div style="display:contents" data-effex-when="w:0" data-effex-branch="true">
  <div>Welcome!</div>
</div>

<!-- match -->
<div style="display:contents" data-effex-match="m:0" data-effex-pattern="success">
  <div>Done!</div>
</div>

<!-- each list -->
<div style="display:contents" data-effex-each="e:0">
  <li data-effex-key="item-1">Apple</li>
  <li data-effex-key="item-2">Banana</li>
</div>
```

Hydration process:
1. Run component code (same as server) - creates signals, derived values
2. Each reactive primitive gets deterministic ID from creation order
3. Query DOM by data attributes: `[data-effex-text="s:0"]`
4. Attach subscriptions to found elements
5. Event handlers use delegation from root

Benefits:
- O(1) lookup vs O(n) DOM walking
- No comment markers needed
- `when`/`match`/`each` already have wrapper divs (`display: contents`) - perfect anchor points
- Out-of-order hydration possible
- Bindings visible in DevTools

| Binding | Data attribute | Extra info |
|---------|----------------|------------|
| Text | `data-effex-text="id"` | — |
| Attribute | `data-effex-attr-{name}="id"` | — |
| Event | `data-effex-{event}="id"` | delegation |
| `when` | `data-effex-when="id"` | `data-effex-branch` |
| `match` | `data-effex-match="id"` | `data-effex-pattern` |
| `each` | `data-effex-each="id"` | keys on children |

**Open Questions:**

- How to handle DOM-specific primitives (Portal, form inputs) in non-DOM targets?
- Scope lifecycle on server - when does cleanup run?
- Async boundaries - wait for all data vs stream vs placeholders?
- Multiple bindings from same signal - need compound IDs like `s:0:0`, `s:0:1`?

## Notes

- TypeDoc is configured for Markdown output (`pnpm docs:gen`)

## Development Guidelines

- **NEVER disable TypeScript or ESLint** - If types are difficult to get right, stop and ask for help rather than using `// @ts-ignore`, `// eslint-disable`, or `any` types. Proper typing is essential for this library.

## Package Structure

```
packages/
├── core/        → @effex/core (platform-agnostic reactivity primitives)
├── dom/         → @effex/dom (DOM rendering, depends on core)
├── router/      → @effex/router (routing, depends on dom)
├── form/        → @effex/form (form handling, depends on dom)
└── primitives/  → @effex/primitives (UI primitives, depends on dom)
```
