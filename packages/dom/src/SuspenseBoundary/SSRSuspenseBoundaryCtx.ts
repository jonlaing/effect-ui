/**
 * SSR SuspenseBoundaryCtx Layer implementation.
 * Creates container with hydration markers, renders fallback only, no async.
 */

import { Effect, Layer, Option } from "effect";

import {
  RendererContext,
  SuspenseBoundaryCtx,
  type ISuspenseBoundaryCtx,
  type Renderer,
} from "@effex/core";

import { SSRContext } from "../server/SSRContext.js";

type DOMElement = HTMLElement | SVGElement;

/**
 * SSR SuspenseBoundaryCtx implementation.
 * Renders fallback with hydration markers, no async support.
 */
export const SSRSuspenseBoundaryCtx: Layer.Layer<
  SuspenseBoundaryCtx,
  never,
  RendererContext | SSRContext
> = Layer.effect(
  SuspenseBoundaryCtx,
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<DOMElement>;
    const ssrContext = yield* SSRContext;

    // Internal state - container created by createSuspensionPoint
    let container: DOMElement | null = null;

    const ctx: ISuspenseBoundaryCtx<DOMElement> = {
      createSuspensionPoint: () =>
        Effect.gen(function* () {
          const hydrationId = yield* ssrContext.generateId;

          // Create container with hydration markers
          const el = (yield* renderer.createNode("div")) as HTMLElement;
          yield* renderer.setStyleProperty(el, "display", "contents");
          yield* renderer.setAttribute(el, "data-effex-id", hydrationId);
          yield* renderer.setAttribute(el, "data-effex-type", "suspense");
          yield* renderer.setAttribute(
            el,
            "data-effex-suspense-state",
            "loading",
          );

          container = el;
          return el;
        }),

      showFallback: (element, _delay) =>
        Effect.gen(function* () {
          // In SSR, always show fallback immediately (ignore delay)
          if (container) {
            yield* renderer.appendChild(container, element);
          }
          // Always return None - no fiber to interrupt in SSR
          return Option.none();
        }),

      forkRender: () =>
        // Noop in SSR - no async rendering
        Effect.void,
    };

    return ctx as ISuspenseBoundaryCtx<unknown>;
  }),
);
