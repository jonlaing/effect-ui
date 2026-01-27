import { Effect, Option, Stream } from "effect";
import { describe, expect, it } from "vitest";

import { Signal, type Readable } from "@effex/core";
import { $, collect, DOMRendererLive } from "@effex/dom";
import { makeRouterLayer, Outlet, type BaseRouter } from "@effex/router";

import { Routes } from "./Routes";

// Helper to run scoped effects with proper typing
const runScoped = <A>(effect: Effect.Effect<A, unknown, unknown>): Promise<A> =>
  Effect.runPromise(Effect.scoped(effect) as Effect.Effect<A, never, never>);

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
// Note: We use `unknown` cast here because BaseRouter.layer is self-referential
const createMockRouter = (options?: {
  currentRoute?: string | null;
  activeLayouts?: readonly string[];
}): BaseRouter => {
  const { currentRoute = "home", activeLayouts = [] } = options ?? {};

  // Create partial router first (all properties except layer)
  const partialRouter = {
    pathname: makeTestReadable("/"),
    searchParams: makeTestReadable(new URLSearchParams()),
    currentRoute: makeTestReadable(
      currentRoute === null ? Option.none() : Option.some(currentRoute),
    ),
    activeLayouts: makeTestReadable(activeLayouts),
    layouts: {},
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

// Sample page components for testing
const HomePage = () => $.div({ id: "home" }, $.of("Home Page"));
const AboutPage = () => $.div({ id: "about" }, $.of("About Page"));
const UserPage = () => $.div({ id: "user" }, $.of("User Page"));
const NotFoundPage = () => $.div({ id: "not-found" }, $.of("404 - Not Found"));

const testComponents = {
  home: HomePage,
  about: AboutPage,
  users_$id: UserPage,
};

describe("Routes", () => {
  describe("basic rendering", () => {
    it("should render the home component when currentRoute is 'home'", async () => {
      const router = createMockRouter({ currentRoute: "home" });
      const routerLayer = makeRouterLayer(router);

      const element = await runScoped(
        Routes({ components: testComponents }).pipe(
          Effect.provide(routerLayer),
          Effect.provide(DOMRendererLive),
        ),
      );

      // The container should have display:contents
      expect(element.style.display).toBe("contents");

      // Should contain the home page
      const homeDiv = element.querySelector("#home");
      expect(homeDiv).not.toBeNull();
      expect(homeDiv?.textContent).toBe("Home Page");
    });

    it("should render the about component when currentRoute is 'about'", async () => {
      const router = createMockRouter({ currentRoute: "about" });
      const routerLayer = makeRouterLayer(router);

      const element = await runScoped(
        Routes({ components: testComponents }).pipe(
          Effect.provide(routerLayer),
          Effect.provide(DOMRendererLive),
        ),
      );

      const aboutDiv = element.querySelector("#about");
      expect(aboutDiv).not.toBeNull();
      expect(aboutDiv?.textContent).toBe("About Page");
    });

    it("should render dynamic route component", async () => {
      const router = createMockRouter({ currentRoute: "users_$id" });
      const routerLayer = makeRouterLayer(router);

      const element = await runScoped(
        Routes({ components: testComponents }).pipe(
          Effect.provide(routerLayer),
          Effect.provide(DOMRendererLive),
        ),
      );

      const userDiv = element.querySelector("#user");
      expect(userDiv).not.toBeNull();
      expect(userDiv?.textContent).toBe("User Page");
    });
  });

  describe("fallback / 404", () => {
    it("should render empty div when no route matches and no fallback", async () => {
      const router = createMockRouter({ currentRoute: null });
      const routerLayer = makeRouterLayer(router);

      const element = await runScoped(
        Routes({ components: testComponents }).pipe(
          Effect.provide(routerLayer),
          Effect.provide(DOMRendererLive),
        ),
      );

      // The container has display:contents, fallback is rendered inside
      // When fallback is the default empty div, the container just has an empty div child
      expect(element.style.display).toBe("contents");
      // No route-specific content should be rendered
      expect(element.querySelector("#home")).toBeNull();
      expect(element.querySelector("#about")).toBeNull();
      expect(element.querySelector("#user")).toBeNull();
    });

    it("should render custom fallback when no route matches", async () => {
      const router = createMockRouter({ currentRoute: null });
      const routerLayer = makeRouterLayer(router);

      const element = await runScoped(
        Routes({
          components: testComponents,
          fallback: NotFoundPage,
        }).pipe(Effect.provide(routerLayer), Effect.provide(DOMRendererLive)),
      );

      const notFoundDiv = element.querySelector("#not-found");
      expect(notFoundDiv).not.toBeNull();
      expect(notFoundDiv?.textContent).toBe("404 - Not Found");
    });

    it("should render fallback when route is unknown", async () => {
      const router = createMockRouter({ currentRoute: "unknown_route" });
      const routerLayer = makeRouterLayer(router);

      const element = await runScoped(
        Routes({
          components: testComponents,
          fallback: NotFoundPage,
        }).pipe(Effect.provide(routerLayer), Effect.provide(DOMRendererLive)),
      );

      const notFoundDiv = element.querySelector("#not-found");
      expect(notFoundDiv).not.toBeNull();
    });
  });

  describe("reactive updates", () => {
    it("should update when currentRoute changes", async () => {
      // Create signal-based router for testing reactivity
      const currentRouteSignal = await Effect.runPromise(
        Effect.scoped(Signal.make<Option.Option<string>>(Option.some("home"))),
      );
      const loaderStateSignal = await Effect.runPromise(
        Effect.scoped(
          Signal.make({
            routeName: "home" as string | null,
            params: {},
            data: null,
            isLoading: false,
            error: null,
          }),
        ),
      );

      // Create partial router first (all properties except layer)
      const partialRouter = {
        pathname: makeTestReadable("/"),
        searchParams: makeTestReadable(new URLSearchParams()),
        currentRoute: currentRouteSignal,
        activeLayouts: makeTestReadable([] as readonly string[]),
        layouts: {},
        loaderState: loaderStateSignal,
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
      const router = Object.assign({}, partialRouter, { layer }) as BaseRouter;
      const routerLayer = router.layer;

      await runScoped(
        Effect.gen(function* () {
          const el = yield* Routes({ components: testComponents }).pipe(
            Effect.provide(routerLayer),
            Effect.provide(DOMRendererLive),
          );

          // Initially should show home
          expect(el.querySelector("#home")).not.toBeNull();
          expect(el.querySelector("#about")).toBeNull();

          // Change route and update loaderState together
          yield* currentRouteSignal.set(Option.some("about"));
          yield* loaderStateSignal.set({
            routeName: "about",
            params: {},
            data: null,
            isLoading: false,
            error: null,
          });
          yield* Effect.sleep(10);

          // Should now show about
          expect(el.querySelector("#home")).toBeNull();
          expect(el.querySelector("#about")).not.toBeNull();
        }),
      );
    });
  });

  describe("layouts", () => {
    // Layout components that use Outlet to render children
    const RootLayout = () =>
      $.div(
        { id: "root-layout" },
        collect(
          $.div({ id: "root-header" }, $.of("Header")),
          $.div({ id: "root-content" }, Outlet()),
          $.div({ id: "root-footer" }, $.of("Footer")),
        ),
      );

    const UsersLayout = () =>
      $.div(
        { id: "users-layout" },
        collect(
          $.span({ id: "users-sidebar" }, $.of("Users Sidebar")),
          $.div({ id: "users-content" }, Outlet()),
        ),
      );

    // Test layout components map
    const layoutComponents = {
      root_layout: RootLayout,
      users_layout: UsersLayout,
    };

    // Test route layouts map
    const routeLayouts = {
      home: ["root_layout"] as const,
      about: ["root_layout"] as const,
      users_$id: ["root_layout", "users_layout"] as const,
    };

    it("should wrap route component with single layout", async () => {
      const router = createMockRouter({ currentRoute: "home" });
      const routerLayer = makeRouterLayer(router);

      const element = await runScoped(
        Routes({
          components: testComponents,
          layoutComponents,
          routeLayouts,
        }).pipe(Effect.provide(routerLayer), Effect.provide(DOMRendererLive)),
      );

      // Should have root layout structure
      expect(element.querySelector("#root-layout")).not.toBeNull();
      expect(element.querySelector("#root-header")).not.toBeNull();
      expect(element.querySelector("#root-footer")).not.toBeNull();

      // Route content should be inside root-content (via Outlet)
      const rootContent = element.querySelector("#root-content");
      expect(rootContent).not.toBeNull();
      expect(rootContent?.querySelector("#home")).not.toBeNull();
    });

    it("should wrap route component with nested layouts", async () => {
      const router = createMockRouter({ currentRoute: "users_$id" });
      const routerLayer = makeRouterLayer(router);

      const element = await runScoped(
        Routes({
          components: testComponents,
          layoutComponents,
          routeLayouts,
        }).pipe(Effect.provide(routerLayer), Effect.provide(DOMRendererLive)),
      );

      // Should have root layout as outermost
      const rootLayout = element.querySelector("#root-layout");
      expect(rootLayout).not.toBeNull();

      // Users layout should be inside root layout's content area
      const rootContent = element.querySelector("#root-content");
      expect(rootContent).not.toBeNull();
      const usersLayout = rootContent?.querySelector("#users-layout");
      expect(usersLayout).not.toBeNull();

      // Route content should be inside users layout's content area
      const usersContent = element.querySelector("#users-content");
      expect(usersContent).not.toBeNull();
      expect(usersContent?.querySelector("#user")).not.toBeNull();
    });

    it("should render route without layouts if no layout mapping exists", async () => {
      // Create a route without any layout mapping
      const routeLayoutsPartial = {
        home: ["root_layout"] as const,
        // about has no layout mapping
      };

      const router = createMockRouter({ currentRoute: "about" });
      const routerLayer = makeRouterLayer(router);

      const element = await runScoped(
        Routes({
          components: testComponents,
          layoutComponents,
          routeLayouts: routeLayoutsPartial,
        }).pipe(Effect.provide(routerLayer), Effect.provide(DOMRendererLive)),
      );

      // Should render about page without any layout wrapper
      expect(element.querySelector("#root-layout")).toBeNull();
      expect(element.querySelector("#about")).not.toBeNull();
    });

    it("should work without layout props (backward compatibility)", async () => {
      const router = createMockRouter({ currentRoute: "home" });
      const routerLayer = makeRouterLayer(router);

      const element = await runScoped(
        Routes({
          components: testComponents,
          // No layoutComponents or routeLayouts provided
        }).pipe(Effect.provide(routerLayer), Effect.provide(DOMRendererLive)),
      );

      // Should render route directly without layouts
      expect(element.querySelector("#root-layout")).toBeNull();
      expect(element.querySelector("#home")).not.toBeNull();
    });
  });
});
