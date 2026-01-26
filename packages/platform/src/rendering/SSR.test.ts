import { Effect, Option } from "effect";
import { describe, expect, it } from "vitest";

import { $, collect, div } from "@effex/dom";

import { performSSR, type SSRResult, type SSRRouter } from "./SSR";

const createMockSSRRouter = (options?: {
  currentRoute?: string | null;
  loaderResult?: { routeName: string; params: unknown; data: unknown } | null;
  pathname?: string;
}): SSRRouter<never, never, never, never> => {
  const {
    currentRoute = "home",
    loaderResult = { routeName: "home", params: {}, data: null },
    pathname = "/",
  } = options ?? {};

  let currentPathname = pathname;

  return {
    currentRoute: {
      get: Effect.succeed(
        currentRoute === null ? Option.none() : Option.some(currentRoute),
      ),
    },
    executeLoader: () => Effect.succeed(loaderResult),
    executeAction: () => Effect.succeed(null),
    pathname: {
      get: Effect.succeed(currentPathname),
      set: (path: string) =>
        Effect.sync(() => {
          currentPathname = path;
        }),
    },
  };
};

const TestComponent = () => div({ id: "test" }, $.of("Hello, SSR!"));

const ComponentWithClass = () =>
  div({ class: "my-class" }, $.of("Styled content"));

describe("ssr", () => {
  describe("performSSR", () => {
    it("should render a simple component to HTML", async () => {
      const request = new Request("http://localhost/");
      const element = TestComponent();

      const result = await Effect.runPromise(
        performSSR(request, element, undefined, undefined),
      );

      expect(result.html).toContain("Hello, SSR!");
      expect(result.html).toContain('id="test"');
    });

    it("should include empty loader data when no router provided", async () => {
      const request = new Request("http://localhost/");
      const element = TestComponent();

      const result = await Effect.runPromise(
        performSSR(request, element, undefined, undefined),
      );

      expect(result.loaderData).toEqual({});
      expect(result.loaderDataScript).toBe("{}");
    });

    it("should include loader data from router", async () => {
      const router = createMockSSRRouter({
        loaderResult: {
          routeName: "users",
          params: { id: "123" },
          data: { name: "Alice", email: "alice@example.com" },
        },
      });
      const request = new Request("http://localhost/users/123");
      const element = TestComponent();

      const result = await Effect.runPromise(
        performSSR(request, element, router, undefined),
      );

      expect(result.loaderData).toHaveProperty("users");
      expect(result.loaderData.users.data).toEqual({
        name: "Alice",
        email: "alice@example.com",
      });
    });

    it("should set router pathname from request URL", async () => {
      let capturedPathname = "";
      const router: SSRRouter<never, never, never, never> = {
        currentRoute: { get: Effect.succeed(Option.some("test")) },
        executeLoader: () =>
          Effect.succeed({ routeName: "test", params: {}, data: null }),
        executeAction: () => Effect.succeed(null),
        pathname: {
          get: Effect.succeed("/"),
          set: (path: string) =>
            Effect.sync(() => {
              capturedPathname = path;
            }),
        },
      };

      const request = new Request("http://localhost/users/123?query=test");
      const element = TestComponent();

      await Effect.runPromise(performSSR(request, element, router, undefined));

      expect(capturedPathname).toBe("/users/123");
    });

    it("should return null action data for GET requests", async () => {
      const request = new Request("http://localhost/", { method: "GET" });
      const element = TestComponent();

      const result = await Effect.runPromise(
        performSSR(request, element, undefined, undefined),
      );

      expect(result.actionData).toBeNull();
      expect(result.actionDataScript).toBe("null");
    });

    it("should include platform context", async () => {
      const request = new Request("http://localhost/");
      const element = TestComponent();

      const result = await Effect.runPromise(
        performSSR(request, element, undefined, undefined),
      );

      expect(result.platformContext).toBeDefined();
      expect(result.platformContext.environment).toBe("server");
    });

    it("should include response headers", async () => {
      const request = new Request("http://localhost/");
      const element = TestComponent();

      const result = await Effect.runPromise(
        performSSR(request, element, undefined, undefined),
      );

      expect(result.headers).toBeInstanceOf(Headers);
    });

    it("should serialize loader data for HTML embedding", async () => {
      const router = createMockSSRRouter({
        loaderResult: {
          routeName: "test",
          params: {},
          data: { message: "Hello" },
        },
      });
      const request = new Request("http://localhost/");
      const element = TestComponent();

      const result = await Effect.runPromise(
        performSSR(request, element, router, undefined),
      );

      expect(typeof result.loaderDataScript).toBe("string");
      expect(result.loaderDataScript).toContain("test");
    });

    it("should render component with attributes", async () => {
      const request = new Request("http://localhost/");
      const element = ComponentWithClass();

      const result = await Effect.runPromise(
        performSSR(request, element, undefined, undefined),
      );

      expect(result.html).toContain('class="my-class"');
      expect(result.html).toContain("Styled content");
    });

    it("should handle components with children", async () => {
      const ParentComponent = () =>
        div(
          { id: "parent" },
          collect(
            div({ id: "child1" }, $.of("Child 1")),
            div({ id: "child2" }, $.of("Child 2")),
          ),
        );

      const request = new Request("http://localhost/");
      const element = ParentComponent();

      const result = await Effect.runPromise(
        performSSR(request, element, undefined, undefined),
      );

      expect(result.html).toContain('id="parent"');
      expect(result.html).toContain('id="child1"');
      expect(result.html).toContain('id="child2"');
      expect(result.html).toContain("Child 1");
      expect(result.html).toContain("Child 2");
    });
  });

  describe("SSRResult", () => {
    it("should have correct structure", () => {
      const result: SSRResult = {
        html: "<div>Test</div>",
        loaderData: {
          route1: { data: { foo: "bar" }, timestamp: 123, params: {} },
        },
        loaderDataScript: '{"route1":{}}',
        actionData: null,
        actionDataScript: "null",
        headers: new Headers(),
        platformContext: {
          environment: "server" as const,
          responseHeaders: new Headers(),
          cookies: {
            get: () => Effect.succeed(undefined),
            getAll: () => Effect.succeed({}),
            set: () => Effect.void,
            delete: () => Effect.void,
          },
          request: new Request("http://localhost/"),
        },
      };

      expect(result.html).toBe("<div>Test</div>");
      expect(result.loaderData).toHaveProperty("route1");
      expect(result.actionData).toBeNull();
      expect(result.platformContext.environment).toBe("server");
    });

    it("should allow action data when present", () => {
      const result: SSRResult = {
        html: "<div>Test</div>",
        loaderData: {},
        loaderDataScript: "{}",
        actionData: {
          routeName: "create",
          data: { id: 1 },
          timestamp: Date.now(),
        },
        actionDataScript: '{"routeName":"create"}',
        headers: new Headers(),
        platformContext: {
          environment: "server" as const,
          responseHeaders: new Headers(),
          cookies: {
            get: () => Effect.succeed(undefined),
            getAll: () => Effect.succeed({}),
            set: () => Effect.void,
            delete: () => Effect.void,
          },
          request: new Request("http://localhost/"),
        },
      };

      expect(result.actionData).not.toBeNull();
      expect(result.actionData?.routeName).toBe("create");
    });
  });

  describe("SSRRouter", () => {
    it("should define correct interface", () => {
      const router = createMockSSRRouter();

      expect(router.currentRoute).toBeDefined();
      expect(router.executeLoader).toBeDefined();
      expect(router.executeAction).toBeDefined();
      expect(router.pathname).toBeDefined();
      expect(router.pathname.get).toBeDefined();
      expect(router.pathname.set).toBeDefined();
    });

    it("should extend ActionRouter", async () => {
      const router = createMockSSRRouter({ currentRoute: "test" });

      // ActionRouter properties
      const currentRoute = await Effect.runPromise(router.currentRoute.get);
      expect(Option.isSome(currentRoute)).toBe(true);

      // executeAction returns Effect with unknown requirements, so we need to cast
      const actionResult = await Effect.runPromise(
        router.executeAction(
          "test",
          new FormData(),
          new Request("http://localhost/"),
        ) as Effect.Effect<{ routeName: string; data: unknown } | null>,
      );
      expect(actionResult).toBeNull();
    });
  });
});
