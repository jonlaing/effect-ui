import { Effect, Option, Stream } from "effect";
import { describe, expect, it } from "vitest";

import type { Readable } from "@effex/core";
import { $, DOMRendererLive } from "@effex/dom";

import { matchRoute } from "./matchRoute";
import { makeRouterLayer } from "./RouterContext";
import type { BaseRouter } from "./types";

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
    layer: undefined as any,
  };
};

// Sample page components for testing
const HomePage = () => $.div({ id: "home" }, ["Home Page"]);
const AboutPage = () => $.div({ id: "about" }, ["About Page"]);
const UserPage = () => $.div({ id: "user" }, ["User Page"]);
const NotFoundPage = () => $.div({ id: "not-found" }, ["404 - Not Found"]);

describe("matchRoute", () => {
  it("should render the matched route", async () => {
    const router = createMockRouter({ currentRoute: "home" });
    const routerLayer = makeRouterLayer(router);

    const element = await runScoped(
      matchRoute({
        home: HomePage,
        about: AboutPage,
        _: NotFoundPage,
      }).pipe(Effect.provide(routerLayer), Effect.provide(DOMRendererLive)),
    );

    const homeDiv = (element as HTMLElement).querySelector("#home");
    expect(homeDiv).not.toBeNull();
    expect(homeDiv?.textContent).toBe("Home Page");
  });

  it("should render fallback when no route matches (Option.none)", async () => {
    const router = createMockRouter({ currentRoute: null });
    const routerLayer = makeRouterLayer(router);

    const element = await runScoped(
      matchRoute({
        home: HomePage,
        about: AboutPage,
        _: NotFoundPage,
      }).pipe(Effect.provide(routerLayer), Effect.provide(DOMRendererLive)),
    );

    const notFoundDiv = (element as HTMLElement).querySelector("#not-found");
    expect(notFoundDiv).not.toBeNull();
    expect(notFoundDiv?.textContent).toBe("404 - Not Found");
  });

  it("should render fallback when router context is not available", async () => {
    const element = await runScoped(
      matchRoute({
        home: HomePage,
        _: NotFoundPage,
      }).pipe(Effect.provide(DOMRendererLive)),
    );

    const notFoundDiv = (element as HTMLElement).querySelector("#not-found");
    expect(notFoundDiv).not.toBeNull();
    expect(notFoundDiv?.textContent).toBe("404 - Not Found");
  });

  it("should match different routes", async () => {
    const router = createMockRouter({ currentRoute: "users_$id" });
    const routerLayer = makeRouterLayer(router);

    const element = await runScoped(
      matchRoute({
        home: HomePage,
        users_$id: UserPage,
        _: NotFoundPage,
      }).pipe(Effect.provide(routerLayer), Effect.provide(DOMRendererLive)),
    );

    const userDiv = (element as HTMLElement).querySelector("#user");
    expect(userDiv).not.toBeNull();
    expect(userDiv?.textContent).toBe("User Page");
  });

  it("should render fallback when route is unknown", async () => {
    const router = createMockRouter({ currentRoute: "unknown_route" });
    const routerLayer = makeRouterLayer(router);

    const element = await runScoped(
      matchRoute({
        home: HomePage,
        about: AboutPage,
        _: NotFoundPage,
      }).pipe(Effect.provide(routerLayer), Effect.provide(DOMRendererLive)),
    );

    const notFoundDiv = (element as HTMLElement).querySelector("#not-found");
    expect(notFoundDiv).not.toBeNull();
  });
});
