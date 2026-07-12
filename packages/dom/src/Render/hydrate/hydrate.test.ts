import { Effect } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Readable, Signal } from "@effex/core";

import { Boundary } from "../../Boundary.js";
import { collect } from "../../Collect.js";
import { each, match, when } from "../../Control/index.js";
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
});
