import { Effect, Layer } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DOMRendererLive } from "@effex/dom";

import { Link, type LinkProps } from "./Link.js";
import { Navigation } from "./Navigation.js";
import { Route } from "./Route.js";
import { concat, empty } from "./Router.js";

// Helper render function
const render = () => Effect.succeed(document.createElement("div"));

// Mock window and history for tests
let mockPathname = "/";
let mockSearch = "";

const mockWindow = {
  location: {
    get pathname() {
      return mockPathname;
    },
    get search() {
      return mockSearch;
    },
    origin: "http://localhost",
  },
  history: {
    pushState: vi.fn((_state: unknown, _title: string, url: string) => {
      const urlObj = new URL(url, "http://localhost");
      mockPathname = urlObj.pathname;
      mockSearch = urlObj.search;
    }),
    replaceState: vi.fn((_state: unknown, _title: string, url: string) => {
      const urlObj = new URL(url, "http://localhost");
      mockPathname = urlObj.pathname;
      mockSearch = urlObj.search;
    }),
    back: vi.fn(),
    forward: vi.fn(),
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

vi.stubGlobal("window", mockWindow);

describe("Link", () => {
  beforeEach(() => {
    mockPathname = "/";
    mockSearch = "";
    vi.clearAllMocks();
  });

  const renderLink = async (props: LinkProps, initialPath = "/") => {
    const router = empty.pipe(
      concat(Route.make("/").pipe(Route.render(render))),
      concat(Route.make("/users").pipe(Route.render(render))),
      concat(Route.make("/users/:id").pipe(Route.render(render))),
    );
    const navLayer = Navigation.makeLayer(router, { initialPath });
    const layer = Layer.merge(navLayer, DOMRendererLive);

    return Effect.runPromise(
      Link(props, Effect.succeed("Click me")).pipe(
        Effect.scoped,
        Effect.provide(layer),
      ),
    );
  };

  describe("href rendering", () => {
    it("renders anchor with href prop", async () => {
      const el = await renderLink({ href: "/users" });

      expect(el.tagName).toBe("A");
      expect(el.getAttribute("href")).toBe("/users");
    });

    it("renders anchor with route-based navigation", async () => {
      const UserRoute = Route.make("/users/:id").pipe(Route.render(render));

      const router = empty.pipe(concat(UserRoute));
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });
      const layer = Layer.merge(navLayer, DOMRendererLive);

      const el = await Effect.runPromise(
        Link(
          { to: UserRoute as LinkProps["to"], params: { id: "123" } },
          Effect.succeed("User"),
        ).pipe(Effect.scoped, Effect.provide(layer)),
      );

      expect(el.getAttribute("href")).toBe("/users/123");
    });

    it("includes search params in href", async () => {
      const el = await renderLink({
        href: "/search",
        searchParams: { q: "test", page: "1" },
      });

      expect(el.getAttribute("href")).toBe("/search?q=test&page=1");
    });

    it("defaults to / when no href or to provided", async () => {
      const el = await renderLink({});
      expect(el.getAttribute("href")).toBe("/");
    });
  });

  describe("active state", () => {
    it("sets data-active-exact when path matches exactly", async () => {
      const el = await renderLink({ href: "/" }, "/");

      expect(el.getAttribute("data-active-exact")).toBe("true");
    });

    it("does not set data-active-exact when path differs", async () => {
      const el = await renderLink({ href: "/users" }, "/");

      expect(el.getAttribute("data-active-exact")).toBeNull();
    });

    it("sets data-active-prefix when path is prefix", async () => {
      const el = await renderLink({ href: "/users" }, "/users/123");

      expect(el.getAttribute("data-active-prefix")).toBe("true");
    });

    it("sets both data attributes when exact match", async () => {
      const el = await renderLink({ href: "/users" }, "/users");

      expect(el.getAttribute("data-active-exact")).toBe("true");
      expect(el.getAttribute("data-active-prefix")).toBe("true");
    });

    it("root path is prefix of all paths", async () => {
      const el = await renderLink({ href: "/" }, "/users/123");

      expect(el.getAttribute("data-active-prefix")).toBe("true");
      expect(el.getAttribute("data-active-exact")).toBeNull();
    });
  });

  describe("click handling", () => {
    it("calls pushPath on click for internal links", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });
      const layer = Layer.merge(navLayer, DOMRendererLive);

      // Create the event before running the effect so we can check it after
      const event = new MouseEvent("click", { bubbles: true, button: 0 });
      Object.defineProperty(event, "preventDefault", { value: vi.fn() });

      await Effect.runPromise(
        Effect.gen(function* () {
          const el = yield* Link({ href: "/users" }, Effect.succeed("Users"));

          // Dispatch click while scope is still active
          el.dispatchEvent(event);

          // Wait for effect to run
          yield* Effect.promise(() => new Promise((r) => setTimeout(r, 10)));
        }).pipe(Effect.scoped, Effect.provide(layer)),
      );

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockWindow.history.pushState).toHaveBeenCalled();
    });

    it("calls replacePath when replace prop is true", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });
      const layer = Layer.merge(navLayer, DOMRendererLive);

      const event = new MouseEvent("click", { bubbles: true, button: 0 });
      Object.defineProperty(event, "preventDefault", { value: vi.fn() });

      await Effect.runPromise(
        Effect.gen(function* () {
          const el = yield* Link(
            { href: "/users", replace: true },
            Effect.succeed("Users"),
          );

          el.dispatchEvent(event);
          yield* Effect.promise(() => new Promise((r) => setTimeout(r, 10)));
        }).pipe(Effect.scoped, Effect.provide(layer)),
      );

      expect(mockWindow.history.replaceState).toHaveBeenCalled();
    });

    it("does not prevent default for ctrl+click", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });
      const layer = Layer.merge(navLayer, DOMRendererLive);

      const event = new MouseEvent("click", {
        bubbles: true,
        button: 0,
        ctrlKey: true,
      });
      Object.defineProperty(event, "preventDefault", { value: vi.fn() });

      await Effect.runPromise(
        Effect.gen(function* () {
          const el = yield* Link({ href: "/users" }, Effect.succeed("Users"));

          el.dispatchEvent(event);
          yield* Effect.promise(() => new Promise((r) => setTimeout(r, 10)));
        }).pipe(Effect.scoped, Effect.provide(layer)),
      );

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("external links", () => {
    it("does not prevent default for external URLs", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });
      const layer = Layer.merge(navLayer, DOMRendererLive);

      const el = await Effect.runPromise(
        Link({ href: "https://example.com" }, Effect.succeed("External")).pipe(
          Effect.scoped,
          Effect.provide(layer),
        ),
      );

      expect(el.getAttribute("href")).toBe("https://example.com");
      // onClick should be undefined for external links, so no SPA navigation
    });

    it("does not prevent default for target=_blank", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });
      const layer = Layer.merge(navLayer, DOMRendererLive);

      const el = await Effect.runPromise(
        Link(
          { href: "/users", target: "_blank" },
          Effect.succeed("New Tab"),
        ).pipe(Effect.scoped, Effect.provide(layer)),
      );

      expect(el.getAttribute("target")).toBe("_blank");
    });
  });

  describe("standard attributes", () => {
    it("passes through class attribute", async () => {
      const el = await renderLink({ href: "/", class: "nav-link" });

      expect(el.className).toBe("nav-link");
    });

    it("passes through rel attribute", async () => {
      const el = await renderLink({ href: "/", rel: "noopener" });

      expect(el.getAttribute("rel")).toBe("noopener");
    });

    it("passes through id attribute", async () => {
      const el = await renderLink({ href: "/", id: "home-link" });

      expect(el.getAttribute("id")).toBe("home-link");
    });
  });
});
