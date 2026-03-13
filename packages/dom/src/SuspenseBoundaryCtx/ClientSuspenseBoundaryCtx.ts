/**
 * Client-side SuspenseBoundaryCtx Layer implementation.
 * Creates a slot, handles delay logic, and forks async render.
 */

import { Duration, Effect, Fiber, Layer, Option, pipe, Scope } from "effect";

import {
  RendererContext,
  SuspenseBoundaryCtx,
  type ISuspenseBoundaryCtx,
  type Renderer,
  type Slot,
} from "@effex/core";

type DOMElement = HTMLElement | SVGElement;

/**
 * Client-side SuspenseBoundaryCtx implementation.
 * Full async support with delay logic for fallback display.
 */
export const ClientSuspenseBoundaryCtx: Layer.Layer<
  SuspenseBoundaryCtx,
  never,
  RendererContext
> = Layer.effect(
  SuspenseBoundaryCtx,
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<DOMElement>;

    // Internal state - slot created by createSuspensionPoint
    let slot: Slot<DOMElement> | null = null;

    const ctx: ISuspenseBoundaryCtx<DOMElement> = {
      createSuspensionPoint: () =>
        Effect.gen(function* () {
          slot = yield* renderer.createSlot();
          return slot.marker;
        }),

      showFallback: (element, delay) =>
        Effect.gen(function* () {
          if (!slot) {
            return Option.none();
          }

          const delayMs = Option.isSome(delay)
            ? Duration.toMillis(delay.value)
            : 0;

          if (delayMs > 0) {
            // Fork delayed display, return fiber for potential interruption
            const scope = yield* Effect.scope;
            const fiber = yield* pipe(
              slot.setContent(element),
              Effect.delay(Duration.millis(delayMs)),
              Effect.interruptible,
              Effect.forkIn(scope),
            );
            return Option.some(fiber);
          } else {
            // Show immediately
            yield* slot.setContent(element);
            return Option.none();
          }
        }),

      forkRender: (render, catchRender, fallbackFiber) =>
        Effect.gen(function* () {
          if (!slot) {
            return;
          }

          const currentSlot = slot;
          const scope = yield* Effect.scope;

          yield* pipe(
            render(),
            // Interrupt fallback timer if render completes first
            Effect.tap(() =>
              Option.isSome(fallbackFiber)
                ? Fiber.interrupt(fallbackFiber.value)
                : Effect.void,
            ),
            // Set the result content
            Effect.flatMap((element) => currentSlot.setContent(element)),
            // Handle errors
            Effect.catchAll((error) =>
              catchRender
                ? pipe(
                    catchRender(error),
                    Effect.flatMap((el) => currentSlot.setContent(el)),
                  )
                : Effect.void,
            ),
            Effect.forkIn(scope),
          );
        }) as Effect.Effect<void, never, Scope.Scope>,
    };

    return ctx as ISuspenseBoundaryCtx<unknown>;
  }),
);
