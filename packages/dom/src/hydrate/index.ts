/**
 * Client-side hydration for Effex SSR.
 *
 * @example
 * ```ts
 * import { hydrate } from "@effex/dom/hydrate";
 * import { App } from "./App";
 *
 * hydrate(App(), document.getElementById("root")!);
 * ```
 *
 * @module
 */

import { Effect, Layer } from "effect";

import { RendererContext, SignalRegistry, type Renderer } from "@effex/core";

import { Element } from "../Element";
import { makeHydrationContext } from "../HydrationContext";
import { createHydrationRenderer } from "./HydrationRenderer";

export interface HydrateOptions {
  /**
   * Called when a hydration mismatch is detected.
   * In development, you might want to log warnings.
   * In production, the framework will attempt recovery.
   */
  readonly onMismatch?: (message: string, node: Node | null) => void;

  /**
   * Additional layers to provide to the element during hydration.
   * Use this to provide services like LoaderContext that the element requires.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly layers?: Layer.Layer<any, never, never>;
}

/**
 * Hydrate server-rendered HTML by attaching to existing DOM
 * and setting up reactive bindings.
 *
 * @param element - The Element to hydrate (same component tree as SSR)
 * @param container - The DOM container with server-rendered HTML
 * @param options - Hydration options
 * @returns Promise that resolves when hydration is complete
 *
 * @example
 * ```ts
 * import { hydrate } from "@effex/dom/hydrate";
 * import { App } from "./App";
 *
 * hydrate(App(), document.getElementById("root")!);
 * ```
 */
export const hydrate = <A extends HTMLElement | SVGElement>(
  element: Element.Element<A, never, RendererContext>,
  container: HTMLElement,
  options: HydrateOptions = {},
): Promise<void> => {
  const renderer = createHydrationRenderer(container, options);

  const HydrationRendererLayer = Layer.succeed(
    RendererContext,
    renderer as Renderer<unknown>,
  );

  const program = Effect.gen(function* () {
    // Create hydration context with ID counter matching SSR order
    const hydrationContextLayer = yield* makeHydrationContext(container);

    // Build the layers to provide to the element
    let elementLayers = hydrationContextLayer;
    if (options.layers) {
      elementLayers = Layer.merge(hydrationContextLayer, options.layers);
    }

    yield* Effect.provide(element, elementLayers);

    // Keep the scope alive - subscriptions run in forked fibers that need to persist
    // Wait forever (until page unload) so subscription fibers stay alive
    yield* Effect.never;
  });

  // Run without awaiting completion - the Effect.never keeps it alive
  Effect.runFork(
    Effect.scoped(program).pipe(
      Effect.provide(HydrationRendererLayer),
      Effect.provide(SignalRegistry.Live),
    ),
  );

  // Return immediately - hydration setup is synchronous, subscriptions are async
  return Promise.resolve();
};

export type { HydrationRenderer } from "./HydrationRenderer";
export { createHydrationRenderer } from "./HydrationRenderer";
export {
  HydrationContext,
  type HydrationContextService,
} from "../HydrationContext";
