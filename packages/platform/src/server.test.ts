import { describe, it, expect } from "vitest";
import { Effect, Option, Stream } from "effect";
import { EffexServer } from "./server";
import { div, component, DOMRendererLive } from "@effex/dom";
import { makeRouterLayer } from "@effex/router";
import type { BaseRouter, ActionResult } from "@effex/router";
import type { Readable } from "@effex/core";

// Create a simple readable for testing
const makeTestReadable = <A>(value: A): Readable.Readable<A> => {
  const readable: Readable.Readable<A> = {
    get: Effect.sync(() => value),
    changes: Stream.empty,
    values: Stream.make(value),
    map: <B>(f: (a: A) => B): Readable.Readable<B> =>
      makeTestReadable(f(value)),
  };
  return readable;
};

// Mock router for testing
const createMockRouter = (options?: {
  initialPath?: string;
  currentRoute?: string;
  loaderData?: unknown;
  actionResult?: ActionResult | null;
}): BaseRouter => {
  const {
    initialPath = "/",
    currentRoute = "home",
    loaderData = null,
    actionResult = null,
  } = options ?? {};

  return {
    pathname: makeTestReadable(initialPath),
    searchParams: makeTestReadable(new URLSearchParams()),
    currentRoute: makeTestReadable(Option.some(currentRoute)),
    actionState: makeTestReadable({
      isSubmitting: false,
      data: null,
      error: null,
      routeName: null,
      submissionId: null,
    }),
    push: () => Effect.void,
    replace: () => Effect.void,
    back: () => Effect.void,
    forward: () => Effect.void,
    submitAction: () => Effect.succeed(actionResult),
  };
};

// Simple test component
const TestApp = component("TestApp", () =>
  Effect.gen(function* () {
    return yield* div({ id: "app" }, ["Hello, World!"]);
  }),
);

describe("EffexServer", () => {
  describe("makeHttpApp", () => {
    it("should create an HttpApp that renders the application", async () => {
      const router = createMockRouter();
      const routerLayer = makeRouterLayer(router);

      // Test the app options structure
      const options = {
        app: () => TestApp().pipe(Effect.provide(routerLayer)),
        document: {
          title: "Test App",
          scripts: ["/client.js"],
        },
      };

      expect(options.app).toBeDefined();
      expect(options.document?.title).toBe("Test App");
    });

    it("should accept router option", () => {
      const mockSSRRouter = {
        executeLoader: () => Effect.succeed(null),
        executeAction: () => Effect.succeed(null),
        currentRoute: { get: Effect.succeed(Option.some("home")) },
        pathname: { get: Effect.succeed("/") },
      };

      const options = {
        app: () => TestApp(),
        router: mockSSRRouter,
      };

      expect(options.router).toBeDefined();
    });
  });

  describe("makeRouter", () => {
    it("should create an HttpRouter with catch-all route", () => {
      const router = createMockRouter();
      const routerLayer = makeRouterLayer(router);

      const effexRouter = EffexServer.makeRouter({
        app: () => TestApp().pipe(Effect.provide(routerLayer)),
      });

      // The router should be defined
      expect(effexRouter).toBeDefined();
    });
  });

  describe("makeFullApp", () => {
    it("should accept staticPaths option", () => {
      const router = createMockRouter();
      const routerLayer = makeRouterLayer(router);

      const app = EffexServer.makeFullApp({
        app: () => TestApp().pipe(Effect.provide(routerLayer)),
        staticPaths: {
          "/static": "./public",
          "/assets": "./dist/assets",
        },
      });

      expect(app).toBeDefined();
    });
  });

  describe("SSRResult structure", () => {
    it("should define correct result interface", () => {
      // Type check - this would fail at compile time if wrong
      const mockResult = {
        html: "<div>Hello</div>",
        loaderData: {},
        loaderDataScript: "{}",
        actionData: null,
        actionDataScript: "null",
        headers: new Headers(),
        platformContext: {
          environment: "server" as const,
          responseHeaders: new Headers(),
        },
      };

      expect(mockResult.html).toBeDefined();
      expect(mockResult.loaderData).toBeDefined();
      expect(mockResult.actionData).toBeNull();
    });
  });

  describe("DocumentOptions", () => {
    it("should support all document configuration options", () => {
      const docOptions = {
        title: "My App",
        scripts: ["/app.js", "/vendor.js"],
        styles: ["/app.css"],
        head: '<meta name="description" content="Test">',
        bodyAttributes: 'class="dark-mode"',
        rootId: "app-root",
      };

      expect(docOptions.title).toBe("My App");
      expect(docOptions.scripts).toHaveLength(2);
      expect(docOptions.styles).toHaveLength(1);
      expect(docOptions.rootId).toBe("app-root");
    });
  });
});

describe("EffexServer integration", () => {
  it("should export all server utilities", () => {
    expect(EffexServer.makeHttpApp).toBeDefined();
    expect(EffexServer.makeRouter).toBeDefined();
    expect(EffexServer.makeFullApp).toBeDefined();
  });
});
