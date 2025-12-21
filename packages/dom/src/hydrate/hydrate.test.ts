import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Effect } from "effect";
import { renderToString } from "../server";
import { hydrate } from "./index";
import { Signal } from "@effex/core";
import { div, span } from "../Element";
import { when, match } from "../Control";
import { Boundary } from "../Boundary";

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
        renderToString(div({ class: "test" }, "Hello")),
      );
      container.innerHTML = html;

      // Hydrate
      await hydrate(div({ class: "test" }, "Hello"), container);

      expect(container.querySelector(".test")).toBeTruthy();
      expect(container.textContent).toContain("Hello");
    });

    it("should attach event handlers during hydration", async () => {
      const onClick = vi.fn();

      // SSR - note: events don't render to HTML
      const html = await Effect.runPromise(
        renderToString(div({ class: "clickable" }, "Click me")),
      );
      container.innerHTML = html;

      // Hydrate with event handler
      await hydrate(
        div({ class: "clickable", onClick }, "Click me"),
        container,
      );

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
            onTrue: () => div({ class: "visible" }, "Visible"),
            onFalse: () => div({ class: "hidden" }, "Hidden"),
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
              { pattern: "loading", render: () => div("Loading...") },
              { pattern: "success", render: () => div("Success!") },
              { pattern: "error", render: () => div("Error!") },
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
              return yield* div({ class: "loaded" }, "Loaded content");
            }),
          fallback: () => div({ class: "loading" }, "Loading..."),
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
          fallback: () => div({ class: "loading" }, "Loading..."),
          catch: (error) => div({ class: "error" }, `Error: ${error}`),
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
                  onTrue: () => div({ class: "true-branch" }, "True"),
                  onFalse: () => div({ class: "false-branch" }, "False"),
                });
              }),
            fallback: () => div({ class: "loading" }, "Loading..."),
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

          return yield* div([
            when(show1, {
              onTrue: () => span("First visible"),
              onFalse: () => span("First hidden"),
            }),
            Boundary.suspense({
              render: () =>
                Effect.gen(function* () {
                  yield* Effect.sleep(10);
                  return yield* div("Async content");
                }),
              fallback: () => div("Loading..."),
            }),
            when(show2, {
              onTrue: () => span("Second visible"),
              onFalse: () => span("Second hidden"),
            }),
          ]);
        });

      // SSR
      const html = await Effect.runPromise(renderToString(App()));
      container.innerHTML = html;

      // Should have h1 for first when, h2 for suspense, h3 for second when
      expect(container.innerHTML).toContain('data-effex-id="h1"');
      expect(container.innerHTML).toContain('data-effex-id="h2"');
      expect(container.innerHTML).toContain('data-effex-id="h3"');

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
});
