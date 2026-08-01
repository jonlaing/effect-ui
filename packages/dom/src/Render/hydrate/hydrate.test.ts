import { Effect } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Readable, Signal } from "@effex/core";

import { Boundary } from "../../Boundary.js";
import { collect } from "../../Collect.js";
import { animated, each, match, when } from "../../Control/index.js";
import { $ } from "../../Element/index.js";
import { renderToString } from "../server/index.js";
import { hydrate } from "./index.js";

describe("Hydration", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("basic hydration", () => {
    it("should hydrate a simple element", async () => {
      // SSR
      const html = await Effect.runPromise(
        renderToString($.div({ class: "test" }, $.of("Hello"))),
      );
      container.innerHTML = html;

      // Hydrate
      await hydrate($.div({ class: "test" }, $.of("Hello")), container);

      expect(container.querySelector(".test")).toBeTruthy();
      expect(container.textContent).toContain("Hello");
    });

    it("should attach event handlers during hydration", async () => {
      const onClick = vi.fn();

      // SSR - note: events don't render to HTML
      const html = await Effect.runPromise(
        renderToString($.div({ class: "clickable" }, $.of("Click me"))),
      );
      container.innerHTML = html;

      // Hydrate with event handler
      await hydrate(
        $.div({ class: "clickable", onClick }, $.of("Click me")),
        container,
      );

      // Wait a tick for the forked fiber to complete hydration
      await new Promise((r) => setTimeout(r, 0));

      // Simulate click
      const element = container.querySelector(".clickable") as HTMLElement;
      element?.click();

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("control flow hydration", () => {
    it("should hydrate when component and set up subscriptions", async () => {
      // Create signal outside for testing
      let conditionSignal: Signal.Signal<boolean>;

      const App = () =>
        Effect.gen(function* () {
          conditionSignal = yield* Signal.make(true);
          return yield* when(conditionSignal, {
            onTrue: () => $.div({ class: "visible" }, $.of("Visible")),
            onFalse: () => $.div({ class: "hidden" }, $.of("Hidden")),
          });
        });

      // SSR
      const html = await Effect.runPromise(renderToString(App()));
      container.innerHTML = html;

      expect(container.innerHTML).toContain("Visible");
      expect(container.innerHTML).not.toContain("Hidden");

      // Hydrate
      await hydrate(App(), container);

      // Initial state preserved
      expect(container.textContent).toContain("Visible");
    });

    it("should hydrate match component", async () => {
      let statusSignal: Signal.Signal<"loading" | "success" | "error">;

      const App = () =>
        Effect.gen(function* () {
          statusSignal = yield* Signal.make<"loading" | "success" | "error">(
            "loading",
          );
          return yield* match(statusSignal, {
            cases: [
              {
                pattern: "loading",
                render: () => $.div({}, $.of("Loading...")),
              },
              { pattern: "success", render: () => $.div({}, $.of("Success!")) },
              { pattern: "error", render: () => $.div({}, $.of("Error!")) },
            ],
          });
        });

      // SSR
      const html = await Effect.runPromise(renderToString(App()));
      container.innerHTML = html;

      expect(container.innerHTML).toContain("Loading...");

      // Hydrate
      await hydrate(App(), container);

      expect(container.textContent).toContain("Loading...");
    });
  });

  describe("suspense hydration", () => {
    it("should find suspense container and trigger async load", async () => {
      let resolved = false;

      const App = () =>
        Boundary.suspense({
          render: () =>
            Effect.gen(function* () {
              yield* Effect.sleep(10);
              resolved = true;
              return yield* $.div({ class: "loaded" }, $.of("Loaded content"));
            }),
          fallback: () => $.div({ class: "loading" }, $.of("Loading...")),
        });

      // SSR - renders fallback
      const html = await Effect.runPromise(renderToString(App()));
      container.innerHTML = html;

      expect(container.innerHTML).toContain("Loading...");
      expect(container.innerHTML).toContain(
        'data-effex-suspense-state="loading"',
      );
      expect(resolved).toBe(false);

      // Hydrate - should trigger async load
      await hydrate(App(), container);

      // Wait for async content to load
      await new Promise((r) => setTimeout(r, 50));

      expect(resolved).toBe(true);
      expect(container.innerHTML).toContain("Loaded content");
      expect(container.innerHTML).toContain(
        'data-effex-suspense-state="loaded"',
      );
    });

    it("should handle suspense error with catch handler", async () => {
      const App = () =>
        Boundary.suspense({
          render: () =>
            Effect.gen(function* () {
              yield* Effect.sleep(10);
              return yield* Effect.fail("Something went wrong");
            }),
          fallback: () => $.div({ class: "loading" }, $.of("Loading...")),
          catch: (error) => $.div({ class: "error" }, $.of(`Error: ${error}`)),
        });

      // SSR - renders fallback
      const html = await Effect.runPromise(renderToString(App()));
      container.innerHTML = html;

      expect(container.innerHTML).toContain("Loading...");

      // Hydrate - should trigger async load and catch error
      await hydrate(App(), container);

      // Wait for async content
      await new Promise((r) => setTimeout(r, 50));

      expect(container.innerHTML).toContain("Error: Something went wrong");
      expect(container.innerHTML).toContain(
        'data-effex-suspense-state="error"',
      );
    });

    it("should handle nested when inside suspense", async () => {
      let conditionSignal: Signal.Signal<boolean>;

      const App = () =>
        Effect.gen(function* () {
          conditionSignal = yield* Signal.make(true);

          return yield* Boundary.suspense({
            render: () =>
              Effect.gen(function* () {
                yield* Effect.sleep(10);
                return yield* when(conditionSignal, {
                  onTrue: () => $.div({ class: "true-branch" }, $.of("True")),
                  onFalse: () =>
                    $.div({ class: "false-branch" }, $.of("False")),
                });
              }),
            fallback: () => $.div({ class: "loading" }, $.of("Loading...")),
          });
        });

      // SSR - renders fallback
      const html = await Effect.runPromise(renderToString(App()));
      container.innerHTML = html;

      expect(container.innerHTML).toContain("Loading...");

      // Hydrate
      await hydrate(App(), container);

      // Wait for async content
      await new Promise((r) => setTimeout(r, 50));

      expect(container.innerHTML).toContain("True");
    });
  });

  describe("hydration ID synchronization", () => {
    it("should generate matching IDs for SSR and hydration", async () => {
      // This tests that when we have multiple control flow elements,
      // the hydration ID counter stays in sync

      const App = () =>
        Effect.gen(function* () {
          const show1 = yield* Signal.make(true);
          const show2 = yield* Signal.make(false);

          return yield* $.div(
            {},
            collect(
              when(show1, {
                onTrue: () => $.span({}, $.of("First visible")),
                onFalse: () => $.span({}, $.of("First hidden")),
              }),
              Boundary.suspense({
                render: () =>
                  Effect.gen(function* () {
                    yield* Effect.sleep(10);
                    return yield* $.div({}, $.of("Async content"));
                  }),
                fallback: () => $.div({}, $.of("Loading...")),
              }),
              when(show2, {
                onTrue: () => $.span({}, $.of("Second visible")),
                onFalse: () => $.span({}, $.of("Second hidden")),
              }),
            ),
          );
        });

      // SSR
      const html = await Effect.runPromise(renderToString(App()));
      container.innerHTML = html;

      // Should have effex-id markers for control flow containers
      expect(container.innerHTML).toContain("data-effex-id=");
      // Should have keys for the rendered slots
      expect(container.innerHTML).toContain('data-effex-key="true"');
      expect(container.innerHTML).toContain('data-effex-key="false"');

      // Hydrate
      await hydrate(App(), container);

      // Wait for suspense
      await new Promise((r) => setTimeout(r, 50));

      // Suspense should have loaded
      expect(container.innerHTML).toContain("Async content");
      expect(container.innerHTML).toContain("First visible");
      expect(container.innerHTML).toContain("Second hidden");
    });
  });

  describe("each intro flag", () => {
    const letters = () => [
      { id: "l1", char: "H" },
      { id: "l2", char: "i" },
    ];

    it("does not re-animate SSR items by default", async () => {
      const onBeforeEnter = vi.fn(() => Effect.void);

      const App = () =>
        Effect.gen(function* () {
          const items = yield* Signal.make(letters());
          return yield* each(items, {
            key: (l: { id: string; char: string }) => l.id,
            render: (l: Readable.Readable<{ id: string; char: string }>) =>
              $.span({}, $.of(Readable.map(l, (v) => v.char))),
            animate: {
              enterFrom: "opacity-0",
              enter: "opacity-100",
              onBeforeEnter,
            },
          });
        });

      container.innerHTML = await Effect.runPromise(renderToString(App()));
      await hydrate(App(), container);
      await new Promise((r) => setTimeout(r, 20));

      expect(onBeforeEnter).not.toHaveBeenCalled();
    });

    it("re-animates SSR items when intro: true", async () => {
      const onBeforeEnter = vi.fn(() => Effect.void);

      const App = () =>
        Effect.gen(function* () {
          const items = yield* Signal.make(letters());
          return yield* each(items, {
            key: (l: { id: string; char: string }) => l.id,
            render: (l: Readable.Readable<{ id: string; char: string }>) =>
              $.span({}, $.of(Readable.map(l, (v) => v.char))),
            animate: {
              enterFrom: "opacity-0",
              enter: "opacity-100",
              onBeforeEnter,
              timeout: 50,
            },
            intro: true,
          });
        });

      container.innerHTML = await Effect.runPromise(renderToString(App()));
      await hydrate(App(), container);
      // Give forked enter animations a tick to invoke the hook.
      await new Promise((r) => setTimeout(r, 20));

      expect(onBeforeEnter).toHaveBeenCalledTimes(letters().length);
    });

    it("re-animates a `when` branch when intro: true", async () => {
      const onBeforeEnter = vi.fn(() => Effect.void);

      const App = () =>
        Effect.gen(function* () {
          const visible = yield* Signal.make(true);
          return yield* when(visible, {
            onTrue: () => $.div({ class: "hero" }, $.of("Hi")),
            onFalse: () => $.div({}, $.of("")),
            animate: {
              enterFrom: "opacity-0",
              enter: "opacity-100",
              onBeforeEnter,
              timeout: 50,
            },
            intro: true,
          });
        });

      container.innerHTML = await Effect.runPromise(renderToString(App()));
      await hydrate(App(), container);
      await new Promise((r) => setTimeout(r, 20));

      expect(onBeforeEnter).toHaveBeenCalledTimes(1);
    });
  });

  describe("each removal after hydration", () => {
    it("removes a hydrated slot's SSR DOM node when its key drops out", async () => {
      let itemsSignal: Signal.Signal<Array<{ id: string; text: string }>>;
      const initial = [
        { id: "a", text: "Alpha" },
        { id: "b", text: "Bravo" },
        { id: "c", text: "Charlie" },
      ];

      const App = () =>
        Effect.gen(function* () {
          itemsSignal = yield* Signal.make(initial);
          return yield* each(itemsSignal, {
            key: (item: { id: string; text: string }) => item.id,
            render: (item: Readable.Readable<{ id: string; text: string }>) =>
              $.li({}, $.of(Readable.map(item, (v) => v.text))),
            container: () => $.ul({ class: "letters" }),
          });
        });

      container.innerHTML = await Effect.runPromise(renderToString(App()));

      // Sanity: SSR emits three <li> nodes.
      const ssrLis = container.querySelectorAll("li");
      expect(ssrLis.length).toBe(3);
      expect(Array.from(ssrLis).map((li) => li.textContent)).toEqual([
        "Alpha",
        "Bravo",
        "Charlie",
      ]);

      await hydrate(App(), container);
      // hydrate() returns Promise.resolve() immediately and completes the
      // App() render inside a forked fiber — wait a tick so the signal has
      // been created and subscriptions wired before we drive it.
      await new Promise((r) => setTimeout(r, 20));

      // Drop "Bravo" — its <li> should be removed from the DOM.
      await Effect.runPromise(
        itemsSignal!.set([
          { id: "a", text: "Alpha" },
          { id: "c", text: "Charlie" },
        ]),
      );
      // Let the forked removal fiber run.
      await new Promise((r) => setTimeout(r, 40));

      const afterLis = container.querySelectorAll("li");
      expect(afterLis.length).toBe(2);
      expect(Array.from(afterLis).map((li) => li.textContent)).toEqual([
        "Alpha",
        "Charlie",
      ]);
    });

    it("removes the correct node when the each is nested inside a wrapper", async () => {
      // Regression cover: the forked ControlCtx that reconcile creates has
      // to re-push its container onto the hydration walker after `create()`
      // pops it; otherwise slot renders find the wrong parent, entry.element
      // is a detached fresh node, and the SSR node stays orphaned in the DOM.
      let itemsSignal: Signal.Signal<Array<{ id: string; text: string }>>;

      const App = () =>
        Effect.gen(function* () {
          itemsSignal = yield* Signal.make([
            { id: "a", text: "Alpha" },
            { id: "b", text: "Bravo" },
          ]);
          return yield* $.section(
            { class: "wrap" },
            each(itemsSignal, {
              key: (item: { id: string; text: string }) => item.id,
              render: (item: Readable.Readable<{ id: string; text: string }>) =>
                $.p({}, $.of(Readable.map(item, (v) => v.text))),
            }),
          );
        });

      container.innerHTML = await Effect.runPromise(renderToString(App()));
      await hydrate(App(), container);
      await new Promise((r) => setTimeout(r, 20));

      await Effect.runPromise(itemsSignal!.set([{ id: "a", text: "Alpha" }]));
      await new Promise((r) => setTimeout(r, 40));

      const remaining = container.querySelectorAll("section p");
      expect(remaining.length).toBe(1);
      expect(remaining[0].textContent).toBe("Alpha");
    });
  });

  describe("animated wrapper under hydration", () => {
    it("hydrates content wrapped in `animated` alongside other siblings", async () => {
      // Regression cover: `animated` uses the same forked-ControlCtx +
      // getContainer path as `each`, but it hits the DEFAULT container
      // (no `config.container` factory). If getContainer's fix pushes on
      // top of a container that createNode already pushed but never
      // popped, the walker ends up with a residual frame after
      // finalizeContainer — siblings rendered after the `animated` block
      // then look in the wrong parent and mismatch.
      const App = () =>
        $.div(
          { class: "root" },
          animated(
            {
              animate: {
                enterFrom: "opacity-0",
                enter: "opacity-100",
              },
            },
            () => $.h1({}, "Animated title"),
          ),
          $.p({ class: "sibling" }, "A sibling"),
        );

      const html = await Effect.runPromise(renderToString(App()));
      container.innerHTML = html;

      const mismatches: string[] = [];
      await hydrate(App(), container, {
        onMismatch: (message) => mismatches.push(message),
      });
      await new Promise((r) => setTimeout(r, 20));

      // The sibling must hydrate against the actual <p>, not fall through
      // to onMismatch because the walker was in the wrong parent.
      expect(mismatches).toEqual([]);
      expect(container.querySelector(".sibling")?.textContent).toBe(
        "A sibling",
      );
      expect(container.querySelector("h1")?.textContent).toBe("Animated title");
    });
  });
});
