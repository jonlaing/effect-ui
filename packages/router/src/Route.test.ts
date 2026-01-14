import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { Route, routeSpecificity } from "./Route";

describe("Route", () => {
  describe("Route.make", () => {
    it("should create a route with a static path", () => {
      const route = Route.make("/");
      expect(route.path).toBe("/");
      expect(route.segments).toEqual([]);
    });

    it("should parse static segments", () => {
      const route = Route.make("/users/settings");
      expect(route.segments).toEqual([
        { type: "static", value: "users" },
        { type: "static", value: "settings" },
      ]);
    });

    it("should parse param segments", () => {
      const route = Route.make("/users/:id");
      expect(route.segments).toEqual([
        { type: "static", value: "users" },
        { type: "param", name: "id" },
      ]);
    });

    it("should parse multiple params", () => {
      const route = Route.make("/posts/:postId/comments/:commentId");
      expect(route.segments).toEqual([
        { type: "static", value: "posts" },
        { type: "param", name: "postId" },
        { type: "static", value: "comments" },
        { type: "param", name: "commentId" },
      ]);
    });

    it("should parse catch-all segment", () => {
      const route = Route.make("/*");
      expect(route.segments).toEqual([{ type: "catchAll" }]);
    });

    it("should parse catch-all after static segments", () => {
      const route = Route.make("/files/*");
      expect(route.segments).toEqual([
        { type: "static", value: "files" },
        { type: "catchAll" },
      ]);
    });
  });

  describe("Route.match", () => {
    it("should match root path", async () => {
      const route = Route.make("/");
      const result = await Effect.runPromise(route.match("/"));
      expect(result).toEqual({});
    });

    it("should match static path", async () => {
      const route = Route.make("/users");
      const result = await Effect.runPromise(route.match("/users"));
      expect(result).toEqual({});
    });

    it("should not match different static path", async () => {
      const route = Route.make("/users");
      const result = await Effect.runPromise(
        route.match("/posts").pipe(
          Effect.map(() => "matched"),
          Effect.catchAll((e) => Effect.succeed(e._tag)),
        ),
      );
      expect(result).toBe("RouteMatchError");
    });

    it("should extract param from path", async () => {
      const route = Route.make("/users/:id");
      const result = await Effect.runPromise(route.match("/users/123"));
      expect(result).toEqual({ id: "123" });
    });

    it("should extract multiple params", async () => {
      const route = Route.make("/posts/:postId/comments/:commentId");
      const result = await Effect.runPromise(
        route.match("/posts/42/comments/99"),
      );
      expect(result).toEqual({ postId: "42", commentId: "99" });
    });

    it("should match catch-all at root", async () => {
      const route = Route.make("/*");
      const result = await Effect.runPromise(route.match("/anything/here"));
      expect(result).toEqual({});
    });

    it("should match catch-all with prefix", async () => {
      const route = Route.make("/files/*");
      const result = await Effect.runPromise(
        route.match("/files/path/to/file.txt"),
      );
      expect(result).toEqual({});
    });

    it("should not match if path has extra segments", async () => {
      const route = Route.make("/users");
      const result = await Effect.runPromise(
        route.match("/users/123").pipe(
          Effect.map(() => "matched"),
          Effect.catchAll((e) => Effect.succeed(e.reason)),
        ),
      );
      expect(result).toBe("no-match");
    });

    it("should not match if path is missing segments", async () => {
      const route = Route.make("/users/:id");
      const result = await Effect.runPromise(
        route.match("/users").pipe(
          Effect.map(() => "matched"),
          Effect.catchAll((e) => Effect.succeed(e.reason)),
        ),
      );
      expect(result).toBe("no-match");
    });
  });

  describe("Route.match with Schema validation", () => {
    it("should validate params with Schema", async () => {
      const route = Route.make("/users/:id", {
        params: Schema.Struct({ id: Schema.String }),
      });
      const result = await Effect.runPromise(route.match("/users/abc"));
      expect(result).toEqual({ id: "abc" });
    });

    it("should fail validation with wrong schema", async () => {
      const route = Route.make("/users/:id", {
        params: Schema.Struct({ id: Schema.NumberFromString }),
      });
      const result = await Effect.runPromise(
        route.match("/users/not-a-number").pipe(
          Effect.map(() => "matched"),
          Effect.catchAll((e) => Effect.succeed(e.reason)),
        ),
      );
      expect(result).toBe("validation-failed");
    });

    it("should transform params via Schema", async () => {
      const route = Route.make("/users/:id", {
        params: Schema.Struct({ id: Schema.NumberFromString }),
      });
      const result = await Effect.runPromise(route.match("/users/42"));
      expect(result).toEqual({ id: 42 });
    });
  });

  describe("routeSpecificity", () => {
    it("should give higher score to static segments", () => {
      const staticRoute = Route.make("/users");
      const paramRoute = Route.make("/:anything");

      expect(routeSpecificity(staticRoute.segments)).toBeGreaterThan(
        routeSpecificity(paramRoute.segments),
      );
    });

    it("should give higher score to params than catch-all", () => {
      const paramRoute = Route.make("/:id");
      const catchAllRoute = Route.make("/*");

      expect(routeSpecificity(paramRoute.segments)).toBeGreaterThan(
        routeSpecificity(catchAllRoute.segments),
      );
    });

    it("should give higher score to longer paths", () => {
      const shortRoute = Route.make("/users");
      const longRoute = Route.make("/users/settings");

      expect(routeSpecificity(longRoute.segments)).toBeGreaterThan(
        routeSpecificity(shortRoute.segments),
      );
    });

    it("should prioritize static segments over param segments at same depth", () => {
      const staticRoute = Route.make("/users/settings");
      const paramRoute = Route.make("/users/:id");

      expect(routeSpecificity(staticRoute.segments)).toBeGreaterThan(
        routeSpecificity(paramRoute.segments),
      );
    });
  });

  describe("Route with loader", () => {
    it("should create a route without a loader", () => {
      const route = Route.make("/users");
      expect(route.loader).toBeUndefined();
    });

    it("should create a route with a loader", () => {
      const route = Route.make("/users/:id", {
        params: Schema.Struct({ id: Schema.String }),
        loader: (params) => Effect.succeed({ user: { id: params.id } }),
      });
      expect(route.loader).toBeDefined();
    });

    it("should execute loader with params", async () => {
      const route = Route.make("/users/:id", {
        params: Schema.Struct({ id: Schema.String }),
        loader: (params: { id: string }) =>
          Effect.succeed({ user: { id: params.id, name: "Test User" } }),
      });

      const params = await Effect.runPromise(route.match("/users/123"));
      expect(params).toEqual({ id: "123" });

      const data = await Effect.runPromise(
        route.loader!(params as { id: string }),
      );
      expect(data).toEqual({ user: { id: "123", name: "Test User" } });
    });

    it("should support async loader", async () => {
      const route = Route.make("/users/:id", {
        params: Schema.Struct({ id: Schema.String }),
        loader: (params: { id: string }) =>
          Effect.gen(function* () {
            yield* Effect.sleep("1 millis");
            return { user: { id: params.id } };
          }),
      });

      const params = await Effect.runPromise(route.match("/users/42"));
      const data = await Effect.runPromise(
        route.loader!(params as { id: string }),
      );
      expect(data).toEqual({ user: { id: "42" } });
    });

    it("should support loader that can fail", async () => {
      const route = Route.make("/users/:id", {
        params: Schema.Struct({ id: Schema.String }),
        loader: (params: { id: string }) =>
          params.id === "404"
            ? Effect.fail(new Error("User not found"))
            : Effect.succeed({ user: { id: params.id } }),
      });

      const params = await Effect.runPromise(route.match("/users/404"));
      const result = await Effect.runPromise(
        route.loader!(params as { id: string }).pipe(
          Effect.map(() => "success"),
          Effect.catchAll(() => Effect.succeed("failed")),
        ),
      );
      expect(result).toBe("failed");
    });
  });
});
