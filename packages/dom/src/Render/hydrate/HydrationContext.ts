import { Context, Effect, Layer, Ref } from "effect";

/**
 * Hydration context service interface.
 * Used during client-side hydration to generate matching IDs
 * and look up existing DOM elements.
 */
export interface HydrationContextService {
  /**
   * Generate the next hydration ID (matches SSR order).
   */
  readonly generateId: Effect.Effect<string>;

  /**
   * The root container element for DOM queries.
   */
  readonly root: HTMLElement | SVGElement;

  /**
   * Find an element by its hydration ID.
   */
  readonly findById: (
    id: string,
  ) => Effect.Effect<HTMLElement | SVGElement | null>;

  /**
   * Find a suspense container and get its current state.
   */
  readonly findSuspense: (id: string) => Effect.Effect<{
    container: HTMLElement | SVGElement;
    state: "loading" | "loaded" | "error";
    fallback: Node | null;
  } | null>;
}

/**
 * Context tag for hydration state.
 * Components check for this context to determine if they're hydrating
 * and to look up existing DOM elements.
 */
export class HydrationContext extends Context.Tag("@stax-ui/HydrationContext")<
  HydrationContext,
  HydrationContextService
>() {}

/**
 * Create a HydrationContext layer for a given root element.
 */
export const makeHydrationContext = (
  root: HTMLElement | SVGElement,
): Effect.Effect<Layer.Layer<HydrationContext>> =>
  Effect.gen(function* () {
    const counter = yield* Ref.make(0);

    const service: HydrationContextService = {
      generateId: Ref.updateAndGet(counter, (n) => n + 1).pipe(
        Effect.map((n) => `h${n}`),
      ),

      root,

      findById: (id: string) =>
        Effect.sync(() => root.querySelector(`[data-stax-id="${id}"]`)),

      findSuspense: (id: string) =>
        Effect.sync(() => {
          const container = root.querySelector<HTMLElement | SVGElement>(
            `[data-stax-id="${id}"][data-stax-type="suspense"]`,
          );
          if (!container) return null;

          const state =
            (container.getAttribute("data-stax-suspense-state") as
              "loading" | "loaded" | "error") ?? "loading";

          // The fallback is the first child of the container
          const fallback = container.firstChild;

          return { container, state, fallback };
        }),
    };

    return Layer.succeed(HydrationContext, service);
  });

/**
 * Run an effect with a hydration context.
 */
export const withHydrationContext = <A, E, R>(
  root: HTMLElement,
  effect: Effect.Effect<A, E, R | HydrationContext>,
): Effect.Effect<A, E, Exclude<R, HydrationContext>> =>
  Effect.gen(function* () {
    const layer = yield* makeHydrationContext(root);
    return yield* Effect.provide(effect, layer);
  }) as Effect.Effect<A, E, Exclude<R, HydrationContext>>;
