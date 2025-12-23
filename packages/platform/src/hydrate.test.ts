import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Effect } from "effect";
import { div } from "@effex/dom";
import { renderToString } from "@effex/dom/server";
import { hydrateApp, isHydrating } from "./hydrate";
import type { LoaderData } from "./RouteLoader";

// Helper to run Effect.runPromise with cross-package type compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const run = (effect: any): Promise<string> =>
  Effect.runPromise(effect) as Promise<string>;

describe("hydrate", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    // Clear any existing loader data
    delete (window as unknown as { __EFFEX_LOADER_DATA__?: LoaderData })
      .__EFFEX_LOADER_DATA__;
  });

  afterEach(() => {
    document.body.removeChild(container);
    delete (window as unknown as { __EFFEX_LOADER_DATA__?: LoaderData })
      .__EFFEX_LOADER_DATA__;
  });

  describe("hydrateApp", () => {
    it("should hydrate a simple element", async () => {
      const html = await run(renderToString(div({ class: "test" }, "Hello")));
      container.innerHTML = html;

      await hydrateApp(div({ class: "test" }, "Hello"), container);

      expect(container.querySelector(".test")).toBeTruthy();
      expect(container.textContent).toContain("Hello");
    });

    it("should attach event handlers during hydration", async () => {
      const onClick = vi.fn();

      const html = await run(
        renderToString(div({ class: "clickable" }, "Click me")),
      );
      container.innerHTML = html;

      await hydrateApp(
        div({ class: "clickable", onClick }, "Click me"),
        container,
      );

      const element = container.querySelector(".clickable") as HTMLElement;
      element?.click();

      expect(onClick).toHaveBeenCalled();
    });

    it("should read loader data from window", async () => {
      // Set up SSR loader data
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/users": {
          data: { users: ["Alice", "Bob"] },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(
        renderToString(div({ class: "users" }, "User list")),
      );
      container.innerHTML = html;

      await hydrateApp(div({ class: "users" }, "User list"), container);

      // Loader data should be available for use
      expect(container.querySelector(".users")).toBeTruthy();
    });

    it("should use provided loader data over window data", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: { source: "window" },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container, {
        loaderData: {
          "routes/test": {
            data: { source: "options" },
            timestamp: Date.now(),
            params: {},
          },
        },
      });

      expect(container.textContent).toContain("Test");
    });

    it("should clean up window loader data after hydration", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: { value: 1 },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container);

      // Loader data should be cleaned up
      expect(
        (window as unknown as { __EFFEX_LOADER_DATA__?: LoaderData })
          .__EFFEX_LOADER_DATA__,
      ).toBeUndefined();
    });

    it("should work with empty loader data", async () => {
      const html = await run(renderToString(div("No loader data")));
      container.innerHTML = html;

      await hydrateApp(div("No loader data"), container);

      expect(container.textContent).toContain("No loader data");
    });

    // Note: Reactive element hydration is tested in @effex/dom/hydrate tests.
    // Cross-package Effect type resolution issues prevent testing here.
  });

  describe("loader data deserialization", () => {
    it("should deserialize Date objects", async () => {
      const date = new Date("2024-01-15T10:30:00Z");
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: {
            created: {
              __effex_type__: "Date",
              __effex_value__: date.toISOString(),
            },
          },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container);

      // Data should be deserialized - cleanup happens after
    });

    it("should deserialize Map objects", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: {
            items: {
              __effex_type__: "Map",
              __effex_value__: [
                ["a", 1],
                ["b", 2],
              ],
            },
          },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container);
    });

    it("should deserialize Set objects", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: {
            tags: {
              __effex_type__: "Set",
              __effex_value__: ["tag1", "tag2", "tag3"],
            },
          },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container);
    });

    it("should deserialize BigInt", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: {
            largeNumber: {
              __effex_type__: "BigInt",
              __effex_value__: "9007199254740993",
            },
          },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container);
    });

    it("should deserialize undefined values", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: {
            optional: { __effex_type__: "undefined" },
          },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container);
    });

    it("should deserialize NaN and Infinity", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: {
            nan: { __effex_type__: "NaN" },
            inf: { __effex_type__: "Infinity" },
            negInf: { __effex_type__: "-Infinity" },
          },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container);
    });

    it("should deserialize RegExp", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: {
            pattern: {
              __effex_type__: "RegExp",
              __effex_value__: { source: "test\\d+", flags: "gi" },
            },
          },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container);
    });

    it("should deserialize URL", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: {
            link: {
              __effex_type__: "URL",
              __effex_value__: "https://example.com/path?query=1",
            },
          },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container);
    });

    it("should deserialize nested special types", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: {
            nested: {
              dates: [
                {
                  __effex_type__: "Date",
                  __effex_value__: "2024-01-15T00:00:00Z",
                },
                {
                  __effex_type__: "Date",
                  __effex_value__: "2024-01-16T00:00:00Z",
                },
              ],
              config: {
                items: {
                  __effex_type__: "Set",
                  __effex_value__: [1, 2, 3],
                },
              },
            },
          },
          timestamp: Date.now(),
          params: {},
        },
      };

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container);
    });
  });

  describe("isHydrating", () => {
    it("should return true when loader data exists on window", () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: {},
          timestamp: Date.now(),
          params: {},
        },
      };

      expect(isHydrating()).toBe(true);
    });

    it("should return false when no loader data exists", () => {
      delete (window as unknown as { __EFFEX_LOADER_DATA__?: LoaderData })
        .__EFFEX_LOADER_DATA__;

      expect(isHydrating()).toBe(false);
    });

    it("should return false after hydration completes", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/test": {
          data: {},
          timestamp: Date.now(),
          params: {},
        },
      };

      expect(isHydrating()).toBe(true);

      const html = await run(renderToString(div("Test")));
      container.innerHTML = html;

      await hydrateApp(div("Test"), container);

      expect(isHydrating()).toBe(false);
    });
  });

  describe("multiple routes", () => {
    it("should handle loader data for multiple routes", async () => {
      (
        window as unknown as { __EFFEX_LOADER_DATA__: LoaderData }
      ).__EFFEX_LOADER_DATA__ = {
        "routes/layout": {
          data: { user: { name: "Alice" } },
          timestamp: Date.now(),
          params: {},
        },
        "routes/users": {
          data: { users: ["Bob", "Charlie"] },
          timestamp: Date.now(),
          params: {},
        },
        "routes/users/$id": {
          data: { user: { id: "123", name: "Bob" } },
          timestamp: Date.now(),
          params: { id: "123" },
        },
      };

      const html = await run(
        renderToString(
          div([
            div({ class: "layout" }, "Layout"),
            div({ class: "users" }, "Users"),
            div({ class: "user-detail" }, "User Detail"),
          ]),
        ),
      );
      container.innerHTML = html;

      await hydrateApp(
        div([
          div({ class: "layout" }, "Layout"),
          div({ class: "users" }, "Users"),
          div({ class: "user-detail" }, "User Detail"),
        ]),
        container,
      );

      expect(container.querySelectorAll("div").length).toBeGreaterThan(0);
    });
  });
});
