---
title: Getting Started
description: Learn how to create your first Effex application
order: 1
---

# Getting Started

Effex is a reactive UI framework built on Effect.ts primitives. It provides fine-grained reactivity, type-safe components, and first-class support for server-side rendering.

## Installation

Create a new Effex project using the CLI:

```bash
npx create-effex@latest my-app
cd my-app
pnpm install
pnpm dev
```

This will scaffold a new SSR-enabled Effex application.

## Project Structure

A typical Effex project looks like this:

```
my-app/
├── src/
│   ├── routes/          # File-based routing
│   │   ├── _layout.ts   # Root layout
│   │   ├── _index.ts    # Home page
│   │   └── about.ts     # /about page
│   ├── generated/       # Auto-generated route config
│   ├── app.ts           # App configuration
│   ├── client.ts        # Client entry point
│   └── server.ts        # Server entry point
├── public/              # Static assets
└── vite.config.ts       # Vite configuration
```

## Your First Component

Components in Effex are Effects that return Elements:

```typescript
import { $, Component, Signal } from "@effex/platform";

const Counter = Component.gen(function* () {
  const count = yield* Signal.make(0);

  const increment = () => count.update((n) => n + 1);
  const decrement = () => count.update((n) => n - 1);

  return yield* $.div({ class: "counter" }, [
    $.button({ onClick: decrement }, "-"),
    $.span({}, [count]),
    $.button({ onClick: increment }, "+"),
  ]);
});
```

Key concepts:

- **`Component.gen`** - Creates a component using Effect generators
- **`Signal.make`** - Creates a reactive value
- **`$`** - Element factory for creating DOM elements

## Reactivity

Effex uses fine-grained reactivity. When you use a Signal in your template, only that specific binding updates when the value changes:

```typescript
const count = yield* Signal.make(0);

// This span updates automatically when count changes
$.span({}, [count])

// Derived values
const doubled = count.map((n) => n * 2);
$.span({}, [doubled])
```

## Next Steps

- [Learn about Signals](/docs/concepts/signals) - Deep dive into reactive state
- [Learn about Effects](/docs/concepts/effects) - Understand Effect.ts integration
- [Routing](/docs/concepts/routing) - File-based routing and navigation
