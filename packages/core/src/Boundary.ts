import { Duration, Effect, Either, Scope } from "effect";
import type { Element } from "./Element";
import { RendererContext, type Renderer } from "./Renderer";

/**
 * Options for the suspense boundary.
 */
export interface SuspenseOptions<N, E, R1, EF> {
  /**
   * Async function that returns the final element.
   * Can fail with error type E if `catch` is provided.
   */
  readonly render: () => Effect.Effect<N, E, Scope.Scope | R1>;

  /**
   * Function to render the loading/fallback state.
   * Must have no requirements (will be rendered in detached context if delay > 0).
   */
  readonly fallback: () => Element<N, EF, never>;

  /**
   * Optional error handler. If provided, errors from render are caught
   * and this function is called to render an error state.
   * Must have no requirements.
   */
  readonly catch?: (error: E) => Element<N, never, never>;

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
 */
export const suspense: {
  // Overload 1: No catch, render cannot fail
  <N, R1 = never, EF = never>(
    options: SuspenseOptions<N, never, R1, EF> & { catch?: never },
  ): Element<N, EF, R1>;

  // Overload 2: With catch, render can fail
  <N, E, R1 = never, EF = never>(
    options: SuspenseOptions<N, E, R1, EF> & {
      catch: (error: E) => Element<N, never, never>;
    },
  ): Element<N, EF, R1>;
} = <N, E, R1 = never, EF = never>(
  options: SuspenseOptions<N, E, R1, EF>,
): Element<N, EF, R1> => {
  const delayMs =
    options.delay !== undefined ? Duration.toMillis(options.delay) : 0;
  const hasCatch = options.catch !== undefined;
  const hasDelay = delayMs > 0;

  // Dispatch to the appropriate implementation
  if (hasDelay && hasCatch) {
    return suspenseWithDelayAndCatch(
      options.render as () => Effect.Effect<N, E, Scope.Scope | R1>,
      options.fallback,
      options.catch as (error: E) => Element<N, never, never>,
      delayMs,
    ) as Element<N, EF, R1>;
  } else if (hasDelay) {
    return suspenseWithDelay(
      options.render as () => Effect.Effect<N, never, Scope.Scope | R1>,
      options.fallback,
      delayMs,
    ) as Element<N, EF, R1>;
  } else if (hasCatch) {
    return suspenseWithCatch(
      options.render as () => Effect.Effect<N, E, Scope.Scope | R1>,
      options.fallback,
      options.catch as (error: E) => Element<N, never, never>,
    ) as Element<N, EF, R1>;
  } else {
    return suspenseSimple(
      options.render as () => Effect.Effect<N, never, Scope.Scope | R1>,
      options.fallback,
    ) as Element<N, EF, R1>;
  }
};

// Internal implementations

const suspenseSimple = <N, R1 = never, EF = never>(
  asyncRender: () => Effect.Effect<N, never, Scope.Scope | R1>,
  fallbackRender: () => Element<N, EF, never>,
): Element<N, EF, R1> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<N>;
    const scope = yield* Effect.scope;
    const slot = yield* renderer.createSlot();

    const fallback = yield* fallbackRender();
    yield* slot.setContent(fallback);

    yield* asyncRender().pipe(
      Effect.tap((element) => slot.setContent(element)),
      Effect.forkIn(scope),
    );

    return slot.marker;
  });

const suspenseWithCatch = <N, E, R1 = never, EF = never>(
  asyncRender: () => Effect.Effect<N, E, Scope.Scope | R1>,
  fallbackRender: () => Element<N, EF, never>,
  catchRender: (error: E) => Element<N, never, never>,
): Element<N, EF, R1> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<N>;
    const scope = yield* Effect.scope;
    const slot = yield* renderer.createSlot();

    const fallback = yield* fallbackRender();
    yield* slot.setContent(fallback);

    yield* asyncRender().pipe(
      Effect.either,
      Effect.tap((result) =>
        Effect.gen(function* () {
          if (Either.isLeft(result)) {
            const errorElement = yield* catchRender(result.left);
            yield* slot.setContent(errorElement);
          } else {
            yield* slot.setContent(result.right);
          }
        }),
      ),
      Effect.forkIn(scope),
    );

    return slot.marker;
  });

const suspenseWithDelay = <N, R1 = never, EF = never>(
  asyncRender: () => Effect.Effect<N, never, Scope.Scope | R1>,
  fallbackRender: () => Element<N, EF, never>,
  delayMs: number,
): Element<N, EF, R1> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<N>;
    const scope = yield* Effect.scope;
    const slot = yield* renderer.createSlot();

    let completed = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    timeoutId = setTimeout(() => {
      if (!completed) {
        Effect.runPromise(
          Effect.gen(function* () {
            const fallbackElement = yield* Effect.scoped(fallbackRender());
            if (!completed) {
              yield* slot.setContent(fallbackElement);
            }
          }).pipe(
            Effect.provideService(
              RendererContext,
              renderer as Renderer<unknown>,
            ),
          ),
        );
      }
    }, delayMs);

    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      }),
    );

    yield* asyncRender().pipe(
      Effect.tap((element) =>
        Effect.gen(function* () {
          completed = true;
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          yield* slot.setContent(element);
        }),
      ),
      Effect.forkIn(scope),
    );

    return slot.marker;
  });

const suspenseWithDelayAndCatch = <N, E, R1 = never, EF = never>(
  asyncRender: () => Effect.Effect<N, E, Scope.Scope | R1>,
  fallbackRender: () => Element<N, EF, never>,
  catchRender: (error: E) => Element<N, never, never>,
  delayMs: number,
): Element<N, EF, R1> =>
  Effect.gen(function* () {
    const renderer = (yield* RendererContext) as Renderer<N>;
    const scope = yield* Effect.scope;
    const slot = yield* renderer.createSlot();

    let completed = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    timeoutId = setTimeout(() => {
      if (!completed) {
        Effect.runPromise(
          Effect.gen(function* () {
            const fallbackElement = yield* Effect.scoped(fallbackRender());
            if (!completed) {
              yield* slot.setContent(fallbackElement);
            }
          }).pipe(
            Effect.provideService(
              RendererContext,
              renderer as Renderer<unknown>,
            ),
          ),
        );
      }
    }, delayMs);

    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      }),
    );

    yield* asyncRender().pipe(
      Effect.either,
      Effect.tap((result) =>
        Effect.gen(function* () {
          completed = true;
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          const newElement = Either.isLeft(result)
            ? yield* catchRender(result.left)
            : result.right;

          yield* slot.setContent(newElement);
        }),
      ),
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
 * Boundary.error(
 *   () => riskyComponent(),
 *   (error) => div(["Something went wrong: ", String(error)])
 * )
 * ```
 */
export const error = <N, E, R1 = never, E2 = never, R2 = never>(
  tryRender: () => Effect.Effect<N, E, Scope.Scope | R1>,
  catchRender: (error: E) => Element<N, E2, R2>,
): Element<N, E2, R1 | R2> =>
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
