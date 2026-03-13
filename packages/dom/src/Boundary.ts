/**
 * DOM-specific boundary components for async and error handling.
 *
 * The suspense boundary now uses SuspenseBoundaryCtx which is provided
 * by the rendering entry points (mount, hydrate, renderToString).
 * This allows the same code to work across client, SSR, and hydration modes.
 */

import type { Duration } from "effect";

import {
  Boundary as CoreBoundary,
  SuspenseBoundaryCtx,
  type BoundarySuspenseOptions as CoreSuspenseOptions,
} from "@effex/core";

import * as Element from "./Element/index.js";

type DOMElement = HTMLElement | SVGElement;

/**
 * Options for the suspense boundary (DOM-specialized version).
 */
export interface SuspenseOptions<E, R1, RF, RC> {
  /**
   * Async function that returns the final element.
   * Can fail with error type E if `catch` is provided.
   */
  readonly render: () => Element.Element<DOMElement, E, R1>;

  /**
   * Function to render the loading/fallback state.
   * Must have no requirements (will be rendered in detached context if delay > 0).
   */
  readonly fallback: () => Element.Element<DOMElement, never, RF>;

  /**
   * Optional error handler. If provided, errors from render are caught
   * and this function is called to render an error state.
   * Must have no requirements.
   */
  readonly catch?: (error: E) => Element.Element<DOMElement, never, RC>;

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
 * The appropriate SuspenseBoundaryCtx layer (Client, SSR, Hydration) is provided
 * automatically by mount(), hydrate(), or renderToString().
 *
 * @example
 * ```ts
 * // Simple - show fallback immediately
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
 *
 * @example
 * ```ts
 * // With error handling
 * Boundary.suspense({
 *   render: () => Effect.gen(function* () {
 *     const user = yield* fetchUser(userId)
 *     return yield* UserPage({ user })
 *   }),
 *   fallback: () => $.div({}, $.of("Loading...")),
 *   catch: (error) => $.div({}, $.of(`Error: ${String(error)}`)),
 *   delay: "200 millis",
 * })
 * ```
 */
export const suspense: {
  // Overload 1: No catch, render cannot fail
  <R1 = never, RF = never>(
    options: SuspenseOptions<never, R1, RF, never> & { catch?: never },
  ): Element.Element<DOMElement, never, R1 | RF | SuspenseBoundaryCtx>;

  // Overload 2: With catch, render can fail
  <E, R1 = never, RF = never, RC = never>(
    options: SuspenseOptions<E, R1, RF, RC> & {
      catch: (error: E) => Element.Element<DOMElement, never, RC>;
    },
  ): Element.Element<DOMElement, never, R1 | RF | RC | SuspenseBoundaryCtx>;
} = <E, R1 = never, RF = never, RC = never>(
  options: SuspenseOptions<E, R1, RF, RC>,
): Element.Element<DOMElement, never, R1 | RF | RC | SuspenseBoundaryCtx> => {
  // Delegate to core - the context handles environment-specific behavior
  // Use intermediate cast to avoid overload resolution issues
  const coreSuspense = CoreBoundary.suspense as <
    N extends HTMLElement | SVGElement,
    E2,
    R1_2,
    RF2,
    RC2,
  >(
    opts: CoreSuspenseOptions<N, E2, R1_2, RF2, RC2>,
  ) => Element.Element<N, never, R1_2 | RF2 | RC2 | SuspenseBoundaryCtx>;

  return coreSuspense(
    options as unknown as CoreSuspenseOptions<DOMElement, E, R1, RF, RC>,
  );
};

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
 *   (error) => $.div({}, $.of(`Something went wrong: ${String(error)}`))
 * )
 * ```
 */
export const error = <E, R1 = never, R2 = never>(
  tryRender: () => Element.Element<DOMElement, E, R1>,
  catchRender: (error: E) => Element.Element<DOMElement, never, R2>,
): Element.Element<DOMElement, never, R1 | R2> =>
  CoreBoundary.error(tryRender, catchRender);

/**
 * Boundary namespace for error and async handling.
 *
 * @example
 * ```ts
 * // Suspense boundary for async loading
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
