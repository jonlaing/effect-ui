import { Duration, Effect, Either, Fiber, pipe } from "effect";

import type { Element } from "./Element";
import { RendererContext, type Renderer, type Slot } from "./Renderer";

/**
 * Options for the suspense boundary.
 */
export interface SuspenseOptions<N, E, R1, RF, RC> {
  /**
   * Async function that returns the final element.
   * Can fail with error type E if `catch` is provided.
   */
  readonly render: () => Element<N, E, R1>;

  /**
   * Function to render the loading/fallback state.
   * Must have no requirements (will be rendered in detached context if delay > 0).
   */
  readonly fallback: () => Element<N, never, RF>;

  /**
   * Optional error handler. If provided, errors from render are caught
   * and this function is called to render an error state.
   * Must have no requirements.
   */
  readonly catch?: (error: E) => Element<N, never, RC>;

  /**
   * Delay before showing the fallback.
   * If the render completes before this duration, no fallback is shown.
   * Accepts Effect Duration strings like "200 millis", "1 second", or a number (milliseconds).
   * If not provided, fallback is shown immediately.
   */
  readonly delay?: Duration.DurationInput;
}

// ============================================================================
// Composable building blocks
// ============================================================================

/**
 * Handle the result of an async render, updating the slot with either
 * the success value or an error element (if catch handler is provided).
 */
const handleRenderResult =
  <N, E, R1, RC>(
    slot: Slot<N>,
    catchRender?: (error: E) => Element<N, never, RC>,
  ) =>
  (element: Element<N, E, R1>): Element<void, E, R1 | RC> =>
    pipe(
      element,
      Effect.flatMap((e) => slot.setContent(e)),
      Effect.catchAll((error) =>
        catchRender
          ? pipe(
              catchRender(error),
              Effect.flatMap((el) => slot.setContent(el)),
            )
          : Effect.void,
      ), // No catch handler means E = never, so this branch is unreachable
    );

/**
 * Create a fallback display effect that shows the fallback in a slot.
 */
const createFallbackEffect = <N, RF>(
  fallbackRender: () => Element<N, never, RF>,
  slot: Slot<N>,
) =>
  pipe(
    fallbackRender(),
    Effect.flatMap((el) => slot.setContent(el)),
  );

// ============================================================================
// Main suspense implementation
// ============================================================================

/**
 * Suspense boundary for async rendering with loading states.
 *
 * Renders the fallback while waiting for the async render to complete.
 * Optionally delays showing the fallback to avoid loading flashes on fast responses.
 * Optionally catches errors and renders an error state.
 *
 * @example
 * ```ts
 * // Simple - show fallback immediately (using @effex/dom)
 * Boundary.suspense({
 *   render: () => fetchAndRenderUser(userId),
 *   fallback: () => $.div({}, $.of("Loading...")),
 * })
 * ```
 *
 * @example
 * ```ts
 * // With delay - avoid loading flash on fast responses
 * Boundary.suspense({
 *   render: () => Effect.gen(function* () {
 *     const user = yield* fetchUser(userId)
 *     return yield* UserPage({ user })
 *   }),
 *   fallback: () => $.div({}, $.of("Loading user...")),
 *   delay: "200 millis",
 * })
 * ```
 */
export const suspense: {
  // Overload 1: No catch, render cannot fail
  <N, R1 = never, RF = never>(
    options: SuspenseOptions<N, never, R1, RF, never> & { catch?: never },
  ): Element<N, never, R1 | RF>;

  // Overload 2: With catch, render can fail
  <N, E, R1 = never, RF = never, RC = never>(
    options: SuspenseOptions<N, E, R1, RF, RC> & {
      catch: (error: E) => Element<N, never, RC>;
    },
  ): Element<N, never, R1 | RF | RC>;
} = <N, E, R1 = never, RF = never, RC = never>(
  options: SuspenseOptions<N, E, R1, RF, RC>,
): Element<N, never, R1 | RF | RC> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<N>;
    const scope = yield* Effect.scope;
    const slot = yield* renderer.createSlot();

    const delayMs =
      options.delay !== undefined ? Duration.toMillis(options.delay) : 0;

    // Show fallback: immediately if no delay, otherwise fork with delay
    const fallbackFiber =
      delayMs > 0
        ? yield* pipe(
            createFallbackEffect(options.fallback, slot),
            Effect.delay(Duration.millis(delayMs)),
            Effect.interruptible,
            Effect.forkIn(scope),
          )
        : null;

    // If no delay, show fallback synchronously before forking render
    if (fallbackFiber === null) {
      yield* createFallbackEffect(options.fallback, slot);
    }

    // Fork main render: interrupt fallback timer (if any), then handle result
    yield* pipe(
      options.render(),
      Effect.tap(() =>
        fallbackFiber ? Fiber.interrupt(fallbackFiber) : Effect.void,
      ),
      handleRenderResult(slot, options.catch),
      Effect.forkIn(scope),
    );

    return slot.marker;
  });

/**
 * Error boundary that catches errors from a render function and displays a fallback element.
 *
 * @param tryRender - Function that may fail with an error
 * @param catchRender - Function to render the error fallback
 *
 * @example
 * ```ts
 * // Using @effex/dom
 * Boundary.error(
 *   () => riskyComponent(),
 *   (error) => $.div({}, $.of(`Something went wrong: ${String(error)}`))
 * )
 * ```
 */
export const error = <N, E, R1 = never, R2 = never>(
  tryRender: () => Element<N, E, R1>,
  catchRender: (error: E) => Element<N, never, R2>,
): Element<N, never, R1 | R2> =>
  Effect.gen(function* () {
    const result = yield* tryRender().pipe(Effect.either);

    if (Either.isLeft(result)) {
      return yield* catchRender(result.left);
    }

    return result.right;
  });

/**
 * Boundary namespace for error and async handling.
 *
 * @example
 * ```ts
 * // Suspense boundary for async loading (using @effex/dom)
 * Boundary.suspense({
 *   render: () => fetchAndRenderData(),
 *   fallback: () => $.div({}, $.of("Loading...")),
 *   catch: (err) => $.div({}, $.of(`Error: ${err}`)),
 *   delay: "200 millis",
 * })
 *
 * // Error boundary for catching render errors
 * Boundary.error(
 *   () => riskyComponent(),
 *   (err) => $.div({}, $.of(`Oops: ${err}`))
 * )
 * ```
 */
export const Boundary = {
  suspense,
  error,
} as const;

// Re-export types
export type { SuspenseOptions as BoundarySuspenseOptions };
