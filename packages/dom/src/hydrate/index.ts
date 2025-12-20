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
import type { Element } from "../Element";
import { createHydrationRenderer } from "./HydrationRenderer";

export interface HydrateOptions {
  /**
   * Called when a hydration mismatch is detected.
   * In development, you might want to log warnings.
   * In production, the framework will attempt recovery.
   */
  readonly onMismatch?: (message: string, node: Node | null) => void;
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
export const hydrate = (
  element: Element<never, RendererContext>,
  container: HTMLElement,
  options: HydrateOptions = {},
): Promise<void> => {
  const renderer = createHydrationRenderer(container, options);

  const HydrationRendererLayer = Layer.succeed(
    RendererContext,
    renderer as Renderer<unknown>,
  );

  const program = Effect.gen(function* () {
    yield* element;
  });

  return Effect.runPromise(
    Effect.scoped(program).pipe(
      Effect.provide(HydrationRendererLayer),
      Effect.provide(SignalRegistry.Live),
    ),
  );
};

export type { HydrationRenderer } from "./HydrationRenderer";
export { createHydrationRenderer } from "./HydrationRenderer";
