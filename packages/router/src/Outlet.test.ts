import { Effect, Layer, Option } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  $,
  AnimationConfigCtx,
  ClientControlCtx,
  DOMRendererLive,
} from "@effex/dom";

import { Navigation } from "./Navigation.js";
import { Outlet } from "./Outlet.js";
import { Route } from "./Route.js";
import {
  concat,
  empty,
  scrollBehavior as routerScrollBehavior,
} from "./Router.js";

const TestLayer = Layer.mergeAll(ClientControlCtx, DOMRendererLive);

describe("Outlet", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("provides AnimationConfigCtx when `animate` is set", async () => {
    // Route's render function peeks at AnimationConfigCtx to prove the
    // Outlet wired it through. Without the fix, `Effect.serviceOption`
    // returned `Option.none()` — `config.animate` sat unused in the
    // OutletConfig type.
    let received: unknown = "not-set";

    const HomeRoute = Route.make("/").pipe(
      Route.render(() =>
        Effect.gen(function* () {
          const cfg = yield* Effect.serviceOption(AnimationConfigCtx);
          received = Option.getOrNull(cfg);
          return yield* $.div({ class: "home" }, $.of("Home"));
        }),
      ),
    );

    const router = empty.pipe(concat(HomeRoute));
    const navLayer = Navigation.makeLayer(router, { initialPath: "/" });

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* Outlet({
          router,
          animate: {
            enterFrom: "opacity-0",
            enter: "opacity-100",
            timeout: 10,
          },
        });
      }).pipe(
        Effect.scoped,
        Effect.provide(navLayer),
        Effect.provide(TestLayer),
      ),
    );

    expect(received).not.toBeNull();
    expect(received).toMatchObject({
      single: expect.objectContaining({ enterFrom: "opacity-0" }),
    });
  });

  it("does not provide AnimationConfigCtx when no `animate` or `intro` is set", async () => {
    // Ensures the wire-up is opt-in: routes that don't configure
    // animation see `Option.none()`, so downstream control-ctx code
    // treats the slot as non-animated.
    let received: unknown = "not-set";

    const HomeRoute = Route.make("/").pipe(
      Route.render(() =>
        Effect.gen(function* () {
          const cfg = yield* Effect.serviceOption(AnimationConfigCtx);
          received = Option.getOrNull(cfg);
          return yield* $.div({ class: "home" }, $.of("Home"));
        }),
      ),
    );

    const router = empty.pipe(concat(HomeRoute));
    const navLayer = Navigation.makeLayer(router, { initialPath: "/" });

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* Outlet({ router });
      }).pipe(
        Effect.scoped,
        Effect.provide(navLayer),
        Effect.provide(TestLayer),
      ),
    );

    expect(received).toBeNull();
  });

  describe("scroll behavior", () => {
    let scrollSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      scrollSpy = vi.fn();
      // jsdom's window.scrollTo is a no-op stub — swap it for a spy we can
      // assert against. The framework calls scrollTo({ top, left, behavior })
      // for the "top" case.
      Object.defineProperty(window, "scrollTo", {
        value: scrollSpy,
        writable: true,
        configurable: true,
      });
    });

    const HomeRoute = Route.make("/").pipe(
      Route.render(() => $.div({ class: "home" }, $.of("Home"))),
    );
    const AboutRoute = Route.make("/about").pipe(
      Route.render(() => $.div({ class: "about" }, $.of("About"))),
    );

    it("applies the router-level `top` default on pushPath", async () => {
      const router = empty.pipe(
        concat(HomeRoute),
        concat(AboutRoute),
        routerScrollBehavior("top"),
      );
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });

      await Effect.runPromise(
        Effect.gen(function* () {
          const nav = yield* Navigation.Context;
          yield* Outlet({ router });
          yield* Effect.sleep("10 millis");
          yield* nav.pushPath("/about");
          yield* Effect.sleep("10 millis");
        }).pipe(
          Effect.scoped,
          Effect.provide(navLayer),
          Effect.provide(TestLayer),
        ),
      );

      expect(scrollSpy).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    });

    it("respects `preserve` — does not scroll", async () => {
      const router = empty.pipe(
        concat(HomeRoute),
        concat(AboutRoute),
        routerScrollBehavior("preserve"),
      );
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });

      await Effect.runPromise(
        Effect.gen(function* () {
          const nav = yield* Navigation.Context;
          yield* Outlet({ router });
          yield* Effect.sleep("10 millis");
          yield* nav.pushPath("/about");
          yield* Effect.sleep("10 millis");
        }).pipe(
          Effect.scoped,
          Effect.provide(navLayer),
          Effect.provide(TestLayer),
        ),
      );

      expect(scrollSpy).not.toHaveBeenCalled();
    });

    it("route-level override wins over router-level default", async () => {
      const PreserveAbout = Route.make("/about").pipe(
        Route.render(() => $.div({ class: "about" }, $.of("About"))),
        Route.scrollBehavior("preserve"),
      );
      const router = empty.pipe(
        concat(HomeRoute),
        concat(PreserveAbout),
        routerScrollBehavior("top"),
      );
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });

      await Effect.runPromise(
        Effect.gen(function* () {
          const nav = yield* Navigation.Context;
          yield* Outlet({ router });
          yield* Effect.sleep("10 millis");
          yield* nav.pushPath("/about");
          yield* Effect.sleep("10 millis");
        }).pipe(
          Effect.scoped,
          Effect.provide(navLayer),
          Effect.provide(TestLayer),
        ),
      );

      expect(scrollSpy).not.toHaveBeenCalled();
    });

    it("defaults to `top` when neither Router nor Route configures it", async () => {
      const router = empty.pipe(concat(HomeRoute), concat(AboutRoute));
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });

      await Effect.runPromise(
        Effect.gen(function* () {
          const nav = yield* Navigation.Context;
          yield* Outlet({ router });
          yield* Effect.sleep("10 millis");
          yield* nav.pushPath("/about");
          yield* Effect.sleep("10 millis");
        }).pipe(
          Effect.scoped,
          Effect.provide(navLayer),
          Effect.provide(TestLayer),
        ),
      );

      expect(scrollSpy).toHaveBeenCalledWith({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    });

    it("calls a custom function with from/to", async () => {
      const customFn = vi.fn(() => Effect.void);
      const router = empty.pipe(
        concat(HomeRoute),
        concat(AboutRoute),
        routerScrollBehavior(customFn),
      );
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });

      await Effect.runPromise(
        Effect.gen(function* () {
          const nav = yield* Navigation.Context;
          yield* Outlet({ router });
          yield* Effect.sleep("10 millis");
          yield* nav.pushPath("/about");
          yield* Effect.sleep("10 millis");
        }).pipe(
          Effect.scoped,
          Effect.provide(navLayer),
          Effect.provide(TestLayer),
        ),
      );

      expect(customFn).toHaveBeenCalledWith("/", "/about");
    });

    it("skips the behavior on popstate — leaves the browser in charge", async () => {
      const router = empty.pipe(
        concat(HomeRoute),
        concat(AboutRoute),
        routerScrollBehavior("top"),
      );
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });

      await Effect.runPromise(
        Effect.gen(function* () {
          const nav = yield* Navigation.Context;
          yield* Outlet({ router });
          yield* Effect.sleep("10 millis");

          // First a push so we have a source that isn't "pop" yet — clear
          // the spy after to isolate the popstate assertion.
          yield* nav.pushPath("/about");
          yield* Effect.sleep("10 millis");
          scrollSpy.mockClear();

          // Simulate a browser back — mutate location + fire popstate the
          // Navigation handler listens for.
          Object.defineProperty(window, "location", {
            value: { ...window.location, pathname: "/", search: "" },
            writable: true,
            configurable: true,
          });
          window.dispatchEvent(new PopStateEvent("popstate"));
          yield* Effect.sleep("20 millis");
        }).pipe(
          Effect.scoped,
          Effect.provide(navLayer),
          Effect.provide(TestLayer),
        ),
      );

      expect(scrollSpy).not.toHaveBeenCalled();
    });
  });
});
