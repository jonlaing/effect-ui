import { Effect, Option, Stream } from "effect";
import { describe, expect, it } from "vitest";

import type { Readable } from "@effex/core";
import { DOMRendererLive } from "@effex/dom";

import { Link, makeRouterLayer, RouterContext } from "./RouterContext";
import type { BaseRouter } from "./types";

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
// Note: We use `unknown` cast here because BaseRouter.layer is self-referential
const createMockRouter = (initialPath = "/"): BaseRouter => {
  let pathname = initialPath;

  // Create partial router first (all properties except layer)
  const partialRouter = {
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

  // Create layer then combine into full router using Object.assign
  const layer = makeRouterLayer(partialRouter as unknown as BaseRouter);
  return Object.assign({}, partialRouter, { layer }) as BaseRouter;
};

describe("RouterContext", () => {
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
    it("should create an anchor element when RouterContext is provided", async () => {
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

      expect(element.tagName).toBe("A");
      expect(element.getAttribute("href")).toBe("/test");
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
