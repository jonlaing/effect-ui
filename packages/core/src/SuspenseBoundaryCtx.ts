import { Context, Effect, Fiber, Option, Scope, type Duration } from "effect";

import type { Element } from "./Element.js";
import { RendererContext } from "./Renderer.js";

/**
 * Context interface for suspense boundary operations.
 * Abstracts SSR/Hydration/Client differences behind a unified API.
 *
 * Each environment provides an implementation:
 * - SSR: Creates container with hydration markers, renders fallback only
 * - Hydration: Finds existing container, forks async render
 * - Client: Creates slot, handles delay logic, forks async render
 */
export interface ISuspenseBoundaryCtx<N> {
  /**
   * Create a suspension point, returns the element we'll return from suspense.
   * The implementation stores internal state for subsequent method calls.
   *
   * - SSR: Creates container with hydration markers, returns it
   * - Hydration: Finds existing container by ID, returns it
   * - Client: Creates a Slot, returns slot.marker
   */
  readonly createSuspensionPoint: () => Effect.Effect<
    N,
    never,
    RendererContext
  >;

  /**
   * Show fallback content.
   * Returns Some(fiber) if display is deferred and can be interrupted.
   *
   * - SSR: Appends to container immediately, returns None
   * - Hydration: Noop (fallback already in DOM), returns None
   * - Client (no delay): Sets in slot immediately, returns None
   * - Client (with delay): Forks delayed display, returns Some(fiber)
   */
  readonly showFallback: (
    element: N,
    delay: Option.Option<Duration.Duration>,
  ) => Effect.Effect<
    Option.Option<Fiber.Fiber<void, never>>,
    never,
    Scope.Scope
  >;

  /**
   * Fork the async render.
   * Interrupts fallback fiber if render completes first.
   *
   * - SSR: Noop
   * - Hydration: Forks render, replaces content on complete, updates state marker
   * - Client: Forks render, interrupts fallbackFiber if Some, sets content
   *
   * Note: R1 and RC context requirements are satisfied through the parent fiber's
   * inherited context when the forked fiber runs, not through the returned Effect.
   */
  readonly forkRender: <E, R1, RC>(
    render: () => Element<N, E, R1>,
    catchRender: ((error: E) => Element<N, never, RC>) | undefined,
    fallbackFiber: Option.Option<Fiber.Fiber<void, never>>,
  ) => Effect.Effect<void, never, Scope.Scope>;
}

/**
 * Context tag for suspense boundary operations.
 * Uses `unknown` as the base element type - implementations narrow this.
 */
export class SuspenseBoundaryCtx extends Context.Tag(
  "@stax-ui/core/SuspenseBoundaryCtx",
)<SuspenseBoundaryCtx, ISuspenseBoundaryCtx<unknown>>() {}
