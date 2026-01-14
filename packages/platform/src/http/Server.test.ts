import { Effect, Option, Stream } from "effect";
import { describe, expect, it } from "vitest";

import type { Readable } from "@effex/core";
import { div } from "@effex/dom";
import { makeRouterLayer, type BaseRouter } from "@effex/router";

import type { SSRRouter } from "../rendering/SSR";
import { EffexServer, renderRequest } from "./Server";

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

// Mock BaseRouter for component rendering
// Note: We use `unknown` cast here because BaseRouter.layer is self-referential
const createMockBaseRouter = (options?: {
  currentRoute?: string;
}): BaseRouter => {
  const { currentRoute = "home" } = options ?? {};

  // Create partial router first (all properties except layer)
  const partialRouter = {
    pathname: makeTestReadable("/"),
    searchParams: makeTestReadable(new URLSearchParams()),
    currentRoute: makeTestReadable(Option.some(currentRoute)),
    loaderState: makeTestReadable({
      routeName: currentRoute,
      params: {},
      data: null,
      isLoading: false,
      error: null,
    }),
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
    submitAction: () => Effect.succeed(null),
  };

  // Create layer then combine into full router using Object.assign
  const layer = makeRouterLayer(partialRouter as unknown as BaseRouter);
  return Object.assign({}, partialRouter, { layer }) as BaseRouter;
};

// Mock SSRRouter for server-side rendering
const createMockSSRRouter = (): SSRRouter<never, never, never, never> => ({
  executeLoader: () =>
    Effect.succeed({ routeName: "home", params: {}, data: null }),
  executeAction: () => Effect.succeed(null),
  currentRoute: { get: Effect.succeed(Option.some("home")) },
  pathname: {
    get: Effect.succeed("/"),
    set: () => Effect.void,
  },
});

// Simple test component
const TestApp = () =>
  Effect.gen(function* () {
    return yield* div({ id: "app" }, ["Hello, World!"]);
  });

describe("EffexServer", () => {
  describe("makeHttpApp", () => {
    it("should create an HttpApp with correct options structure", () => {
      const router = createMockBaseRouter();
      const routerLayer = makeRouterLayer(router);

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

    it("should accept SSR router option", () => {
      const ssrRouter = createMockSSRRouter();

      const options = {
        app: () => TestApp(),
        router: ssrRouter,
      };

      expect(options.router).toBeDefined();
      expect(options.router.executeLoader).toBeDefined();
      expect(options.router.executeAction).toBeDefined();
    });

    it("should return an HttpApp", () => {
      const router = createMockBaseRouter();
      const routerLayer = makeRouterLayer(router);

      const app = EffexServer.makeHttpApp({
        app: () => TestApp().pipe(Effect.provide(routerLayer)),
      });

      expect(app).toBeDefined();
      expect(Effect.isEffect(app)).toBe(true);
    });
  });

  describe("makeRouter", () => {
    it("should create an HttpRouter", () => {
      const router = createMockBaseRouter();
      const routerLayer = makeRouterLayer(router);

      const httpRouter = EffexServer.makeRouter({
        app: () => TestApp().pipe(Effect.provide(routerLayer)),
      });

      expect(httpRouter).toBeDefined();
    });

    it("should accept document options", () => {
      const router = createMockBaseRouter();
      const routerLayer = makeRouterLayer(router);

      const httpRouter = EffexServer.makeRouter({
        app: () => TestApp().pipe(Effect.provide(routerLayer)),
        document: {
          title: "My App",
          scripts: ["/app.js"],
          styles: ["/app.css"],
        },
      });

      expect(httpRouter).toBeDefined();
    });
  });

  describe("makeFullApp", () => {
    it("should accept staticPaths option", () => {
      const router = createMockBaseRouter();
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

    it("should work without staticPaths", () => {
      const router = createMockBaseRouter();
      const routerLayer = makeRouterLayer(router);

      const app = EffexServer.makeFullApp({
        app: () => TestApp().pipe(Effect.provide(routerLayer)),
      });

      expect(app).toBeDefined();
    });
  });

  describe("renderRequest", () => {
    it("should render a request to HTML string", async () => {
      const request = new Request("http://localhost/");

      const html = await Effect.runPromise(
        Effect.scoped(
          renderRequest(request, {
            app: TestApp(),
          }),
        ),
      );

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Hello, World!");
      expect(html).toContain('id="app"');
    });

    it("should use document options", async () => {
      const request = new Request("http://localhost/");

      const html = await Effect.runPromise(
        Effect.scoped(
          renderRequest(request, {
            app: TestApp(),
            document: {
              title: "Custom Title",
              scripts: ["/bundle.js"],
            },
          }),
        ),
      );

      expect(html).toContain("<title>Custom Title</title>");
      expect(html).toContain('src="/bundle.js"');
    });

    it("should accept SSR router", async () => {
      const ssrRouter = createMockSSRRouter();
      const request = new Request("http://localhost/");

      const html = await Effect.runPromise(
        Effect.scoped(
          renderRequest(request, {
            app: TestApp(),
            router: ssrRouter,
          }),
        ),
      );

      expect(html).toContain("Hello, World!");
    });

    it("should include hydration scripts", async () => {
      const request = new Request("http://localhost/");

      const html = await Effect.runPromise(
        Effect.scoped(
          renderRequest(request, {
            app: TestApp(),
          }),
        ),
      );

      expect(html).toContain("window.__EFFEX_LOADER_DATA__");
      expect(html).toContain("window.__EFFEX_ACTION_DATA__");
    });
  });

  describe("EffexServer namespace", () => {
    it("should export all server utilities", () => {
      expect(EffexServer.makeHttpApp).toBeDefined();
      expect(EffexServer.makeRouter).toBeDefined();
      expect(EffexServer.makeFullApp).toBeDefined();
      expect(EffexServer.renderRequest).toBeDefined();
    });

    it("should have renderRequest as both export and namespace member", () => {
      expect(renderRequest).toBe(EffexServer.renderRequest);
    });
  });
});
