import { describe, it, expect } from "vitest";
import { Effect, Layer, Option } from "effect";
import {
  RouteLoader,
  LoaderContextTag,
  ActionContextTag,
  RedirectError,
  makeLoaderContext,
  makeActionContext,
} from "./RouteLoader";

describe("RouteLoader", () => {
  describe("params", () => {
    it("should return route params from context", async () => {
      const ctx = makeLoaderContext({
        routeId: "routes/users/$id",
        params: { get: Effect.succeed({ id: "123", tab: "profile" }) },
        loaderDataCache: new Map(),
        isHydrating: false,
      });
      const layer = Layer.succeed(LoaderContextTag, ctx);

      const result = await Effect.runPromise(
        Effect.provide(RouteLoader.params(), layer),
      );

      expect(result).toEqual({ id: "123", tab: "profile" });
    });

    it("should work with empty params", async () => {
      const ctx = makeLoaderContext({
        routeId: "routes/index",
        params: { get: Effect.succeed({}) },
        loaderDataCache: new Map(),
        isHydrating: false,
      });
      const layer = Layer.succeed(LoaderContextTag, ctx);

      const result = await Effect.runPromise(
        Effect.provide(RouteLoader.params(), layer),
      );

      expect(result).toEqual({});
    });
  });

  describe("loaderData", () => {
    it("should return cached loader data", async () => {
      const loaderDataCache = new Map<string, unknown>();
      loaderDataCache.set("routes/users", { users: ["Alice", "Bob"] });

      const ctx = makeLoaderContext({
        routeId: "routes/users",
        params: { get: Effect.succeed({}) },
        loaderDataCache,
        isHydrating: false,
      });
      const layer = Layer.succeed(LoaderContextTag, ctx);

      const result = await Effect.runPromise(
        Effect.provide(RouteLoader.loaderData<{ users: string[] }>(), layer),
      );

      expect(result).toEqual({ users: ["Alice", "Bob"] });
    });

    it("should return cached data during hydration", async () => {
      const loaderDataCache = new Map<string, unknown>();
      loaderDataCache.set("routes/posts/$id", { title: "Hello World" });

      const ctx = makeLoaderContext({
        routeId: "routes/posts/$id",
        params: { get: Effect.succeed({ id: "1" }) },
        loaderDataCache,
        isHydrating: true,
      });
      const layer = Layer.succeed(LoaderContextTag, ctx);

      const result = await Effect.runPromise(
        Effect.provide(RouteLoader.loaderData<{ title: string }>(), layer),
      );

      expect(result).toEqual({ title: "Hello World" });
    });

    it("should fail when no loader data exists", async () => {
      const ctx = makeLoaderContext({
        routeId: "routes/missing",
        params: { get: Effect.succeed({}) },
        loaderDataCache: new Map(),
        isHydrating: false,
      });
      const layer = Layer.succeed(LoaderContextTag, ctx);

      const result = await Effect.runPromise(
        Effect.either(Effect.provide(RouteLoader.loaderData(), layer)),
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(Error);
        expect((result.left as Error).message).toContain("routes/missing");
      }
    });
  });

  describe("parentData", () => {
    it("should return parent route data when available", async () => {
      const ctx = makeLoaderContext({
        routeId: "routes/users/$id/posts",
        params: { get: Effect.succeed({ id: "1" }) },
        loaderDataCache: new Map(),
        isHydrating: false,
        parentData: { user: { id: "1", name: "Alice" } },
      });
      const layer = Layer.succeed(LoaderContextTag, ctx);

      const result = await Effect.runPromise(
        Effect.provide(
          RouteLoader.parentData<{ user: { id: string; name: string } }>(),
          layer,
        ),
      );

      expect(result).toEqual({ user: { id: "1", name: "Alice" } });
    });

    it("should die when no parent data available", async () => {
      const ctx = makeLoaderContext({
        routeId: "routes/users",
        params: { get: Effect.succeed({}) },
        loaderDataCache: new Map(),
        isHydrating: false,
        // No parentData
      });
      const layer = Layer.succeed(LoaderContextTag, ctx);

      await expect(
        Effect.runPromise(Effect.provide(RouteLoader.parentData(), layer)),
      ).rejects.toThrow("No parent route data available");
    });
  });

  describe("formData", () => {
    it("should return form data from action context", async () => {
      const formData = new FormData();
      formData.append("username", "alice");
      formData.append("email", "alice@example.com");

      const ctx = makeActionContext(
        new Request("https://example.com/", { method: "POST" }),
        formData,
      );
      const layer = Layer.succeed(ActionContextTag, ctx);

      const result = await Effect.runPromise(
        Effect.provide(RouteLoader.formData(), layer),
      );

      expect(result.get("username")).toBe("alice");
      expect(result.get("email")).toBe("alice@example.com");
    });
  });

  describe("request", () => {
    it("should return the request from action context", async () => {
      const request = new Request("https://example.com/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const ctx = makeActionContext(request, new FormData());
      const layer = Layer.succeed(ActionContextTag, ctx);

      const result = await Effect.runPromise(
        Effect.provide(RouteLoader.request(), layer),
      );

      expect(result.url).toBe("https://example.com/api/submit");
      expect(result.method).toBe("POST");
    });
  });

  describe("redirect", () => {
    it("should fail with RedirectError", async () => {
      const result = await Effect.runPromise(
        Effect.either(RouteLoader.redirect("/login")),
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        const error = result.left as RedirectError;
        expect(error._tag).toBe("RedirectError");
        expect(error.url).toBe("/login");
        expect(error.status).toBe(302);
      }
    });

    it("should use provided status code", async () => {
      const result = await Effect.runPromise(
        Effect.either(RouteLoader.redirect("/moved", 301)),
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        const error = result.left as RedirectError;
        expect(error.status).toBe(301);
      }
    });

    it("should support all valid redirect status codes", async () => {
      const statuses: (301 | 302 | 303 | 307 | 308)[] = [
        301, 302, 303, 307, 308,
      ];

      for (const status of statuses) {
        const result = await Effect.runPromise(
          Effect.either(RouteLoader.redirect("/", status)),
        );

        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect((result.left as RedirectError).status).toBe(status);
        }
      }
    });
  });

  describe("RedirectError", () => {
    it("should create with default status", () => {
      const error = new RedirectError("/dashboard");

      expect(error._tag).toBe("RedirectError");
      expect(error.url).toBe("/dashboard");
      expect(error.status).toBe(302);
    });

    it("should create with custom status", () => {
      const error = new RedirectError("/new-location", 301);

      expect(error.status).toBe(301);
    });
  });

  describe("makeLoaderContext", () => {
    it("should create context with all properties", () => {
      const loaderDataCache = new Map();
      const ctx = makeLoaderContext({
        routeId: "routes/test",
        params: { get: Effect.succeed({ key: "value" }) },
        loaderDataCache,
        isHydrating: true,
        parentData: { foo: "bar" },
      });

      expect(ctx.routeId).toBe("routes/test");
      expect(ctx.loaderDataCache).toBe(loaderDataCache);
      expect(ctx.isHydrating).toBe(true);
      expect(Option.isSome(ctx.parentData)).toBe(true);
      if (Option.isSome(ctx.parentData)) {
        expect(ctx.parentData.value).toEqual({ foo: "bar" });
      }
    });

    it("should create context with None for missing parentData", () => {
      const ctx = makeLoaderContext({
        routeId: "routes/test",
        params: { get: Effect.succeed({}) },
        loaderDataCache: new Map(),
        isHydrating: false,
      });

      expect(Option.isNone(ctx.parentData)).toBe(true);
    });
  });

  describe("makeActionContext", () => {
    it("should create action context", () => {
      const request = new Request("https://example.com/action", {
        method: "POST",
      });
      const formData = new FormData();
      formData.append("field", "value");

      const ctx = makeActionContext(request, formData);

      expect(ctx.request).toBe(request);
      expect(ctx.formData).toBe(formData);
      expect(ctx.formData.get("field")).toBe("value");
    });
  });
});
