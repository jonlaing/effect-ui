import { Effect, Layer, Option } from "effect";
import { beforeEach, describe, expect, it } from "vitest";

import {
  $,
  AnimationConfigCtx,
  ClientControlCtx,
  DOMRendererLive,
} from "@effex/dom";

import { Navigation } from "./Navigation.js";
import { Outlet } from "./Outlet.js";
import { Route } from "./Route.js";
import { concat, empty } from "./Router.js";

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
});
