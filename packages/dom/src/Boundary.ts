import { Effect, Layer, Option, type Duration } from "effect";

import {
  Boundary as CoreBoundary,
  RendererContext,
  type Renderer,
  type RendererInterface,
} from "@effex/core";

import { DOMRenderer } from "./DOMRenderer";
import { Element } from "./Element";
import { HydrationContext } from "./HydrationContext";
import { SSRContext } from "./SSRContext";

/**
 * Options for the suspense boundary (DOM-specialized version).
 */
export interface SuspenseOptions<E, R1, RF, RC> {
  /**
   * Async function that returns the final element.
   * Can fail with error type E if `catch` is provided.
   */
  readonly render: () => Element.Element<HTMLElement | SVGElement, E, R1>;

  /**
   * Function to render the loading/fallback state.
   * Must have no requirements (will be rendered in detached context if delay > 0).
   */
  readonly fallback: () => Element.Element<HTMLElement | SVGElement, never, RF>;

  /**
   * Optional error handler. If provided, errors from render are caught
   * and this function is called to render an error state.
   * Must have no requirements.
   */
  readonly catch?: (
    error: E,
  ) => Element.Element<HTMLElement | SVGElement, never, RC>;

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
  ): Element.Element<HTMLElement | SVGElement, never, R1 | RF>;

  // Overload 2: With catch, render can fail
  <E, R1 = never, RF = never, RC = never>(
    options: SuspenseOptions<E, R1, RF, RC> & {
      catch: (error: E) => Element.Element<HTMLElement | SVGElement, never, RC>;
    },
  ): Element.Element<HTMLElement | SVGElement, never, R1 | RF | RC>;
} = <E, R1 = never, RF = never, RC = never>(
  options: SuspenseOptions<E, R1, RF, RC>,
): Element.Element<HTMLElement | SVGElement, never, R1 | RF | RC> =>
  Effect.gen(function* () {
    const ssrContext = yield* Effect.serviceOption(SSRContext);

    // SSR mode: render fallback with hydration markers
    if (Option.isSome(ssrContext)) {
      const renderer = (yield* RendererContext) as RendererInterface<Node>;
      const hydrationId = yield* ssrContext.value.generateId;

      // Create container with hydration markers
      const container = (yield* renderer.createNode("div")) as HTMLElement;
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

      return container;
    }

    // Check for hydration mode
    const hydrationContext = yield* Effect.serviceOption(HydrationContext);

    // Hydration mode: find existing container and trigger async load
    if (Option.isSome(hydrationContext)) {
      const hydrationId = yield* hydrationContext.value.generateId;

      // Find the existing suspense container
      const suspenseInfo =
        yield* hydrationContext.value.findSuspense(hydrationId);

      if (suspenseInfo && suspenseInfo.state === "loading") {
        const { container, fallback } = suspenseInfo;

        // Use DOMRenderer for creating new async content (not HydrationRenderer)
        // since this content doesn't exist in the DOM yet
        const domRendererLayer = Layer.succeed(
          RendererContext,
          DOMRenderer as Renderer<unknown>,
        );

        // Run the async render - when it completes, replace the fallback
        // Fork and await the fiber to ensure we wait for completion
        const fiber = yield* options.render().pipe(
          // Provide DOMRenderer for creating new elements
          Effect.provide(domRendererLayer),
          Effect.tap((element) =>
            Effect.sync(() => {
              // Update state attribute
              container.setAttribute("data-effex-suspense-state", "loaded");

              // Replace fallback with actual content
              if (fallback) {
                container.replaceChild(element, fallback);
              } else {
                container.appendChild(element);
              }
            }),
          ),
          Effect.catchAll((error) => {
            // If there's a catch handler, use it
            if (options.catch) {
              return options.catch!(error).pipe(
                Effect.provide(domRendererLayer),
                Effect.tap((errorElement) =>
                  Effect.sync(() => {
                    container.setAttribute(
                      "data-effex-suspense-state",
                      "error",
                    );
                    if (fallback) {
                      container.replaceChild(errorElement, fallback);
                    } else {
                      container.appendChild(errorElement);
                    }
                  }),
                ),
              );
            }
            // Re-throw if no catch handler
            return Effect.fail(error);
          }),
          Effect.fork,
        );

        // Add finalizer to await the fiber when scope closes
        yield* Effect.addFinalizer(() => fiber.await.pipe(Effect.ignore));

        return container as HTMLElement;
      }

      // If container not found or already loaded, fall through to normal render
    }

    // Client-side (fresh render): use the core implementation
    // Cast to any to bypass the strict type checking on overloads
    // The runtime behavior is correct because CoreBoundary.suspense handles all cases
    return yield* CoreBoundary.suspense(
      options as Required<SuspenseOptions<E, R1, RF, RC>>,
    );
  });

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
  tryRender: () => Element.Element<HTMLElement | SVGElement, E, R1>,
  catchRender: (
    error: E,
  ) => Element.Element<HTMLElement | SVGElement, never, R2>,
) => {
  return CoreBoundary.error(tryRender, catchRender);
};

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
