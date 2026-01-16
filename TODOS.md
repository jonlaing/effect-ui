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

### Refactoring
- `createKeyboardNav` helper adopted in: Tabs, RadioGroup, Toolbar, Accordion, DropdownMenu, ContextMenu, Select

---

## TODO

### High Priority

- [ ] **Layouts & Outlet** (Router Phase 3)
  - `__layout.ts` file convention
  - `Outlet` component for nested rendering
  - Layout data loaders
  - Parallel route segments

- [ ] **Static Site Generation (SSG)**
  - `Route.define({ static: true })` - Mark route as static
  - `staticPaths()` - Enumerate params for dynamic static routes
  - `revalidate: number` - ISR support
  - Build command renders static routes to disk

- [ ] **Documentation Site**
  - Built with Effex (dogfooding)
  - Requires: Layouts, SSG, Markdown rendering
  - Location: `apps/docs/` or `sites/docs/`

### Medium Priority

- [ ] **`@effex/markdown` package**
  - `parseMarkdown(string)` → AST + frontmatter
  - `Markdown.fromAST(ast)` → Element
  - Shiki integration for code highlighting
  - Options: Runtime parsing, build-time transform, or hybrid

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
  - Build orchestration (SSR build, client build, asset manifest)
  - Platform adapters (Vercel, Cloudflare, Node)
  - CLI (`create-effex-app`, `effex dev`, `effex build`)
  - `Link` with `prefetch` prop
  - Streaming SSR

- [ ] **Router V2**
  - Nested routes with accumulated params
  - Hash routing, route guards, query param schemas
  - Route prefetching, View Transitions API

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

## Package Structure

```
packages/
├── core/        → @effex/core (platform-agnostic reactivity)
├── dom/         → @effex/dom (DOM rendering)
├── router/      → @effex/router (routing)
├── form/        → @effex/form (form handling)
├── primitives/  → @effex/primitives (UI primitives)
└── platform/    → @effex/platform (meta-framework)
```
