import { Effect, Layer, Option } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  $,
  AnimationConfigCtx,
  ClientControlCtx,
  DOMRendererLive,
} from "@stax-ui/dom";

import { Navigation } from "./Navigation.js";
import { Outlet } from "./Outlet.js";
import { Route } from "./Route.js";
import { RouteDataProvider } from "./RouteData.js";
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

  describe("RouteDataProvider visibility (regression: issue #50)", () => {
    // Issue #50 reported that inside `reconcile`'s forked subscription
    // fiber, `Effect.serviceOption(RouteDataProvider)` returned None even
    // when the provider was provided at the top level. That silently
    // routed Outlet through its "no provider" SPA fallback branch on
    // client-side navigation, so a Route.static route rendered with
    // `data === undefined` on subsequent nav.
    //
    // The root cause has since been fixed — most likely by #78 (hydrate
    // now builds layers as a Context in its outer program scope, so
    // context propagates correctly to fibers forked from the element).
    // These tests pin the behavior so any regression re-surfaces at the
    // level the original bug was reported: whether getRouteData is
    // actually invoked on subsequent client-nav renders.

    it("initial render sees RouteDataProvider", async () => {
      const getRouteData = vi.fn(() =>
        Effect.succeed({
          data: { title: "Initial" },
          loaderPath: "/?_data=1",
          actions: {},
        }),
      );
      const providerLayer = Layer.succeed(RouteDataProvider, { getRouteData });

      const HomeRoute = Route.make("/").pipe(
        Route.static({
          load: () => Effect.succeed({ title: "Home" }),
          render: (data) => $.div({ class: "home" }, $.of(data.title)),
        }),
      );

      const router = empty.pipe(concat(HomeRoute));
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });

      await Effect.runPromise(
        Effect.gen(function* () {
          yield* Outlet({ router });
          yield* Effect.sleep("10 millis");
        }).pipe(
          Effect.scoped,
          Effect.provide(navLayer),
          Effect.provide(providerLayer),
          Effect.provide(TestLayer),
        ),
      );

      // Initial render should have gone through the provider (not the SPA
      // fallback branch). The provider's getRouteData is invoked with the
      // matched route, its params, and its search params.
      expect(getRouteData).toHaveBeenCalled();
    });

    it("subsequent client-nav render still sees RouteDataProvider", async () => {
      // The bug from #50: after the initial hydration render, when the
      // reconcile subscription fires on pushPath, the forked subscription
      // fiber inside subscribeReconcile loses visibility of the top-level
      // RouteDataProvider. This asserts that getRouteData is invoked with
      // BOTH the initial and the post-nav route.
      const invocations: string[] = [];
      const getRouteData = vi.fn((route, _params, _searchParams) => {
        invocations.push(route.path);
        return Effect.succeed({
          // Emulate what a real provider does: return data that matches the
          // route's loader shape ({ title: string }) so the render fn
          // doesn't crash on missing fields.
          data: { title: route.path === "/" ? "Home" : "About" },
          loaderPath: `${route.path}?_data=1`,
          actions: {},
        });
      });
      const providerLayer = Layer.succeed(RouteDataProvider, { getRouteData });

      const HomeRoute = Route.make("/").pipe(
        Route.static({
          load: () => Effect.succeed({ title: "Home" }),
          render: (data) => $.div({ class: "home" }, $.of(data.title)),
        }),
      );
      const AboutRoute = Route.make("/about").pipe(
        Route.static({
          load: () => Effect.succeed({ title: "About" }),
          render: (data) => $.div({ class: "about" }, $.of(data.title)),
        }),
      );

      const router = empty.pipe(concat(HomeRoute), concat(AboutRoute));
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });

      await Effect.runPromise(
        Effect.gen(function* () {
          const nav = yield* Navigation.Context;
          const outletEl = yield* Outlet({ router });
          document.body.appendChild(outletEl);
          yield* Effect.sleep("10 millis");
          yield* nav.pushPath("/about");
          // Reconcile is async — give the forked subscription fiber time to
          // process the pathname change and re-render.
          yield* Effect.sleep("50 millis");
        }).pipe(
          Effect.scoped,
          Effect.provide(navLayer),
          Effect.provide(providerLayer),
          Effect.provide(TestLayer),
        ),
      );

      // If the provider is visible only during initial render but not
      // during reconcile-driven re-render, we'll see just "/". If both,
      // we'll see "/" then "/about".
      expect(invocations).toEqual(["/", "/about"]);
    });

    // Sanity: does Route.static crash on subsequent client-nav even when
    // there's no provider (SPA fallback path)? If yes, the "provider-not-
    // visible" story from #50 is masking a different bug — Route.static
    // re-renders are just plain broken.
    it("Route.static subsequent client-nav renders without a provider (SPA fallback)", async () => {
      const HomeRoute = Route.make("/").pipe(
        Route.static({
          load: () => Effect.succeed({ title: "Home" }),
          render: (data) => $.div({ class: "home" }, $.of(data.title)),
        }),
      );
      const AboutRoute = Route.make("/about").pipe(
        Route.static({
          load: () => Effect.succeed({ title: "About" }),
          render: (data) => $.div({ class: "about" }, $.of(data.title)),
        }),
      );

      const router = empty.pipe(concat(HomeRoute), concat(AboutRoute));
      const navLayer = Navigation.makeLayer(router, { initialPath: "/" });

      await Effect.runPromise(
        Effect.gen(function* () {
          const nav = yield* Navigation.Context;
          const outletEl = yield* Outlet({ router });
          document.body.appendChild(outletEl);
          yield* Effect.sleep("10 millis");
          yield* nav.pushPath("/about");
          yield* Effect.sleep("50 millis");
        }).pipe(
          Effect.scoped,
          Effect.provide(navLayer),
          Effect.provide(TestLayer),
        ),
      );

      // If we crash before this point, there's a Route.static re-render bug
      // independent of #50.
      expect(document.querySelector(".about")?.textContent).toBe("About");
    });
  });

  describe("OutletCtx", () => {
    // Page components see a fresh transition group per mount via
    // `yield* OutletCtx` — used to sequence their own intro animations
    // off the outlet's transition rather than racing with it.
    it("provides a fresh AnimationGroup to each rendered route", async () => {
      const { OutletCtx } = await import("./OutletCtx.js");
      const { Animation } = await import("@stax-ui/dom");

      const seen: unknown[] = [];
      const collectGroup = (label: string) =>
        Effect.gen(function* () {
          const outlet = yield* OutletCtx;
          seen.push({ label, group: outlet.transition });
          return yield* $.div({ class: label }, $.of(label));
        });

      const HomeRoute = Route.make("/").pipe(
        Route.render(() => collectGroup("home")),
      );
      const AboutRoute = Route.make("/about").pipe(
        Route.render(() => collectGroup("about")),
      );
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

      const homeEntry = seen.find(
        (e): e is { label: string; group: unknown } =>
          typeof e === "object" &&
          e !== null &&
          (e as { label: string }).label === "home",
      );
      const aboutEntry = seen.find(
        (e): e is { label: string; group: unknown } =>
          typeof e === "object" &&
          e !== null &&
          (e as { label: string }).label === "about",
      );
      expect(homeEntry).toBeDefined();
      expect(aboutEntry).toBeDefined();

      // Each mount got its own group — the outlet doesn't hand the same
      // handle to both, so page-level `Animation.sequence(_, { group })`
      // in one nav doesn't get gated by a stale `_done` from a previous
      // one.
      expect(homeEntry!.group).not.toBe(aboutEntry!.group);

      // The values are actually AnimationGroups (tag brand).
      const g = aboutEntry!.group as { _tag: string };
      expect(g._tag).toBe("AnimationGroup");

      // Silence unused-import lint — the import is a compile-time
      // check that Animation is still the same reference the outlet
      // wires through.
      void Animation;
    });
  });
});
