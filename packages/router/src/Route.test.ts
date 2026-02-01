import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import {
  isRoute,
  matchSegments,
  parsePath,
  Route,
  routeSpecificity,
  type RouteContext,
} from "./Route.js";

describe("parsePath", () => {
  it("parses static segments", () => {
    expect(parsePath("/users")).toEqual([{ type: "static", value: "users" }]);
    expect(parsePath("/users/list")).toEqual([
      { type: "static", value: "users" },
      { type: "static", value: "list" },
    ]);
  });

  it("parses param segments", () => {
    expect(parsePath("/users/:id")).toEqual([
      { type: "static", value: "users" },
      { type: "param", name: "id" },
    ]);
    expect(parsePath("/:org/:repo")).toEqual([
      { type: "param", name: "org" },
      { type: "param", name: "repo" },
    ]);
  });

  it("parses catch-all segments", () => {
    expect(parsePath("/docs/*")).toEqual([
      { type: "static", value: "docs" },
      { type: "catchAll" },
    ]);
  });

  it("handles root path", () => {
    expect(parsePath("/")).toEqual([]);
  });

  it("strips optional marker from params", () => {
    expect(parsePath("/users/:id?")).toEqual([
      { type: "static", value: "users" },
      { type: "param", name: "id" },
    ]);
  });
});

describe("matchSegments", () => {
  it("matches static paths", () => {
    const segments = parsePath("/users");
    expect(matchSegments(segments, "/users")).toEqual({});
    expect(matchSegments(segments, "/posts")).toBeNull();
  });

  it("extracts params", () => {
    const segments = parsePath("/users/:id");
    expect(matchSegments(segments, "/users/123")).toEqual({ id: "123" });
    expect(matchSegments(segments, "/users/abc")).toEqual({ id: "abc" });
    expect(matchSegments(segments, "/users")).toBeNull();
  });

  it("extracts multiple params", () => {
    const segments = parsePath("/users/:userId/posts/:postId");
    expect(matchSegments(segments, "/users/1/posts/2")).toEqual({
      userId: "1",
      postId: "2",
    });
  });

  it("handles catch-all", () => {
    const segments = parsePath("/docs/*");
    expect(matchSegments(segments, "/docs/getting-started")).toEqual({
      "*": "getting-started",
    });
    expect(matchSegments(segments, "/docs/api/reference")).toEqual({
      "*": "api/reference",
    });
    expect(matchSegments(segments, "/docs")).toEqual({ "*": "" });
  });

  it("matches root path", () => {
    const segments = parsePath("/");
    expect(matchSegments(segments, "/")).toEqual({});
    expect(matchSegments(segments, "/users")).toBeNull();
  });

  it("rejects paths with extra segments", () => {
    const segments = parsePath("/users");
    expect(matchSegments(segments, "/users/123")).toBeNull();
  });
});

describe("routeSpecificity", () => {
  it("ranks static higher than params", () => {
    const staticRoute = parsePath("/users/list");
    const paramRoute = parsePath("/users/:id");
    expect(routeSpecificity(staticRoute)).toBeGreaterThan(
      routeSpecificity(paramRoute),
    );
  });

  it("ranks params higher than catch-all", () => {
    const paramRoute = parsePath("/docs/:page");
    const catchAllRoute = parsePath("/docs/*");
    expect(routeSpecificity(paramRoute)).toBeGreaterThan(
      routeSpecificity(catchAllRoute),
    );
  });

  it("ranks longer paths higher (same segment types)", () => {
    const longer = parsePath("/users/list/all");
    const shorter = parsePath("/users/list");
    expect(routeSpecificity(longer)).toBeGreaterThan(routeSpecificity(shorter));
  });
});

describe("Route.make", () => {
  it("creates a route with path and render function", () => {
    const render = () => Effect.succeed(document.createElement("div"));
    const route = Route.make("/users", render);

    expect(route.path).toBe("/users");
    expect(route.render).toBe(render);
    expect(route.segments).toEqual([{ type: "static", value: "users" }]);
    expect(route.paramsSchema).toBeNull();
    expect(route.guard).toBeNull();
    expect(route.animation).toBeNull();
  });

  it("is pipeable", () => {
    const render = () => Effect.succeed(document.createElement("div"));
    const route = Route.make("/users/:id", render).pipe(
      Route.withAnimation({ enter: "fade-in" }),
    );

    expect(route.animation).toEqual({ enter: "fade-in" });
  });

  it("creates unique context tag per route", () => {
    const render = () => Effect.succeed(document.createElement("div"));
    const route1 = Route.make("/users", render);
    const route2 = Route.make("/posts", render);

    // Different routes should have different context tags
    expect(route1.Params.key).not.toBe(route2.Params.key);
  });
});

describe("Route.params", () => {
  it("adds a params schema to the route", () => {
    const render = () => Effect.succeed(document.createElement("div"));
    const route = Route.make("/users/:id", render).pipe(
      Route.params(Schema.Struct({ id: Schema.NumberFromString })),
    );

    expect(route.paramsSchema).not.toBeNull();
  });

  it("provides typed params via context", async () => {
    const render = () => Effect.succeed(document.createElement("div"));
    const UserRoute = Route.make("/users/:id", render).pipe(
      Route.params(Schema.Struct({ id: Schema.NumberFromString })),
    );

    // Simulate providing the context
    const ctx: RouteContext<{ id: number }, Record<string, string>> = {
      params: { id: 123 },
      searchParams: {},
    };

    const result = await Effect.runPromise(
      UserRoute.params.pipe(Effect.provideService(UserRoute.Params, ctx)),
    );

    expect(result).toEqual({ id: 123 });
  });
});

describe("Route.searchParams", () => {
  it("adds a search params schema to the route", () => {
    const render = () => Effect.succeed(document.createElement("div"));
    const route = Route.make("/search", render).pipe(
      Route.searchParams(
        Schema.Struct({
          q: Schema.String,
          page: Schema.optional(Schema.NumberFromString),
        }),
      ),
    );

    expect(route.searchParamsSchema).not.toBeNull();
  });
});

describe("Route.rawParams", () => {
  it("keeps params as raw strings", () => {
    const render = () => Effect.succeed(document.createElement("div"));
    const route = Route.make("/users/:id", render).pipe(Route.rawParams);

    expect(route.paramsSchema).toBeNull();
  });
});

describe("Route.withGuard", () => {
  it("adds a guard condition", () => {
    const render = () => Effect.succeed(document.createElement("div"));
    const isAuthenticated = { get: Effect.succeed(true) } as any;

    const route = Route.make("/dashboard", render).pipe(
      Route.withGuard(isAuthenticated, { redirect: "/login" }),
    );

    expect(route.guard).toBe(isAuthenticated);
    expect(route.guardOptions).toEqual({ redirect: "/login" });
  });
});

describe("Route.withAnimation", () => {
  it("adds animation options", () => {
    const render = () => Effect.succeed(document.createElement("div"));
    const route = Route.make("/modal", render).pipe(
      Route.withAnimation({
        enter: "slide-up",
        exit: "slide-down",
      }),
    );

    expect(route.animation).toEqual({
      enter: "slide-up",
      exit: "slide-down",
    });
  });
});

describe("isRoute", () => {
  it("returns true for routes", () => {
    const render = () => Effect.succeed(document.createElement("div"));
    const route = Route.make("/users", render);
    expect(isRoute(route)).toBe(true);
  });

  it("returns false for non-routes", () => {
    expect(isRoute({})).toBe(false);
    expect(isRoute(null)).toBe(false);
    expect(isRoute("/users")).toBe(false);
  });
});

describe("Route composition", () => {
  it("allows chaining multiple combinators", () => {
    const render = () => Effect.succeed(document.createElement("div"));
    const isAuth = Effect.succeed(true);

    const route = Route.make("/users/:id", render).pipe(
      Route.params(Schema.Struct({ id: Schema.NumberFromString })),
      Route.withGuard(isAuth, { redirect: "/login" }),
      Route.withAnimation({ enter: "fade-in", exit: "fade-out" }),
    );

    expect(route.paramsSchema).not.toBeNull();
    expect(route.guard).toBe(isAuth);
    expect(route.animation).toEqual({ enter: "fade-in", exit: "fade-out" });
  });
});
