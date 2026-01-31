/**
 * Hydration SuspenseBoundaryCtx Layer implementation.
 * Finds existing container, forks async render, replaces content on complete.
 */

import { Effect, Layer, Option, pipe, Scope } from "effect";

import {
  RendererContext,
  SuspenseBoundaryCtx,
  type ISuspenseBoundaryCtx,
  type Renderer,
} from "@effex/core";

import { DOMRenderer } from "../Render/DOMRenderer.js";
import { HydrationContext } from "../Render/hydrate/HydrationContext.js";

type DOMElement = HTMLElement | SVGElement;

/**
 * Hydration SuspenseBoundaryCtx implementation.
 * Finds existing suspense container and triggers async load.
 */
export const HydrationSuspenseBoundaryCtx: Layer.Layer<
  SuspenseBoundaryCtx,
  never,
  HydrationContext
> = Layer.effect(
  SuspenseBoundaryCtx,
  Effect.gen(function* () {
    const hydrationContext = yield* HydrationContext;

    // Internal state
    let container: DOMElement | null = null;
    let existingFallback: Node | null = null;

    const ctx: ISuspenseBoundaryCtx<DOMElement> = {
      createSuspensionPoint: () =>
        Effect.gen(function* () {
          const hydrationId = yield* hydrationContext.generateId;

          // Find the existing suspense container
          const suspenseInfo =
            yield* hydrationContext.findSuspense(hydrationId);

          if (suspenseInfo && suspenseInfo.state === "loading") {
            container = suspenseInfo.container;
            existingFallback = suspenseInfo.fallback;
            return suspenseInfo.container;
          }

          // Fallback: create a new container if not found (shouldn't happen in normal hydration)
          const renderer = (yield* RendererContext) as Renderer<DOMElement>;
          const el = (yield* renderer.createNode("div")) as HTMLElement;
          yield* renderer.setStyleProperty(el, "display", "contents");
          container = el;
          return el;
        }),

      showFallback: (_element, _delay) =>
        // Noop in hydration - fallback is already in the DOM from SSR
        Effect.succeed(Option.none()),

      forkRender: (render, catchRender, _fallbackFiber) =>
        Effect.gen(function* () {
          if (!container) {
            return;
          }

          const currentContainer = container;
          const fallback = existingFallback;
          const scope = yield* Effect.scope;

          // Use DOMRenderer for creating new async content (not HydrationRenderer)
          // since this content doesn't exist in the DOM yet
          const domRendererLayer = Layer.succeed(
            RendererContext,
            DOMRenderer as Renderer<unknown>,
          );

          yield* pipe(
            render(),
            Effect.provide(domRendererLayer),
            Effect.tap((element) =>
              Effect.sync(() => {
                // Update state attribute
                currentContainer.setAttribute(
                  "data-effex-suspense-state",
                  "loaded",
                );

                // Replace fallback with actual content
                if (fallback) {
                  currentContainer.replaceChild(element, fallback);
                } else {
                  currentContainer.appendChild(element);
                }
              }),
            ),
            Effect.catchAll((error) => {
              if (catchRender) {
                return pipe(
                  catchRender(error),
                  Effect.provide(domRendererLayer),
                  Effect.tap((errorElement) =>
                    Effect.sync(() => {
                      currentContainer.setAttribute(
                        "data-effex-suspense-state",
                        "error",
                      );
                      if (fallback) {
                        currentContainer.replaceChild(errorElement, fallback);
                      } else {
                        currentContainer.appendChild(errorElement);
                      }
                    }),
                  ),
                );
              }
              return Effect.void;
            }),
            Effect.forkIn(scope),
          );

          // Note: we don't need to interrupt fallbackFiber in hydration
          // because showFallback is a noop (fallback is already visible from SSR)
        }) as Effect.Effect<void, never, Scope.Scope>,
    };

    return ctx as ISuspenseBoundaryCtx<unknown>;
  }),
);
