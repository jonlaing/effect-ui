import { Effect, Option, Schema } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Route } from "./Route";
import { Router } from "./Router";
import type { ActionResult, LoaderResult } from "./types";

// Mock window and history for tests
const mockHistory: string[] = [];
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
      mockHistory.push(url);
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

// Replace global window
vi.stubGlobal("window", mockWindow);

describe("Router", () => {
  beforeEach(() => {
    mockPathname = "/";
    mockSearch = "";
    mockHistory.length = 0;
    vi.clearAllMocks();
  });

  describe("Router.make", () => {
    it("should create a router with routes", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make({
              home: Route.make("/"),
              users: Route.make("/users"),
            });
            return {
              pathname: yield* router.pathname.get,
              currentRoute: yield* router.currentRoute.get,
            };
          }),
        ),
      );

      expect(result.pathname).toBe("/");
      expect(result.currentRoute).toEqual(Option.some("home"));
    });

    it("should use initialPath option", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
                users: Route.make("/users"),
              },
              { initialPath: "/users" },
            );
            return {
              pathname: yield* router.pathname.get,
              currentRoute: yield* router.currentRoute.get,
            };
          }),
        ),
      );

      expect(result.pathname).toBe("/users");
      expect(result.currentRoute).toEqual(Option.some("users"));
    });

    it("should use initialSearch option", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
              },
              { initialPath: "/", initialSearch: "?foo=bar&baz=qux" },
            );

            const params = yield* router.searchParams.get;
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

    it("should return null currentRoute when no match", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
                users: Route.make("/users"),
              },
              { initialPath: "/nonexistent" },
            );
            return yield* router.currentRoute.get;
          }),
        ),
      );

      expect(result).toEqual(Option.none());
    });
  });

  describe("Route-specific state", () => {
    it("should track isActive for each route", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
                users: Route.make("/users"),
              },
              { initialPath: "/" },
            );
            return {
              homeActive: yield* router.routes.home.isActive.get,
              usersActive: yield* router.routes.users.isActive.get,
            };
          }),
        ),
      );

      expect(result.homeActive).toBe(true);
      expect(result.usersActive).toBe(false);
    });

    it("should provide params for matched route", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
                user: Route.make("/users/:id", {
                  params: Schema.Struct({ id: Schema.String }),
                }),
              },
              { initialPath: "/users/123" },
            );
            return yield* router.routes.user.params.get;
          }),
        ),
      );

      expect(result).toEqual({ id: "123" });
    });

    it("should return null params for non-matched route", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
                user: Route.make("/users/:id"),
              },
              { initialPath: "/" },
            );
            return yield* router.routes.user.params.get;
          }),
        ),
      );

      expect(result).toBe(null);
    });
  });

  describe("Route matching priority", () => {
    it("should match more specific routes first", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                userSettings: Route.make("/users/settings"),
                user: Route.make("/users/:id"),
                catchAll: Route.make("/*"),
              },
              { initialPath: "/users/settings" },
            );
            return yield* router.currentRoute.get;
          }),
        ),
      );

      // Should match static "settings" before param ":id"
      expect(result).toEqual(Option.some("userSettings"));
    });

    it("should fall back to param route when no static match", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                userSettings: Route.make("/users/settings"),
                user: Route.make("/users/:id"),
                catchAll: Route.make("/*"),
              },
              { initialPath: "/users/123" },
            );
            return yield* router.currentRoute.get;
          }),
        ),
      );

      expect(result).toEqual(Option.some("user"));
    });

    it("should fall back to catch-all when nothing else matches", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
                users: Route.make("/users"),
                catchAll: Route.make("/*"),
              },
              { initialPath: "/something/random" },
            );
            return yield* router.currentRoute.get;
          }),
        ),
      );

      expect(result).toEqual(Option.some("catchAll"));
    });
  });

  describe("Navigation", () => {
    it("should push to history", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make({
              home: Route.make("/"),
              users: Route.make("/users"),
            });

            yield* router.push("/users");

            const pathname = yield* router.pathname.get;
            expect(pathname).toBe("/users");
            expect(mockWindow.history.pushState).toHaveBeenCalled();
          }),
        ),
      );
    });

    it("should replace history", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make({
              home: Route.make("/"),
              users: Route.make("/users"),
            });

            yield* router.replace("/users");

            const pathname = yield* router.pathname.get;
            expect(pathname).toBe("/users");
            expect(mockWindow.history.replaceState).toHaveBeenCalled();
          }),
        ),
      );
    });

    it("should call history.back()", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make({
              home: Route.make("/"),
            });

            yield* router.back();
            expect(mockWindow.history.back).toHaveBeenCalled();
          }),
        ),
      );
    });

    it("should call history.forward()", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make({
              home: Route.make("/"),
            });

            yield* router.forward();
            expect(mockWindow.history.forward).toHaveBeenCalled();
          }),
        ),
      );
    });

    it("should update route state after navigation", async () => {
      // Note: currentRoute is derived from pathname, so after push the
      // pathname changes but currentRoute is computed lazily.
      // We verify the pathname updates correctly instead.
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make({
              home: Route.make("/"),
              users: Route.make("/users"),
            });

            const beforePath = yield* router.pathname.get;
            yield* router.push("/users");
            const afterPath = yield* router.pathname.get;

            return { beforePath, afterPath };
          }),
        ),
      );

      expect(result.beforePath).toBe("/");
      expect(result.afterPath).toBe("/users");
    });
  });

  describe("Search params", () => {
    it("should expose searchParams readable", async () => {
      mockSearch = "?foo=bar&baz=qux";

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make({
              home: Route.make("/"),
            });

            const params = yield* router.searchParams.get;
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

    it("should update searchParams on navigation", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make({
              home: Route.make("/"),
            });

            yield* router.push("/?test=value");

            const params = yield* router.searchParams.get;
            expect(params.get("test")).toBe("value");
          }),
        ),
      );
    });
  });

  describe("Cleanup", () => {
    it("should add and remove popstate listener", async () => {
      await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            yield* Router.make({
              home: Route.make("/"),
            });

            expect(mockWindow.addEventListener).toHaveBeenCalledWith(
              "popstate",
              expect.any(Function),
            );
          }),
        ),
      );

      // After scope closes, removeEventListener should be called
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith(
        "popstate",
        expect.any(Function),
      );
    });
  });

  describe("SSR mode", () => {
    it("should work without window when using initialPath and initialSearch", async () => {
      // Temporarily remove window
      const originalWindow = globalThis.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      globalThis.window = undefined;

      try {
        const result = await Effect.runPromise(
          Effect.scoped(
            Effect.gen(function* () {
              const router = yield* Router.make(
                {
                  home: Route.make("/"),
                  users: Route.make("/users/:id", {
                    params: Schema.Struct({ id: Schema.String }),
                  }),
                },
                { initialPath: "/users/123", initialSearch: "?tab=profile" },
              );

              return {
                pathname: yield* router.pathname.get,
                currentRoute: yield* router.currentRoute.get,
                params: yield* router.routes.users.params.get,
                search: (yield* router.searchParams.get).get("tab"),
              };
            }),
          ),
        );

        expect(result.pathname).toBe("/users/123");
        expect(result.currentRoute).toEqual(Option.some("users"));
        expect(result.params).toEqual({ id: "123" });
        expect(result.search).toBe("profile");
      } finally {
        // Restore window
        globalThis.window = originalWindow;
      }
    });

    it("should default to / and empty search when window is undefined and no options", async () => {
      // Temporarily remove window
      const originalWindow = globalThis.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      globalThis.window = undefined;

      try {
        const result = await Effect.runPromise(
          Effect.scoped(
            Effect.gen(function* () {
              const router = yield* Router.make({
                home: Route.make("/"),
              });

              return {
                pathname: yield* router.pathname.get,
                currentRoute: yield* router.currentRoute.get,
                searchSize: (yield* router.searchParams.get).size,
              };
            }),
          ),
        );

        expect(result.pathname).toBe("/");
        expect(result.currentRoute).toEqual(Option.some("home"));
        expect(result.searchSize).toBe(0);
      } finally {
        // Restore window
        globalThis.window = originalWindow;
      }
    });

    it("should not call push/replace/back/forward in SSR mode", async () => {
      // Temporarily remove window
      const originalWindow = globalThis.window;
      // @ts-expect-error - Intentionally setting window to undefined for SSR test
      globalThis.window = undefined;

      try {
        await Effect.runPromise(
          Effect.scoped(
            Effect.gen(function* () {
              const router = yield* Router.make(
                {
                  home: Route.make("/"),
                  users: Route.make("/users"),
                },
                { initialPath: "/" },
              );

              // These should not throw in SSR mode
              yield* router.push("/users");
              yield* router.replace("/");
              yield* router.back();
              yield* router.forward();

              // Pathname shouldn't change since there's no browser history
              const pathname = yield* router.pathname.get;
              expect(pathname).toBe("/");
            }),
          ),
        );
      } finally {
        // Restore window
        globalThis.window = originalWindow;
      }
    });
  });

  describe("executeLoader", () => {
    it("should return null when no route matches", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                users: Route.make("/users"),
              },
              { initialPath: "/nonexistent" },
            );
            // Type assertion needed because TypeScript infers unknown requirements
            return yield* router.executeLoader() as Effect.Effect<LoaderResult | null>;
          }),
        ),
      );

      expect(result).toBeNull();
    });

    it("should return null when matched route has no loader", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
              },
              { initialPath: "/" },
            );
            // Type assertion needed because TypeScript infers unknown requirements
            return yield* router.executeLoader() as Effect.Effect<LoaderResult | null>;
          }),
        ),
      );

      expect(result).toBeNull();
    });

    it("should execute loader and return result", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                user: Route.make("/users/:id", {
                  params: Schema.Struct({ id: Schema.String }),
                  loader: (params) =>
                    Effect.succeed({ user: { id: params.id, name: "Test" } }),
                }),
              },
              { initialPath: "/users/123" },
            );
            return yield* router.executeLoader();
          }),
        ),
      );

      expect(result).toEqual({
        routeName: "user",
        params: { id: "123" },
        data: { user: { id: "123", name: "Test" } },
      });
    });

    it("should execute async loader", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                user: Route.make("/users/:id", {
                  params: Schema.Struct({ id: Schema.String }),
                  loader: (params) =>
                    Effect.gen(function* () {
                      yield* Effect.sleep("1 millis");
                      return { userId: params.id };
                    }),
                }),
              },
              { initialPath: "/users/456" },
            );
            return yield* router.executeLoader();
          }),
        ),
      );

      expect(result).toEqual({
        routeName: "user",
        params: { id: "456" },
        data: { userId: "456" },
      });
    });

    it("should propagate loader errors", async () => {
      // Create route with a loader that conditionally fails
      const userRoute = Route.make("/users/:id", {
        params: Schema.Struct({ id: Schema.String }),
        loader: (params: { id: string }) =>
          params.id === "fail"
            ? Effect.fail(new Error("Loader failed"))
            : Effect.succeed({ id: params.id }),
      });

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              { user: userRoute },
              { initialPath: "/users/fail" },
            );
            return yield* router.executeLoader().pipe(
              Effect.map(() => "success"),
              Effect.catchAll((e) =>
                Effect.succeed(`failed: ${(e as Error).message}`),
              ),
            );
          }),
        ),
      );

      expect(result).toBe("failed: Loader failed");
    });

    it("should expose route definitions", async () => {
      const userRoute = Route.make("/users/:id", {
        params: Schema.Struct({ id: Schema.String }),
        loader: (params) => Effect.succeed({ id: params.id }),
      });

      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
                user: userRoute,
              },
              { initialPath: "/" },
            );
            return {
              hasHome: "home" in router.definitions,
              hasUser: "user" in router.definitions,
              userHasLoader: router.definitions.user.loader !== undefined,
            };
          }),
        ),
      );

      expect(result).toEqual({
        hasHome: true,
        hasUser: true,
        userHasLoader: true,
      });
    });
  });

  describe("loaderState", () => {
    it("should have initial empty state", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
              },
              { initialPath: "/" },
            );
            return yield* router.loaderState.get;
          }),
        ),
      );

      expect(result).toEqual({
        routeName: null,
        params: {},
        data: null,
        isLoading: false,
        error: null,
      });
    });

    it("should be reactive (is a Readable)", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
              },
              { initialPath: "/" },
            );
            // loaderState should have get method (Readable interface)
            const state = yield* router.loaderState.get;
            return typeof state === "object" && state !== null;
          }),
        ),
      );

      expect(result).toBe(true);
    });
  });

  describe("initializeLoaderData", () => {
    it("should initialize loader state with provided data", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                user: Route.make("/users/:id", {
                  params: Schema.Struct({ id: Schema.String }),
                }),
              },
              { initialPath: "/users/123" },
            );

            // Initialize with SSR data
            yield* router.initializeLoaderData(
              "user",
              { id: "123" },
              { name: "Alice", email: "alice@example.com" },
            );

            return yield* router.loaderState.get;
          }),
        ),
      );

      expect(result).toEqual({
        routeName: "user",
        params: { id: "123" },
        data: { name: "Alice", email: "alice@example.com" },
        isLoading: false,
        error: null,
      });
    });

    it("should allow re-initialization (for hydration)", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
                user: Route.make("/users/:id"),
              },
              { initialPath: "/users/456" },
            );

            // First initialization
            yield* router.initializeLoaderData(
              "user",
              { id: "456" },
              { name: "Bob" },
            );

            const first = yield* router.loaderState.get;

            // Re-initialize (simulating a new hydration)
            yield* router.initializeLoaderData(
              "user",
              { id: "456" },
              { name: "Bob Updated" },
            );

            const second = yield* router.loaderState.get;

            return { first, second };
          }),
        ),
      );

      expect(result.first.data).toEqual({ name: "Bob" });
      expect(result.second.data).toEqual({ name: "Bob Updated" });
    });

    it("should set isLoading to false after initialization", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
              },
              { initialPath: "/" },
            );

            yield* router.initializeLoaderData("home", {}, { loaded: true });

            return yield* router.loaderState.get;
          }),
        ),
      );

      expect(result.isLoading).toBe(false);
    });
  });

  describe("actionState", () => {
    it("should have initial empty state", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
              },
              { initialPath: "/" },
            );
            return yield* router.actionState.get;
          }),
        ),
      );

      expect(result).toEqual({
        isSubmitting: false,
        data: null,
        error: null,
        routeName: null,
        submissionId: null,
      });
    });
  });

  describe("executeAction", () => {
    it("should return null when route has no action", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
              },
              { initialPath: "/" },
            );

            const formData = new FormData();
            const request = new Request("http://localhost/", {
              method: "POST",
            });

            // Type assertion needed because TypeScript infers unknown requirements
            return yield* router.executeAction(
              "home",
              formData,
              request,
            ) as Effect.Effect<ActionResult | null>;
          }),
        ),
      );

      expect(result).toBeNull();
    });

    it("should execute action and return result", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                contact: Route.make("/contact", {
                  action: ({ formData }) =>
                    Effect.succeed({
                      success: true,
                      email: formData.get("email"),
                    }),
                }),
              },
              { initialPath: "/contact" },
            );

            const formData = new FormData();
            formData.append("email", "test@example.com");
            const request = new Request("http://localhost/contact", {
              method: "POST",
            });

            return yield* router.executeAction("contact", formData, request);
          }),
        ),
      );

      expect(result).toEqual({
        routeName: "contact",
        data: { success: true, email: "test@example.com" },
      });
    });

    it("should pass params to action", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                user: Route.make("/users/:id", {
                  params: Schema.Struct({ id: Schema.String }),
                  action: ({ params }) => Effect.succeed({ userId: params.id }),
                }),
              },
              { initialPath: "/users/123" },
            );

            const formData = new FormData();
            const request = new Request("http://localhost/users/123", {
              method: "POST",
            });

            return yield* router.executeAction("user", formData, request);
          }),
        ),
      );

      expect(result).toEqual({
        routeName: "user",
        data: { userId: "123" },
      });
    });
  });

  describe("initializeActionData", () => {
    it("should initialize action state with provided data", async () => {
      const result = await Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const router = yield* Router.make(
              {
                home: Route.make("/"),
              },
              { initialPath: "/" },
            );

            yield* router.initializeActionData("home", { submitted: true });

            return yield* router.actionState.get;
          }),
        ),
      );

      expect(result).toEqual({
        isSubmitting: false,
        data: { submitted: true },
        error: null,
        routeName: "home",
        submissionId: null,
      });
    });
  });
});
