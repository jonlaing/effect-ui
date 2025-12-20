import { Effect, Option } from "effect";
import type { Duration, Scope } from "effect";
import type { Element } from "./Element";
import {
  suspense as coreSuspense,
  error as coreError,
  RendererContext,
  type RendererInterface,
} from "@effex/core";
import { SSRContext } from "./SSRContext";

/**
 * Options for the suspense boundary (DOM-specialized version).
 */
export interface SuspenseOptions<E, R1, EF> {
  /**
   * Async function that returns the final element.
   * Can fail with error type E if `catch` is provided.
   */
  readonly render: () => Effect.Effect<HTMLElement, E, Scope.Scope | R1>;

  /**
   * Function to render the loading/fallback state.
   * Must have no requirements (will be rendered in detached context if delay > 0).
   */
  readonly fallback: () => Element<EF, never>;

  /**
   * Optional error handler. If provided, errors from render are caught
   * and this function is called to render an error state.
   * Must have no requirements.
   */
  readonly catch?: (error: E) => Element<never, never>;

  /**
   * Delay before showing the fallback.
   * If the render completes before this duration, no fallback is shown.
   * Accepts Effect Duration strings like "200 millis", "1 second", or a number (milliseconds).
   * If not provided, fallback is shown immediately.
   */
  readonly delay?: Duration.DurationInput;
}

/**
 * Suspense boundary for async rendering with loading states.
 *
 * Renders the fallback while waiting for the async render to complete.
 * Optionally delays showing the fallback to avoid loading flashes on fast responses.
 * Optionally catches errors and renders an error state.
 *
 * @example
 * ```ts
 * // Simple - show fallback immediately
 * Boundary.suspense({
 *   render: () => fetchAndRenderUser(userId),
 *   fallback: () => div("Loading..."),
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
 *   fallback: () => div("Loading user..."),
 *   delay: "200 millis",
 * })
 * ```
 *
 * @example
 * ```ts
 * // With error handling
 * Boundary.suspense({
 *   render: () => Effect.gen(function* () {
 *     const user = yield* fetchUser(userId)
 *     return yield* UserPage({ user })
 *   }),
 *   fallback: () => div("Loading..."),
 *   catch: (error) => div(["Error: ", String(error)]),
 *   delay: "200 millis",
 * })
 * ```
 */
export const suspense: {
  // Overload 1: No catch, render cannot fail
  <R1 = never, EF = never>(
    options: SuspenseOptions<never, R1, EF> & { catch?: never },
  ): Element<EF, R1>;

  // Overload 2: With catch, render can fail
  <E, R1 = never, EF = never>(
    options: SuspenseOptions<E, R1, EF> & {
      catch: (error: E) => Element<never, never>;
    },
  ): Element<EF, R1>;
} = <E, R1 = never, EF = never>(
  options: SuspenseOptions<E, R1, EF>,
): Element<EF, R1> =>
  Effect.gen(function* () {
    const ssrContext = yield* Effect.serviceOption(SSRContext);

    // SSR mode: render fallback with hydration markers
    if (Option.isSome(ssrContext)) {
      const renderer = (yield* RendererContext) as RendererInterface<Node>;
      const hydrationId = yield* ssrContext.value.generateId;

      // Create container with hydration markers
      const container = yield* renderer.createNode("div");
      yield* renderer.setStyleProperty(container, "display", "contents");
      yield* renderer.setAttribute(container, "data-effex-id", hydrationId);
      yield* renderer.setAttribute(container, "data-effex-type", "suspense");
      yield* renderer.setAttribute(
        container,
        "data-effex-suspense-state",
        "loading",
      );

      // Render the fallback
      const fallback = yield* options.fallback();
      yield* renderer.appendChild(container, fallback);

      return container as HTMLElement;
    }

    // Client-side: use the core implementation
    // Cast to any to bypass the strict type checking on overloads
    // The runtime behavior is correct because coreSuspense handles all cases
    return yield* (coreSuspense as any)(options);
  }) as Element<EF, R1>;

/**
 * Error boundary that catches errors from a render function and displays a fallback element.
 *
 * @param tryRender - Function that may fail with an error
 * @param catchRender - Function to render the error fallback
 *
 * @example
 * ```ts
 * Boundary.error(
 *   () => riskyComponent(),
 *   (error) => div(["Something went wrong: ", String(error)])
 * )
 * ```
 */
export const error = <E, R1 = never, E2 = never, R2 = never>(
  tryRender: () => Effect.Effect<HTMLElement, E, Scope.Scope | R1>,
  catchRender: (error: E) => Element<E2, R2>,
): Element<E2, R1 | R2> => {
  return coreError(tryRender, catchRender) as Element<E2, R1 | R2>;
};

/**
 * Boundary namespace for error and async handling.
 *
 * @example
 * ```ts
 * // Suspense boundary for async loading
 * Boundary.suspense({
 *   render: () => fetchAndRenderData(),
 *   fallback: () => $.div("Loading..."),
 *   catch: (err) => $.div(`Error: ${err}`),
 *   delay: "200 millis",
 * })
 *
 * // Error boundary for catching render errors
 * Boundary.error(
 *   () => riskyComponent(),
 *   (err) => $.div(`Oops: ${err}`)
 * )
 * ```
 */
export const Boundary = {
  suspense,
  error,
} as const;

// Re-export types
export type { SuspenseOptions as BoundarySuspenseOptions };
