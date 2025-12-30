import { describe, it, expect, beforeEach } from "vitest";
import { Effect, Option, Stream } from "effect";
import {
  Link,
  RouterContext,
  setRouter,
  clearRouter,
  getRouter,
  makeRouterLayer,
} from "./RouterContext";
import type { BaseRouter } from "./types";
import type { Readable } from "@effex/core";
import { DOMRendererLive } from "@effex/dom";

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
const createMockRouter = (initialPath = "/"): BaseRouter => {
  let pathname = initialPath;
  return {
    pathname: makeTestReadable(pathname),
    searchParams: makeTestReadable(new URLSearchParams()),
    currentRoute: makeTestReadable(Option.some("test")),
    loaderState: makeTestReadable({
      routeName: "test",
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
    push: (path: string) =>
      Effect.sync(() => {
        pathname = path;
      }),
    replace: (path: string) =>
      Effect.sync(() => {
        pathname = path;
      }),
    back: () => Effect.void,
    forward: () => Effect.void,
    submitAction: () => Effect.succeed(null),
  };
};

describe("RouterContext", () => {
  beforeEach(() => {
    clearRouter();
  });

  describe("legacy global setRouter / getRouter / clearRouter", () => {
    it("should set and get router", () => {
      const router = createMockRouter();
      expect(getRouter()).toBe(null);

      setRouter(router);
      expect(getRouter()).toBe(router);

      clearRouter();
      expect(getRouter()).toBe(null);
    });
  });

  describe("RouterContext", () => {
    it("should return router when provided via layer", async () => {
      const router = createMockRouter();
      const layer = makeRouterLayer(router);

      const result = await Effect.runPromise(
        RouterContext.pipe(Effect.provide(layer)),
      );
      expect(result).toBe(router);
    });
  });

  describe("Link", () => {
    it("should create a button element when RouterContext is provided", async () => {
      const router = createMockRouter();
      const layer = makeRouterLayer(router);

      const element = await Effect.runPromise(
        Effect.scoped(
          Link({ href: "/test" }, "Test").pipe(
            Effect.provide(layer),
            Effect.provide(DOMRendererLive),
          ),
        ),
      );

      expect(element.tagName).toBe("BUTTON");
      expect(element.textContent).toBe("Test");
    });

    it("should apply class with active state", async () => {
      const router = createMockRouter();
      const layer = makeRouterLayer(router);

      // Test non-active link
      const element = await Effect.runPromise(
        Effect.scoped(
          Link({ href: "/other", class: "nav" }, "Other").pipe(
            Effect.provide(layer),
            Effect.provide(DOMRendererLive),
          ),
        ),
      );
      expect(element.className).toBe("nav");

      // Test active link (matches current path "/")
      const activeElement = await Effect.runPromise(
        Effect.scoped(
          Link({ href: "/", class: "nav" }, "Home").pipe(
            Effect.provide(layer),
            Effect.provide(DOMRendererLive),
          ),
        ),
      );
      expect(activeElement.className).toBe("nav active");
    });
  });
});
