import { Effect, Option, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { Route } from "./Route.js";
import {
  concat,
  empty,
  fallback,
  findMatch,
  guard,
  isRouter,
  layout,
  parseParams,
  parseSearchParams,
  prefixAll,
  Router,
} from "./Router.js";

// Helper to create a simple render function for tests
const render = () => Effect.succeed(document.createElement("div"));

describe("Router", () => {
  describe("empty", () => {
    it("creates an empty router", () => {
      expect(empty.routes).toEqual([]);
      expect(empty.fallback).toBeNull();
      expect(empty.layouts).toEqual([]);
    });

    it("is pipeable", () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );
      expect(router.routes.length).toBe(1);
    });
  });

  describe("concat", () => {
    it("adds a single route to a router", () => {
      const HomeRoute = Route.make("/").pipe(Route.render(render));
      const router = empty.pipe(concat(HomeRoute));

      expect(router.routes.length).toBe(1);
      expect(router.routes[0].path).toBe("/");
    });

    it("adds multiple routes", () => {
      const HomeRoute = Route.make("/").pipe(Route.render(render));
      const UsersRoute = Route.make("/users").pipe(Route.render(render));

      const router = empty.pipe(concat(HomeRoute), concat(UsersRoute));

      expect(router.routes.length).toBe(2);
      expect(router.routes[0].path).toBe("/");
      expect(router.routes[1].path).toBe("/users");
    });

    it("merges another router", () => {
      const HomeRoute = Route.make("/").pipe(Route.render(render));
      const UsersRoute = Route.make("/users").pipe(Route.render(render));
      const PostsRoute = Route.make("/posts").pipe(Route.render(render));

      const mainRouter = empty.pipe(concat(HomeRoute));
      const apiRouter = empty.pipe(concat(UsersRoute), concat(PostsRoute));

      const combined = mainRouter.pipe(concat(apiRouter));

      expect(combined.routes.length).toBe(3);
      expect(combined.routes.map((r) => r.path)).toEqual([
        "/",
        "/users",
        "/posts",
      ]);
    });

    it("preserves fallback when merging routers", () => {
      const fallbackRender = () =>
        Effect.succeed(document.createElement("span"));

      const router1 = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        fallback(fallbackRender),
      );

      const router2 = empty.pipe(
        concat(Route.make("/users").pipe(Route.render(render))),
      );

      // router2's fallback is null, so router1's fallback should be preserved
      const combined = router2.pipe(concat(router1));
      expect(combined.fallback).toBe(fallbackRender);
    });

    it("overrides fallback when merging router with fallback", () => {
      const fallback1 = () => Effect.succeed(document.createElement("span"));
      const fallback2 = () => Effect.succeed(document.createElement("div"));

      const router1 = empty.pipe(fallback(fallback1));
      const router2 = empty.pipe(fallback(fallback2));

      const combined = router1.pipe(concat(router2));
      expect(combined.fallback).toBe(fallback2);
    });

    it("combines layouts from both routers", () => {
      const layout1 = (children: any) => children;
      const layout2 = (children: any) => children;

      const router1 = empty.pipe(layout(layout1));
      const router2 = empty.pipe(layout(layout2));

      const combined = router1.pipe(concat(router2));
      expect(combined.layouts.length).toBe(2);
      expect(combined.layouts[0]).toBe(layout1);
      expect(combined.layouts[1]).toBe(layout2);
    });
  });

  describe("prefixAll", () => {
    it("adds prefix to all routes", () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        concat(Route.make("/users").pipe(Route.render(render))),
        prefixAll("/admin"),
      );

      expect(router.routes[0].path).toBe("/admin");
      expect(router.routes[1].path).toBe("/admin/users");
    });

    it("handles trailing slash in prefix", () => {
      const router = empty.pipe(
        concat(Route.make("/users").pipe(Route.render(render))),
        prefixAll("/api/"),
      );

      expect(router.routes[0].path).toBe("/api/users");
    });

    it("updates segments after prefixing", () => {
      const router = empty.pipe(
        concat(Route.make("/users/:id").pipe(Route.render(render))),
        prefixAll("/api"),
      );

      expect(router.routes[0].segments).toEqual([
        { type: "static", value: "api" },
        { type: "static", value: "users" },
        { type: "param", name: "id" },
      ]);
    });
  });

  describe("fallback", () => {
    it("sets the fallback render function", () => {
      const fallbackRender = () =>
        Effect.succeed(document.createElement("div"));

      const router = empty.pipe(fallback(fallbackRender));

      expect(router.fallback).toBe(fallbackRender);
    });
  });

  describe("guard", () => {
    it("adds guard to protected routes", () => {
      const isAuthenticated = Effect.succeed(true);
      const DashboardRoute = Route.make("/dashboard").pipe(
        Route.render(render),
      );

      const protectedRouter = empty.pipe(concat(DashboardRoute));
      const router = empty.pipe(
        guard(isAuthenticated, protectedRouter, { redirect: "/login" }),
      );

      expect(router.routes.length).toBe(1);
      expect(router.routes[0].guard).toBe(isAuthenticated);
      expect(router.routes[0].guardOptions).toEqual({ redirect: "/login" });
    });

    it("adds guard with fallback option", () => {
      const isAuthenticated = Effect.succeed(false);
      const fallbackRender = () =>
        Effect.succeed(document.createElement("div"));

      const protectedRouter = empty.pipe(
        concat(Route.make("/dashboard").pipe(Route.render(render))),
      );

      const router = empty.pipe(
        guard(isAuthenticated, protectedRouter, { fallback: fallbackRender }),
      );

      expect(router.routes[0].guardOptions).toEqual({
        fallback: fallbackRender,
      });
    });

    it("combines public and protected routes", () => {
      const isAuthenticated = Effect.succeed(true);

      const publicRoutes = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        concat(Route.make("/login").pipe(Route.render(render))),
      );

      const protectedRoutes = empty.pipe(
        concat(Route.make("/dashboard").pipe(Route.render(render))),
        concat(Route.make("/profile").pipe(Route.render(render))),
      );

      const router = publicRoutes.pipe(
        guard(isAuthenticated, protectedRoutes, { redirect: "/login" }),
      );

      expect(router.routes.length).toBe(4);
      // Public routes should not have guards
      expect(router.routes[0].guard).toBeNull();
      expect(router.routes[1].guard).toBeNull();
      // Protected routes should have guards
      expect(router.routes[2].guard).toBe(isAuthenticated);
      expect(router.routes[3].guard).toBe(isAuthenticated);
    });
  });

  describe("layout", () => {
    it("adds a layout wrapper", () => {
      const wrapper = (children: any) => children;

      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        layout(wrapper),
      );

      expect(router.layouts.length).toBe(1);
      expect(router.layouts[0]).toBe(wrapper);
    });

    it("allows multiple nested layouts", () => {
      const innerLayout = (children: any) => children;
      const outerLayout = (children: any) => children;

      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        layout(innerLayout),
        layout(outerLayout),
      );

      expect(router.layouts.length).toBe(2);
      expect(router.layouts[0]).toBe(innerLayout);
      expect(router.layouts[1]).toBe(outerLayout);
    });
  });

  describe("findMatch", () => {
    it("finds matching route for pathname", () => {
      const HomeRoute = Route.make("/").pipe(Route.render(render));
      const UsersRoute = Route.make("/users").pipe(Route.render(render));

      const router = empty.pipe(concat(HomeRoute), concat(UsersRoute));

      const homeMatch = findMatch(router, "/");
      expect(Option.isSome(homeMatch)).toBe(true);
      if (Option.isSome(homeMatch)) {
        expect(homeMatch.value.route.path).toBe("/");
        expect(homeMatch.value.params).toEqual({});
      }

      const usersMatch = findMatch(router, "/users");
      expect(Option.isSome(usersMatch)).toBe(true);
      if (Option.isSome(usersMatch)) {
        expect(usersMatch.value.route.path).toBe("/users");
      }
    });

    it("extracts params from matching route", () => {
      const UserRoute = Route.make("/users/:id").pipe(Route.render(render));
      const router = empty.pipe(concat(UserRoute));

      const match = findMatch(router, "/users/123");
      expect(Option.isSome(match)).toBe(true);
      if (Option.isSome(match)) {
        expect(match.value.params).toEqual({ id: "123" });
      }
    });

    it("returns none when no route matches", () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
      );

      const match = findMatch(router, "/nonexistent");
      expect(Option.isNone(match)).toBe(true);
    });

    it("matches more specific routes first", () => {
      const router = empty.pipe(
        concat(Route.make("/users/:id").pipe(Route.render(render))),
        concat(Route.make("/users/settings").pipe(Route.render(render))),
      );

      // Static "settings" should match before param ":id"
      const match = findMatch(router, "/users/settings");
      expect(Option.isSome(match)).toBe(true);
      if (Option.isSome(match)) {
        expect(match.value.route.path).toBe("/users/settings");
      }
    });

    it("falls back to param routes when no static match", () => {
      const router = empty.pipe(
        concat(Route.make("/users/:id").pipe(Route.render(render))),
        concat(Route.make("/users/settings").pipe(Route.render(render))),
      );

      const match = findMatch(router, "/users/123");
      expect(Option.isSome(match)).toBe(true);
      if (Option.isSome(match)) {
        expect(match.value.route.path).toBe("/users/:id");
        expect(match.value.params).toEqual({ id: "123" });
      }
    });

    it("matches catch-all routes", () => {
      const router = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        concat(Route.make("/docs/*").pipe(Route.render(render))),
      );

      const match = findMatch(router, "/docs/api/reference");
      expect(Option.isSome(match)).toBe(true);
      if (Option.isSome(match)) {
        expect(match.value.route.path).toBe("/docs/*");
        expect(match.value.params).toEqual({ "*": "api/reference" });
      }
    });

    it("prefers more specific routes over catch-all", () => {
      const router = empty.pipe(
        concat(Route.make("/*").pipe(Route.render(render))),
        concat(Route.make("/users").pipe(Route.render(render))),
      );

      const match = findMatch(router, "/users");
      expect(Option.isSome(match)).toBe(true);
      if (Option.isSome(match)) {
        expect(match.value.route.path).toBe("/users");
      }
    });
  });

  describe("parseParams", () => {
    it("returns raw params when no schema", async () => {
      const route = Route.make("/users/:id").pipe(Route.render(render));
      const rawParams = { id: "123" };

      const result = await Effect.runPromise(parseParams(route, rawParams));
      expect(result).toEqual({ id: "123" });
    });

    it("validates and transforms params with schema", async () => {
      const route = Route.make("/users/:id").pipe(
        Route.render(render),
        Route.params(Schema.Struct({ id: Schema.NumberFromString })),
      );
      const rawParams = { id: "123" };

      const result = await Effect.runPromise(parseParams(route, rawParams));
      expect(result).toEqual({ id: 123 });
    });

    it("fails on invalid params", async () => {
      const route = Route.make("/users/:id").pipe(
        Route.render(render),
        Route.params(Schema.Struct({ id: Schema.NumberFromString })),
      );
      const rawParams = { id: "not-a-number" };

      await expect(
        Effect.runPromise(parseParams(route, rawParams)),
      ).rejects.toThrow();
    });
  });

  describe("parseSearchParams", () => {
    it("returns raw search params when no schema", async () => {
      const route = Route.make("/search").pipe(Route.render(render));
      const searchParams = new URLSearchParams("q=test&page=1");

      const result = await Effect.runPromise(
        parseSearchParams(route, searchParams),
      );
      expect(result).toEqual({ q: "test", page: "1" });
    });

    it("validates and transforms search params with schema", async () => {
      const route = Route.make("/search").pipe(
        Route.render(render),
        Route.searchParams(
          Schema.Struct({
            q: Schema.String,
            page: Schema.NumberFromString,
          }),
        ),
      );
      const searchParams = new URLSearchParams("q=test&page=2");

      const result = await Effect.runPromise(
        parseSearchParams(route, searchParams),
      );
      expect(result).toEqual({ q: "test", page: 2 });
    });
  });

  describe("isRouter", () => {
    it("returns true for routers", () => {
      expect(isRouter(empty)).toBe(true);
      expect(
        isRouter(
          empty.pipe(concat(Route.make("/").pipe(Route.render(render)))),
        ),
      ).toBe(true);
    });

    it("returns false for non-routers", () => {
      expect(isRouter({})).toBe(false);
      expect(isRouter(null)).toBe(false);
      expect(isRouter(Route.make("/").pipe(Route.render(render)))).toBe(false);
    });
  });

  describe("Router module export", () => {
    it("exports all functions via Router namespace", () => {
      expect(Router.empty).toBe(empty);
      expect(Router.concat).toBe(concat);
      expect(Router.prefixAll).toBe(prefixAll);
      expect(Router.fallback).toBe(fallback);
      expect(Router.guard).toBe(guard);
      expect(Router.layout).toBe(layout);
      expect(Router.findMatch).toBe(findMatch);
      expect(Router.parseParams).toBe(parseParams);
      expect(Router.parseSearchParams).toBe(parseSearchParams);
      expect(Router.isRouter).toBe(isRouter);
    });
  });

  describe("composition examples", () => {
    it("builds a complete router with all features", () => {
      const isAuthenticated = Effect.succeed(true);

      // Public routes
      const publicRouter = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))),
        concat(Route.make("/login").pipe(Route.render(render))),
        concat(Route.make("/about").pipe(Route.render(render))),
      );

      // Admin routes with layout and prefix
      const adminRouter = empty.pipe(
        concat(Route.make("/").pipe(Route.render(render))), // becomes /admin
        concat(Route.make("/users").pipe(Route.render(render))), // becomes /admin/users
        concat(Route.make("/settings").pipe(Route.render(render))), // becomes /admin/settings
        prefixAll("/admin"),
        layout((children) => children), // AdminLayout
      );

      // Combine everything
      const router = publicRouter.pipe(
        guard(isAuthenticated, adminRouter, { redirect: "/login" }),
        fallback(() => Effect.succeed(document.createElement("div"))),
      );

      // Verify structure
      expect(router.routes.length).toBe(6); // 3 public + 3 admin
      expect(router.fallback).not.toBeNull();

      // Check admin routes have guards
      const adminRoutes = router.routes.filter((r) =>
        r.path.startsWith("/admin"),
      );
      expect(adminRoutes.length).toBe(3);
      adminRoutes.forEach((route) => {
        expect(route.guard).toBe(isAuthenticated);
      });

      // Check public routes don't have guards
      const publicRoutes = router.routes.filter(
        (r) => !r.path.startsWith("/admin"),
      );
      expect(publicRoutes.length).toBe(3);
      publicRoutes.forEach((route) => {
        expect(route.guard).toBeNull();
      });
    });

    it("supports nested sub-routers", () => {
      // API v1 routes
      const apiV1 = empty.pipe(
        concat(Route.make("/users").pipe(Route.render(render))),
        concat(Route.make("/posts").pipe(Route.render(render))),
        prefixAll("/v1"),
      );

      // API v2 routes
      const apiV2 = empty.pipe(
        concat(Route.make("/users").pipe(Route.render(render))),
        concat(Route.make("/posts").pipe(Route.render(render))),
        concat(Route.make("/comments").pipe(Route.render(render))),
        prefixAll("/v2"),
      );

      // Combined API router
      const apiRouter = empty.pipe(
        concat(apiV1),
        concat(apiV2),
        prefixAll("/api"),
      );

      expect(apiRouter.routes.length).toBe(5);
      expect(apiRouter.routes.map((r) => r.path)).toEqual([
        "/api/v1/users",
        "/api/v1/posts",
        "/api/v2/users",
        "/api/v2/posts",
        "/api/v2/comments",
      ]);
    });
  });
});
