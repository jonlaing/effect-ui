/**
 * Client-side mounting for Effex applications.
 *
 * @example
 * ```ts
 * import { mount, runApp } from "@effex/dom/client";
 * import { App } from "./App";
 *
 * runApp(
 *   Effect.gen(function* () {
 *     yield* mount(App(), document.getElementById("root")!)
 *   })
 * )
 * ```
 *
 * @module
 */

import { Effect, Layer, Scope } from "effect";

import {
  RendererContext,
  SignalRegistry,
  type ControlCtx,
  type Renderer,
  type SuspenseBoundaryCtx,
} from "@effex/core";

import { ClientControlCtx } from "../Control/ClientControlCtx.js";
import { DOMRenderer } from "../DOMRenderer.js";
import * as Element from "../Element";
import { ClientSuspenseBoundaryCtx } from "../SuspenseBoundary/ClientSuspenseBoundaryCtx.js";

/**
 * Mount an Element into a DOM container. Automatically cleans up when the scope closes.
 *
 * The element must have no errors and no unsatisfied requirements (Element.Element<never, never>).
 * If your component can fail, handle all errors before mounting using ErrorBoundary or Effect.catchAll.
 * If your component has context requirements, provide them using Effect.provide before mounting.
 *
 * @param element - The Element to mount (must be error-free with all requirements satisfied)
 * @param container - The DOM container to mount into
 *
 * @example
 * ```ts
 * import { $, collect, mount } from "@effex/dom"
 *
 * const app = $.div({}, collect(
 *   $.h1({}, $.of("Hello, Effex!"))
 * ))
 *
 * // Mount the app and run it
 * Effect.runPromise(
 *   Effect.scoped(
 *     mount(app, document.getElementById("root")!)
 *   )
 * )
 * ```
 *
 * @example
 * ```ts
 * // Handle errors before mounting
 * const riskyApp = fetchAndRenderData() // Element<..., FetchError, ...>
 *
 * const safeApp = Boundary.error(
 *   () => riskyApp,
 *   (error) => $.div({}, $.of(`Failed to load: ${String(error)}`))
 * ) // Element<..., never, ...>
 *
 * Effect.runPromise(
 *   Effect.scoped(
 *     mount(safeApp, document.getElementById("root")!)
 *   )
 * )
 * ```
 *
 * @example
 * ```ts
 * // Provide context before mounting
 * const appWithRouter = Link({ href: "/home" }, $.of("Home")) // Element<..., never, RouterContext>
 *
 * Effect.runPromise(
 *   Effect.scoped(
 *     mount(
 *       appWithRouter.pipe(Effect.provide(routerLayer)),
 *       document.getElementById("root")!
 *     )
 *   )
 * )
 * ```
 */
export const mount = (
  element: Element.Element<
    HTMLElement,
    never,
    RendererContext | ControlCtx | SuspenseBoundaryCtx
  >,
  container: HTMLElement,
): Effect.Effect<void, never, Scope.Scope> =>
  Effect.gen(function* () {
    // Build the layers for client-side rendering
    const rendererLayer = Layer.succeed(
      RendererContext,
      DOMRenderer as Renderer<unknown>,
    );
    const suspenseLayer = Layer.provide(
      ClientSuspenseBoundaryCtx,
      rendererLayer,
    );

    const el = yield* element.pipe(
      Effect.provide(rendererLayer),
      Effect.provide(ClientControlCtx),
      Effect.provide(suspenseLayer),
    );
    container.appendChild(el);

    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        if (el.parentNode === container) {
          container.removeChild(el);
        }
      }),
    );
  });

/**
 * Run an Effex application. This is the main entry point for Effex apps.
 *
 * Handles all the boilerplate:
 * - Scopes the effect for proper resource cleanup
 * - Provides the SignalRegistry
 * - Keeps the app alive until page unload
 * - Optionally provides additional layers (like router context)
 *
 * @param program - An effect that sets up and mounts the app
 * @param options - Optional configuration
 * @param options.layer - Additional layer to provide (e.g., router context)
 *
 * @example
 * ```ts
 * // Simple app without routing
 * runApp(
 *   Effect.gen(function* () {
 *     yield* mount(App(), document.getElementById("root")!)
 *   })
 * )
 * ```
 *
 * @example
 * ```ts
 * // App with router
 * runApp(
 *   Effect.gen(function* () {
 *     const router = yield* Router.make(routes)
 *     yield* mount(
 *       App().pipe(Effect.provide(makeRouterLayer(router))),
 *       document.getElementById("root")!
 *     )
 *   })
 * )
 * ```
 *
 * @example
 * ```ts
 * // App with custom layer
 * const appLayer = Layer.merge(
 *   makeRouterLayer(router),
 *   Layer.succeed(MyContext, myService)
 * )
 *
 * runApp(
 *   Effect.gen(function* () {
 *     yield* mount(App().pipe(Effect.provide(appLayer)), root)
 *   })
 * )
 * ```
 */
export const runApp = <E, R>(
  program: Effect.Effect<void, E, Scope.Scope | R>,
  options?: {
    layer?: Layer.Layer<R, never, never>;
  },
): Promise<void> => {
  const fullProgram = Effect.gen(function* () {
    yield* program;
    // Keep the app alive until page unload
    yield* Effect.never;
  });

  let effect = Effect.scoped(fullProgram).pipe(
    Effect.provide(SignalRegistry.Live),
  );

  if (options?.layer) {
    effect = effect.pipe(
      Effect.provide(options.layer as Layer.Layer<R, never, never>),
    );
  }

  return Effect.runPromise(effect as Effect.Effect<void, E, never>);
};
