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

import {
  RendererContext,
  SignalRegistry,
  type ControlCtx,
  type Renderer,
  type SuspenseBoundaryCtx,
} from "@effex/core";

import { ClientAsyncCacheLayer } from "../../ClientAsyncCache.js";
import {
  HydrationControlCtx,
  HydrationRootCtx,
} from "../../Control/HydrationControlCtx.js";
import * as Element from "../../Element/index.js";
import { HydrationSuspenseBoundaryCtx } from "../../SuspenseBoundaryCtx/HydrationSuspenseBoundaryCtx.js";
import { makeHydrationContext } from "./HydrationContext.js";
import { createHydrationRenderer } from "./HydrationRenderer.js";

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
  element: Element.Element<
    A,
    never,
    RendererContext | ControlCtx | SuspenseBoundaryCtx
  >,
  container: HTMLElement,
  options: HydrateOptions = {},
): Promise<void> => {
  const renderer = createHydrationRenderer(container, options);

  const HydrationRendererLayer = Layer.succeed(
    RendererContext,
    renderer as Renderer<unknown>,
  );

  // Create the HydrationRootCtx layer that HydrationControlCtx needs
  const HydrationRootLayer = Layer.succeed(HydrationRootCtx, container);
  const ControlLayer = Layer.provide(HydrationControlCtx, HydrationRootLayer);

  const program = Effect.gen(function* () {
    // Create hydration context with ID counter matching SSR order
    const hydrationContextLayer = yield* makeHydrationContext(container);

    // Build the suspense layer with its HydrationContext dependency
    const suspenseLayer = Layer.provide(
      HydrationSuspenseBoundaryCtx,
      hydrationContextLayer,
    );

    // Build the layers to provide to the element
    let elementLayers = Layer.merge(hydrationContextLayer, ControlLayer);
    elementLayers = Layer.merge(elementLayers, suspenseLayer);
    elementLayers = Layer.merge(elementLayers, ClientAsyncCacheLayer);
    if (options.layers) {
      elementLayers = Layer.merge(elementLayers, options.layers);
    }

    yield* Effect.provide(element, elementLayers);

    // Keep the scope alive - subscriptions run in forked fibers that need to persist
    // Wait forever (until page unload) so subscription fibers stay alive
    yield* Effect.never;
  });

  // Run without awaiting completion - the Effect.never keeps it alive
  // Type assertion needed because TypeScript can't fully trace the layer dependencies
  Effect.runFork(
    Effect.scoped(program).pipe(
      Effect.provide(HydrationRendererLayer),
      Effect.provide(SignalRegistry.Live),
    ) as Effect.Effect<never>,
  );

  // Return immediately - hydration setup is synchronous, subscriptions are async
  return Promise.resolve();
};

export type { HydrationRenderer } from "./HydrationRenderer.js";
export { createHydrationRenderer } from "./HydrationRenderer.js";
export {
  HydrationContext,
  type HydrationContextService,
} from "./HydrationContext.js";
