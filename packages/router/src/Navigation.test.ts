import { Effect, Schema, Stream } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildPath,
  make as makeNavigation,
  Navigation,
  NavigationContext,
} from "./Navigation.js";
import { Route } from "./Route.js";
import { concat, empty, fallback } from "./Router.js";

// Helper to create a simple render function for tests
const render = () => Effect.succeed(document.createElement("div"));

// Mock window and history for tests
let mockPathname = "/";
let mockSearch = "";
const windowListeners = new Map<string, Set<EventListener>>();

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
  addEventListener: vi.fn((type: string, listener: EventListener) => {
    const set = windowListeners.get(type) ?? new Set();
    set.add(listener);
    windowListeners.set(type, set);
  }),
  removeEventListener: vi.fn((type: string, listener: EventListener) => {
    windowListeners.get(type)?.delete(listener);
  }),
};

// Simulate a browser event on the window mock.
const dispatchWindowEvent = (type: string) => {
  const listeners = windowListeners.get(type);
  if (!listeners) return;
  const evt = { type } as Event;
  for (const l of Array.from(listeners)) l(evt);
};

// Replace global window
vi.stubGlobal("window", mockWindow);

describe("Navigation", () => {
  beforeEach(() => {
    mockPathname = "/";
    mockSearch = "";
    windowListeners.clear();
    vi.clearAllMocks();
  });

  describe("buildPath", () => {
    it("builds path from route without params", () => {
      const route = Route.make("/users").pipe(Route.render(render));
      expect(buildPath(route, {})).toBe("/users");
    });

    it("replaces param segments with values", () => {
      const route = Route.make("/users/:id").pipe(Route.render(render));
      expect(buildPath(route, { id: "123" })).toBe("/users/123");
    });

    it("replaces multiple params", () => {
      const route = Route.make("/users/:userId/posts/:postId").pipe(
        Route.render(render),
      );
      expect(buildPath(route, { userId: "1", postId: "2" })).toBe(
        "/users/1/posts/2",
      );
    });

    it("appends search params", () => {
      const route = Route.make("/users").pipe(Route.render(render));
      expect(buildPath(route, {}, { page: "1", sort: "name" })).toBe(
        "/users?page=1&sort=name",
      );
    });

    it("handles both params and search params", () => {
      const route = Route.make("/users/:id").pipe(Route.render(render));
      expect(buildPath(route, { id: "123" }, { tab: "profile" })).toBe(
        "/users/123?tab=profile",
      );
    });

    it("encodes search param values", () => {
      const route = Route.make("/search").pipe(Route.render(render));
      expect(buildPath(route, {}, { q: "hello world" })).toBe(
        "/search?q=hello%20world",
      );
    });

    it("skips undefined search params", () => {
      const route = Route.make("/users").pipe(Route.render(render));
      expect(
        buildPath(
          route,
          {},
          { page: "1", sort: undefined as unknown as string },
        ),
      ).toBe("/users?page=1");
    });
  });

  describe("make", () => {
    it("creates navigation with initial pathname from options", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        concat(Route.make("/users").pipe(Route.render(render))),
      );

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, {
              initialPath: "/users",
            });
            return yield* nav.pathname.get;
          }),
        ),
      );

      expect(result).toBe("/users");
    });

    it("creates navigation with initial search params", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, {
              initialPath: "/",
              initialSearch: "?foo=bar&baz=qux",
            });
            const params = yield* nav.searchParams.get;
            return {
              foo: params.get("foo"),
              baz: params.get("baz"),
            };
          }),
        ),
      );

      expect(result.foo).toBe("bar");
      expect(result.baz).toBe("qux");
    });

    it("computes currentMatch from pathname", async () => {
      const HomeRoute = Route.make("/").pipe(Route.render(render));
      const UsersRoute = Route.make("/users").pipe(Route.render(render));

      const router = empty.pipe(concat(HomeRoute), concat(UsersRoute));

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, {
              initialPath: "/users",
            });
            const match = yield* nav.currentMatch.get;
            return match.route.path;
          }),
        ),
      );

      expect(result).toBe("/users");
    });

    it("falls back when no route matches", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        fallback(render),
      );

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, {
              initialPath: "/nonexistent",
            });
            const match = yield* nav.currentMatch.get;
            // When no route matches, currentMatch uses the fallback
            return match.route;
          }),
        ),
      );

      // The fallback is used when no route matches
      expect(result).toBe(router.fallback);
    });

    it("extracts params in currentMatch", async () => {
      const UserRoute = Route.make("/users/:id").pipe(Route.render(render));
      const router = empty.pipe(concat(UserRoute));

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, {
              initialPath: "/users/123",
            });
            const match = yield* nav.currentMatch.get;
            return match.params;
          }),
        ),
      );

      expect(result).toEqual({ id: "123" });
    });
  });

  describe("pushPath", () => {
    it("updates pathname state", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        concat(Route.make("/users").pipe(Route.render(render))),
      );

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });

            const before = yield* nav.pathname.get;
            yield* nav.pushPath("/users");
            const after = yield* nav.pathname.get;

            return { before, after };
          }),
        ),
      );

      expect(result.before).toBe("/");
      expect(result.after).toBe("/users");
    });

    it("calls history.pushState", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });
            yield* nav.pushPath("/users");
          }),
        ),
      );

      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        null,
        "",
        "/users",
      );
    });

    it("updates searchParams when path includes query string", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });
            yield* nav.pushPath("/search?q=test");

            const pathname = yield* nav.pathname.get;
            const params = yield* nav.searchParams.get;

            return { pathname, q: params.get("q") };
          }),
        ),
      );

      expect(result.pathname).toBe("/search");
      expect(result.q).toBe("test");
    });
  });

  describe("replacePath", () => {
    it("updates pathname state", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });
            yield* nav.replacePath("/users");
            return yield* nav.pathname.get;
          }),
        ),
      );

      expect(result).toBe("/users");
    });

    it("calls history.replaceState", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });
            yield* nav.replacePath("/users");
          }),
        ),
      );

      expect(mockWindow.history.replaceState).toHaveBeenCalledWith(
        null,
        "",
        "/users",
      );
    });
  });

  describe("pushRoute", () => {
    it("navigates to route with params", async () => {
      const UserRoute = Route.make("/users/:id").pipe(
        Route.render(render),
        Route.params(Schema.Struct({ id: Schema.NumberFromString })),
      );

      const router = empty.pipe(concat(UserRoute));

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });
            yield* nav.pushRoute(UserRoute, { params: { id: 123 } });
            return yield* nav.pathname.get;
          }),
        ),
      );

      expect(result).toBe("/users/123");
    });

    it("navigates to route with search params", async () => {
      const SearchRoute = Route.make("/search").pipe(
        Route.render(render),
        Route.searchParams(Schema.Struct({ q: Schema.String })),
      );

      const router = empty.pipe(concat(SearchRoute));

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });
            yield* nav.pushRoute(SearchRoute, { searchParams: { q: "test" } });

            const pathname = yield* nav.pathname.get;
            const params = yield* nav.searchParams.get;

            return { pathname, q: params.get("q") };
          }),
        ),
      );

      expect(result.pathname).toBe("/search");
      expect(result.q).toBe("test");
    });

    it("navigates to route without options", async () => {
      const HomeRoute = Route.make("/").pipe(Route.render(render));
      const router = empty.pipe(concat(HomeRoute));

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, {
              initialPath: "/other",
            });
            yield* nav.pushRoute(HomeRoute);
            return yield* nav.pathname.get;
          }),
        ),
      );

      expect(result).toBe("/");
    });
  });

  describe("replaceRoute", () => {
    it("replaces with route and params", async () => {
      const UserRoute = Route.make("/users/:id").pipe(Route.render(render));
      const router = empty.pipe(concat(UserRoute));

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });
            yield* nav.replaceRoute(UserRoute, { params: { id: "456" } });
          }),
        ),
      );

      expect(mockWindow.history.replaceState).toHaveBeenCalledWith(
        null,
        "",
        "/users/456",
      );
    });
  });

  describe("back and forward", () => {
    it("calls history.back()", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });
            yield* nav.back();
          }),
        ),
      );

      expect(mockWindow.history.back).toHaveBeenCalled();
    });

    it("calls history.forward()", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });
            yield* nav.forward();
          }),
        ),
      );

      expect(mockWindow.history.forward).toHaveBeenCalled();
    });
  });

  describe("popstate handling", () => {
    it("adds popstate listener on creation", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            yield* makeNavigation(router, { initialPath: "/" });
            expect(mockWindow.addEventListener).toHaveBeenCalledWith(
              "popstate",
              expect.any(Function),
            );
          }),
        ),
      );
    });

    it("removes popstate listener on scope close", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            yield* makeNavigation(router, { initialPath: "/" });
          }),
        ),
      );

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith(
        "popstate",
        expect.any(Function),
      );
    });
  });

  describe("SSR mode", () => {
    it("works without window when using initialPath", async () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      globalThis.window = undefined;

      try {
        const router = empty.pipe(
          concat(Route.make("/").pipe(Route.render(render))),
          concat(Route.make("/users/:id").pipe(Route.render(render))),
        );

        const result = await Effect.runPromise(
          Effect.scoped(
            Effect.gen(function* () {
              const nav = yield* makeNavigation(router, {
                initialPath: "/users/123",
                initialSearch: "?tab=profile",
              });

              const pathname = yield* nav.pathname.get;
              const match = yield* nav.currentMatch.get;
              const params = yield* nav.searchParams.get;

              return {
                pathname,
                matchPath: match.route.path,
                matchParams: match.params,
                tab: params.get("tab"),
              };
            }),
          ),
        );

        expect(result.pathname).toBe("/users/123");
        expect(result.matchPath).toBe("/users/:id");
        expect(result.matchParams).toEqual({ id: "123" });
        expect(result.tab).toBe("profile");
      } finally {
        globalThis.window = originalWindow;
      }
    });

    it("defaults to / when window is undefined and no options", async () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      globalThis.window = undefined;

      try {
        const router = empty.pipe(
          concat(Route.make("/").pipe(Route.render(render))),
        );

        const result = await Effect.runPromise(
          Effect.scoped(
            Effect.gen(function* () {
              const nav = yield* makeNavigation(router);
              return yield* nav.pathname.get;
            }),
          ),
        );

        expect(result).toBe("/");
      } finally {
        globalThis.window = originalWindow;
      }
    });

    it("navigation methods are no-op in SSR mode", async () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      globalThis.window = undefined;

      try {
        const router = empty.pipe(
          concat(Route.make("/").pipe(Route.render(render))),
        );

        // These should not throw
        await Effect.runPromise(
          Effect.scoped(
            Effect.gen(function* () {
              const nav = yield* makeNavigation(router, { initialPath: "/" });
              yield* nav.pushPath("/users");
              yield* nav.replacePath("/posts");
              yield* nav.back();
              yield* nav.forward();

              // But state should still update
              const pathname = yield* nav.pathname.get;
              expect(pathname).toBe("/posts");
            }),
          ),
        );
      } finally {
        globalThis.window = originalWindow;
      }
    });
  });

  describe("Navigation module exports", () => {
    it("exports all functions via Navigation namespace", () => {
      expect(Navigation.buildPath).toBe(buildPath);
      expect(Navigation.make).toBeDefined();
      expect(Navigation.makeLayer).toBeDefined();
      expect(Navigation.Context).toBe(NavigationContext);
      expect(Navigation.pathname).toBeDefined();
      expect(Navigation.searchParams).toBeDefined();
      expect(Navigation.currentMatch).toBeDefined();
      expect(Navigation.pushPath).toBeDefined();
      expect(Navigation.replacePath).toBeDefined();
      expect(Navigation.back).toBeDefined();
      expect(Navigation.forward).toBeDefined();
    });
  });

  describe("accessor effects", () => {
    it("Navigation.pathname gets current pathname", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );
      const layer = Navigation.makeLayer(router, { initialPath: "/test" });

      const result = await Effect.runPromise(
        Navigation.pathname.pipe(Effect.provide(layer)),
      );

      expect(result).toBe("/test");
    });

    it("Navigation.searchParams gets current search params", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );
      const layer = Navigation.makeLayer(router, {
        initialPath: "/",
        initialSearch: "?foo=bar",
      });

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const params = yield* Navigation.searchParams;
          return params.get("foo");
        }).pipe(Effect.provide(layer)),
      );

      expect(result).toBe("bar");
    });

    it("Navigation.currentMatch gets current match", async () => {
      const UserRoute = Route.make("/users/:id").pipe(Route.render(render));
      const router = empty.pipe(concat(UserRoute));
      const layer = Navigation.makeLayer(router, { initialPath: "/users/42" });

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const match = yield* Navigation.currentMatch;
          return match.params;
        }).pipe(Effect.provide(layer)),
      );

      expect(result).toEqual({ id: "42" });
    });

    it("Navigation.pushPath navigates via context", async () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );
      const layer = Navigation.makeLayer(router, { initialPath: "/" });

      await Effect.runPromise(
        Effect.gen(function* () {
          yield* Navigation.pushPath("/users");
          const pathname = yield* Navigation.pathname;
          expect(pathname).toBe("/users");
        }).pipe(Effect.provide(layer)),
      );
    });
  });

  describe("popstate (browser back/forward)", () => {
    it("updates the pathname signal when the browser fires popstate", async () => {
      // Signal.set uses SubscriptionRef which involves semaphore permits
      // — Effect flags that as async-capable, so Effect.runSync would
      // fail silently from a browser event handler. The popstate handler
      // uses the layer's captured Runtime + runFork instead, so the
      // update goes through even though it isn't purely sync.
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        concat(Route.make("/about").pipe(Route.render(render))),
      );

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });

            yield* nav.pushPath("/about");
            expect(yield* nav.pathname.get).toBe("/about");

            // Browser back: URL updates FIRST, then popstate fires.
            mockPathname = "/";
            mockSearch = "";
            dispatchWindowEvent("popstate");

            // runFork is async — yield the microtask queue so the update
            // completes before we assert.
            yield* Effect.sleep("5 millis");
            expect(yield* nav.pathname.get).toBe("/");
          }),
        ),
      );
    });

    it("popstate notifies subscribers (Outlet-shaped)", async () => {
      // The core regression from the SSG dev-mode report: signal.set was
      // silently failing under Effect.runSync, so subscribers never got
      // the update — which is why Outlet's reconcile didn't re-render on
      // browser back. This test drives the exact pattern: subscribe to
      // pathname.changes the way Outlet does, verify the change fires.
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        concat(Route.make("/about").pipe(Route.render(render))),
      );

      const seen: string[] = [];

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, { initialPath: "/" });

            const scope = yield* Effect.scope;
            yield* Stream.runForEach(nav.pathname.changes, (v) =>
              Effect.sync(() => {
                seen.push(v);
              }),
            ).pipe(Effect.forkIn(scope));

            // Let the subscription attach.
            yield* Effect.sleep("5 millis");

            yield* nav.pushPath("/about");
            yield* Effect.sleep("5 millis");

            mockPathname = "/";
            mockSearch = "";
            dispatchWindowEvent("popstate");
            yield* Effect.sleep("5 millis");
          }),
        ),
      );

      expect(seen).toContain("/about");
      expect(seen).toContain("/");
    });

    it("popstate handler doesn't throw or silently fail", async () => {
      // The pre-fix bug surfaced with no errors in either client or
      // server logs. Verify the handler runs without throwing so if it
      // ever regresses to that state, this test catches it.
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      let thrown: unknown = null;
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            yield* makeNavigation(router, { initialPath: "/" });

            mockPathname = "/other";
            try {
              dispatchWindowEvent("popstate");
            } catch (e) {
              thrown = e;
            }
            yield* Effect.sleep("5 millis");
          }),
        ),
      );

      expect(thrown).toBeNull();
    });

    it("updates search params on popstate", async () => {
      // Preserved from the pre-runFork tests — verifies the searchParams
      // signal also updates on popstate, in addition to pathname.
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const nav = yield* makeNavigation(router, {
              initialPath: "/",
              initialSearch: "",
            });

            yield* nav.pushPath("/?tab=profile");
            expect((yield* nav.searchParams.get).get("tab")).toBe("profile");

            mockPathname = "/";
            mockSearch = "";
            dispatchWindowEvent("popstate");
            yield* Effect.sleep("5 millis");

            expect((yield* nav.searchParams.get).get("tab")).toBeNull();
          }),
        ),
      );
    });
  });
});
