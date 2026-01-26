# Effex - TODO List

## Completed

### Core Features
- **Unit Tests** - Comprehensive coverage for Signal, Derived, Readable, Reaction, Element, Control, Component, Mount, Ref, Template, Form, Field
- **SVG Elements** - Full SVG element factories (`$.svg`, `$.path`, `$.rect`, `$.circle`, etc.)
- **Storybook** - Set up with HTML framework, Vite, path aliases, render helpers, storysource addon
- **Animation Primitives** - CSS-first enter/exit, stagger utilities, lifecycle hooks, reduced motion support
- **Form Handling** - Schema-based validation, field-level state, async validators, FieldArray
- **Router V1** - Flat routes, path params with Schema validation, History API, Link component
- **Virtualized Lists** - `virtualEach` with fixed/variable height, overscan, scroll control
- **Streaming Data** - `Readable.fromStream`, `Stream.scan` for accumulating, `innerHTML` for dynamic HTML
- **Reactive Collections** - `Signal.Array`, `Signal.Map`, `Signal.Set` with in-place mutations
- **Portal** - Render children into different DOM nodes
- **Migration Guides** - React, Vue, Svelte migration documentation

### @effex/platform V1
- Re-exports all packages, PlatformContext, cookies, request/response headers
- RouteLoader utilities (params, loaderData, parentData, formData, redirect)
- Custom JSON serialization (Date, Map, Set, BigInt, RegExp, URL, etc.)
- SSR with `render()`, `renderToDocument()`, hydration with `hydrateApp()`
- Actions with typed errors and requirements
- File-based routing via Vite plugin (`effexRoutes`, `effexSSR`)

### SSR & Hydration
- Basic SSR (`renderToString`), hydration (`hydrate`)
- Hydration markers on control flow (`data-effex-*` attributes)
- Suspense SSR (renders fallback, client re-triggers async)
- Data serialization for hydration (avoids double-fetching)
- Router SSR support

### Headless Primitives
Dialog, DropdownMenu, Select, Combobox, Popover, Tooltip, Tabs, Accordion, Toggle, Switch, RadioGroup, Checkbox, Slider, Toast, AlertDialog, ContextMenu, NavigationMenu, Collapsible, ScrollArea, Progress, Image, Separator, Toolbar, TreeView, Splitter

### ESLint Plugin (`@effex/eslint-plugin`)
- Custom rules for Effect.ts/Effex best practices:
  - `no-throw` - Warn on `throw` (use Effect.fail/Effect.die)
  - `no-try-catch` - Warn on try/catch (use Effect error handling)
  - `no-null` - Warn on `null` (use Option)
  - `no-floating-effect` - Error on unhandled Effects
  - `prefer-template-literal` - Warn on arrays in `$.*()` that should use `t``
- Recommended config with curated TypeScript rules
- Added to create-effex templates

### Refactoring
- `createKeyboardNav` helper adopted in: Tabs, RadioGroup, Toolbar, Accordion, DropdownMenu, ContextMenu, Select

### Layouts & Outlet
- `_layout.tsx` file convention with nested layout hierarchy
- `Outlet` component in `@effex/router` for rendering child content
- `Router.make` accepts `layouts` and `routeLayouts` configuration
- `router.activeLayouts` reactive state, per-layout `isActive` state
- Vite plugin generates `layouts`, `layoutComponents`, `routeLayouts`, `layoutParents`
- `Routes` component automatically wraps routes in their layout hierarchy

### Static Site Generation (SSG)
- `Route.define({ static: true })` - Mark route as static
- `Route.define({ revalidate: number })` - ISR support
- `staticPaths` export for dynamic static routes
- Vite plugin detects `staticPaths` exports and generates `staticRouteConfig`
- `buildStaticPages()` in `@effex/platform/server` renders and writes HTML files
- `getStaticRoutes()` helper to enumerate all static paths

---

## TODO

### High Priority

- [x] **Effex CLI** (`@effex/cli`)
  - `effex dev` - runs Vite dev server with SSR
  - `effex build` - orchestrates client build + SSG in one command
  - Looks for `ssg-entry.ts` or `effex.config.ts` for SSG configuration
  - [ ] Platform adapters (Vercel, Cloudflare, Node) - future work

- [x] **Documentation Site**
  - Built with Effex (dogfooding)
  - Location: `apps/docs/`
  - Approach:
    - Single catch-all route: `routes/docs.$.ts`
    - Use Node fs/glob to find all `.md` files in `content/docs/`
    - Export `staticPaths` with all markdown file paths
    - Loader reads file, parses frontmatter (`gray-matter`), converts to HTML (`marked`)
    - Render HTML via `innerHTML` prop (already supported)
    - Shiki for code highlighting (integrates with marked)
  - Dependencies: `glob`, `gray-matter`, `marked`, `shiki`

- [ ] **Documentation Content**

  Philosophy: Tutorial-first, hands-on learning. Meet devs where they are (Promise/async-await mental model). Introduce Effect gradually as concepts require it, not all at once.

  #### Structure
  1. **Quick Start** (5 min) - Hello world to first reactive component
  2. **Effect in 2 Minutes** - "Promise on steroids" mental model before first tutorial
     - `Promise<A>` → `Effect<A, E, R>` (adds typed errors + requirements)
     - `.then()` → `Effect.map()` / `Effect.flatMap()`
     - `async/await` → `Effect.gen` + `yield*`
     - "You don't need to understand Effect deeply to use Effex"
  3. **Tutorials** - Complete apps, building up concepts progressively
  4. **Concepts/Guides** - Grouped explanations with focused examples
  5. **Reference** - API docs (auto-generated from TypeDoc)

  #### Tutorials
  - [ ] **Tutorial 1: Todo App** - Core Effex concepts
    - Chapter 1: Getting Started - create-effex, project structure, dev server
    - Chapter 2: Your First Element - `$` factory, nesting, props
    - Chapter 3: Making It Interactive - Signals, set/update, onClick, Effect.gen
    - Chapter 4: Building the Todo List - Signal.Array, `each`, TodoItem component
    - Chapter 5: Toggling and Updating - onClick handlers, conditional styling
    - Chapter 6: Adding New Todos - form input, submission, push to array
    - Chapter 7: Derived State - `.map()` for single signal, `Derived.make` for multiple
    - Chapter 8: Conditional Rendering - `when`, clear completed, empty state
    - Chapter 9: Deleting Todos - remove from array
    - Chapter 10: Persistence (optional) - localStorage, loading/saving
  - [ ] **Tutorial 2: Social Media Site** - `@effex/platform` full-stack
    - Loaders (posts feed)
    - Actions (create post)
    - HttpApi integration (like/unlike, optimistic updates)
    - Brief database integration example (defer to Effect.ts for deep backend)
  - [ ] **Tutorial 3: LLM Chat Frontend** (future, when streaming primitives ready)
    - Streaming state for token-by-token display
    - Conversation history management

  #### Gradual Effect Introduction
  Teach Effect concepts as they become relevant:
  1. **Elements** - "Returns an Effect. Think of it like a Promise that hasn't run yet. The E and R types give you compile-time safety."
  2. **Event handlers** - "Handlers return Effects. Use Effect.gen + yield* like async/await."
  3. **Components** - "Components are functions that return Effects. Use Effect.gen for the implementation."
  4. **Context** - "Remember the R channel? That's for dependencies."

  #### Concept Docs (ordered by learning progression)
  - [ ] Elements & the `$` factory
  - [ ] Components
  - [ ] Signals & reactivity
  - [ ] Derived values (`.map`, `Derived.make`)
  - [ ] Control flow (`when`, `match`, `each`)
  - [ ] Forms & validation
  - [ ] Routing (client-side)
  - [ ] Animations
  - [ ] Refs & DOM access
  - [ ] SSR & SSG
  - [ ] Platform & full-stack
  - [ ] Effect.ts deep dive (deferred - can get far without it)

### Medium Priority

- [ ] **CONTRIBUTING.md** - Contribution guidelines for the project

- [ ] **Improve error messages** - Better DX when things go wrong

- [ ] **Performance testing**
  - [x] Vitest benchmarks (internal regression testing)
  - [ ] js-framework-benchmark integration (public comparison)

- [ ] **Streaming SSR** - `renderToStream` for progressive HTML delivery

- [ ] **Partial/Islands hydration** - Only hydrate interactive parts

### Future / Nice-to-Have

- [ ] **DevTools** (`@effex/devtools`)
  - Signal Inspector (view/edit values, highlight updates)
  - Update Highlighting (flash DOM on changes)
  - Component Tree with error types
  - Subscription counts, Scope tree visualization
  - Dependency graph, Timeline/time travel

- [ ] **Platform V2+**
  - `Link` with `prefetch` prop
  - Streaming SSR

- [ ] **Router V2**
  - Hash routing, route guards, query param schemas
  - Route prefetching, View Transitions API
  - Layout loaders (run layout-specific data fetching)

- [ ] **Demo: Effex IDE** - VSCode-like clone showcasing primitives
  - File explorer (TreeView), editor tabs, resizable panels (Splitter)
  - Command palette (Combobox), CodeMirror integration
  - Self-documenting: displays its own source code

- [ ] **Demo: Effex PM** - Jira-lite project management
  - Dashboard, Issues Table, Kanban Board, Issue Detail
  - AI Assistant with streaming, auth flow, real-time updates

- [ ] **Table helpers** - TanStack Table-inspired utilities

- [ ] **Carousel primitive** - Rotating panels, autoplay, swipe gestures

- [ ] **Architecture documentation** - Internals for contributors

- [ ] **Remaining keyboard nav refactors**: Combobox, NavigationMenu, TreeView

---

## Marketing / Value Propositions

**Tagline:** "A type-safe reactive UI framework that never throws"

(Errors are tracked in the type system and handled explicitly - no mystery runtime crashes)

**ESLint Plugin:** `@effex/eslint-plugin` warns on `throw`, `try/catch`, `null`, and other anti-patterns

---

### Value Props

**Type Safety**
- Errors are part of the type signature, not hidden runtime surprises
- Know at compile time if a component can fail and what errors it produces
- Full-stack type safety from database to UI with typed loaders/actions

**Fine-Grained Reactivity**
- Only what changes, updates - nothing more
- Components are regular functions that run once, making them deterministic
- Reactive primitives that compose naturally

**Composability**
- Components, loaders, actions, event handlers - same mental model
- Everything is an Effect, so everything composes
- Build complex behavior from simple pieces

**Built for the Server**
- SSR and SSG designed in from day one, not bolted on
- Hydration that doesn't re-fetch your data
- Same code runs on server and client

**Production-Ready Primitives**
- Full suite of accessible, headless UI components
- Keyboard navigation, ARIA, focus management built-in
- Style however you want

**Structured Error Handling**
- Errors don't disappear into console.log
- Handle failures explicitly at the right level
- Type-safe recovery paths

**Testable by Default**
- Dependency injection via Context, no mocking hacks
- Components are pure functions of their inputs
- Swap implementations for testing without rewiring

---

## Design Decisions

### No JSX
Function-based DSL preserves error types (`Element<E>`), requires no build config, and makes Effects explicit.

### Router
TanStack Router-style with Effect Schema. File-based routing via Vite plugin. Routes as Effects with typed loaders/actions.

### Forms
Effect Schema integration, headless, field-level subscriptions. Validation timing: hybrid/blur/change/submit.

### Animation
CSS-first with event-based timing. Enter/exit lifecycle for `when`/`match`/`each`. Stagger utilities, respects `prefers-reduced-motion`.

### SSR
Abstract rendering through Layers. Hydration via data attributes for O(1) lookup. Control flow wrappers use `display: contents`.

### Class Arrays
`class` accepts strings, arrays, or Readables for Tailwind-friendly ergonomics.

---

## Development Guidelines

- **NEVER disable TypeScript or ESLint** - Ask for help rather than using `@ts-ignore`, `eslint-disable`, or `any`.
- **ALWAYS verify APIs before writing documentation** - Read the actual source files in `packages/` before documenting any API. Do not write examples from memory - check the real function signatures, types, and usage patterns first.

## Package Structure

```
packages/
├── core/          → @effex/core (platform-agnostic reactivity)
├── dom/           → @effex/dom (DOM rendering)
├── router/        → @effex/router (routing)
├── form/          → @effex/form (form handling)
├── primitives/    → @effex/primitives (UI primitives)
├── platform/      → @effex/platform (meta-framework)
├── cli/           → @effex/cli (dev server, build tooling)
├── vite-plugin/   → @effex/vite-plugin (file-based routing)
├── eslint-plugin/ → @effex/eslint-plugin (linting rules)
└── create-effex/  → create-effex (project scaffolding)
```
