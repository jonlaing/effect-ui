import { describe, it, expect } from "vitest";
import { Effect, Option, Stream } from "effect";
import { Routes } from "./Routes";
import { makeRouterLayer } from "@effex/router";
import type { BaseRouter } from "@effex/router";
import type { Readable } from "@effex/core";
import { DOMRendererLive, div, component } from "@effex/dom";
import { Signal } from "@effex/core";

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
const createMockRouter = (options?: {
  currentRoute?: string | null;
}): BaseRouter => {
  const { currentRoute = "home" } = options ?? {};

  return {
    pathname: makeTestReadable("/"),
    searchParams: makeTestReadable(new URLSearchParams()),
    currentRoute: makeTestReadable(
      currentRoute === null ? Option.none() : Option.some(currentRoute),
    ),
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
};

// Sample page components for testing
const HomePage = component("HomePage", () =>
  div({ id: "home" }, ["Home Page"]),
);
const AboutPage = component("AboutPage", () =>
  div({ id: "about" }, ["About Page"]),
);
const UserPage = component("UserPage", () =>
  div({ id: "user" }, ["User Page"]),
);
const NotFoundPage = component("NotFoundPage", () =>
  div({ id: "not-found" }, ["404 - Not Found"]),
);

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
      // Create a signal-based router for testing reactivity
      const currentRouteSignal = await Effect.runPromise(
        Effect.scoped(Signal.make<Option.Option<string>>(Option.some("home"))),
      );

      const router: BaseRouter = {
        pathname: makeTestReadable("/"),
        searchParams: makeTestReadable(new URLSearchParams()),
        currentRoute: currentRouteSignal,
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

      const routerLayer = makeRouterLayer(router);

      await runScoped(
        Effect.gen(function* () {
          const el = yield* Routes({ components: testComponents }).pipe(
            Effect.provide(routerLayer),
            Effect.provide(DOMRendererLive),
          );

          // Initially should show home
          expect(el.querySelector("#home")).not.toBeNull();
          expect(el.querySelector("#about")).toBeNull();

          // Change route
          yield* currentRouteSignal.set(Option.some("about"));
          yield* Effect.sleep(10);

          // Should now show about
          expect(el.querySelector("#home")).toBeNull();
          expect(el.querySelector("#about")).not.toBeNull();
        }),
      );
    });
  });
});
