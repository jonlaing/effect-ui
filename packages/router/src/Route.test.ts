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
  it("creates a route with path", () => {
    const route = Route.make("/users");

    expect(route.path).toBe("/users");
    expect(route.segments).toEqual([{ type: "static", value: "users" }]);
    expect(route.paramsSchema).toBeNull();
    expect(route.guard).toBeNull();
    expect(route.animation).toBeNull();
    expect(route._loader).toBeNull();
    expect(route._handlers).toEqual([]);
  });

  it("render yields NoRenderError when not set", async () => {
    const route = Route.make("/users");
    const result = await Effect.runPromiseExit(route.render(undefined));
    expect(result._tag).toBe("Failure");
  });

  it("is pipeable", () => {
    const route = Route.make("/users/:id").pipe(
      Route.render(() => Effect.succeed(document.createElement("div"))),
      Route.withAnimation({ enter: "fade-in" }),
    );

    expect(route.animation).toEqual({ enter: "fade-in" });
  });

  it("creates unique context tag per route", () => {
    const route1 = Route.make("/users");
    const route2 = Route.make("/posts");

    // Different routes should have different context tags
    expect(route1.Params.key).not.toBe(route2.Params.key);
  });
});

describe("Route.render", () => {
  it("sets the render function", async () => {
    const div = document.createElement("div");
    const route = Route.make("/users").pipe(
      Route.render(() => Effect.succeed(div)),
    );

    const result = await Effect.runPromise(route.render(undefined));
    expect(result).toBe(div);
  });
});

describe("Route.get", () => {
  it("stores the loader and render function", () => {
    const loader = ({}: {
      params: Record<string, string>;
      searchParams: Record<string, string>;
    }) => Effect.succeed({ name: "test" });
    const renderFn = (data: { name: string }) =>
      Effect.succeed(document.createElement("div"));

    const route = Route.make("/users/:id").pipe(Route.get(loader, renderFn));

    expect(route._loader).toBe(loader);
  });

  it("passes loader data to render function", async () => {
    const route = Route.make("/users").pipe(
      Route.get(
        ({}) => Effect.succeed({ greeting: "hello" }),
        (data) => Effect.succeed(data),
      ),
    );

    const result = await Effect.runPromise(route.render({ greeting: "hello" }));
    expect(result).toEqual({ greeting: "hello" });
  });

  it("typed data flows from loader to render", async () => {
    const route = Route.make("/users").pipe(
      Route.get(
        ({}) => Effect.succeed([1, 2, 3]),
        (nums) => {
          // nums is inferred as number[]
          const sum: number = nums.reduce((a, b) => a + b, 0);
          return Effect.succeed(sum);
        },
      ),
    );

    const result = await Effect.runPromise(route.render([1, 2, 3]));
    expect(result).toBe(6);
  });
});

describe("Route.static", () => {
  it("stores static config with paths and load", () => {
    const paths = () => Effect.succeed([{ slug: "a" }, { slug: "b" }]);
    const load = ({ params }: { params: { slug: string } }) =>
      Effect.succeed({ content: `Page ${params.slug}` });
    const renderFn = (data: { content: string }) =>
      Effect.succeed(document.createElement("div"));

    const route = Route.make("/docs/:slug").pipe(
      Route.params(Schema.Struct({ slug: Schema.String })),
      Route.static({ paths, load, render: renderFn }),
    );

    expect(route._staticConfig).not.toBeNull();
    expect(route._staticConfig!.paths).toBe(paths);
    expect(route._staticConfig!.load).toBe(load);
  });

  it("sets the render function", async () => {
    const div = document.createElement("div");
    const route = Route.make("/about").pipe(
      Route.static({
        load: () => Effect.succeed({ title: "About" }),
        render: () => Effect.succeed(div),
      }),
    );

    const result = await Effect.runPromise(route.render({ title: "About" }));
    expect(result).toBe(div);
  });

  it("defaults paths to a single empty param set when omitted", async () => {
    const route = Route.make("/about").pipe(
      Route.static({
        load: () => Effect.succeed({ title: "About" }),
        render: () => Effect.succeed(document.createElement("div")),
      }),
    );

    const paramSets = await Effect.runPromise(route._staticConfig!.paths());
    expect(paramSets).toEqual([{}]);
  });

  it("does not set _loader (loaders are for SSR)", () => {
    const route = Route.make("/about").pipe(
      Route.static({
        load: () => Effect.succeed({}),
        render: () => Effect.succeed(document.createElement("div")),
      }),
    );

    expect(route._loader).toBeNull();
  });

  it("passes typed data from load to render", async () => {
    const route = Route.make("/docs/:slug").pipe(
      Route.params(Schema.Struct({ slug: Schema.String })),
      Route.static({
        paths: () => Effect.succeed([{ slug: "test" }]),
        load: ({ params }) =>
          Effect.succeed({ content: `Page ${params.slug}` }),
        render: (data) => Effect.succeed(data.content),
      }),
    );

    // Simulate the build flow: load data, then pass to render
    const data = await Effect.runPromise(
      route._staticConfig!.load({ params: { slug: "hello" } }),
    );
    const result = await Effect.runPromise(route.render(data));
    expect(result).toBe("Page hello");
  });
});

describe("Route.post", () => {
  it("stores a post handler", () => {
    const handler = (body: unknown) => Effect.succeed({ ok: true });

    const route = Route.make("/users").pipe(Route.post("submit", handler));

    expect(route._handlers).toHaveLength(1);
    expect(route._handlers[0].method).toBe("post");
    expect(route._handlers[0].key).toBe("submit");
    expect(route._handlers[0].handler).toBe(handler);
  });

  it("allows multiple handlers", () => {
    const route = Route.make("/users").pipe(
      Route.post("create", () => Effect.succeed({ created: true })),
      Route.post("delete", () => Effect.succeed({ deleted: true })),
    );

    expect(route._handlers).toHaveLength(2);
    expect(route._handlers[0].key).toBe("create");
    expect(route._handlers[1].key).toBe("delete");
  });
});

describe("Route.put", () => {
  it("stores a put handler", () => {
    const route = Route.make("/users/:id").pipe(
      Route.put("update", () => Effect.succeed({ updated: true })),
    );

    expect(route._handlers).toHaveLength(1);
    expect(route._handlers[0].method).toBe("put");
    expect(route._handlers[0].key).toBe("update");
  });
});

describe("Route.delete", () => {
  it("stores a delete handler", () => {
    const route = Route.make("/users/:id").pipe(
      Route.delete("remove", () => Effect.succeed({ removed: true })),
    );

    expect(route._handlers).toHaveLength(1);
    expect(route._handlers[0].method).toBe("delete");
    expect(route._handlers[0].key).toBe("remove");
  });
});

describe("Route.params", () => {
  it("adds a params schema to the route", () => {
    const route = Route.make("/users/:id").pipe(
      Route.params(Schema.Struct({ id: Schema.NumberFromString })),
    );

    expect(route.paramsSchema).not.toBeNull();
  });

  it("provides typed params via context", async () => {
    const UserRoute = Route.make("/users/:id").pipe(
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
    const route = Route.make("/search").pipe(
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
    const route = Route.make("/users/:id").pipe(Route.rawParams);

    expect(route.paramsSchema).toBeNull();
  });
});

describe("Route.withGuard", () => {
  it("adds a guard condition", () => {
    const isAuthenticated = { get: Effect.succeed(true) } as any;

    const route = Route.make("/dashboard").pipe(
      Route.render(() => Effect.succeed(document.createElement("div"))),
      Route.withGuard(isAuthenticated, { redirect: "/login" }),
    );

    expect(route.guard).toBe(isAuthenticated);
    expect(route.guardOptions).toEqual({ redirect: "/login" });
  });
});

describe("Route.withAnimation", () => {
  it("adds animation options", () => {
    const route = Route.make("/modal").pipe(
      Route.render(() => Effect.succeed(document.createElement("div"))),
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
    const route = Route.make("/users");
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
    const isAuth = Effect.succeed(true);

    const route = Route.make("/users/:id").pipe(
      Route.params(Schema.Struct({ id: Schema.NumberFromString })),
      Route.post("submit", (body) => Effect.succeed(body)),
      Route.get(
        ({ params: { id } }) => Effect.succeed({ id, name: "test" }),
        (user) => Effect.succeed(document.createElement("div")),
      ),
      Route.withGuard(isAuth, { redirect: "/login" }),
      Route.withAnimation({ enter: "fade-in", exit: "fade-out" }),
    );

    expect(route.paramsSchema).not.toBeNull();
    expect(route.guard).toBe(isAuth);
    expect(route.animation).toEqual({ enter: "fade-in", exit: "fade-out" });
    expect(route._loader).not.toBeNull();
    expect(route._handlers).toHaveLength(1);
  });
});
