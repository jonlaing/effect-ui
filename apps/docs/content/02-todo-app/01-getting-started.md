---
title: "Chapter 1: Getting Started"
description: "Set up a new Effex project and understand the project structure"
order: 1
---

# Chapter 1: Getting Started

Let's create a new Effex project and get our development environment running.

## Create Your Project

Open your terminal and run:

```bash
pnpm create effex@latest todo-app
```

When prompted, select:
- **Template**: SPA (Single Page Application)
- **Package manager**: pnpm (or your preference)

Once complete, navigate into the project and start the dev server:

```bash
cd todo-app
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. You should see the default Effex welcome page with a counter.

## Project Structure

Your project looks like this:

```
todo-app/
├── src/
│   ├── main.ts              # Application entry point
│   └── App.ts               # Root component
├── index.html               # HTML template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

The key files:

- **`src/main.ts`** - Bootstraps the app and mounts to the DOM
- **`src/App.ts`** - Your root component

## Understanding main.ts

Open `src/main.ts`. You'll see something like:

```typescript
import { Effect } from "effect";
import { $, mount, runApp } from "@effex/dom";

runApp(
  Effect.gen(function* () {
    const app = yield* App();
    yield* mount(app, container);
  }),
);
```

Don't worry about understanding all of this yet. The key points:

1. **`runApp`** starts the application
2. **`Effect.gen`** is like an async function (we use `yield*` instead of `await`)
3. **`mount`** attaches our app to the DOM

## Simplify for Learning

For this tutorial, we'll start simpler. Replace the contents of `src/main.ts` with:

```typescript
import { Effect } from "effect";
import { $, mount, runApp } from "@effex/dom";

// Get the root element
const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

// Our app - just a simple div for now
const App = $.div({}, "Hello, Effex!");

// Mount it
runApp(
  Effect.gen(function* () {
    yield* mount(App, container);
    console.log("App mounted!");
  }),
);
```

Save the file. Your browser should now show "Hello, Effex!"

## What Just Happened?

Let's break it down:

1. **`$.div({}, "Hello, Effex!")`** - Creates a div element with text content. The `$` object has methods for every HTML element (`$.div`, `$.span`, `$.button`, etc.). Strings can be passed directly as children.

2. **`mount(App, container)`** - Takes our element and renders it into the DOM container

3. **`runApp(Effect.gen(...))`** - Runs our Effect, which mounts the app

The `$` factory returns an Effect that, when run, creates a DOM element. Effects are lazy—they describe *what* to do, not *when* to do it. The `mount` function runs the Effect and attaches the result to the DOM.

## Next Steps

You've got a working Effex app! In the next chapter, we'll explore the `$` factory in depth and build out the structure of our todo app.
